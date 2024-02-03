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
import ApiError from "./utils/ApiError.js";


//Routes Declaration
app.use("/api/v1/users", userRouter);

app.use((err, req, res, next) => {
    // Check if it's an instance of your custom ApiError
    
      return res.status(err.statusCode).json({
        statusCode : err.statusCode,
        error: err.message,
        // You can include additional information if needed
        // errors: err.errors,
      });
    
})

export default app