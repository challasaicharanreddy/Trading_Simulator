import express from "express";
import backtestService from "../services/backtest.service.js";

const router=express.Router();

router.post("/run",async(req,res)=>{
    const {start,end,buyIndicator,sellIndicator,buyThreshold,sellThreshold,symbol,quantity,buyOperator,sellOperator}=req.body;
    const result=await backtestService(start,end,buyIndicator,sellIndicator,buyThreshold,sellThreshold,symbol,quantity,buyOperator,sellOperator);

    return res.json(result);
})

export default router