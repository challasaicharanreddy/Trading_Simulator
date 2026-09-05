import MinuteCandles from "../models/minuteCandles.js";
const Model=MinuteCandles
export default async function(symbol,timeperiod) {
    const time=24*60*60*1000;
    const data=await Model.find({
        symbol,
        timestamp:{
            $gte:Date.now()-time
        }
    }).sort({ timestamp: 1 });
    return data;
}
