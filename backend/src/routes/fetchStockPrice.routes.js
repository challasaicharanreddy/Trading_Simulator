import express from "express";
import fetchStockMinutes from "../services/fetchStockMinutes.js";
import holdings from "../models/holdings.js";

const router=express.Router();

router.post("/minuteCandles",async(req,res)=>{
    const {symbol,timeperiod}=req.body
    const data=await fetchStockMinutes(symbol,timeperiod);

    return res.json(data);
});
router.post("/holdings",async(req,res)=>{
    const {symbol}=req.body;
    const data=await holdings.findOne({symbol});

    return res.json(data);
});

export default router;