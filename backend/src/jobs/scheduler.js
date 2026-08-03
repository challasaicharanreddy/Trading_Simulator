import RedisClient from "../config/redis.js";
import { fetchPriceFromAPI } from "../services/marketData.js";
import marketdata from "../models/marketData.js";


const Model=marketdata;


const symbols=["AAPL","MSFT","TSLA","TITN","NVDA","AMZN","GOOGL","META"];
async function scheduler() {
    setInterval(async () => {
        for(const stock of symbols) {
            const data=await fetchPriceFromAPI(stock);
            const cacheKey=`price:${stock}`;
            const CACHE_TTL_SEC = 10;
            await RedisClient.set(cacheKey,JSON.stringify(data),'EX',CACHE_TTL_SEC);
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
}

export default scheduler;