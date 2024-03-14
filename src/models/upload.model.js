import mongoose, {Schema} from "mongoose";

const uploadSchema = new Schema({
    multiMedia : {   //it could be either image or video
        type : String,
        required : [true, 'Please upload some multi media']
    },

    uploadedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },

    description : {
        type : String,
        required : [true, 'Please provide some description']
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
    },

    mediaType : {
        type : String,
        required : [true, 'Please provide media type']
    },

    duration : {
        type : String,
        default : "0"
    }
}, {timestamps : true})


export const Upload = mongoose.model('Upload', uploadSchema);