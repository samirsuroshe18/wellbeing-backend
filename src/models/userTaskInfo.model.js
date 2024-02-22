import mongoose, {Schema} from "mongoose";

const userTaskInfoSchema =  new Schema({
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
        type : Schema.Types.ObjectId,
        ref : "Upload"
    }
})


export const UserTaskInfo = mongoose.model('UserTaskInfo', userTaskInfoSchema);