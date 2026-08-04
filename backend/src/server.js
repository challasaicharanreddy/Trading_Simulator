import app from "./app.js";
import connectdb from "./config/db.js";
import scheduler from "./jobs/scheduler.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const PORT=process.env.PORT||5000;
const MONGO_URI=process.env.MONGO_URI;

const startserver=async ()=>{
    await connectdb();
    app.listen(PORT,()=>{
        console.log(`server running on port ${PORT}`);
    });
}
startserver();
// scheduler();


