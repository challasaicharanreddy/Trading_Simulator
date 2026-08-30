import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
} from "recharts";

function MiniLineChart({
  data,
  dataKey,
  dataValue,
  className = "",
}) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex h-full w-full items-center justify-center text-xs text-[#71829d] ${className}`}>
        Waiting for live tick data...
      </div>
    );
  }
  return (
    <div className={`h-full w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient
              id="miniChartGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--primary)"
                stopOpacity={0.15}
              />

              <stop
                offset="100%"
                stopColor="var(--primary)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <XAxis
            dataKey={dataKey}
            hide
          />

          <Tooltip
            cursor={{
              stroke: "var(--primary)",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
            contentStyle={{
              backgroundColor: "#121b30",
              border: "1px solid #1f3155",
              borderRadius: "6px",
            }}
            labelStyle={{
              color: "#71829d",
            }}
            itemStyle={{
              color: "#ffffff",
            }}
            formatter={(value) => [
              `$${Number(value).toFixed(2)}`,
              "Price",
            ]}
          />

          <Area
            type="linear"
            dataKey={dataValue}
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#miniChartGradient)"
            dot={false}
            activeDot={{
              r: 4,
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MiniLineChart;