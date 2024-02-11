import express from "express";
import cors from 'cors'

const app = express();

// database name --> youtubedb

// this use for cross origin sharing 
app.use(cors({ origin: process.env.CORS_ORIGIN}))
// this middleware use for parsing the json data
app.use(express.json({limit:"16kb"}))
// this is used for parsing url data extended is used for nessted object
app.use(express.urlencoded({extended: true}))
// this is used for accessing public resources from server
app.use(express.static("public"))


//Routes import
import userRouter from "./routes/user.route.js";
import tasklistRouter from "./routes/tasklist.route.js";
import uploadRouter from "./routes/upload.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import dislikeRouter from "./routes/unlike.route.js";


//Routes Declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasklist", tasklistRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/dislike", dislikeRouter);


app.use((err, req, res, next) => {
    
      return res.status(err.statusCode).json({
        statusCode : err.statusCode,
        error: err.message,
      });
    
})

export default app