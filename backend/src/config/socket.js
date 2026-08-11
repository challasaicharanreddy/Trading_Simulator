import {Server} from "socket.io"
import jwt from "jsonwebtoken"
let io;
function SocketInit(httpServer){
    io=new Server(httpServer,{
        cors:{
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials:true,
        },
    });

    io.use((socket,next)=>{
        const token=socket.handshake.headers?.token;
        if(!token){
            return next(new Error("Authentication token is missing"));
        }

        try{
            const decoded=jwt.verify(token, process.env.JWT_SECRET);
            socket.userId=decoded.id;
            next();
        }catch(err){
            next(new Error("Invalid or expired Token"));
        }
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

    return io;
}

function getIO(){
    if(!io){
        throw new Error("Socket.io not initialized — call initSocket() first");
    }
    return io;
}

export {SocketInit, getIO};