import express from "express";
import portfolio from "../models/portfolio.js";
import holdings from "../models/holdings.js";
import PortfolioSnapshot from "../models/portfolioSnapshot.js";
import { getdetails,getTradeHistory } from "../services/portfolio.services.js";

const router=express.Router();
const Model=portfolio;
const Model2=holdings;

router.get("/",async(req,res)=>{
    const userid=req.user.id;
    const user_portfolio=await Model.findOne({user:userid});
    const portfolio_id=user_portfolio._id;
    const user_holdings=await Model2.find({portfolio:portfolio_id});
    const cashBalance=user_portfolio.cashBalance;
    const details=await getdetails(user_holdings);

    return res.json({
        cashBalance:cashBalance,
        totalValue:cashBalance+details.totalValue,
        holdings:details.currentPrices
    })

});
router.get("/trades",async(req,res)=>{
    const userid=req.user.id;
    const tradeHistory=await getTradeHistory(userid);

    return res.json(tradeHistory);
});
router.get("/pnl",async(req,res)=>{
    const userid=req.user.id;
    const user_portfolio=await Model.findOne({user:userid});
    const portfolio_id=user_portfolio._id;
    const user_holdings=await Model2.findOne({portfolio:portfolio_id});
    const details=await getdetails(user_holdings);

    return res.json(details.pnl);
})

router.get("/history", async (req, res) => {
  console.log('ROUTE HIT')
    try {
      const userId = req.user.id;
  
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
  
      const snapshots = await PortfolioSnapshot
        .find({ user: userId, date: { $gte: sevenDaysAgo } })
        .sort({ date: 1 })
        .lean();
  
      const chartData = snapshots.map((s) => ({
        date: s.date.toISOString().split("T")[0], // "2026-08-11" format for chart labels
        value: s.portfolioValue,
      }));
  
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

export default router
