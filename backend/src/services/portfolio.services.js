import { fetchWithCache } from "./marketData.js";
import Portfolio from "../models/portfolio.js";
import PortfolioSnapshot from "../models/portfolioSnapshot.js";
import Users from "../models/users.js";
import transactions from "../models/transactions.js";
import Holding from "../models/holdings.js";

const Model=transactions;

const getdetails=async (holdings)=>{
    if(!holdings) {
        return {
            totalValue:0,
            currentPrices:{},
            pnl:{}
        }
    }
    const curr_holding_stats={};
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


        const curr_value = curr_price * quantity;
        const pnl_percent =
            (pnl / (average_price * quantity)) * 100;

        curr_holding_stats[holding.symbol] = {
            quantity,
            avg_buy_price: average_price,
            curr_price,
            curr_value,
            pnl,
            pnl_percent,
        };
    }

    return {
        curr_holding_stats,
        pnl:PnL
    };
}

const getTradeHistory=async(userid)=>{
    const transactionHistory=await Model.find({user:userid}).sort({ executedAt: -1 });

    return transactionHistory;
}

async function takeSnapshotForUser(userId) {
    const portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) return;
  
    const holdings = await Holding.find({ portfolio: portfolio._id });
  
    let holdingsValue = 0;
    for (const holding of holdings) {
      const currentPrice = await fetchWithCache(holding.symbol);
      if (currentPrice !== null) {
        holdingsValue += holding.quantity * currentPrice.price;
      } else {
        holdingsValue += holding.quantity * holding.avgCostPrice;
      }
    }
  
    const totalValue = portfolio.cashBalance + holdingsValue;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    await PortfolioSnapshot.findOneAndUpdate(
      { user: userId, date: today },
      {
        user: userId,
        portfolioValue: totalValue,
        date: today,
      },
      { upsert: true, returnDocument: "after" }
    );
  }
  
  async function takeSnapshotsForAllUsers() {
    const users = await Users.find().select("_id");
    console.log(`Taking portfolio snapshots for ${users.length} users...`);
  
    for (const user of users) {
      try {
        await takeSnapshotForUser(user._id);
      } catch (err) {
        console.error(`Snapshot failed for user ${user._id}:`, err.message);
      }
    }
  
    console.log("Portfolio snapshots complete.");
  }

  const PortfolioMetrics=async (userId)=>{
    const portfolio=await Portfolio.findOne({user:userId});
    const cash=portfolio.cashBalance;
    const holdings = await Holding.find({ portfolio: portfolio._id });
  
    let holdingsValue = 0;
    for (const holding of holdings) {
      const currentPrice = await fetchWithCache(holding.symbol);
      holdingsValue += holding.quantity * currentPrice.price;
    }
    const portfolioValue = cash + holdingsValue;
    const previousSnapshot=await PortfolioSnapshot.findOne({user:userId}).sort({ date: -1 });
    const todayPnL=portfolioValue-previousSnapshot.portfolioValue;
    const todayPnLPercentage=(todayPnL / previousSnapshot.portfolioValue) * 100;
    const totalPnL=portfolioValue-1000000;
    const totalPnLPercentage=(totalPnL/1000000)*100;
    return {
      portfolioValue,cash,todayPnL,todayPnLPercentage,totalPnL,totalPnLPercentage
    }
  }

export {getdetails,getTradeHistory,takeSnapshotsForAllUsers,PortfolioMetrics};