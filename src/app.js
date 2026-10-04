import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// this middleware is used for cross origin sharing 
// browsers reject credentialed requests when the origin is a wildcard
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: process.env.CORS_ORIGIN !== '*'}))
// this middleware is used for parsing the json data by default express does not parse the jason data
app.use(express.json({limit:"16kb"}))
// this is used for parsing url data extended is used for nessted object
app.use(express.urlencoded({extended: true}))
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

//Routes Declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/verify", verifyRouter);
app.use("/api/v1/tasklist", tasklistRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/dislike", dislikeRouter);
app.use("/api/v1/usertaskinfo", userTaskInfoRouter);

app.use((err, req, res, next) => {
  const isBadInput = ["MulterError", "ValidationError", "CastError"].includes(err.name);
  const statusCode = err.statusCode || (isBadInput ? 400 : 500);
  const message = err.message || "Internal server error";

  // remove the temporary upload if the request failed before it reached cloudinary
  if (req.file?.path && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }

      return res.status(statusCode).json({
        status : statusCode,
        message : message
      });
    
})

export default app