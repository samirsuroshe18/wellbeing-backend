import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema({
    content: {
        type: String,
        required: [true, 'Please provide some content']
    },

    commentedBy : {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
  
    multiMedia : {
        type : Schema.Types.ObjectId,
        ref : "Upload"
    }
}, {timestamps : true})


export const Comment = mongoose.model("Comment", commentSchema);