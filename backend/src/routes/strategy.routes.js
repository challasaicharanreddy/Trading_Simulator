import express from "express";
import Strategy from "../models/strategy.js";

const router=express.Router();

router.post("/", async(req,res)=>{
    try{
        const {name, symbol, indicator, period, operator, threshold, action, quantity}=req.body;
        const userId=req.user.id;

        if(!name || !symbol || !indicator || !period || !operator || threshold == undefined|| !action || !quantity){
            return res.status(400).json({error:"All fields are required"});
        }
        const strategy=await Strategy.create({
            user:userId,
            name: name.trim(),
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
        const userId=req.user.id;
        const strategies=await Strategy.find({user:userId});
        res.json(strategies);
    }catch(err){
        res.status(500).json({error:err.message});
    }
});

router.patch("/:id/status", async (req, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.body;
  
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          error: "Invalid strategy status",
        });
      }
  
      const strategy = await Strategy.findOneAndUpdate(
        {
          _id: req.params.id,
          user: userId,
        },
        { status },
        { new: true }
      );
  
      if (!strategy) {
        return res.status(404).json({
          error: "Strategy not found",
        });
      }
  
      res.json(strategy);
    } catch (err) {
      res.status(400).json({
        error: err.message,
      });
    }
  });
  
router.delete("/:id", async (req, res) => {
    try {
      const userId = req.user.id;
  
      const strategy = await Strategy.findOneAndDelete({
        _id: req.params.id,
        user: userId,
      });
  
      if (!strategy) {
        return res.status(404).json({
          error: "Strategy not found",
        });
      }
  
      res.json({
        message: "Strategy deleted successfully",
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  });

export default router;