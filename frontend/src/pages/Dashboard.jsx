import StockCard from "../components/StockCard";
import "./Dashboard.css";

const WATCHLIST = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "NFLX"];

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Watchlist</h2>
      <div className="stock-grid">
        {WATCHLIST.map((symbol) => (
          <StockCard key={symbol} symbol={symbol} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;