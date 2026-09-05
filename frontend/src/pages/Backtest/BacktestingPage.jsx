import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  LoaderCircle,
  Menu,
  Play,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Condition from "./Condition";
import Results from "./Results";
import axios from "axios";

const symbols = [
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "GOOGL",
  "META",
  "TSLA",
  "TITN",
];


function Select({ value, onChange, children }) {
  return (
    <span className="relative block">
      <select
        value={value}
        onChange={onChange}
        className="h-10 w-full appearance-none rounded-md border border-[#1f3155] bg-[#080e19] px-3 pr-8 font-mono text-sm text-white outline-none focus:border-[#3c85ff]"
      >
        {children}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-3 text-[#71829d]"
      />
    </span>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-[#71829d] font-medium">
        {label}
      </span>

      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  min,
}) {
  return (
    <input
      type={type}
      min={min}
      value={value}
      onChange={onChange}
      className="h-10 w-full rounded-md border border-[#1f3155] bg-[#080e19] px-3 font-mono text-sm text-white outline-none focus:border-[#3c85ff]"
    />
  );
}

function MarketStatus() {
  const now = new Date();

  const nyTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const [hour, minute] = nyTime.split(":").map(Number);

  const isOpen =
    (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${
        isOpen
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
      }`}
    >
      <span
        className={`size-2 rounded-full ${
          isOpen
            ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]"
            : "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.85)]"
        }`}
      />

      {isOpen ? "Market Open" : "Market Closed"}
    </div>
  );
}


export default function BacktestingPage() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const [equity, setequity] = useState([]);
  const [trades, settrades] = useState([]);
  const [reply, setreply] = useState({});

  const [form, setForm] = useState({
    start: "2026-09-01T09:30",
    end: "2026-09-03T16:00",

    buyIndicator: "SMA",
    sellIndicator: "RSI",

    buyThreshold: "50",
    sellThreshold: "70",

    symbol: "AAPL",
    quantity: 1,

    buyOperator: ">",
    sellOperator: "<",
  });

  const [error, setError] = useState("");


  const update = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };


  async function runBacktest(event) {
    event.preventDefault();

    setError("");

    if (!form.start || !form.end) {
      return setError("Start and end dates are required.");
    }

    if (new Date(form.start) >= new Date(form.end)) {
      return setError("Start must be before end.");
    }

    if (
      Number(form.quantity) <= 0 ||
      Number.isNaN(Number(form.quantity))
    ) {
      return setError("Quantity must be greater than 0.");
    }

    if (
      Number.isNaN(Number(form.buyThreshold)) ||
      Number.isNaN(Number(form.sellThreshold))
    ) {
      return setError("Thresholds must be numbers.");
    }

    setRunning(true);

    setResults({
      ...form,
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/app/backtest/run",
        form,
        {
          withCredentials: true,
        }
      );


      setreply(response.data);


      const newequity = [];
      const sample = response.data.pvalues || [];

      for (const samp of sample) {
        newequity.push({
          date: new Date(samp[1]).toLocaleString(),
          value: Number(samp[0]).toFixed(4),
        });
      }

      setequity(newequity);


      const newtrade = [];
      const sample2 = response.data.trades || [];

      for (const samp of sample2) {
        newtrade.push({
          date: new Date(samp.TransactionAt).toLocaleString(),
          action: samp.type,
          symbol: samp.symbol,
          quantity: samp.quantity,
          price: samp.price,
          pnl:
            samp.profit !== undefined && samp.profit !== null
              ? Number(samp.profit).toFixed(4)
              : "-",
        });
      }

      settrades(newtrade);
    } catch (error) {
      console.error(error);
      setError("Failed to run backtest. Please try again.");
    } finally {
      setRunning(false);
    }
  }


  return (
    <div className="min-h-screen bg-[#080e19] text-white">
      <div className="flex min-h-screen">


        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        {menuOpen && (
          <button
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}


        <main className="min-w-0 flex-1">

          <header className="flex h-20 items-center justify-between border-b border-[#182944] px-6 lg:px-8">

            <div className="flex items-center gap-3">

              <button
                onClick={() => setMenuOpen(true)}
                className="text-[#8292ac] lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <button
                onClick={() => navigate(-1)}
                className="text-[#8292ac] hover:text-white"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Backtesting Engine
                </h1>

                <p className="mt-1 text-xs sm:text-sm text-[#71829d]">
                  Test your trading strategy against historical market data.
                </p>
              </div>

            </div>

            <MarketStatus />

          </header>


          <div className="mx-auto max-w-[1280px] space-y-6 p-6 lg:p-8">


            <form
              onSubmit={runBacktest}
              className="rounded-md border border-[#1f3155] bg-[#121b30] p-5"
            >


              <div className="mb-5 flex items-start justify-between">

                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    Backtest Configuration
                  </h2>

                  <p className="mt-1 text-xs text-[#71829d]">
                    Configure your strategy and run it against historical market data.
                  </p>
                </div>

                <RotateCcw
                  size={17}
                  className="text-[#71829d]"
                />

              </div>


              <div className="space-y-5">


                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wider text-[#3c85ff]">
                    BACKTEST PERIOD
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">

                    <Field label="Start Date & Time">
                      <Input
                        type="datetime-local"
                        value={form.start}
                        onChange={update("start")}
                      />
                    </Field>

                    <Field label="End Date & Time">
                      <Input
                        type="datetime-local"
                        value={form.end}
                        onChange={update("end")}
                      />
                    </Field>

                  </div>
                </div>


                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wider text-[#3c85ff]">
                    ASSET & POSITION
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">

                    <Field label="Symbol">
                      <Select
                        value={form.symbol}
                        onChange={update("symbol")}
                      >
                        {symbols.map((symbol) => (
                          <option
                            key={symbol}
                            value={symbol}
                          >
                            {symbol}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label="Quantity">
                      <Input
                        type="number"
                        min="1"
                        value={form.quantity}
                        onChange={update("quantity")}
                      />
                    </Field>

                  </div>
                </div>


                <Condition
                  title="BUY CONDITION"
                  indicator={form.buyIndicator}
                  operator={form.buyOperator}
                  threshold={form.buyThreshold}
                  setIndicator={update("buyIndicator")}
                  setOperator={update("buyOperator")}
                  setThreshold={update("buyThreshold")}
                  helper="Buy when the selected indicator satisfies this condition."
                />


                <Condition
                  title="SELL CONDITION"
                  indicator={form.sellIndicator}
                  operator={form.sellOperator}
                  threshold={form.sellThreshold}
                  setIndicator={update("sellIndicator")}
                  setOperator={update("sellOperator")}
                  setThreshold={update("sellThreshold")}
                  helper="Sell when the selected indicator satisfies this condition."
                />

              </div>


              {error && (
                <p className="mt-4 rounded-md border border-[#7f2935] bg-[#421820] px-3 py-2 text-xs text-[#ff8692]">
                  {error}
                </p>
              )}


              <button
                type="submit"
                disabled={running}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-[#3c85ff] px-4 text-sm font-semibold text-white transition hover:bg-[#3277eb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {running ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />

                    Running Backtest...
                  </>
                ) : (
                  <>
                    <Play size={16} />

                    Run Backtest
                  </>
                )}
              </button>

            </form>


            <Results
              results={results}
              reply={reply}
              equity={equity}
              trades={trades}
            />

          </div>
        </main>
      </div>
    </div>
  );
}