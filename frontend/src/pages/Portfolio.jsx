import { ArrowLeft, BarChart3, CircleDollarSign, LayoutDashboard, Menu, PieChart, Settings, TrendingUp, X, } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";


function Stat({ label, value, detail, tone, isPnL }) {
  const isLoss = tone === "loss" || (isPnL && String(value).startsWith("-"));
  const isGain = tone === "gain" || (isPnL && String(value).startsWith("+"));

  const valueColor = isPnL
    ? isLoss
      ? "text-loss"
      : isGain
        ? "text-gain"
        : "text-white"
    : "text-white";

  const toneClass =
    tone === "gain"
      ? "text-gain"
      : tone === "loss"
        ? "text-loss"
        : "text-[#71829d]";

  return (
    <div className="rounded-md border border-[#1f3155] bg-[#121b30] p-5">
      <p className="text-xs uppercase tracking-wider text-[#71829d] font-medium">
        {label}
      </p>

      <p className={`mt-2 font-mono text-2xl font-semibold ${valueColor}`}>
        {value || "—"}
      </p>

      {detail && (
        <p className={`mt-1 font-mono text-xs ${toneClass}`}>
          {detail}
        </p>
      )}
    </div>
  );
}

function Card({ title, action, children, className = "" }) {
  return (
    <section
      className={`
        rounded-md border border-[#1f3155]
        bg-[#121b30]
        ${className}
      `}
    >
      <div className="flex items-center justify-between border-b border-[#1f3155] px-5 py-4">
        <h2 className="text-base sm:text-lg font-semibold text-white">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MarketStatus() {
  const now = new Date();

  const nyTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const [hour, minute] = nyTime.split(":").map(Number);

  const isOpen =
    (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${isOpen
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
        }`}
    >
      <span
        className={`size-2 rounded-full ${isOpen
            ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]"
            : "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.85)]"
          }`}
      />

      {isOpen ? "Market Open" : "Market Closed"}
    </div>
  );
}

const COLORS = {
  AAPL: "#53627d",
  MSFT: "#b885ff",
  TSLA: "#f59e75",
  TITN: "#a3e635",
  NVDA: "#25d98a",
  AMZN: "#facc15",
  GOOGL: "#22d3ee",
  META: "#f472b6",
  CASH: "#4b91ff"
};

const STOCK_NAMES = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  TSLA: "Tesla Inc.",
  TITN: "Titan Company Limited",
  NVDA: "NVIDIA Corporation",
  AMZN: "Amazon.com Inc.",
  GOOGL: "Alphabet Inc.",
  META: "Meta Platforms Inc."
}

export default function PortfolioPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const [holdings, setholdings] = useState([]);
  const [pnl, setpnl] = useState([]);
  const [allocation, setallocation] = useState([]);

  const [holding_stats, setholding_stats] = useState({});
  const [cash, setcash] = useState(0);
  const { socket, isConnected } = useSocket();
  const [bestperformer, setbestperformer] = useState([]);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  let totalPortfolioValue = 0;
  let totalPnL = 0;
  let totalInvested = 0;
  let activeHoldings = 0;
  let holding_numbers = 0;
  for (const symbol in holding_stats) {
    const stats = holding_stats[symbol];
    totalPortfolioValue += stats.curr_value;
    totalPnL += stats.pnl;
    totalInvested += (stats.avg_buy_price * stats.quantity);
    activeHoldings += stats.quantity;
    holding_numbers++;
  }
  totalPortfolioValue += cash;



  useEffect(() => {
    const run = async () => {
      const result = await axios.get("http://localhost:5000/app/portfolio", { withCredentials: true });
      setholding_stats(result.data.holdings)
      setcash(result.data.cashBalance)
    }
    run();
  }, [])

  useEffect(() => {
    const newHoldings = [];
    const newPnl = [];
    let totalValue = 0;
    let temp = ["", 0];

    if (!holding_stats) return;

    for (const symbol in holding_stats) {
      const stats = holding_stats[symbol];
      const status = stats.pnl > 0 ? "gain" : "loss"

      if (stats.pnl_percent > temp[1]) {
        temp[0] = symbol;
        temp[1] = stats.pnl_percent;
      }

      newHoldings.push([
        symbol,
        STOCK_NAMES[symbol],
        stats.quantity,
        stats.avg_buy_price.toFixed(2),
        stats.curr_price?.toFixed(2),
        stats.curr_value.toFixed(2),
        stats.pnl.toFixed(2),
        stats.pnl_percent.toFixed(2),
        status
      ]);
      newPnl.push({
        symbol: symbol,
        pnl: stats.pnl.toFixed(2),
      });
      totalValue += stats.curr_value;
    }

    totalValue += cash;

    const newAllocation = [];

    for (const symbol in holding_stats) {
      const stats = holding_stats[symbol];
      newAllocation.push({
        name: symbol,
        value: (stats.curr_value),
        percent: ((stats.curr_value / totalValue) * 100).toFixed(2),
        color: COLORS[symbol]
      })
    }
    newAllocation.push({
      name: "CASH",
      value: cash,
      percent: ((cash / totalValue) * 100).toFixed(2),
      color: COLORS["CASH"]
    })

    setallocation(newAllocation);
    setpnl(newPnl);
    setholdings(newHoldings);
    setbestperformer(temp);

  }, [holding_stats]);

  useEffect(() => {
    if (!isConnected || !socket) return;
    for (const stock in holding_stats) {
      socket.emit("subscribe", stock);
    }
    const symbols = Object.keys(holding_stats);
    const updNewPrices = (data) => {
      console.log(data)
      setholding_stats((prev) => {
        const holding = prev[data.symbol];

        if (!holding) return prev;

        const pnl =
          (data.close - holding.avg_buy_price) * holding.quantity;

        const pnl_percent =
          (pnl / (holding.avg_buy_price * holding.quantity)) * 100;

        return {
          ...prev,

          [data.symbol]: {
            ...holding,
            curr_price: data.close,
            curr_value: data.close * holding.quantity,
            pnl,
            pnl_percent,
          },
        };
      });
    };
    socket.on("priceChange", updNewPrices);

    return () => {
      symbols.forEach((symbol) => {
        socket.emit("unsubscribe", symbol);
      });

      socket.off("priceChange", updNewPrices);
    };

  }, [socket, isConnected, holding_stats]);

  return (
    <div className="min-h-screen bg-[#080e19] text-white">
      <div className="flex min-h-screen">
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

        <main className="min-w-0 flex-1">

          <header className="flex h-20 items-center justify-between border-b border-[#182944] px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-[#8292ac] hover:text-white"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                onClick={() => setMenuOpen(true)}
                className="text-[#8292ac] lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Portfolio
                </h1>

                <p className="mt-1 text-xs sm:text-sm text-[#71829d]">
                  Overview of your holdings, performance, and portfolio analytics.
                </p>
              </div>
            </div>

            <div>
              {MarketStatus()}
            </div>
          </header>

          <div className="mx-auto max-w-[1280px] space-y-6 p-6 lg:p-8">

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Stat
                label="Total Portfolio Value"
                value={`$${totalPortfolioValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                detail={`As of ${formatDate(new Date())}`}
                tone="neutral"
              />

              <Stat
                label="Best Performer"
                value={bestperformer[0] || "—"}
                detail={bestperformer[1] !== undefined ? `+${bestperformer[1]?.toFixed(2)}%` : ""}
                tone="gain"
              />

              <Stat
                label="Holdings P&L"
                isPnL
                value={`${totalPnL >= 0 ? "+" : "-"}$${Math.abs(totalPnL).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                tone={totalPnL >= 0 ? "gain" : "loss"}
              />

              <Stat
                label="Available Cash"
                value={`$${cash.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                tone="neutral"
              />

              <Stat
                label="Holdings Investment"
                value={`$${totalInvested.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                tone="neutral"
              />

              <Stat
                label="Active Holdings"
                value={activeHoldings}
                detail={`Across ${holding_numbers} position${holding_numbers !== 1 ? "s" : ""}`}
                tone="neutral"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">

              <Card title="Current P/L by Holding">
                <div className="h-[280px] p-4">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={pnl}
                      layout="vertical"
                      margin={{
                        left: 8,
                        right: 18,
                      }}
                    >
                      <CartesianGrid
                        stroke="#1d3153"
                        strokeDasharray="3 3"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        tick={{
                          fill: "#71829d",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />

                      <YAxis
                        type="category"
                        dataKey="symbol"
                        tick={{
                          fill: "#fff",
                          fontSize: 12,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={45}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#101a2e",
                          border: "1px solid #29456d",
                          borderRadius: 5,
                          fontSize: 12,
                        }}
                        formatter={(v) => [
                          `${Number(v) >= 0 ? "+" : "-"}$${Math.abs(
                            Number(v)
                          )}`,
                          "P/L",
                        ]}
                      />

                      <Bar
                        dataKey="pnl"
                        radius={[0, 3, 3, 0]}
                      >
                        {pnl.map((item) => (
                          <Cell
                            key={item.symbol}
                            fill={
                              item.pnl >= 0
                                ? "#25d98a"
                                : "#ef5b68"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Portfolio Allocation">
                <div className="grid items-center gap-2 p-4 sm:grid-cols-[1fr_1.2fr]">
                  <div className="relative h-[220px]">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <RechartsPieChart>
                        <Pie
                          data={allocation}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={66}
                          outerRadius={92}
                          paddingAngle={3}
                          stroke="#121b30"
                          strokeWidth={2}
                          onMouseEnter={(_, index) => setHoveredSlice(allocation[index])}
                          onMouseLeave={() => setHoveredSlice(null)}
                        >
                          {allocation.map((item) => (
                            <Cell
                              key={item.name}
                              fill={item.color}
                              opacity={hoveredSlice ? (hoveredSlice.name === item.name ? 1 : 0.45) : 1}
                            />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div className="max-w-[130px] px-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#71829d] truncate" title={hoveredSlice ? `${hoveredSlice.name} (${hoveredSlice.percent}%)` : "Total Value"}>
                          {hoveredSlice ? `${hoveredSlice.name} (${hoveredSlice.percent}%)` : "Total Value"}
                        </p>

                        <p className="mt-0.5 font-mono text-xs sm:text-sm font-semibold tracking-tight text-white truncate">
                          {hoveredSlice
                            ? `$${Number(hoveredSlice.value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : totalPortfolioValue >= 100_000_000
                              ? `$${(totalPortfolioValue / 1_000_000).toFixed(2)}M`
                              : `$${totalPortfolioValue.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                    {allocation.map((item) => {
                      const isHovered = hoveredSlice?.name === item.name;
                      return (
                        <div
                          key={item.name}
                          onMouseEnter={() => setHoveredSlice(item)}
                          onMouseLeave={() => setHoveredSlice(null)}
                          className={`flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer ${isHovered ? "bg-[#1f3155] text-white" : "text-[#8292ac] hover:bg-[#182944]"
                            }`}
                        >
                          <span className="flex items-center gap-2 font-medium text-white">
                            <i
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />

                            {item.name}
                          </span>

                          <span className="font-mono text-[#8292ac]">
                            {item.percent}% · ${Number(item.value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            <Card
              title="Holdings"
              action={
                <span className="text-xs font-mono text-[#71829d]">
                  {activeHoldings} active positions
                </span>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#1f3155] text-xs uppercase tracking-wider text-[#71829d]">
                      {[
                        "Stock Symbol",
                        "Quantity",
                        "Avg Buy Price",
                        "Current Price",
                        "Current Value",
                        "Unrealized P/L",
                        "P/L %",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 font-medium"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {holdings.map((row) => (
                      <tr
                        key={row[0]}
                        onClick={() =>
                          navigate(`/stocks/${row[0]}`)
                        }
                        className="
                          cursor-pointer
                          border-b border-[#182944]
                          text-sm text-[#b8c4d8]
                          transition-colors
                          last:border-0
                          hover:bg-[#17243e]
                        "
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">
                            {row[0]}
                          </p>

                          <p className="mt-0.5 text-xs text-[#71829d]">
                            {row[1]}
                          </p>
                        </td>

                        <td className="px-4 py-3 font-mono text-sm">
                          {row[2]}
                        </td>

                        <td className="px-4 py-3 font-mono text-sm">
                          ${row[3]}
                        </td>

                        <td className="px-4 py-3 font-mono text-sm text-white">
                          ${row[4]}
                        </td>

                        <td className="px-4 py-3 font-mono text-sm font-semibold text-white">
                          ${row[5]}
                        </td>

                        <td
                          className={`
                            px-4 py-3 font-mono text-sm font-semibold
                            ${row[8] === "gain"
                              ? "text-gain"
                              : "text-loss"
                            }
                          `}
                        >
                          {Number(row[6]) >= 0 ? "+" : ""}${row[6]}
                        </td>

                        <td
                          className={`
                            px-4 py-3 font-mono text-sm font-semibold
                            ${row[8] === "gain"
                              ? "text-gain"
                              : "text-loss"
                            }
                          `}
                        >
                          {Number(row[7]) >= 0 ? "+" : ""}{row[7]}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}