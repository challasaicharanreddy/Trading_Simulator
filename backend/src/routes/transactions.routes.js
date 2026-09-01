import express from "express";
import transactionsService from "../services/transactions.service.js";

const router=express.Router();

router.get("/history",async (req,res)=>{
    const userid=req.user.id;
    const required=await transactionsService(userid);

    return res.json(required);
})

export default router;