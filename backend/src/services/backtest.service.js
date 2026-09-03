import MinuteCandles from "../models/MinuteCandles.js";
import { evaluateStrategy } from "./strategyRunner.js";

const Model2 = MinuteCandles;

export default async function (start, end, buyIndicator, sellIndicator, buyThreshold, sellThreshold, symbol, quantity, buyOperator, sellOperator) {
    const candles = await Model2.find({
        symbol: symbol,
        timestamp: {
            $gte: start,
            $lte: end
        }
    }).sort({ timestamp: 1 });

    quantity = Number(quantity);
    buyThreshold = Number(buyThreshold);
    sellThreshold = Number(sellThreshold);

    let cash = 1000000;
    let shares = 0;
    let avgCost = 0;
    let peak = cash;
    let maxDrawDown = 0;

    const trades = [];
    let prices = [];
    const pvalues=[];

    let profitableTrades = 0;
    let totalTrades = 0;
    let totalProfit = 0;

    const buyDetails = {
        indicator: buyIndicator,
        period: (end - start) / (1000 * 60),
        operator: buyOperator,
        threshold: buyThreshold
    }
    const sellDetails = {
        indicator: sellIndicator,
        period: (end - start) / (1000 * 60),
        operator: sellOperator,
        threshold: sellThreshold
    }

    for (const candle of candles) {
        prices.push(candle.close);
        const buyResult = evaluateStrategy(buyDetails, prices);
        const sellResult = evaluateStrategy(sellDetails, prices);
        if (buyResult) {
            const cost = prices[prices.length - 1];
            if(cash>=cost * quantity) {
                const prev_cost = avgCost * shares;
                const new_cost = quantity * cost;
                avgCost = (prev_cost + new_cost) / (quantity + shares);
                cash -= new_cost;
                shares += quantity;
                trades.push({
                    symbol:symbol,
                    type: "BUY",
                    price: cost,
                    quantity: quantity,
                    TransactionAt: candle.timestamp
                });
                const portfoliovalue=(cash+(shares*cost))
                const temp=[portfoliovalue,candle.timestamp]
            }
        }
        if (sellResult) {
            if(shares>=quantity) {
                const cost = prices[prices.length - 1];
                cash += cost * quantity;
                shares -= quantity;
                const profit = (cost - avgCost) * quantity;
                if (profit>0) {
                    profitableTrades++;
                }
                trades.push({
                    symbol:symbol,
                    type:"SELL",
                    price:cost,
                    quantity:quantity,
                    profit:profit,
                    TransactionAt: candle.timestamp
                });
                totalProfit+=profit;
                totalTrades++;
                const portfoliovalue=(cash+(shares*cost))
                const temp=[(cash+(shares*cost)),candle.timestamp]
            }
        }
        const cost = prices[prices.length - 1];
        const portfoliovalue=(cash+(shares*cost))
        peak = Math.max(peak, portfoliovalue);

        if (candle.timestamp.getMinutes() === 0) {
            pvalues.push([
                portfoliovalue,
                candle.timestamp
            ]);
        }

        const drawdown =
            ((peak - portfoliovalue) / peak) * 100;

        maxDrawDown = Math.max(maxDrawDown, drawdown);
    }

    

    let winRate=totalTrades === 0 ? 0 : (profitableTrades / totalTrades) * 100;
    const initialCapital=1000000;
    const lastPrice = prices[prices.length - 1];

    const finalPortfolioValue =
    cash + (shares * lastPrice);

    const totalReturnPct =
    ((finalPortfolioValue - initialCapital) / initialCapital) * 100;

    return {
        trades:trades,
        totalTrades,
        profitableTrades,
        finalPortfolioValue,
        totalReturnPct:totalReturnPct,
        winRate:winRate,
        pvalues,
        maxDrawDown
    }
}