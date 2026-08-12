import app from "./app.js";
import connectdb from "./config/db.js";
import http from "http";
import scheduler from "./jobs/scheduler.js";
import {SocketInit} from "./config/socket.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const PORT=process.env.PORT||5000;
const MONGO_URI=process.env.MONGO_URI;

const httpServer=http.createServer(app);
SocketInit(httpServer);
const startserver=async ()=>{
    await connectdb();
    httpServer.listen(PORT,()=>{
        console.log(`server running on port ${PORT}`);
    });
}
startserver();
scheduler();


