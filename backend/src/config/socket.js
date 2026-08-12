import {Server} from "socket.io"
import jwt from "jsonwebtoken"
import RedisClient from "./redis.js";

const subclient=RedisClient;
await subclient.subscribe("price_change");
let io;
function SocketInit(httpServer){
    io=new Server(httpServer,{
        cors:{
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials:true,
        },
    });

    io.on("connection",(socket)=>{
        console.log(`Socket connected: user ${socket.userId}, socket ${socket.id}`);
        socket.on("subscribe", (symbol)=>{
            socket.join(`room:${symbol}`);
            console.log(`User ${socket.userId} subscribed to ${symbol}`);
        });

        socket.on("unsubscribe", (symbol)=>{
            socket.leave(`room:${symbol}`);
            console.log(`User ${socket.userId} unsubscribed from ${symbol}`);
        });

        socket.on("disconnect",()=>{
            console.log(`Socket disconnected: user ${socket.userId}`);
        });
    });

    subclient.on("message",(channel,message)=>{
        const msg=JSON.parse(message);
        io.to(`room:${msg.symbol}`).emit("priceChange",msg);
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