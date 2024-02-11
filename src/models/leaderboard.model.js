import mongoose, {Schema} from "mongoose";


const leaderboardSchema = new Schema({
    users : [
        {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    ]
})


export const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);