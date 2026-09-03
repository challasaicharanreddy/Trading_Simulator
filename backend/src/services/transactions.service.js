import transactions from "../models/transactions.js";
import Portfolio from "../models/portfolio.js";
export async function transactionsService(userid) {
    const data=await transactions.find({user:userid}).sort({executedAt:-1});
    let buyorders=0;
    let sellorders=0;
    let totalvolume=0;
    for(const transaction of data) {
        if(transaction.action=="BUY") {
            buyorders++;
        }else{
            sellorders++;
        }
        totalvolume+=(transaction.quantity*transaction.price);
    }
    return {
        totalorders:(buyorders+sellorders),
        buyorders,
        sellorders,
        avgtradesize:data.length>0?(totalvolume/data.length):0,
        record:data
    }
}
export async function getRecentTransactions(userId) {

    const portfolio = await Portfolio.findOne({
        user: userId
    });

    if (!portfolio) {
        throw new Error("Portfolio not found");
    }

    const transaction = await transactions.find({
        portfolio: portfolio._id
    })
        .sort({ executedAt: -1 })
        .limit(5)
        .lean();

    return transaction.map((transactionn) => ({
        id: transactionn._id,
        action: transactionn.action,
        symbol: transactionn.symbol,
        quantity: transactionn.quantity,
        price: transactionn.price,
        executedAt: transactionn.executedAt
    }));
}
