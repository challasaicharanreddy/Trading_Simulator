import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Wifi,
  CandlestickChart,
  Menu,
} from "lucide-react"
import { createChart, CandlestickSeries } from 'lightweight-charts';
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import Sidebar from "../components/Sidebar";

const TIMEFRAMES = [
  { id: "1h", label: "1 Hour" },
]

const fmtMoney = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" })

const fmtNum = (n) => n.toLocaleString("en-US")

function StatRow({ label, value, tone = "default" }) {
  const toneClass =
    tone === "gain"
      ? "text-gain"
      : tone === "loss"
        ? "text-loss"
        : "text-white"
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#1f3155] py-2.5 last:border-b-0">
      <span className="text-sm text-[#71829d]">{label}</span>
      <span className={`font-mono text-sm font-medium tabular-nums ${toneClass}`}>
        {value}
      </span>
    </div>
  )
}

function OhlcCell({ label, value, tone = "default" }) {
  const toneClass =
    tone === "gain"
      ? "text-gain"
      : tone === "loss"
        ? "text-loss"
        : "text-white"
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-[#71829d]">
        {label}
      </span>
      <span className={`font-mono text-sm font-semibold tabular-nums ${toneClass}`}>
        {value}
      </span>
    </div>
  )
}

function Panel({ title, icon: Icon, children, className = "" }) {
  return (
    <section
      className={`rounded-md border border-[#1f3155] bg-[#121b30] p-5 ${className}`}
    >
      {title && (
        <header className="mb-4 flex items-center gap-2">
          {Icon && <Icon className="size-4 text-[#3c85ff]" aria-hidden="true" />}
          <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
        </header>
      )}
      {children}
    </section>
  )
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
      <Wifi className={`size-3.5 ${isOpen?"text-gain":"text-loss"}`} aria-hidden="true" />
    </div>
  );
}


