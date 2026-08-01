import axios from "axios";
import redisClient from "../config/redis.js";

const ALPHA_VANTAGE_BASE='https://www.alphavantage.co/query';
const CACHE_TTL_SEC=60;

async function fetchPriceFromAPI(symbol){
    const response=await axios.get(ALPHA_VANTAGE_BASE,{
        params:{
            function:'GLOBAL_QUOTE',
            symbol:symbol,
            apikey:process.env.ALPHA_VANTAGE_KEY,
        }
    });

    console.log('RAW API RESPONSE:', JSON.stringify(response.data, null, 2));

const quote=response.data['Global Quote'];
if(!quote|| !quote['05. price']){
    throw new Error(`No price fetched for symbol: ${symbol}`);
}
console.log(quote);
return {
    symbol:quote['01. symbol'],
    price:parseFloat(quote['05. price']),
    open:parseFloat(quote['02. open']),
    high:parseFloat(quote['03. high']),
    low:parseFloat(quote['04. low']),
    volume:parseInt(quote['06. volume']),
    timestamp:Date.now(),
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
