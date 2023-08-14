import {app} from './app.js';
import cloudinary from 'cloudinary';


// configure cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDNARY_NAME,
    api_key: process.env.CLOUDNARY_KEY,
    api_secret: process.env.CLOUDNARY_SECRET,
});

app.listen(4000, () => console.log('server running on port 4000'));