import mongoose, {Schema} from "mongoose";


const likeSchema = new Schema({
    likedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },

    multiMedia : {
        type : Schema.Types.ObjectId,
        ref : "Upload"
    }
})
 

export const Like = mongoose.model("Like", likeSchema);