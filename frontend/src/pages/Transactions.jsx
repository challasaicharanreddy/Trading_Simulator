import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Menu,
  Search,
  Wifi,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const stocks = ["AAPL", "NVDA", "MSFT", "TSLA", "META", "AMZN"];

function SelectBox({ value, onChange, children }) {
  return (
    <label className="relative flex min-w-[150px] items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded border border-[#1f3155] bg-[#0e1729] px-3 py-2 pr-8 text-sm text-[#b8c4d8] outline-none focus:border-[#3c85ff]"
      >
        {children}
      </select>

      <ChevronDown
        className="pointer-events-none absolute right-2 text-[#71829d]"
        size={14}
      />
    </label>
  );
}

function Metric({ label, value, tone }) {
  return (
    <div className="rounded-md border border-[#1f3155] bg-[#121b30] p-5">
      <div className="text-xs uppercase tracking-wider text-[#71829d] font-medium">
        {label}
      </div>

      <div
        className={`mt-2 font-mono text-2xl font-semibold ${tone || "text-white"
          }`}
      >
        {value}
      </div>
    </div>
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

  console.log(nyTime);

  const [hour, minute] = nyTime.split(":").map(Number);

  const isOpen =
    (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${isOpen
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
        }`}
    >
      <span
        className={`size-2 rounded-full ${isOpen
            ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]"
            : "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.85)]"
          }`}
      />

      {isOpen ? "Market Open" : "Market Closed"}

      <Wifi
        className={`size-3.5 ${isOpen ? "text-gain" : "text-loss"
          }`}
        aria-hidden="true"
      />
    </div>
  );
}

export default function TransactionsPage() {
  const [response, setresponse] = useState(null);

  const [type, setType] = useState("All Transactions");
  const [stock, setStock] = useState("All Stocks");
  const [range, setRange] = useState("All Time");
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const transactions = useMemo(() => {
    if (!response?.record) return [];

    return response.record.map((data, index) => ({
      id: `TX-${index + 1}`,

      row: [
        new Date(data.executedAt).toLocaleString(),
        data.action,
        data.symbol,
        data.quantity,
        `$${Number(data.price).toFixed(2)}`,
        `$${(data.quantity * data.price).toFixed(2)}`,
        data.pnl ? data.pnl : "--",
      ],

      date: data.executedAt,
    }));
  }, [response]);

  const filtered = useMemo(() => {
    const now = new Date();

    return transactions.filter(({ id, row, date }) => {
      const executedDate = new Date(date);

      // BUY / SELL filter
      const typeMatch =
        type === "All Transactions" ||
        row[1] === type.toUpperCase();

      // Stock filter
      const stockMatch =
        stock === "All Stocks" ||
        row[2] === stock;

      // Search filter
      const searchMatch =
        !query ||
        `${id} ${row.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());

      // Date filter
      let dateMatch = true;

      if (range === "Today") {
        const start = new Date();

        start.setHours(0, 0, 0, 0);

        dateMatch =
          executedDate >= start &&
          executedDate <= now;
      }

      else if (range === "Last 7 Days") {
        const start = new Date();

        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);

        dateMatch =
          executedDate >= start &&
          executedDate <= now;
      }

      else if (range === "Last 30 Days") {
        const start = new Date();

        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);

        dateMatch =
          executedDate >= start &&
          executedDate <= now;
      }

      return (
        typeMatch &&
        stockMatch &&
        searchMatch &&
        dateMatch
      );
    });
  }, [transactions, type, stock, range, query]);

  const pages = Math.max(
    1,
    Math.ceil(filtered.length / 20)
  );

  const currentPage = Math.min(page, pages);

  const visible = filtered.slice(
    (currentPage - 1) * 20,
    currentPage * 20
  );

  const reset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/app/transactions/history",
          {
            withCredentials: true,
          }
        );

        setresponse(res.data);
      } catch (error) {
        console.error(
          "Error fetching transactions:",
          error
        );
      }
    };

    fetchData();
  }, []);

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

          {/* Header */}
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
                  Transactions
                </h1>

                <p className="mt-1 text-xs sm:text-sm text-[#71829d]">
                  View your complete trading activity.
                </p>
              </div>

            </div>

            <div>
              {MarketStatus()}
            </div>

          </header>

          <div className="mx-auto max-w-[1280px] space-y-6 p-6 lg:p-8">

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <Metric
                label="Total Orders"
                value={
                  response
                    ? response.totalorders
                    : "-"
                }
              />

              <Metric
                label="Buy Orders"
                value={
                  response
                    ? response.buyorders
                    : "-"
                }
              />

              <Metric
                label="Sell Orders"
                value={
                  response
                    ? response.sellorders
                    : "-"
                }
              />

              <Metric
                label="Average Trade Size"
                value={
                  response
                    ? "$" +
                    response.avgtradesize.toFixed(2)
                    : "-"
                }
              />

            </div>

            {/* Filters */}
            <section className="rounded-md border border-[#1f3155] bg-[#121b30] p-5">

              <div className="mb-3 flex items-center gap-2 text-base font-semibold text-white">

                <Filter
                  size={15}
                  className="text-[#3c85ff]"
                />

                Filter Transactions

              </div>

              <div className="flex flex-wrap gap-3">

                <SelectBox
                  value={type}
                  onChange={reset(setType)}
                >
                  <option>
                    All Transactions
                  </option>

                  <option>Buy</option>
                  <option>Sell</option>
                </SelectBox>

                <SelectBox
                  value={stock}
                  onChange={reset(setStock)}
                >
                  <option>
                    All Stocks
                  </option>

                  {stocks.map((s) => (
                    <option key={s}>
                      {s}
                    </option>
                  ))}
                </SelectBox>

                <SelectBox
                  value={range}
                  onChange={reset(setRange)}
                >
                  <option>All Time</option>
                  <option>Today</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </SelectBox>

                <label className="relative min-w-[220px] flex-1">

                  <Search
                    size={14}
                    className="absolute left-3 top-2.5 text-[#71829d]"
                  />

                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search symbol or transaction ID"
                    className="w-full rounded-md border border-[#1f3155] bg-[#080e19] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#71829d] focus:border-[#3c85ff]"
                  />

                </label>

              </div>

            </section>

            {/* Transaction History */}
            <section className="overflow-hidden rounded-md border border-[#1f3155] bg-[#121b30]">

              <div className="flex items-center justify-between border-b border-[#1f3155] px-5 py-4">

                <div>

                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    Transaction History
                  </h2>

                  <p className="mt-1 text-xs text-[#71829d]">
                    {filtered.length} matching transactions
                  </p>

                </div>

                <span className="font-mono text-xs text-[#71829d]">
                  20 / page
                </span>

              </div>

              <div className="overflow-x-auto">

                {visible.length ? (

                  <table className="w-full min-w-[850px] border-collapse text-left">

                    <thead>

                      <tr className="border-b border-[#1f3155] text-xs uppercase tracking-wider text-[#71829d]">

                        <th className="px-3 py-2.5 font-medium">
                          Date &amp; Time
                        </th>

                        <th className="px-3 py-2.5 font-medium">
                          Type
                        </th>

                        <th className="px-3 py-2.5 font-medium">
                          Symbol
                        </th>

                        <th className="px-3 py-2.5 font-medium">
                          Quantity
                        </th>

                        <th className="px-3 py-2.5 font-medium">
                          Price
                        </th>

                        <th className="px-3 py-2.5 font-medium">
                          Total Value
                        </th>

                        <th className="px-3 py-2.5 font-medium">
                          P&amp;L
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {visible.map(({ id, row }) => (

                        <tr
                          key={id}
                          className="border-b border-[#182944] text-sm text-[#b8c4d8] last:border-0 hover:bg-[#17243e]"
                        >

                          {/* Date & ID */}
                          <td className="px-3 py-3">

                            <div>
                              {row[0]}
                            </div>

                            <div className="mt-0.5 font-mono text-xs text-[#71829d]">
                              {id}
                            </div>

                          </td>

                          {/* Type */}
                          <td className="px-3 py-3">

                            <span
                              className={`rounded px-2 py-1 text-xs font-bold ${row[1] === "BUY"
                                  ? "bg-[#0d3828] text-gain"
                                  : "bg-[#411d28] text-loss"
                                }`}
                            >
                              {row[1]}
                            </span>

                          </td>

                          {/* Symbol */}
                          <td className="px-3 py-3 font-mono text-sm font-semibold text-white">
                            {row[2]}
                          </td>

                          {/* Quantity */}
                          <td className="px-3 py-3 font-mono text-sm">
                            {row[3]}
                          </td>

                          {/* Price */}
                          <td className="px-3 py-3 font-mono text-sm">
                            {row[4]}
                          </td>

                          {/* Total Value */}
                          <td className="px-3 py-3 font-mono text-sm">
                            {row[5]}
                          </td>

                          {/* P&L */}
                          <td
                            className={`px-3 py-3 font-mono text-sm ${row[6] == "--"
                                ? "text-[#71829d]"
                                : row[6][0] == "-"
                                  ? "text-loss"
                                  : "text-gain"
                              }`}
                          >
                            {row[6].toLocaleString()}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                ) : (

                  <div className="px-6 py-16 text-center">

                    <p className="text-base font-semibold">
                      No matching transactions found.
                    </p>

                    <p className="mt-2 text-sm text-[#71829d]">
                      Your trading activity will appear
                      here once you place an order.
                    </p>

                  </div>

                )}

              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-[#1f3155] px-3 py-3 text-xs text-[#71829d] sm:flex-row sm:items-center sm:justify-between">

                <span>
                  Showing{" "}

                  {filtered.length
                    ? (currentPage - 1) * 20 + 1
                    : 0}

                  –

                  {Math.min(
                    currentPage * 20,
                    filtered.length
                  )}{" "}

                  of {filtered.length} transactions
                </span>

                <div className="flex items-center justify-between gap-2 sm:justify-end">

                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setPage((p) => p - 1)
                    }
                    className="flex items-center gap-1 rounded border border-[#1f3155] px-2 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={13} />
                    Prev
                  </button>

                  <div className="hidden gap-1 sm:flex">

                    {Array.from(
                      {
                        length: Math.min(pages, 5),
                      },
                      (_, i) => (

                        <button
                          key={i}
                          onClick={() =>
                            setPage(i + 1)
                          }
                          className={`size-6 rounded text-xs ${currentPage === i + 1
                              ? "bg-[#3c85ff] text-white"
                              : "border border-[#1f3155] hover:bg-[#17243e]"
                            }`}
                        >
                          {i + 1}
                        </button>

                      )
                    )}

                  </div>

                  <span className="text-xs sm:hidden">
                    Page {currentPage} of {pages}
                  </span>

                  <button
                    disabled={currentPage === pages}
                    onClick={() =>
                      setPage((p) => p + 1)
                    }
                    className="flex items-center gap-1 rounded border border-[#1f3155] px-2 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={13} />
                  </button>

                </div>

              </div>

            </section>

          </div>

        </main>

      </div>
    </div>
  );
}

export { X };