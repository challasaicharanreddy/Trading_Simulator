import express from "express";
import { executeBuyOrder, executeSellOrder } from "../services/orderEngine.js";
import { fetchWithCache } from "../services/marketData.js";
import Transaction from "../models/transactions.js";
function MarketStatus() {
    const now = new Date();

    const nyTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(now);
    const [hour, minute] = nyTime.split(":").map(Number);

    const isOpen =
        (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;

  return isOpen;
}

const router = express.Router();

router.post("/buy",async (req, res) => {
  try {
    // if(!MarketStatus()) {
    //   return res.status(410).json({ error: "Market Closed, Please come back later" });
    // }
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
    // if(!MarketStatus()) {
    //   return res.status(410).json({ error: "Market Closed, Please come back later" });
    // }
    const { symbol, quantity } = req.body;
    const userId = req.user.id;
    const data=await fetchWithCache(symbol);
    const price=data.price;

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ error: "symbol, quantity, and price are required" });
    }

    const result = await executeSellOrder(userId, symbol.toUpperCase(), quantity, price);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/recent", async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      user: userId,
    })
      .sort({ executedAt: -1 })
      .limit(5);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;