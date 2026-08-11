import { useEffect, useState } from "react";
import useLivePrice from "../hooks/useLivePrice";
import "./StockCard.css";

function StockCard({ symbol }) {
  const priceData = useLivePrice(symbol);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!priceData) return;
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 400);
    return () => clearTimeout(timer);
  }, [priceData?.price]);

  return (
    <div className={`stock-card ${flash ? "stock-card--flash" : ""}`}>
      <div className="stock-card__symbol">{symbol}</div>
      {priceData ? (
        <>
          <div className="stock-card__price">${priceData.price.toFixed(2)}</div>
          {priceData.changePercent !== undefined && (
            <div className={`stock-card__change ${priceData.changePercent >= 0 ? "positive" : "negative"}`}>
              {priceData.changePercent >= 0 ? "+" : ""}{priceData.changePercent.toFixed(2)}%
            </div>
          )}
        </>
      ) : (
        <div className="stock-card__loading">Loading…</div>
      )}
    </div>
  );
}

export default StockCard;