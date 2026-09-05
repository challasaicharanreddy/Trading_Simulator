import Startegy from '../models/strategy.js';
import MinuteCandles from '../models/minuteCandles.js';
import {evaluateStrategy} from './strategyRunner.js';
import {executeBuyOrder, executeSellOrder} from './orderEngine.js';

async function checkAndExecuteStrategies(symbol) {
    const strategies=await Startegy.find({symbol, status:"ACTIVE"});
    if(strategies.length===0)return;

    const recentPrices=await MinuteCandles.find({symbol}).sort({timestamp:-1}).limit(45000).lean();

    const prices=recentPrices.reverse().map(s=>s.close);

    for(const strategy of strategies){
        const shouldExecute=evaluateStrategy(strategy, prices);

        if(shouldExecute){
            try{
                const currPrice=prices[prices.length-1];
                if(strategy.action==="BUY"){
                    await executeBuyOrder(strategy.user, strategy.symbol, strategy.quantity, currPrice);
                }
                else if(strategy.action==="SELL"){
                    await executeSellOrder(strategy.user, strategy.symbol, strategy.quantity, currPrice);
                }

                console.log(
                    `Strategy fired: ${strategy.name} | ${strategy.action} ${strategy.quantity} ${strategy.symbol} for user ${strategy.user}`
                  );

                strategy.status="INACTIVE";
                await strategy.save();
            }catch(err){
                console.error(`Strategy "${strategy.name}" execution failed for ${strategy._id}:`, err.message);
            }
        }
    }
}
export {checkAndExecuteStrategies};
