import express from "express";
const router=express.Router();
import { fetchWithCache} from "../services/marketData.js";
console.log('market.routes.js loaded');
router.get('/quote/:symbol', async(req,res)=>{
    console.log('Route hit! symbol =', req.params.symbol);
    try{
        const symbol=req.params.symbol.toUpperCase();
        const priceData=await fetchWithCache(symbol);
        res.json(priceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;