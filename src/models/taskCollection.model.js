import mongoose, {Schema} from "mongoose";

const taskCollectionSchema =  new Schema({
    title : {
        type : String,
        required : true,
        trim : true,
        unique : [true, 'Task title should be unique'],
    },

    description : {
        type : String,
        required : [true, 'Please provide description about task'],
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
        required : [true, 'Please provide time']
    }
}, {timestamps : true})


export const TaskCollection = mongoose.model('TaskCollection', taskCollectionSchema);