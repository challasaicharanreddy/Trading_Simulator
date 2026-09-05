import { useState, useEffect } from "react";
import MiniLineChart from "./MiniLineChart"; // adjust path to match your project
import axiosInstance from "../../api/axiosInstance";
import axios from "axios";
function PortfolioPerformanceCard() {
  const [portfolioPerformance, setPortfolioPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/app/portfolio/history",{withCredentials:true})
      .then((res) => {
        setPortfolioPerformance(res.data);
      })
      .catch((err) => {
        console.error("Failed to load portfolio history:", err.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // derive day labels from the real dates returned by the backend
  const dayLabels = portfolioPerformance.map((point) => {
    const date = new Date(point.date);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
  });

  return (
    <section className="rounded-md border border-[#1f3155] bg-[#121b30] p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Portfolio Performance (7 Days)
        </h2>
        <span className="text-xs text-[#71829d]">Value in USD</span>
      </div>

      <div className="mt-2 h-[180px] border-y border-dashed border-[#213653] bg-[#0f1a2c] p-2">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-xs text-[#71829d]">
            Loading…
          </div>
        ) : portfolioPerformance.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-[#71829d]">
            No portfolio history yet
          </div>
        ) : (
          <MiniLineChart data={portfolioPerformance} dataKey="date" dataValue="value" />
        )}
      </div>

      <div className="flex justify-between px-1 pt-2 text-xs text-[#71829d]">
        {dayLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </section>
  );
}

export default PortfolioPerformanceCard;