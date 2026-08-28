import MinuteCandles from "../models/MinuteCandles.js";
const Model=MinuteCandles
export default async function(symbol,timeperiod) {
    const time=60*60*1000;
    const data=await Model.find({
        symbol,
        timestamp:{
            $gte:Date.now()-time
        }
    }).sort({ timestamp: 1 });
    return data;
}