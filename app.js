import express from 'express';
export const app = express();
import dotenv from 'dotenv';
import routes from './routes.js';
import database from './config/database.js';
import errorMiddleware from './middlewares/error.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {join,resolve,dirname} from 'path';
import {fileURLToPath} from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url))
// .env
dotenv.config({path: './config/.env'});

//body parser
app.use(express.json({limit: '50mb'}));
app.use(
	express.urlencoded({
	  extended: true,
	})
);

// cookie parser 
app.use(cookieParser());

// cors 
app.use(cors({
	origin: '*',
	methods: ['GET','POST','PUT','DELETE'],
	credentials: true
}));


// connnect database
database();

// app routes
app.use('/api/v1',routes);


// Middleware for Errors
app.use(errorMiddleware);


// render frontend
app.use(express.static(join(__dirname,'./build')))
app.get('*',(req,res) => {
	res.sendFile(resolve(__dirname,'./build/index.html'))
});
