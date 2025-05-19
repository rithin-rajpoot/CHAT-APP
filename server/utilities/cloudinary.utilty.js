import { v2 as cloudinary }  from 'cloudinary';
import {config} from 'dotenv';
config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
// export const uploadImage = async (filePath) => {
//     try {
//         const result = await cloudinary.uploader.upload(filePath, {
//             folder: 'images',
//             use_filename: true,
//             unique_filename: false,
//             overwrite: true
//         });
//         return result;
//     } catch (error) {
//         console.error('Error uploading image to Cloudinary:', error);
//         throw error;
//     }
// }