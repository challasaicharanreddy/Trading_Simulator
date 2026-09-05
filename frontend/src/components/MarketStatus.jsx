import { useMarketStatus } from "../context/MarketStatusContext";

function MarketStatus() {
  const { open } = useMarketStatus();

  const isOpen = open;

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm font-medium tracking-wide transition-all ${
        isOpen
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          : "border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
      }`}
    >
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        {isOpen && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            isOpen
              ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
              : "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]"
          }`}
        />
      </span>

      <span>{isOpen ? "Market Open" : "Market Closed"}</span>
    </div>
  );
}

export default MarketStatus;