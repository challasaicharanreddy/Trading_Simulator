// routes/orders.routes.js
import express from "express";
import { executeBuyOrder, executeSellOrder } from "../services/orderEngine.js";
import { fetchWithCache } from "../services/marketData.js";

const router = express.Router();

router.post("/buy",async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user.id; 
    const data=await fetchWithCache(symbol);
    const price=data.price;

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ error: "symbol, quantity, and price are required" });
    }

    const result = await executeBuyOrder(userId, symbol.toUpperCase(), quantity, price);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/sell", async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;
    const price=await fetchWithCache(symbol);

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ error: "symbol, quantity, and price are required" });
    }

    const result = await executeSellOrder(userId, symbol.toUpperCase(), quantity, price);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;