import app from "./app.js";
import mongoose from "mongoose";
import redisClient from "./config/redis.js";
import dotenv from "dotenv";

dotenv.config();

const PORT=process.env.PORT||5000;
const MONGO_URI=process.env.MONGO_URI;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});