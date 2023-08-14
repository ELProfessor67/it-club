import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './user.js';
import validator from 'validator';

const schema = new mongoose.Schema({
	image: {
        public_id: {type: String, required: true},
        url: {type: String, required: true}
    },
    content: {required: true, type: String},
    author: {type: mongoose.Schema.Types.ObjectId, ref: User},
    email: {type: String,required: true, validate: validator.isEmail}
},{timestamps: true});

export default mongoose.model('posts', schema);