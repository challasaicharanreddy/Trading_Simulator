import axios from "axios";
import redisClient from "../config/redis.js";

const FINNHUB_BASE="https://finnhub.io/api/v1/quote";
const CACHE_TTL_SEC=9;

async function fetchPriceFromAPI(symbol){
    const response=await axios.get(FINNHUB_BASE,{
        timeout:10000,
        params:{
            symbol:symbol,
            token:process.env.FINNHUB_API_KEY,
        }
    });

    // console.log('RAW API RESPONSE:', JSON.stringify(response.data, null, 2));

    const data = response.data;

    if (!data || data.c === 0) {
      throw new Error(`No price fetched for symbol: ${symbol}`);
    }
// console.log(data);
console.log("Data fetched");
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

export {fetchWithCache,fetchPriceFromAPI};
