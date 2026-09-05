import MarketData from "../models/marketData.js";
import MinuteCandles from "../models/minuteCandles.js";
import RedisClient from "../config/redis.js";

const Model1=MarketData;
const Model2=MinuteCandles;

function getPreviousMinuteRange() {
    const end = new Date();

    end.setSeconds(0);
    end.setMilliseconds(0);

    const start = new Date(end);
    start.setMinutes(start.getMinutes() - 1);

    return { start,end };
}

export default async function(stock) {
    const { start,end } = getPreviousMinuteRange();

    const snapshots = await Model1.find({
        symbol: stock,
        timestamp: {
            $gte: start,
            $lt: end
        }
    }).sort({timestamp: 1});

    if (snapshots.length === 0) {
        console.log(`No snapshots found for ${stock}`);
        return;
    }

    const open = snapshots[0].close;                     
    const close = snapshots[snapshots.length - 1].close; 
    const high = Math.max(...snapshots.map(s => s.close));
    const low = Math.min(...snapshots.map(s => s.close));
    const data={
            symbol:stock,
            open:open,
            high:high,
            low:low,
            close:close,
            timestamp: start
        }

    try{
        await RedisClient.publish("new_minute_aggregation",JSON.stringify(data));
        await Model2.create(data)
        console.log("Fetched for this min and stored in mongoDB");
    }catch(err) {
        console.log("Error in adding to minutecandles"+" "+err);
    }
}
