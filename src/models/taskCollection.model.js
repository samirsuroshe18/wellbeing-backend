import mongoose, {Schema} from "mongoose";

const taskCollectionSchema =  new Schema({
    title : {
        type : String,
        required : true,
        trim : true,
        unique : true,
    },

    description : {
        type : String,
        required : true,
    },

    taskReference : {
        type : String
    },

    mediaType : {
        type : String
    },
  
    createdBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },

    timeToComplete : {
        type : Number,
        required : true
    }
}, {timestamps : true})


export const TaskCollection = mongoose.model('TaskCollection', taskCollectionSchema);