import mongoose, {Schema} from "mongoose";


const dislikeSchema = new Schema({
    dislikedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },

    multiMedia : {
        type : Schema.Types.ObjectId,
        ref : "Upload"
    }
}, {timestamps : true})


export const Dislike = mongoose.model("Dislike", dislikeSchema);  