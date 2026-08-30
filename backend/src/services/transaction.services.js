import Transaction from "../models/transactions.js";
import Portfolio from "../models/portfolio.js";

export async function getRecentTransactions(userId) {

    const portfolio = await Portfolio.findOne({
        user: userId
    });

    if (!portfolio) {
        throw new Error("Portfolio not found");
    }

    const transactions = await Transaction.find({
        portfolio: portfolio._id
    })
        .sort({ executedAt: -1 })
        .limit(5)
        .lean();

    return transactions.map((transaction) => ({
        id: transaction._id,
        action: transaction.action,
        symbol: transaction.symbol,
        quantity: transaction.quantity,
        price: transaction.price,
        executedAt: transaction.executedAt
    }));
}