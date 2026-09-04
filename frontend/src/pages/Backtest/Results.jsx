import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  Check,
} from "lucide-react";

function Metric({
  label,
  value,
  tone = "",
}) {
  return (
    <div className="rounded-md border border-[#1f3155] bg-[#121b30] p-4">
      <p className="text-xs uppercase tracking-wider text-[#71829d] font-medium truncate" title={label}>
        {label}
      </p>

      <p
        className={`mt-1.5 font-mono text-base sm:text-lg xl:text-xl font-semibold tracking-tight truncate ${
          tone === "positive"
            ? "text-gain"
            : tone === "negative"
            ? "text-loss"
            : "text-white"
        }`}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}

export default function Results({
  results,
  reply,
  equity,
  trades,
}) {
  return (
    <section className="space-y-6">

      {/* Results Header */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Backtest Results
          </h2>

          <p className="mt-1 text-xs text-[#71829d]">
            {results
              ? `Results for ${results.symbol} · ${results.start.slice(
                  0,
                  10
                )} to ${results.end.slice(0, 10)}`
              : "Run a backtest to see your results"}
          </p>
        </div>

        {results && (
          <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-gain">
            <Check size={14} />
            Complete
          </span>
        )}

      </div>

      {/* No Results */}
      {!results ? (
        <div className="grid min-h-[220px] place-items-center rounded-md border border-dashed border-[#1f3155] bg-[#121b30] p-8 text-center">

          <div>

            <BarChart3
              size={36}
              className="mx-auto mb-3 text-[#3c85ff]"
            />

            <p className="text-base font-semibold text-white">
              Run a backtest to see your results
            </p>

            <p className="mt-1 text-xs text-[#71829d]">
              Configure your strategy above and click Run Backtest.
            </p>

          </div>

        </div>
      ) : (

        /* Results Available */
        <div className="space-y-6">

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 sm:gap-4">

            <Metric
              label="Total Trades"
              value={reply ? reply.totalTrades : "0"}
            />

            <Metric
              label="Winning Trades"
              value={reply ? reply.profitableTrades : "0"}
              tone="positive"
            />

            <Metric
              label="Win Percent"
              value={
                reply
                  ? reply.winRate?.toFixed(2) + "%"
                  : "0%"
              }
            />

            <Metric
              label="Initial Capital"
              value="$1,000,000"
            />

            <Metric
              label="Final Value"
              value={
                reply
                  ? "$" +
                    Number(reply.finalPortfolioValue || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "$0.00"
              }
              tone={
                reply
                  ? reply.finalPortfolioValue >= 1000000
                    ? "positive"
                    : "negative"
                  : "positive"
              }
            />

            <Metric
              label="Total Return"
              value={
                reply
                  ? `${reply.totalReturnPct >= 0 ? "+" : ""}${Number(reply.totalReturnPct || 0).toFixed(2)}%`
                  : "0.00%"
              }
              tone={
                reply
                  ? reply.totalReturnPct >= 0
                    ? "positive"
                    : "negative"
                  : "positive"
              }
            />

            <Metric
              label="Max Drawdown"
              value={
                reply
                  ? `-${Math.abs(Number(reply.maxDrawDown || 0)).toFixed(2)}%`
                  : "0.00%"
              }
              tone="negative"
            />

          </div>

          {/* Equity Curve */}
          <div className="rounded-md border border-[#1f3155] bg-[#121b30] p-5">

            <h3 className="mb-4 text-base sm:text-lg font-semibold text-white">
              Equity Curve
            </h3>

            <div className="h-[260px] w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={equity}
                  margin={{
                    top: 8,
                    right: 12,
                    left: 4,
                    bottom: 0,
                  }}
                >

                  <CartesianGrid
                    stroke="#1f3155"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#71829d",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fill: "#71829d",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `$${value / 1000}k`
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#080e19",
                      border: "1px solid #1f3155",
                      borderRadius: 6,
                      color: "#fff",
                      fontSize: 12,
                    }}
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      "Portfolio Value",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3c85ff"
                    strokeWidth={2}
                    dot={{
                      fill: "#3c85ff",
                      r: 3,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* Trade History */}
          <div className="overflow-hidden rounded-md border border-[#1f3155] bg-[#121b30]">

            {/* Table Header */}
            <div className="border-b border-[#1f3155] px-5 py-4">

              <h3 className="text-base sm:text-lg font-semibold text-white">
                Trade History
              </h3>

            </div>

            {/* Table */}
            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px] border-collapse text-left">

                <thead>

                  <tr className="border-b border-[#1f3155] text-xs uppercase tracking-wider text-[#71829d]">

                    {[
                      "Date & Time",
                      "Action",
                      "Symbol",
                      "Quantity",
                      "Price",
                      "P&L",
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

                  {trades.map((trade, index) => (

                    <tr
                      key={`${trade.date}-${trade.symbol}-${index}`}
                      className="border-b border-[#182944] text-sm text-[#b8c4d8] last:border-0 hover:bg-[#17243e]"
                    >

                      {/* Date */}
                      <td className="px-4 py-3 text-sm text-[#b8c4d8] whitespace-nowrap">
                        {trade.date}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">

                        <span
                          className={`rounded px-2 py-1 text-xs font-bold ${
                            trade.action === "BUY"
                              ? "bg-[#0d3828] text-gain"
                              : "bg-[#411d28] text-loss"
                          }`}
                        >
                          {trade.action}
                        </span>

                      </td>

                      {/* Symbol */}
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-white">
                        {trade.symbol}
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3 font-mono text-sm">
                        {trade.quantity}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-mono text-sm">
                        ${trade.price}
                      </td>

                      {/* P&L */}
                      <td
                        className={`px-4 py-3 font-mono text-sm font-semibold ${
                          trade.pnl === "-"
                            ? "text-[#71829d]"
                            : String(trade.pnl).startsWith("-")
                            ? "text-loss"
                            : "text-gain"
                        }`}
                      >
                        {trade.pnl !== "-" && !String(trade.pnl).startsWith("-") ? "+" : ""}
                        {trade.pnl !== "-" ? `$${trade.pnl}` : "-"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}