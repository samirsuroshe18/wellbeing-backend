import express from "express";
import cors from 'cors';
import path from 'path';

const app = express();

// this middleware is used for cross origin sharing 
app.use(cors({ origin: process.env.CORS_ORIGIN}))
// this middleware is used for parsing the json data by default express does not parse the jason data
app.use(express.json({limit:"16kb"}))
// this is used for parsing url data extended is used for nessted object
app.use(express.urlencoded({extended: true}))
// this is used for accessing public resources from server
// app.use(express.static("public"))
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(__dirname));


//Routes import
import userRouter from "./routes/user.route.js";
import tasklistRouter from "./routes/tasklist.route.js";
import uploadRouter from "./routes/upload.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import dislikeRouter from "./routes/unlike.route.js";
import userTaskInfoRouter from "./routes/userTaskInfo.route.js";


//Routes Declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasklist", tasklistRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/dislike", dislikeRouter);
app.use("/api/v1/usertaskinfo", userTaskInfoRouter);


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
    
      return res.status(statusCode).json({
        status : statusCode,
        message : message
      });
    
})

export default app