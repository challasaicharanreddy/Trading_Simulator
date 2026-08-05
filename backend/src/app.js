import express from "express";
import cookieParser from "cookie-parser";
import commonMiddleware from "./middlewares/common.middleware.js"
import authroutes from "./routes/authroutes.js"
import marketRoutes from "./routes/market.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import strategyRoutes from "./routes/strategy.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js"

const app=express();

app.use(express.json());
app.use(cookieParser());
app.use('/auth',authroutes);

app.use('/app',commonMiddleware);
app.use("/app/api/market",marketRoutes);
app.use("/app/api/orders", ordersRoutes);
app.use("/app/api/strategies", strategyRoutes);
app.use("/app/portfolio",portfolioRoutes);
app.get("/app/api/health",(req,res)=>{
    res.json({status:"ok"});
});


export default app;