import { v2 as cloud } from "cloudinary";
import fs from 'fs'
import dotenv from "dotenv";
dotenv.config();

cloud.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        let response;

        if (!localFilePath) return null;

        if (fs.existsSync(localFilePath)) {
            response = await cloud.uploader.upload(localFilePath, { resource_type: "auto", folder: "wellbeing-files", });
            console.log("file is uploaded on cloudinary sdk : ", response.secure_url);
            fs.unlinkSync(localFilePath)//remove the locally saved temporary files as the upload operation got successfull
        }else{
            throw new ApiError(400, "File path is not found !!");
        }

        return response;
        // return response.secure_url; // ✅ returning HTTPS URL
    }
    catch (err) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)//remove the locally saved temporary files as the upload operation got failed
        }
        return null;
    }
}

const deleteCloudinary = async (cloudinaryFilePath) => {
    try {
        if (!cloudinaryFilePath) {
            console.log("No cloudinary file path provided");
            return null;
        }
        
        const urlParts = cloudinaryFilePath.split('/');
        
        // Find the index of the part that starts with 'v' (version)
        const versionIndex = urlParts.findIndex(part => part.startsWith('v') && /^v\d+$/.test(part));
        
        if (versionIndex === -1) {
            console.error("Could not find version in URL:", cloudinaryFilePath);
            return null;
        }
        
        // Get everything after the version (folder + filename)
        const pathAfterVersion = urlParts.slice(versionIndex + 1);
        
        // Join the path and remove file extension
        const publicId = pathAfterVersion.join('/').replace(/\.[^/.]+$/, "");
        
        console.log("Attempting to delete public ID:", publicId);
        
        const result = await cloud.uploader.destroy(publicId);
        console.log("Cloudinary delete result:", result);
        
        if (result.result === 'ok') {
            console.log("Successfully deleted from Cloudinary");
        } else if (result.result === 'not found') {
            console.log("File not found in Cloudinary (might already be deleted)");
        } else {
            console.log("Unexpected delete result:", result);
        }
        
        return result;
        
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        // Don't throw error - just log it so the main operation can continue
        return null;
    }
}

export { uploadOnCloudinary, deleteCloudinary };