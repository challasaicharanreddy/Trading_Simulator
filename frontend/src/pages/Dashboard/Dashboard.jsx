import { useMemo, useState, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { Menu } from "lucide-react";

import Sidebar from "../../components/Sidebar";
import MarketWatch, { watchlist } from "./MarketWatch";
import SelectedStock from "./SelectedStock";
import PortfolioPerformanceCard from "./portfolioPerformance";


function MarketStatus() {
    const now = new Date();

    const nyTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(now);
    console.log(nyTime)
    const [hour, minute] = nyTime.split(":").map(Number);

    const isOpen =
        (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${
        isOpen
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
      }`}
    >
      <span
        className={`size-2 rounded-full ${
          isOpen
            ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]"
            : "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.85)]"
        }`}
      />

      {isOpen ? "Market Open" : "Market Closed"}
    </div>
  );
}



function Metric({ label, value, detail }) {
  return (
    <div className="rounded-md border border-[#1f3155] bg-[#121b30] px-3 py-3">
      <p className="text-sm uppercase tracking-wider text-[#71829d]">
        {label}
      </p>

      <p className="mt-2 font-mono text-2xl font-semibold text-white">
        {value}
      </p>

      {detail && (
        <p className="mt-1 font-mono text-sm text-gain">
          {detail}
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { socket } = useSocket();
  const [selected, setSelected] = useState("AAPL");
  const [marketData, setMarketData] = useState(watchlist);
  const [activity, setActivity] = useState([]);
  const [portfolioPerformance, setPortfolioPerformance] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Subscribe to symbol rooms
    marketData.forEach((item) => socket.emit("subscribe", item.symbol));

    const handlePriceChange = (UpdatedData) => {
      if (!UpdatedData || !UpdatedData.symbol) return;

      setMarketData((prev) =>
        prev.map((item) => {
          if (item.symbol === UpdatedData.symbol) {
            const rawChange = UpdatedData.changePercent ?? 0;
            const changeNum = typeof rawChange === "number" ? rawChange : parseFloat(rawChange || 0);
            const isLoss = changeNum < 0;
            const formattedChange = `${isLoss ? "" : "+"}${changeNum.toFixed(2)}%`;

            const rawPrice = parseFloat(UpdatedData.close);
            const formattedPrice = isNaN(rawPrice) ? "--" : `$${rawPrice.toFixed(2)}`;

            return {
              ...item,
              price: formattedPrice,
              change: formattedChange,
              tone: isLoss ? "loss" : "gain",
              open: UpdatedData.open != null ? `$${parseFloat(UpdatedData.open).toFixed(2)}` : item.open,
              high: UpdatedData.high != null ? `$${parseFloat(UpdatedData.high).toFixed(2)}` : item.high,
              low: UpdatedData.low != null ? `$${parseFloat(UpdatedData.low).toFixed(2)}` : item.low,
              previousClose: UpdatedData.previousClose != null ? `$${parseFloat(UpdatedData.previousClose).toFixed(2)}` : item.previousClose,
              chartData: [
                ...(item.chartData || []),
                {
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  price: isNaN(rawPrice) ? 0 : rawPrice,
                },
              ],
            };
          }
          return item;
        })
      );
    };

    socket.on("priceChange", handlePriceChange);
    return () => {
      socket.off("priceChange", handlePriceChange);
    };
  }, [socket]);

  const stock = useMemo(
    () => marketData.find((s) => s.symbol === selected) || marketData[0],
    [selected, marketData]
  );

  return (
    <div className="min-h-screen bg-[#080e19] text-white">
      <div className="flex min-h-screen">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        {menuOpen && (
          <button
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        <main className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-[#182944] px-6 lg:px-10">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-[#8292ac] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="hidden lg:block">
              <h1 className="text-3xl font-semibold tracking-tight">
                Algorithmic Trading Dashboard
              </h1>

              <p className="mt-1 text-sm text-[#71829d]">
                Monitor your portfolio, market movements, and trading activity
                in real-time.
              </p>
            </div>

            <div>
              {MarketStatus()}
            </div>
          </header>

          <div className="mx-auto max-w-[1280px] space-y-6 p-6 lg:p-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Portfolio Value" value="--" detail="" />
              <Metric label="Available Cash" value="--" detail="" />
              <Metric
                label="Today's P&L"
                value="--"
                detail=""
              />
              <Metric
                label="Total Profit"
                value="--"
                detail=""
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
              <MarketWatch
                selected={selected}
                setSelected={setSelected}
                marketData={marketData}
              />

              <SelectedStock stock={stock} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
              <PortfolioPerformanceCard/>

              <section className="rounded-md border border-[#1f3155] bg-[#121b30] p-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">
                    Recent Activity
                  </h2>

                  <span className="text-xs text-[#71829d]">
                    Auto-trigger
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {activity.length === 0 ? (
                    <p className="text-xs text-[#71829d]">No recent activity</p>
                  ) : (
                    activity.map(
                      ([type, symbol, detail, time, tone]) => (
                        <div
                          key={`${type}-${symbol}`}
                          className="grid grid-cols-[52px_52px_1fr_80px] items-center gap-3 text-sm"
                        >
                          <span
                            className={`rounded-md px-2 py-1 text-center text-[10px] font-bold ${tone === "gain"
                              ? "bg-[#0a6339] text-gain"
                              : "bg-[#6e202a] text-[#ff8692]"
                              }`}
                          >
                            {type}
                          </span>

                          <span className="font-semibold text-white">
                            {symbol}
                          </span>

                          <span className="font-mono text-xs text-white">
                            {detail}
                          </span>

                          <span className="whitespace-nowrap text-right text-xs text-[#71829d]">
                            {time}
                          </span>
                        </div>
                      )
                    )
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}