import express from "express";
import cookieParser from "cookie-parser";
import commonMiddleware from "./middlewares/common.middleware.js"
import authroutes from "./routes/authroutes.js"

const app=express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth',authroutes);

app.use('/app',commonMiddleware);

export default app;