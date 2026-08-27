import express from "express";
import portfolio from "../models/portfolio.js";
import holdings from "../models/holdings.js";
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
        holdings:details.curr_holding_stats
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

export default router
