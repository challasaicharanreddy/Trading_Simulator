import express from "express";
import fetchStockMinutes from "../services/fetchStockMinutes.js";
import holdings from "../models/holdings.js";
import portfolio from "../models/portfolio.js";

const router=express.Router();

router.post("/minuteCandles",async(req,res)=>{
    const {symbol,timeperiod}=req.body
    const data=await fetchStockMinutes(symbol,timeperiod);

    return res.json(data);
});
router.post("/holdings",async(req,res)=>{
    const {symbol}=req.body;
    const userid=req.user.id;
    const portfoliodoc=await portfolio.findOne({user:userid})
    const portfolioid=portfoliodoc._id
    const data=await holdings.findOne(
        {
            portfolio:portfolioid,
            symbol:symbol
        });

    return res.json(data);
});

export default router;