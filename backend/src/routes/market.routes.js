import express from "express";
const router=express.Router();
import { fetchWithCache} from "../services/marketData.js";
import marketData from "../models/marketData.js";

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

router.get("/latest", async (req, res) => {
  try {
    const symbols = [
      "AAPL",
      "MSFT",
      "NVDA",
      "AMZN",
      "GOOGL",
      "META",
      "TSLA",
      "TITN",
    ];

    const latestData = await Promise.all(
      symbols.map(async (symbol) => {
        const data = await marketData.findOne({ symbol })
          .sort({ timestamp: -1 })
          .lean();

        if (!data) return null;

        return {
          symbol: data.symbol,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          previousClose: data.previousClose,
          changePercent: data.changePercent,
          timestamp: data.timestamp,
        };
      })
    );

    res.status(200).json(
      latestData.filter((item) => item !== null)
    );
  } catch (error) {
    console.error("Latest market data error:", error);

    res.status(500).json({
      message: "Failed to fetch latest market data",
    });
  }
});

export default router;