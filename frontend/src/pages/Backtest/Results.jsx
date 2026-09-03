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
    <div className="rounded-md border border-[#1f3155] bg-[#121b30] p-3">
      <p className="text-[11px] uppercase tracking-wider text-[#71829d]">
        {label}
      </p>

      <p
        className={`mt-2 font-mono text-[18px] font-semibold ${
          tone === "positive"
            ? "text-emerald-400"
            : tone === "negative"
            ? "text-red-400"
            : "text-white"
        }`}
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
    <section>

      {/* Results Header */}
      <div className="mb-3 flex items-center justify-between">

        <div>
          <h2 className="text-[16px] font-semibold">
            Backtest Results
          </h2>

          <p className="mt-1 text-[12px] text-[#71829d]">
            {results
              ? `Results for ${results.symbol} · ${results.start.slice(
                  0,
                  10
                )} to ${results.end.slice(0, 10)}`
              : "Run a backtest to see your results"}
          </p>
        </div>

        {results && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <Check size={14} />
            Complete
          </span>
        )}

      </div>


      {/* ------------------------------------------ */}
      {/* No Results */}
      {/* ------------------------------------------ */}

      {!results ? (
        <div className="grid min-h-[210px] place-items-center rounded-md border border-dashed border-[#1f3155] bg-[#0e1729] p-8 text-center">

          <div>

            <BarChart3
              size={32}
              className="mx-auto mb-3 text-[#3c85ff]"
            />

            <p className="text-[14px] text-[#b8c4d8]">
              Run a backtest to see your results
            </p>

            <p className="mt-1 text-[12px] text-[#71829d]">
              Configure your strategy above and click Run Backtest.
            </p>

          </div>

        </div>
      ) : (

        /* ------------------------------------------ */
        /* Results Available */
        /* ------------------------------------------ */

        <div className="space-y-4">

          {/* ------------------------------------------ */}
          {/* Metrics */}
          {/* ------------------------------------------ */}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">

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
                    reply.finalPortfolioValue?.toFixed(2)
                  : "0"
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
                  ? reply.totalReturnPct?.toFixed(4) + "%"
                  : "0%"
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
                  ? "-" + reply.maxDrawDown?.toFixed(4) + "%"
                  : "0%"
              }
              tone="negative"
            />

          </div>


          {/* ------------------------------------------ */}
          {/* Equity Curve */}
          {/* ------------------------------------------ */}

          <div className="rounded-md border border-[#1f3155] bg-[#121b30] p-4">

            <h3 className="mb-4 text-[14px] font-semibold">
              Equity Curve
            </h3>

            <div className="h-[230px] w-full">

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
                      background: "#0e1729",
                      border: "1px solid #1f3155",
                      borderRadius: 4,
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


          {/* ------------------------------------------ */}
          {/* Trade History */}
          {/* ------------------------------------------ */}

          <div className="overflow-hidden rounded-md border border-[#1f3155] bg-[#121b30]">

            {/* Table Header */}

            <div className="border-b border-[#1f3155] px-4 py-3">

              <h3 className="text-[14px] font-semibold">
                Trade History
              </h3>

            </div>


            {/* Table */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[650px] text-left text-[13px]">

                <thead className="bg-[#0e1729] text-[11px] uppercase tracking-wider text-[#71829d]">

                  <tr>

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
                      className="border-t border-[#182944] hover:bg-[#17243e]"
                    >

                      {/* Date */}

                      <td className="px-4 py-3 text-[13px] text-[#b8c4d8] whitespace-nowrap">
                        {trade.date}
                      </td>


                      {/* Action */}

                      <td className="px-4 py-3">

                        <span
                          className={`rounded px-2 py-1 text-[11px] font-semibold ${
                            trade.action === "BUY"
                              ? "bg-emerald-950 text-emerald-400"
                              : "bg-red-950 text-red-400"
                          }`}
                        >
                          {trade.action}
                        </span>

                      </td>


                      {/* Symbol */}

                      <td className="px-4 py-3 text-[13px] font-semibold text-white">
                        {trade.symbol}
                      </td>


                      {/* Quantity */}

                      <td className="px-4 py-3 font-mono text-[13px] text-[#b8c4d8]">
                        {trade.quantity}
                      </td>


                      {/* Price */}

                      <td className="px-4 py-3 font-mono text-[13px] text-[#b8c4d8]">
                        {trade.price}
                      </td>


                      {/* P&L */}

                      <td
                        className={`px-4 py-3 font-mono text-[13px] ${
                          trade.pnl === "-"
                            ? "text-[#71829d]"
                            : String(trade.pnl).startsWith("-")
                            ? "text-red-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {trade.pnl}
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