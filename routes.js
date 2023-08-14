import express from 'express';
import {changePassword, loadme, login, logout, register, updateUser,forgotPassword,resetPassword} from './controllers/user.js';
import { isAuthenticate } from './middlewares/auth.js';
import singleUpload from './middlewares/multer.js';
import { createPost, detelePost, getAllPost, getMyPost, updatePost } from './controllers/posts.js';

const router = express.Router();

// users routes
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(isAuthenticate,loadme);
router.route('/logout').get(logout);
router.route('/user/update').put(isAuthenticate,updateUser);
router.route('/user/change-password').put(isAuthenticate,changePassword);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').put(resetPassword);

// posts routes
router.route('/post/add').post(isAuthenticate,singleUpload,createPost);
router.route('/post/update/:postId').put(isAuthenticate,singleUpload,updatePost);
router.route('/post/delete/:postId').delete(isAuthenticate,detelePost);
router.route('/post/get/:page').get(getAllPost);
router.route('/post/my/:page').get(isAuthenticate,getMyPost);


export default router;