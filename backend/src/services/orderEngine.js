import Portfolio from "../models/portfolio.js";
import Holding from "../models/holdings.js";
import Transaction from "../models/transactions.js";

async function executeBuyOrder(userId, symbol, quantity, price){
    const totalAmount=quantity*price;

    const portfolio=await Portfolio.findOne({user:userId});
    if(!portfolio){
        throw new Error("Portfolio not found for this user");
    }

    if(portfolio.cashBalance<totalAmount){
        throw new Error(
            `Insufficient cash balance. Required: ${totalAmount}, Available: ${portfolio.cashBalance}`
        );
    }
    portfolio.cashBalance-=totalAmount;
    await portfolio.save();

    let holding=await Holding.findOne({portfolio:portfolio._id,symbol});
    if(holding){
        const existingValue=holding.quantity*holding.avgCostPrice;
        const newValue=totalAmount;
        const newQuantity=holding.quantity+quantity;
        holding.avgCostPrice=(existingValue+newValue)/newQuantity;
        holding.quantity=newQuantity;
        holding.updatedAt=Date.now();
        await holding.save();
    } else {
        await Holding.create({
            portfolio: portfolio._id,
            symbol,
            quantity,
            avgCostPrice: price,
            updatedAt: Date.now()
        });
    }

    const transaction=await Transaction.create({
        user: userId,
        portfolio: portfolio._id,
        symbol,
        quantity,
        price,
        action: "BUY",
        executedAt: Date.now()
    });

    console.log("Buy order executed successfully");

    return {transaction,holding,cashBalance:portfolio.cashBalance};
} 

async function executeSellOrder(userId,symbol, quantity, price){
    const portfolio=await Portfolio.findOne({user:userId});
    if(!portfolio){
        throw new Error("Portfolio not found for this user");
    }

    const holding=await Holding.findOne({portfolio:portfolio._id,symbol});
    if(!holding || holding.quantity<quantity){
        throw new Error(
            `Insufficient shares. Trying to sell ${quantity}, own ${holding ? holding.quantity : 0}`
        );
    }
    const pnl=(price-holding.avgCostPrice)*quantity;
    console.log(price);
    console.log(holding.avgCostPrice)
    console.log(quantity)
    holding.quantity-=quantity;
    holding.updatedAt=Date.now();

    if(holding.quantity===0){
        await Holding.deleteOne({_id:holding._id});
    } else {
        await holding.save();
    }

    const totalAmount=quantity*price;
    portfolio.cashBalance+=totalAmount;
    await portfolio.save();

    const transaction=await Transaction.create({
        user: userId,
        portfolio: portfolio._id,
        symbol,
        quantity,
        price,
        action: "SELL",
        executedAt: Date.now(),
        pnl:pnl
    });
    console.log("sell order executed successfully");
    return {transaction, holding, cashBalance: portfolio.cashBalance};
}

export {executeBuyOrder, executeSellOrder};