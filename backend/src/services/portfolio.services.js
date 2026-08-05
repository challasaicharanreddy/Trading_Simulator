import { fetchWithCache } from "./marketData.js";
import transactions from "../models/transactions.js";

const Model=transactions;

const getdetails=async (holdings)=>{
    if(!holdings) {
        return {
            totalValue:0,
            currentPrices:{},
            pnl:{}
        }
    }
    let totalValue=0;
    const PnL={};
    const currentPrices={};
    for(const holding of holdings) {
        let pnl=0;
        const cur_price=await fetchWithCache(holding.symbol);
        const curr_price=cur_price.price;
        const quantity=holding.quantity;
        const average_price=holding.avgCostPrice;
        pnl+=(curr_price-average_price)*(quantity);
        totalValue+=curr_price*quantity;
        PnL[holding.symbol]=pnl;
        currentPrices[holding.symbol]=curr_price;
    }

    return {
        totalValue:totalValue,
        currentPrices:currentPrices,
        pnl:PnL
    };
}

const getTradeHistory=async(userid)=>{
    const transactionHistory=await Model.find({user:userid}).sort({ executedAt: -1 });

    return transactionHistory;
}

export {getdetails,getTradeHistory}