export default function StockPage() {
    const { symbol } = useParams()
    const {socket,isConnected}=useSocket();
    const chartref=useRef(null);
    const chartInstanceRef = useRef(null);
    const candleSeriesRef = useRef(null);
    const [data,setdata]=useState([]);
    const [realtimedata,setrealtimedata]=useState({});
    const [holdings,setholdings]=useState({});
    const [transaction,settransaction]=useState(false);
    const [cursordata,setcursordata]=useState({})
    const STOCK_NAMES = {
        AAPL: "Apple Inc.",
        MSFT: "Microsoft Corporation",
        TSLA: "Tesla Inc.",
        TITN: "Titan Company Limited",
        NVDA: "NVIDIA Corporation",
        AMZN: "Amazon.com Inc.",
        GOOGL: "Alphabet Inc.",
        META: "Meta Platforms Inc."
    };
    const stock = {
        symbol: symbol?.toUpperCase() || "",
        name: STOCK_NAMES[symbol?.toUpperCase()] || "",

        price: realtimedata?.close ?? 0,
        change: realtimedata?.change ?? 0,
        changePercent: realtimedata?.changePercent ?? 0,

        ohlc: {
            open: realtimedata?.open ?? 0,
            high: realtimedata?.high ?? 0,
            low: realtimedata?.low ?? 0,
            close: realtimedata?.close ?? 0
        },

        market: {
            open: realtimedata?.open ?? 0,
            prevClose: realtimedata?.previousClose ?? 0
        },

        position: {
            quantity: holdings?.quantity ?? 0,
            avgCost: holdings?.avgCost ?? 0
        }
    };
    useEffect(()=>{
        if(!symbol || !isConnected) return;
        socket.emit("subscribe",symbol);

        const addAggregation=(d)=>{
            const new_data={
                time: Math.floor(new Date(d.timestamp).getTime() / 1000),
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close
            };
            candleSeriesRef.current?.update(new_data);
        }
        const updateRealTimeData=(d)=>{
            setrealtimedata(d);
        }
        socket.on("new_minute_aggregation",addAggregation);
        socket.on("priceChange",updateRealTimeData);

        return ()=>{
            socket.emit("unsubscribe",symbol);
        }
    },[symbol,socket,isConnected]);
    useEffect(()=>{
        const call=async ()=>{
            const result=await axios.post("http://localhost:5000/app/fetchprice/minuteCandles",{symbol:symbol,timeperiod:"1h"},{withCredentials:true});
            const resultagain=await axios.post("http://localhost:5000/app/fetchprice/holdings",{symbol:symbol},{withCredentials:true})
            const formattedData = result.data.map((item) => ({
                time: Math.floor(new Date(item.timestamp).getTime() / 1000),
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close
            }));
            const cleanedData={
                quantity: resultagain.data?.quantity ?? 0,
                avgCost: resultagain.data?.avgCostPrice ?? 0
            }
            setholdings(cleanedData);
            setdata(formattedData);
            setrealtimedata(result.data[result.data.length-1]);
        }
        call()
    },[]);
    useEffect(()=>{
        const chartOptions = {
            width: chartref.current.clientWidth,
            height: chartref.current.clientHeight,

            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },

            grid: {
                vertLines: {
                    color: "rgba(255, 255, 255, 0.05)",
                },
                horzLines: {
                    color: "rgba(255, 255, 255, 0.05)",
                },
            },

            layout: {
                textColor: "#94a3b8",
                background: {
                    type: "solid",
                    color: "#13171e",
                },
            },
        };
        const chart = createChart(chartref.current, chartOptions);
        const candlestickSeries = chart.addSeries(CandlestickSeries, { upColor: '#35c26d', downColor: '#f1424e', borderVisible: false, wickUpColor: '#35c26d', wickDownColor: '#f1424e' });


        candlestickSeries.setData(data);

        chartInstanceRef.current = chart;
      candleSeriesRef.current = candlestickSeries

        chart.subscribeCrosshairMove((param) => {
            if (!param.time) return;

            const candleData = param.seriesData.get(candlestickSeries);
            setcursordata(candleData);

        });

        chart.timeScale().fitContent();

        return () => {
            chart.remove();
            chartInstanceRef.current = null;
          candleSeriesRef.current = null;
        };
    },[])

    useEffect(() => {
    if (!candleSeriesRef.current) return;
    if (data.length === 0) return;

    candleSeriesRef.current.setData(data);

    chartInstanceRef.current?.timeScale().fitContent();
  } , [data]);

  const executeBuy=async ()=>{
    try{
      const res=await axios.post("http://localhost:5000/app/api/orders/buy",{symbol:symbol,quantity:quantity},{withCredentials:true})
      if(res) {
        setmessage("Transaction Successful")
      }
    }catch(error) {
      if (error.response?.status === 410) {
        setmessage("Market Closed. Please Come again later");
      }else{
        setmessage("Transaction Failed, Please try after some time");
      }
    }
  }
  const executeSell=async ()=>{
    try{
      const res=await axios.post("http://localhost:5000/app/api/orders/sell",{symbol:symbol,quantity:quantity},{withCredentials:true})
      if(res) {
        setmessage("Transaction Successful")
      }
    }catch(error) {
      if (error.response?.status === 410) {
        setmessage("Market Closed. Please Come again later");
      }else{
        setmessage("Transaction Failed, Please try after some time");
      }
    }
  }

  const navigate = useNavigate()

  const [timeframe, setTimeframe] = useState("1d")
  const [quantity, setQuantity] = useState(1);
  const [message, setmessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const isUp = stock.changePercent >= 0
  const changeTone = isUp ? "gain" : "loss"
  const ChangeIcon = isUp ? TrendingUp : TrendingDown

  const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 0
  const estimatedCost = qty * stock.price

  const { quantity: posQty, avgCost } = stock.position
  const currentValue = posQty * stock.price
  const costBasis = posQty * avgCost
  const unrealizedPnl = currentValue - costBasis
  const unrealizedPnlPct = (unrealizedPnl / costBasis) * 100
  const positionUp = unrealizedPnl >= 0

  return (
    <div className="min-h-screen bg-[#080e19] text-white">
      <div className="flex min-h-screen">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        {menuOpen && (
          <button
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
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
                type="button"
                onClick={() => navigate(-1)}
                className="text-[#8292ac] hover:text-white"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Stock Details
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#71829d]">
                  Real-time market chart, position breakdown, and order execution.
                </p>
              </div>
            </div>

            <div>
              {MarketStatus()}
            </div>
          </header>

          <div className="mx-auto max-w-[1280px] space-y-6 p-6 lg:p-8">

            <section className="flex flex-col gap-4 rounded-md border border-[#1f3155] bg-[#121b30] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {stock.symbol}
                  </h2>
                  <span className="rounded-md border border-[#3c85ff]/30 bg-[#3c85ff]/10 px-2 py-0.5 text-xs font-semibold text-[#3c85ff]">
                    NASDAQ
                  </span>
                </div>
                <p className="text-sm text-[#71829d]">{stock.name}</p>
              </div>

              <div className="flex flex-col gap-1 sm:items-end">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-white">
                    {fmtMoney(stock.price)}
                  </span>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums ${
                    isUp ? "text-gain" : "text-loss"
                  }`}
                >
                  <ChangeIcon className="size-4" aria-hidden="true" />
                  <span>
                    {isUp ? "+" : ""}
                    {stock.change}
                  </span>
                  <span>
                    ({isUp ? "+" : ""}
                    {stock.changePercent}%)
                  </span>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-6 lg:col-span-2">
                <Panel className="!p-0 overflow-hidden">
                  <div className="flex flex-col gap-4 border-b border-[#1f3155] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <OhlcCell label="Open" value={fmtNum(cursordata.open || stock.ohlc.open)} />
                      <OhlcCell label="High" value={fmtNum(cursordata.high || stock.ohlc.high)} tone="gain" />
                      <OhlcCell label="Low" value={fmtNum(cursordata.low || stock.ohlc.low)} tone="loss" />
                      <OhlcCell
                        label="Close"
                        value={fmtNum(cursordata.close || stock.ohlc.close)}
                        tone={changeTone}
                      />
                    </div>

                    <div className="flex items-center gap-1 rounded-md border border-[#1f3155] bg-[#080e19] p-1">
                      {TIMEFRAMES.map((tf) => (
                        <button
                          key={tf.id}
                          type="button"
                          onClick={() => setTimeframe(tf.id)}
                          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                            timeframe === tf.id
                              ? "bg-[#3c85ff] text-white"
                              : "text-[#71829d] hover:text-white"
                          }`}
                          aria-pressed={timeframe === tf.id}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div ref={chartref}
                    id="tv-lightweight-chart"
                    className="relative w-full h-[320px] bg-[#080e19] sm:h-[420px]"
                    role="img"
                  >
                    <span className="absolute bottom-3 right-4 font-mono text-[11px] uppercase tracking-wide text-[#71829d]">
                      {timeframe === "1h" ? "1 Hour" : "1 Day"} · {stock.symbol}
                    </span>
                  </div>
                </Panel>

                <Panel title="Market Details" icon={Activity}>
                  <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    <StatRow label="Open" value={fmtMoney(stock.market.open)} />
                    <StatRow
                      label="High"
                      value={fmtMoney(stock.ohlc.high)}
                      tone="gain"
                    />
                    <StatRow
                      label="Low"
                      value={fmtMoney(stock.ohlc.low)}
                      tone="loss"
                    />
                    <StatRow
                      label="Previous Close"
                      value={fmtMoney(stock.market.prevClose)}
                    />
                  </div>
                </Panel>
              </div>

              <div className="flex flex-col gap-6">
                <Panel title="Your Position" icon={TrendingUp}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-[#71829d]">Status</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        positionUp ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
                      }`}
                    >
                      {positionUp ? "In Profit" : "At Loss"}
                    </span>
                  </div>
                  <StatRow label="Quantity" value={`${posQty} shares`} />
                  <StatRow label="Average Cost" value={fmtMoney(avgCost)} />
                  <StatRow label="Current Value" value={fmtMoney(currentValue)} />
                  <StatRow
                    label="Unrealized P/L"
                    value={`${unrealizedPnl >= 0 ? "+" : ""}${fmtMoney(
                      unrealizedPnl,
                    )} (${unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnlPct.toFixed(
                      2,
                    )}%)`}
                    tone={positionUp ? "gain" : "loss"}
                  />
                </Panel>

                <Panel title="Trade" icon={CandlestickChart}>
                  <label
                    htmlFor="quantity"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#71829d]"
                  >
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min={1}
                    step={1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Number.parseInt(e.target.value, 10) || 0)
                    }
                    className="mb-4 w-full rounded-md border border-[#1f3155] bg-[#080e19] px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-[#3c85ff]"
                  />

                  <div className="mb-4 flex items-center justify-between rounded-md border border-[#1f3155] bg-[#080e19] px-3 py-2.5">
                    <span className="text-sm text-[#71829d]">
                      Estimated {qty > 0 ? "value" : "cost"}
                    </span>
                    <span className="font-mono text-sm font-semibold text-white">
                      {fmtMoney(estimatedCost)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={executeBuy}
                      type="button"
                      className="rounded-md bg-[#0d5b35] border border-[#18a957] px-4 py-2.5 text-sm font-semibold text-[#35d47a] transition hover:bg-[#126b40]"
                    >
                      Buy
                    </button>
                    <button
                      onClick={executeSell}
                      type="button"
                      className="rounded-md bg-[#661f2a] border border-[#d43a4b] px-4 py-2.5 text-sm font-semibold text-[#ff7d89] transition hover:bg-[#782633]"
                    >
                      Sell
                    </button>
                  </div>
                </Panel>

                <div className={`${message===""?"hidden":""} flex items-center justify-between rounded-md border border-[#1f3155] bg-[#121b30] px-4 py-3`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">
                      {message}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-[#1f3155] bg-[#121b30] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-gain opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-gain" />
                    </span>
                    <span className="text-xs font-medium text-white">
                      Market data connected
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#71829d]">
                    Real-time
                  </span>
                </div>
                
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
