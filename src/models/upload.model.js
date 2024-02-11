import mongoose, {Schema} from "mongoose";

const uploadSchema = new Schema({
    multiMedia : {   //it could be either image or video
        type : String,
        required : true
    },

    uploadedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },

    discription : {
        type : String,
        required : true
    },

    likes : {
        type : Schema.Types.ObjectId,
        ref : "Like"
    },

    dislikes : {
        type : Schema.Types.ObjectId,
        ref : "Dislike"
    },
  
    comments : 
        {
            type : Schema.Types.ObjectId,
            ref : "comments"
        }
    ,

    task : {
        type : Schema.Types.ObjectId,
        ref : "TaskCollection"
    }
}, {timestamps : true})


export const Upload = mongoose.model('Upload', uploadSchema);