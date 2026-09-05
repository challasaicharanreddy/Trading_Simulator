import {Server} from "socket.io"
import jwt from "jsonwebtoken"
import RedisClient from "./redis.js";
import socketAuthMiddleware from "../middlewares/socketAuth.middleware.js";

const subclient = RedisClient.duplicate();
await subclient.subscribe("price_change");
await subclient.subscribe("new_minute_aggregation");

let io;
function SocketInit(httpServer){
    io=new Server(httpServer,{
        cors:{
            origin: process.env.CLIENT_URL,
            credentials:true,
        },
    });

    io.use(socketAuthMiddleware);

    io.on("connection",(socket)=>{
        console.log(`Socket connected: user ${socket.userId}, socket ${socket.id}`);
        socket.on("subscribe", (symbol)=>{
            socket.join(`room:${symbol}`);
            // console.log(`User ${socket.userId} subscribed to ${symbol}`);
        });

        socket.on("unsubscribe", (symbol)=>{
            socket.leave(`room:${symbol}`);
            // console.log(`User ${socket.userId} unsubscribed from ${symbol}`);
        });

        socket.on("disconnect",()=>{
            console.log(`Socket disconnected: user ${socket.userId}`);
        });
    });

    subclient.on("message",(channel,message)=>{
        if(channel=="price_change") {
            const msg=JSON.parse(message);
            // console.log(msg)
            io.to(`room:${msg.symbol}`).emit("priceChange",msg);
        }else if(channel=="new_minute_aggregation") {
            const msg=JSON.parse(message)
            io.to(`room:${msg.symbol}`).emit("new_minute_aggregation",msg);
        }
    });

    return io;
}

function getIO(){
    if(!io){
        throw new Error("Socket.io not initialized — call initSocket() first");
    }
    return io;
}

export {SocketInit, getIO};