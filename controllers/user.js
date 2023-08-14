import catchAsyncError from '../middlewares/catchAsyncError.js';
import UserModel from '../models/user.js'; 
import sendResponse from '../utils/sendResponse.js';
import validator from 'validator';
import {sendToken} from '../utils/sendToken.js';
import ErrorHandler from '../utils/errorHandler.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

export const register = catchAsyncError(async (req, res) => {
	const {name, email, username, password} = req.body;
	if(!name, !email, !username, !password){
		return sendResponse(false, 401, 'All fields are required',res);
	}

	const user = await UserModel.create(req.body);

	sendToken(res, user, "Registered Successfully", 201);
});


export const login = catchAsyncError(async (req, res, next) => {
	const {id, password} = req.body;
	if(!id || !password) return sendResponse(false, 401, 'All fields are required',res);
	let user;
	if(validator.isEmail(id)){
		user = await UserModel.findOne({email: id});
	}else{
		user = await UserModel.findOne({username: id});
	}
	if (!user)
      return sendResponse(false, 401, 'Incorrect Email or Password',res);

	const isMatch = await user.comparePassword(password);
    if (!isMatch)
		return sendResponse(false, 401, 'Incorrect Email or Password',res);
  
    sendToken(res, user, `Welcome back, ${user.name}`, 200);
});

export const loadme = catchAsyncError(async (req, res, next) => {
	res.status(200).json({
		success: true,
		user: req.user
	})
});

export const logout = catchAsyncError(async (req, res, next) => {
	res.clearCookie('token').status(200).json({
		success: true,
		message: 'Logout successfully'
	})
});

export const updateUser = catchAsyncError(async (req, res, next) => {
	const {name, email, username} = req.body;
	const user = await UserModel.findByIdAndUpdate(req.user._id,{name,username,email});
	sendResponse(true,200,'Update successfully',res);
});

export const changePassword = catchAsyncError(async (req, res, next) => {
	const {oldpassword, newpassword} = req.body;
	const user = await UserModel.findById(req.user._id);

	console.log(oldpassword,newpassword)
	
	const isMatch = await user.comparePassword(oldpassword);
    if (!isMatch)
		return sendResponse(false, 401, 'Incorrect old password',res);
	
	user.password = newpassword;
	await user.save();
  
    sendResponse(true,200,'Password update successfully',res);
});


// forgot password 
export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    // console.log(email)

    const user = await UserModel.findOne({ email });

    if (!user) return next(new ErrorHandler("User not found", 400));

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `Click on the link to reset your password. ${url}. If you have not request then please ignore.`;
    // Send token via email
    await sendEmail(user.email, "IT Club Reset Password", message);
	console.log(url);
	sendResponse(true,200,`Reset Token has been sent to ${user.email}`,res);
  });

// reset password 
export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;
  
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  
    const user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });
  
    if (!user)
      return next(new ErrorHandler("Token is invalid or has been expired", 401));
  
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  
    await user.save();
	sendResponse(true,200,"Password Changed Successfully",res);
  });