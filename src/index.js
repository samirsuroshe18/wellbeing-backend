import dotenv from "dotenv"
dotenv.config()
import connectDB from "./db/db.js";
import app from "./app.js";


connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, process.env.SERVER_HOST || '0.0.0.0', () => {
  console.log(`Server is running at http://${process.env.SERVER_HOST || '0.0.0.0'}:${process.env.PORT || 8000}`);
});
}).catch((err)=>{
    console.log('MongoDB Failed !!!', err);
})