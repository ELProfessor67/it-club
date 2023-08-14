import catchAsyncError from '../middlewares/catchAsyncError.js';
import PostsModel from '../models/posts.js'; 
import sendResponse from '../utils/sendResponse.js';
import ErrorHandler from '../utils/errorHandler.js';
import cloudinary from 'cloudinary';
import getDataUri from '../utils/dataUri.js';

export const createPost = catchAsyncError(async (req, res,next) => {
	const {content} = req.body;
    const file = req.file;
    if(!file || !content) return next(new ErrorHandler('All Fields are required',401));
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    const posts = await PostsModel.create({
        content,
        image: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        },
        email: req.user.email,
        author: req.user._id
    });

    sendResponse(true,201,'Posts add successfully',res);
});

export const updatePost = catchAsyncError(async (req, res,next) => {
	const {postId} = req.params;
    const {content} = req.body;
    const file = req.file;
    const post = await PostsModel.findById(postId);

    if(!post) return next(new ErrorHandler('Invalid Id',404));

    if(req.user.email !== post.email) return next(new ErrorHandler('Only author update this post',401));

    if(file){
        await cloudinary.v2.uploader.destroy(post.image.public_id);
        const fileUri = getDataUri(file);
        const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
        post.image = {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        }
    }

    if(content) post.content = content;
    await post.save();

    sendResponse(true,200,'Post update successfully',res);

});


export const detelePost = catchAsyncError(async (req, res,next) => {
	const {postId} = req.params;
    const post = await PostsModel.findById(postId);

    if(!post) return next(new ErrorHandler('Invalid Id',404));

    if(req.user.email !== post.email) return next(new ErrorHandler('Only author delete this post',401));
    await cloudinary.v2.uploader.destroy(post.image.public_id);
    await PostsModel.findByIdAndDelete(postId);

    sendResponse(true,200,'Post delete successfully',res);

});

export const getAllPost = catchAsyncError(async (req, res,next) => {
    const page = +req.params.page || 1;
    const perpage = 10;
    const skip = (page-1)*perpage;
    const totalPosts = await PostsModel.countDocuments();
    const totalPage = Math.ceil(totalPosts/perpage);
    const posts = await PostsModel.find().skip(skip).limit(perpage).populate('author');

    res.status(200).json({
        totalPage,
        posts,
        scuccess: true
    })
});


export const getMyPost = catchAsyncError(async (req, res,next) => {
    const page = +req.params.page || 1;
    const perpage = 10;
    const skip = (page-1)*perpage;
    const posts = await PostsModel.find({email: req.user.email}).skip(skip).limit(perpage);
    const totalPosts = posts.length;
    const totalPage = Math.ceil(totalPosts/perpage);

    res.status(200).json({
        totalPage,
        posts,
        scuccess: true
    })
});


