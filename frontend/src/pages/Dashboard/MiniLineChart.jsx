// function MiniLineChart({ values, className = "" }) {
//     const points = values
//       .map(
//         (value, index) =>
//           `${(index / (values.length - 1)) * 100},${92 - value}`
//       )
//       .join(" ");
  
//     return (
//       <svg
//         viewBox="0 0 100 100"
//         preserveAspectRatio="none"
//         className={`h-full w-full ${className}`}
//         aria-hidden="true"
//       >
//         <defs>
//           <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0" stopColor="var(--primary)" stopOpacity=".15" />
//             <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
//           </linearGradient>
//         </defs>
  
//         <polygon
//           points={`0,100 ${points} 100,100`}
//           fill="url(#chartFill)"
//         />
  
//         <polyline
//           points={points}
//           fill="none"
//           stroke="var(--primary)"
//           strokeWidth="1.4"
//           vectorEffect="non-scaling-stroke"
//         />
//       </svg>
//     );
//   }
  
//   export default MiniLineChart;
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
} from "recharts";

function MiniLineChart({
  data,
  dataKey = "value",
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
            dataKey="time"
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
            dataKey={dataKey}
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