import express from "express";
import marketRoutes from "./routes/market.routes.js";


const app=express();
app.use(express.json());
app.use("/api/market",marketRoutes);
app.get("/api/health",(req,res)=>{
    res.json({status:"ok"});
});


export default app;