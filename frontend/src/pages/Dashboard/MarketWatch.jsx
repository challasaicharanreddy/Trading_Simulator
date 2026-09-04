import { useState, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

export const watchlist = [
  { symbol: "AAPL", name: "Apple Inc.", price: "--", change: "--", tone: "neutral", chartData: [], open: "--", high: "--", low: "--", previousClose: "--" },
  { symbol: "MSFT", name: "Microsoft", price: "--", change: "--", tone: "neutral", chartData: [], open: "--", high: "--", low: "--", previousClose: "--" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: "--", change: "--", tone: "neutral", chartData: [], open: "--", high: "--", low: "--", previousClose: "--" },
  { symbol: "AMZN", name: "Amazon.com", price: "--", change: "--", tone: "neutral", chartData: [], open: "--", high: "--", low: "--", previousClose: "--" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: "--", change: "--", tone: "neutral", chartData: [], open: "--", high: "--", low: "--", previousClose: "--" },
  { symbol: "META", name: "Meta Platforms", price: "--", change: "--", tone: "neutral", chartData: [], open: "--", high: "--", low: "--", previousClose: "--" },
  { symbol: "TSLA", name: "Tesla Inc.", price: "--", change: "--", tone: "neutral", chartData: [], open: "--", high: "--", low: "--", previousClose: "--" },
  { symbol: "TITN", name: "Titan Machinery", price: "--", change: "--", tone: "neutral", chartData: [], open: "--", high: "--", low: "--", previousClose: "--" },
];

function MarketWatch({ selected, setSelected, marketData: propMarketData }) {
  const { socket, isConnected } = useSocket();
  const [internalMarketData, setInternalMarketData] = useState(watchlist);

  const marketData = propMarketData || internalMarketData;

  useEffect(() => {
    if (!socket) return;

    // Subscribe to symbol rooms
    marketData.forEach((item) => socket.emit("subscribe", item.symbol));
  }, [socket, marketData]);

  return (
    <section className="overflow-hidden rounded-md border border-[#1f3155] bg-[#121b30]">
      <div className="flex items-center justify-between border-b border-[#1f3155] px-5 py-4">
        <h2 className="text-base sm:text-lg font-semibold text-white">Market Watch</h2>

        <span className={`text-xs font-medium ${isConnected ? "text-gain" : "text-loss"}`}>
          ● {isConnected ? "LIVE" : "DISCONNECTED"}
        </span>
      </div>

      <div className="p-2">
        {marketData.map((item) => (
          <button
            key={item.symbol}
            onClick={() => setSelected(item.symbol)}
            className={`grid w-full grid-cols-[1fr_92px_70px] items-center rounded-md px-2 py-1.5 text-left ${
              selected === item.symbol
                ? "border border-[#3a86ff] bg-[#1d2f55]"
                : "hover:bg-[#182640]"
            }`}
          >
            <span>
              <span className="block text-base font-semibold">
                {item.symbol}
              </span>

              <span className="block text-xs text-[#71829d]">
                {item.name}
              </span>
            </span>

            <span className="font-mono text-sm font-semibold">
              {item.price}
            </span>

            <span
              className={`font-mono text-sm ${
                item.tone === "gain"
                  ? "text-gain"
                  : item.tone === "loss"
                  ? "text-loss"
                  : "text-[#71829d]"
              }`}
            >
              {item.change}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default MarketWatch;