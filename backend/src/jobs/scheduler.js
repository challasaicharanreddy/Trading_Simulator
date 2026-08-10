import RedisClient from "../config/redis.js";
import { fetchPriceFromAPI,fetchWithCache } from "../services/marketData.js";
import marketdata from "../models/marketData.js";
import candleAggregation from "../services/candleAggregation.js";


const Model=marketdata;


const symbols=["AAPL","MSFT","TSLA","TITN","NVDA","AMZN","GOOGL","META"];
async function scheduler() {
    setInterval(async () => {
        for(const stock of symbols) {
            const data=await fetchWithCache(stock);
            try {
                const update_in_db=await Model.create({
                    symbol:stock,
                    open:data.open,
                    high:data.high,
                    low:data.low,
                    close:data.price
                });

                await RedisClient.publish("price_change",JSON.stringify({
                    "symbol":stock,
                    "curr_price":data.price,
                    "time":Date.now()
                }));

            }catch(err) {
                console.error(err);
            }
        }


        
    }, 10000);

    setInterval(async() => {
        for(const stock of symbols) {
            try{
                await candleAggregation(stock);
            }catch(err) {
                console.log("Error in aggregating candles every min"+" "+err);
            }
        }
    }, 60000);
}

export default scheduler;