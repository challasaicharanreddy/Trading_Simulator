import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import commonMiddleware from "./middlewares/common.middleware.js"
import authroutes from "./routes/authroutes.js"
import marketRoutes from "./routes/market.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import strategyRoutes from "./routes/strategy.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import backtestRoutes from "./routes/backtest.routes.js";
import fetchStockPriceRoutes from "./routes/fetchStockPrice.routes.js"
import transactionRoutes from "./routes/transactions.routes.js"
import { getMarketStatus } from "./services/marketClock.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use('/auth', authroutes);

app.use('/app', commonMiddleware);
app.use("/app/api/market", marketRoutes);
app.use("/app/api/orders", ordersRoutes);
app.use("/app/api/strategies", strategyRoutes);
app.use("/app/portfolio", portfolioRoutes);
app.use("/app/backtest", backtestRoutes)
app.use("/app/fetchprice", fetchStockPriceRoutes);
app.use("/app/transactions", transactionRoutes);
app.get("/app/api/market/status", (req, res) => {
    const market = getMarketStatus();
    res.json({
        status: market.status,
        open: market.open
    });
});

export default app;
