import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticPath = path.join(__dirname, '../public');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// this middleware is used for cross origin sharing 
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true}))
// this middleware is used for parsing the json data by default express does not parse the jason data
app.use(express.json({limit:"16kb"}))
// this is used for parsing url data extended is used for nessted object
app.use(express.urlencoded({extended: true}))
// this is used for accessing public resources from server
app.use(express.static(staticPath));
// this is used to parse the cookie
app.use(cookieParser());

//Routes import
import userRouter from "./routes/user.route.js";
import verifyRouter from './routes/verify.routes.js';
import tasklistRouter from "./routes/tasklist.route.js";
import uploadRouter from "./routes/upload.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import dislikeRouter from "./routes/unlike.route.js";
import userTaskInfoRouter from "./routes/userTaskInfo.route.js";
import cloudinaryRouter from "./routes/cloudinary.route.js";

//Routes Declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/verify", verifyRouter);
app.use("/api/v1/tasklist", tasklistRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/dislike", dislikeRouter);
app.use("/api/v1/usertaskinfo", userTaskInfoRouter);
app.use("/api/v1/cloudinary", cloudinaryRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
    
      return res.status(statusCode).json({
        status : statusCode,
        message : message
      });
    
})

export default app