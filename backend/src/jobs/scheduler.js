import RedisClient from "../config/redis.js";
import { fetchPriceFromAPI,fetchWithCache } from "../services/marketData.js";
import marketdata from "../models/marketData.js";
import candleAggregation from "../services/candleAggregation.js";
import {checkAndExecuteStrategies} from "../services/strategyChecker.js";

const Model=marketdata;


const symbols=["AAPL","MSFT","TSLA","TITN","NVDA","AMZN","GOOGL","META"];
async function runPriceTick() {
    for(const stock of symbols) {
        try {
            const data = await fetchWithCache(stock);
            const mod_data={
                symbol:stock,
                open:data.open,
                high:data.high,
                low:data.low,
                close:data.price,
                previousClose:data.previousClose,
                change:data.change,
                changePercent:data.changePercent,
                timestamp:data.timestamp
            }
            await Model.create({
                symbol: stock,
                open: data.open,
                high: data.high,
                low: data.low,
                close: data.price
            });

            await RedisClient.publish("price_change", JSON.stringify(mod_data));
            console.log(`[Scheduler] Published price update for ${stock}: $${data.price}`);
        } catch(err) {
            console.error(`[Scheduler Error ${stock}]:`, err.message);
        }
    }
}

async function scheduler() {
    // Run once immediately on startup
    runPriceTick();

    // Repeat every 10 seconds
    setInterval(runPriceTick, 10000);

    setInterval(async() => {
        for(const stock of symbols) {
            try{
                await candleAggregation(stock);
                const result=await checkAndExecuteStrategies(stock);
            }catch(err) {
                console.log("Error in aggregating candles every min"+" "+err);
            }
        }
    }, 60000);
}

export default scheduler;