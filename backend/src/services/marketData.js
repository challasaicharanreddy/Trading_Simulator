import axios from "axios";
import redisClient from "../config/redis.js";

const FINNHUB_BASE="https://finnhub.io/api/v1/quote";
const CACHE_TTL_SEC=60;

async function fetchPriceFromAPI(symbol){
    const response=await axios.get(FINNHUB_BASE,{
        params:{
            symbol:symbol,
            token:process.env.FINNHUB_API_KEY,
        }
    });

    console.log('RAW API RESPONSE:', JSON.stringify(response.data, null, 2));

    const data = response.data;

    // Finnhub returns 0 for all fields if the symbol is invalid or unsupported
    if (!data || data.c === 0) {
      throw new Error(`No price fetched for symbol: ${symbol}`);
    }
console.log(data);
return {
    symbol: symbol,
    price: data.c,        
    open: data.o,           
    high: data.h,         
    low: data.l,          
    previousClose: data.pc, 
    change: data.d,    
    changePercent: data.dp, 
    timestamp: Date.now(),
  };
}

async function fetchWithCache(symbol){
    const cacheKey=`price:${symbol}`;
    const cachedData=await redisClient.get(cacheKey);

    if(cachedData){
        return JSON.parse(cachedData);
    }

    const priceData=await fetchPriceFromAPI(symbol);
    await redisClient.set(cacheKey,JSON.stringify(priceData),'EX',CACHE_TTL_SEC);
    return priceData;
}

export {fetchWithCache};
