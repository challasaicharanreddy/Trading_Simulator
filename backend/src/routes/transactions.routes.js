import express from "express";
import {getRecentTransactions, transactionsService} from "../services/transactions.service.js";
const router=express.Router();

router.get("/history",async (req,res)=>{
    const userid=req.user.id;
    const required=await transactionsService(userid);
    return res.json(required);
})

router.get("/recent", async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions =
            await getRecentTransactions(userId);
        res.json(transactions);
    } catch (error) {
        console.error(
            "Recent transactions error:",
            error
        );
        res.status(500).json({
            error: error.message
        });
    }
});

export default router;
