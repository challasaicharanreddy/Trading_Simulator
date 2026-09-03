import { useNavigate } from "react-router-dom";
import MiniLineChart from "./MiniLineChart";
import { useEffect } from "react";

function SelectedStock({ stock }) {
  const navigate = useNavigate();

  if (!stock) {
    return (
      <section className="rounded-md border border-[#1f3155] bg-[#121b30] p-4 text-[#71829d]">
        Select a stock to view details.
      </section>
    );
  }

  const isGain = stock.tone === "gain";
  const isLoss = stock.tone === "loss";
  const toneColor = isGain ? "text-gain" : isLoss ? "text-[#ff8692]" : "text-[#71829d]";
  const hasLivePrice = stock.price && stock.price !== "--";

  return (
    <section className="rounded-md border border-[#1f3155] bg-[#121b30] p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {stock.symbol} / {stock.name}
          </h2>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold">
              {stock.price || "--"}
            </span>

            <span className={`font-mono text-sm ${toneColor}`}>
              {stock.change || "--"}
            </span>
          </div>
        </div>

        <span className={`mt-1 text-sm ${hasLivePrice ? "text-gain" : "text-[#71829d]"}`}>
          ● {hasLivePrice ? "LIVE TICK" : "WAITING FOR TICK"}
        </span>
      </div>

      <div className="mt-3 h-[340px] border-y border-dashed border-[#213653] bg-[#0f1a2c] p-2">
        <MiniLineChart
          data={stock.chartData}
          dataKey="time"
          dataValue="price"
        />
      </div>

      <div className="flex flex-wrap justify-between gap-2 pt-2 text-xs text-[#75849c]">
        <span>
          Open <b className="font-mono text-white">{stock.open || "--"}</b>
        </span>

        <span>
          High <b className="font-mono text-white">{stock.high || "--"}</b>
        </span>

        <span>
          Low <b className="font-mono text-white">{stock.low || "--"}</b>
        </span>

        <span>
          Prev Close <b className="font-mono text-white">{stock.previousClose || "--"}</b>
        </span>

        <button
          onClick={() => navigate(`/stocks/${stock.symbol}`)}
          className="ml-auto text-[#4b91ff]"
        >
          View Details →
        </button>
      </div>
    </section>
  );
}

export default SelectedStock;