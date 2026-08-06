// scripts/seedMarketData.js
import dotenv from "dotenv";
import connectdb from "../config/db.js";
import mongoose from "mongoose";
import MinuteCandle from "../models/minuteCandles.js";

dotenv.config();

await connectdb();
const candles = [
    // {
    //   symbol: "AAPL",
    //   interval: "1MIN",
    //   timestamp: new Date("2026-08-06T10:00:00.000Z"),
    //   open: 307.8,
    //   high: 308.0,
    //   low: 307.6,
    //   close: 307.9,
    //   volume: 120000
    // }
  ]

await MinuteCandle.insertMany(candles);

console.log("Seeded successfully");
process.exit();