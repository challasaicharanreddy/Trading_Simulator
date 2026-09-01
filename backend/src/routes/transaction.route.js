import express from "express";
import {
    getRecentTransactions
} from "../services/transaction.services.js";

const router = express.Router();


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