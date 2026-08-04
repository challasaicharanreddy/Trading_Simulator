import express from "express";
import Strategy from "../models/strategy.js";

const router=express.Router();

router.post("/", async(req,res)=>{
    try{
        const {symbol, indicator, period, operator, threshold, action, quantity}=req.body;
        const userId=req.user._id;

        if(!symbol || !indicator || !period || !operator || threshold == undefined|| !action || !quantity){
            return res.status(400).json({error:"All fields are required"});
        }
        const strategy=await Strategy.create({
            user:userId,
            symbol:symbol.toUpperCase(),
            indicator:indicator,
            period:period,
            operator:operator,
            threshold:threshold,
            action:action,
            quantity:quantity
        });
        res.json(strategy);
    }catch(err){
        res.status(400).json({error:err.message});
    }
});

router.get("/",async(req,res)=>{
    try{
        const userId=req.user._id;
        const strategies=await Strategy.find({user:userId});
        res.json(strategies);
    }catch(err){
        res.status(500).json({error:err.message});
    }
});

export default router;