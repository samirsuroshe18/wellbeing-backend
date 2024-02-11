import mongoose, {Schema} from "mongoose";

const taskSchema =  new Schema({
    taskInfo : {
        type : Schema.Types.ObjectId,
        ref : "TaskCollection"
    },

    assignTo : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },

    status : {
        type : String,
        required : true
    },

    proofMedia : {
        type : String,
        required : true
    }
})


export const Task = mongoose.model('Task', taskSchema);