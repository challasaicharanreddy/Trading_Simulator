# QuantX — Real-Time Algorithmic Trading Simulator

**QuantX** is a full-stack real-time algorithmic trading simulator designed to provide a realistic paper-trading environment with live market data, portfolio management, order execution, rule-based trading strategies, backtesting, and real-time market visualization.

The platform combines a React-based trading interface with a Node.js/Express backend, MongoDB for persistent data storage, Redis for caching, and Socket.io for real-time communication.

🌐 **Live Application:** https://quant-x-frontend.vercel.app

---

## Overview

QuantX simulates a complete trading workflow without involving real financial transactions.

Users can:

- Monitor live market prices
- View real-time candlestick charts
- Manage virtual cash and stock holdings
- Execute BUY/SELL paper trades
- Track portfolio performance and P&L
- View transaction history
- Create and manage rule-based trading strategies
- Automatically execute active strategies when their conditions are satisfied
- Perform historical strategy backtesting
- Analyze market and portfolio information through a centralized trading dashboard

The project was designed with emphasis on **backend engineering, real-time communication, caching, authentication, data persistence, and modular system architecture**.

---

## Key Features

### 📈 Real-Time Market Data

- Fetches market data through the Finnhub API.
- Uses Redis as a caching layer to reduce repeated external API requests.
- Stores minute-level OHLC market data in MongoDB.
- Uses Socket.io to broadcast real-time price updates to connected clients.
- Supports live market monitoring across the configured stock symbols.

### 💼 Portfolio Management

The portfolio system maintains:

- Available cash balance
- Stock holdings
- Quantity held per symbol
- Average acquisition price
- Current market value
- Profit/Loss
- Portfolio value
- Historical portfolio snapshots

Portfolio value is calculated using the current market value of all holdings together with the available cash balance.

### ⚡ Order Engine

QuantX contains a centralized paper-trading Order Engine responsible for executing simulated market orders.

Supported operations:

- BUY orders
- SELL orders
- Cash balance validation
- Holdings validation
- Weighted-average cost calculation
- Portfolio balance updates
- Holding creation and modification
- Transaction persistence

The backend remains authoritative for order execution prices and portfolio state.

### 🧠 Strategy Engine

The Strategy Engine allows users to define rule-based trading strategies.

Currently supported indicators:

- Simple Moving Average (SMA)
- Relative Strength Index (RSI)

Strategies can be configured using:

- Strategy name
- Stock symbol
- Indicator
- Indicator period
- Comparison operator
- Threshold
- Action
- Quantity
- Active/Inactive status

Example strategy:

```text
IF AAPL SMA(20) > 300
THEN BUY 10 shares