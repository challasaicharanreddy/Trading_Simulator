import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import MarketStatus from "../components/MarketStatus";

const stocks = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "AMZN", name: "Amazon.com" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "TSLA", name: "Tesla Inc." },
];

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCash(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return `$${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatRelativeTime(date) {
  const now = new Date();
  const executed = new Date(date);

  const difference = Math.floor(
    (now.getTime() - executed.getTime()) / 1000
  );

  if (difference < 60) {
    return "Just now";
  }

  const minutes = Math.floor(difference / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days > 1 ? "s" : ""} ago`;
}


function OrderEngine() {
  const { socket, isConnected } = useSocket();

  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [action, setAction] = useState("BUY");
  const [quantity, setQuantity] = useState(1);

  const [marketData, setMarketData] = useState({});

  const [cash, setCash] = useState(null);

  const [recentOrders, setRecentOrders] = useState([]);

  const [metricsLoading, setMetricsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);

  /*
   * Subscribe to the selected stock and receive live prices.
   */
  useEffect(() => {
    if (!socket) return;

    socket.emit("subscribe", selectedSymbol);

    const handlePriceChange = (data) => {
      if (!data || !data.symbol) return;

      setMarketData((previous) => ({
        ...previous,
        [data.symbol]: data,
      }));
    };

    socket.on("priceChange", handlePriceChange);

    return () => {
      socket.emit("unsubscribe", selectedSymbol);
      socket.off("priceChange", handlePriceChange);
    };
  }, [socket, selectedSymbol]);

  /*
   * Fetch portfolio metrics.
   * We mainly need available cash here.
   */
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetricsLoading(true);

        const response = await axios.get(
          "http://localhost:5000/app/portfolio/metrics",
          {
            withCredentials: true,
          }
        );

        setCash(response.data.cash);
      } catch (error) {
        console.error("Failed to fetch portfolio metrics:", error);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  /*
   * Fetch recent executed orders.
   */
  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true);

      const response = await axios.get(
        "http://localhost:5000/app/api/orders/recent",
        {
          withCredentials: true,
        }
      );

      setRecentOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch recent orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  /*
   * Current selected stock.
   */
  const selectedStock = useMemo(() => {
    return marketData[selectedSymbol];
  }, [marketData, selectedSymbol]);

  /*
   * Numeric current price.
   */
  const currentPrice = Number(selectedStock?.close ?? 0);

  /*
   * Estimated order value.
   */
  const estimatedValue = currentPrice * Number(quantity || 0);

  /*
   * Handle quantity changes.
   */
  const handleQuantityChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setQuantity("");
      return;
    }

    const numericValue = Number(value);

    if (numericValue >= 0) {
      setQuantity(numericValue);
    }
  };

  /*
   * Submit BUY / SELL order.
   */
  const handlePlaceOrder = async () => {
    setOrderError(null);
    setOrderSuccess(null);

    const numericQuantity = Number(quantity);

    if (!selectedSymbol) {
      setOrderError("Please select a stock.");
      return;
    }

    if (!Number.isInteger(numericQuantity) || numericQuantity <= 0) {
      setOrderError("Quantity must be a positive whole number.");
      return;
    }

    if (!currentPrice || currentPrice <= 0) {
      setOrderError("Current market price is not available.");
      return;
    }

    if (action === "BUY" && cash !== null && estimatedValue > cash) {
      setOrderError("Insufficient cash balance.");
      return;
    }

    try {
      setOrderLoading(true);

      const endpoint =
        action === "BUY"
          ? "http://localhost:5000/app/api/orders/buy"
          : "http://localhost:5000/app/api/orders/sell";

      const response = await axios.post(
        endpoint,
        {
          symbol: selectedSymbol,
          quantity: numericQuantity,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Order executed:", response.data);

      setOrderSuccess(
        `${action} order for ${numericQuantity} ${selectedSymbol} shares executed successfully.`
      );

      /*
       * Refresh portfolio cash after execution.
       */
      try {
        const metricsResponse = await axios.get(
          "http://localhost:5000/app/portfolio/metrics",
          {
            withCredentials: true,
          }
        );

        setCash(metricsResponse.data.cash);
      } catch (error) {
        console.error("Failed to refresh cash:", error);
      }

      /*
       * Refresh recent orders.
       */
      await fetchRecentOrders();

    } catch (error) {
      console.error("Order execution failed:", error);

      setOrderError(
        error.response?.data?.error ||
          "Order execution failed. Please try again."
      );
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080e19] text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        {menuOpen && (
          <button
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* MAIN */}

        <main className="min-w-0 flex-1">

          {/* HEADER */}

          <header className="flex h-20 items-center justify-between border-b border-[#182944] px-6 lg:px-8">

            <button
              onClick={() => setMenuOpen(true)}
              className="text-[#8292ac] lg:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Order Engine
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-[#71829d]">
                Execute and monitor your trading orders.
              </p>
            </div>

            <div>
                <MarketStatus/>
              </div>

          </header>

          {/* CONTENT */}

          <div className="mx-auto max-w-[1280px] space-y-6 p-6 lg:p-8">

            {/* TOP SECTION */}

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

              {/* PLACE ORDER */}

              <section className="rounded-md border border-[#1f3155] bg-[#121b30] p-5">

                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    Place Order
                  </h2>

                  <p className="mt-1 text-xs text-[#71829d]">
                    Configure and submit a market order.
                  </p>
                </div>

                <div className="mt-6 space-y-5">

                  {/* SYMBOL */}

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-[#71829d]">
                      Symbol
                    </label>

                    <select
                      value={selectedSymbol}
                      onChange={(event) => {
                        setSelectedSymbol(event.target.value);
                        setOrderError(null);
                        setOrderSuccess(null);
                      }}
                      className="w-full rounded-md border border-[#1f3155] bg-[#080e19] px-3 py-3 text-sm text-white outline-none focus:border-[#3c85ff]"
                    >
                      {stocks.map((stock) => (
                        <option
                          key={stock.symbol}
                          value={stock.symbol}
                        >
                          {stock.symbol}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CURRENT PRICE */}

                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-[#71829d]">
                      Current Price
                    </p>

                    <div className="rounded-md border border-[#1f3155] bg-[#1d2f55] px-3 py-3 font-mono text-lg font-semibold text-gain">
                      {currentPrice
                        ? formatMoney(currentPrice)
                        : "Waiting for market price..."}
                    </div>
                  </div>

                  {/* ACTION */}

                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-[#71829d]">
                      Action
                    </p>

                    <div className="grid grid-cols-2 gap-2">

                      <button
                        type="button"
                        onClick={() => {
                          setAction("BUY");
                          setOrderError(null);
                          setOrderSuccess(null);
                        }}
                        className={`rounded-md border px-4 py-3 text-sm font-semibold transition ${
                          action === "BUY"
                            ? "border-[#18a957] bg-[#0d5b35] text-[#35d47a]"
                            : "border-[#1f3155] bg-[#0b1222] text-[#71829d] hover:text-white"
                        }`}
                      >
                        BUY
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAction("SELL");
                          setOrderError(null);
                          setOrderSuccess(null);
                        }}
                        className={`rounded-md border px-4 py-3 text-sm font-semibold transition ${
                          action === "SELL"
                            ? "border-[#d43a4b] bg-[#661f2a] text-[#ff7d89]"
                            : "border-[#1f3155] bg-[#0b1222] text-[#71829d] hover:text-white"
                        }`}
                      >
                        SELL
                      </button>

                    </div>
                  </div>

                  {/* QUANTITY */}

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-[#71829d]">
                      Quantity
                    </label>

                    <div className="relative">

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-full rounded-md border border-[#1f3155] bg-[#080e19] px-3 py-3 pr-16 font-mono text-sm text-white outline-none focus:border-[#3c85ff]"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#71829d]">
                        shares
                      </span>

                    </div>
                  </div>

                  {/* CALCULATIONS */}

                  <div className="border-t border-[#1f3155] pt-4">

                    <div className="flex items-center justify-between">

                      <span className="text-sm text-[#71829d]">
                        Estimated Value
                      </span>

                      <span className="font-mono text-sm font-semibold text-white">
                        {currentPrice
                          ? formatMoney(estimatedValue)
                          : "—"}
                      </span>

                    </div>

                    <div className="mt-2 flex items-center justify-between">

                      <span className="text-sm text-[#71829d]">
                        Available Cash
                      </span>

                      <span className="font-mono text-sm text-[#71829d]">
                        {metricsLoading
                          ? "Loading..."
                          : formatCash(cash)}
                      </span>

                    </div>

                  </div>

                  {/* CONFIRMATION */}

                  <div className="rounded-md border border-[#263c73] bg-[#172852] px-3 py-3 text-xs text-white">

                    You are about to{" "}

                    <span
                      className={
                        action === "BUY"
                          ? "font-semibold text-gain"
                          : "font-semibold text-loss"
                      }
                    >
                      {action}
                    </span>{" "}

                    <span className="font-semibold">
                      {quantity || 0} {selectedSymbol}
                    </span>{" "}

                    shares at approximately{" "}

                    <span className="font-mono text-[#4b91ff]">
                      {currentPrice
                        ? formatMoney(currentPrice)
                        : "—"}
                    </span>{" "}
                    per share.

                  </div>

                  {/* ERROR */}

                  {orderError && (
                    <div className="rounded-md border border-[#7f2935] bg-[#421820] px-3 py-3 text-sm text-[#ff8692]">
                      {orderError}
                    </div>
                  )}

                  {/* SUCCESS */}

                  {orderSuccess && (
                    <div className="rounded-md border border-[#176b42] bg-[#0c3928] px-3 py-3 text-sm text-gain">
                      {orderSuccess}
                    </div>
                  )}

                  {/* PLACE ORDER */}

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={orderLoading}
                    className="w-full rounded-md bg-[#3c85ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3277eb] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {orderLoading
                      ? "Executing Order..."
                      : "Place Order"}
                  </button>

                </div>

              </section>

              {/* RIGHT SIDE */}

              <div className="space-y-5">

                {/* ORDER SUMMARY */}

                <section className="rounded-md border border-[#1f3155] bg-[#121b30] p-5">

                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    Order Summary
                  </h2>

                  <div className="mt-5 space-y-3">

                    <div className="flex justify-between">
                      <span className="text-sm text-[#71829d]">
                        Symbol
                      </span>

                      <span className="font-mono text-sm font-semibold">
                        {selectedSymbol}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-[#71829d]">
                        Action
                      </span>

                      <span
                        className={`font-mono text-sm font-semibold ${
                          action === "BUY"
                            ? "text-gain"
                            : "text-loss"
                        }`}
                      >
                        {action}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-[#71829d]">
                        Quantity
                      </span>

                      <span className="font-mono text-sm">
                        {quantity || 0} shares
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-[#71829d]">
                        Current Price
                      </span>

                      <span className="font-mono text-sm">
                        {currentPrice
                          ? formatMoney(currentPrice)
                          : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-[#71829d]">
                        Estimated Value
                      </span>

                      <span className="font-mono text-sm font-semibold">
                        {currentPrice
                          ? formatMoney(estimatedValue)
                          : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-[#71829d]">
                        Available Cash
                      </span>

                      <span className="font-mono text-sm">
                        {formatCash(cash)}
                      </span>
                    </div>

                  </div>

                  <div className="mt-5 rounded-md border border-[#176b42] bg-[#0c3928] px-3 py-2 text-center text-xs font-medium text-gain">
                    Ready to Execute
                  </div>

                </section>

                {/* TRADING INFORMATION */}

                <section className="rounded-md border border-[#1f3155] bg-[#121b30] p-5">

                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    Trading Information
                  </h2>

                  <div className="mt-4 space-y-3">

                    <div className="flex justify-between">
                      <span className="text-sm text-[#71829d]">
                        Market Status
                      </span>

                      <span
                        className={`text-sm font-medium ${
                          isConnected
                            ? "text-gain"
                            : "text-loss"
                        }`}
                      >
                        {isConnected
                          ? "Connected"
                          : "Disconnected"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-[#71829d]">
                        Selected Market
                      </span>

                      <span className="text-sm font-semibold">
                        NASDAQ
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-[#71829d]">
                        Order Type
                      </span>

                      <span className="text-sm font-semibold">
                        Market
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-[#71829d]">
                        Currency
                      </span>

                      <span className="text-sm font-semibold">
                        USD
                      </span>
                    </div>

                  </div>

                </section>

              </div>

            </div>

            {/* RECENT ORDERS */}

            <section className="rounded-md border border-[#1f3155] bg-[#121b30] p-5">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    Recent Orders
                  </h2>

                  <p className="mt-1 text-xs text-[#71829d]">
                    Latest submitted orders
                  </p>
                </div>

                <Link
                    to="/transactions"
                    className="text-xs text-[#3c85ff] hover:text-[#5896ff]"
                >
                    View All →
                </Link>

              </div>

              {/* TABLE HEADER */}

              <div className="mt-5 hidden grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-[#1f3155] px-3 pb-3 text-xs uppercase tracking-wider text-[#71829d] md:grid">

                <span>Symbol</span>
                <span>Action</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Status</span>
                <span className="text-right">Time</span>

              </div>

              {/* ORDERS */}

              <div className="mt-2">

                {ordersLoading ? (
                  <div className="px-3 py-8 text-center text-sm text-[#71829d]">
                    Loading recent orders...
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm text-white">
                      No recent orders
                    </p>

                    <p className="mt-1 text-xs text-[#71829d]">
                      Orders you submit will appear here.
                    </p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="grid gap-2 border-b border-[#1b2b47] px-3 py-3 text-sm hover:bg-[#182640] md:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] md:items-center"
                    >

                      <div>
                        <span className="font-semibold">
                          {order.symbol}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-bold ${
                            order.action === "BUY"
                              ? "bg-[#0a6339] text-gain"
                              : "bg-[#6e202a] text-[#ff8692]"
                          }`}
                        >
                          {order.action}
                        </span>
                      </div>

                      <div className="font-mono">
                        {order.quantity}
                      </div>

                      <div className="font-mono">
                        {formatMoney(order.price)}
                      </div>

                      <div>
                        <span className="inline-block rounded bg-[#0a6339] px-2 py-1 text-xs font-semibold text-gain">
                          EXECUTED
                        </span>
                      </div>

                      <div className="text-left text-xs text-[#71829d] md:text-right">
                        {formatRelativeTime(order.executedAt)}
                      </div>

                    </div>
                  ))
                )}

              </div>

            </section>

          </div>

        </main>

      </div>
    </div>
  );
}

export default OrderEngine;