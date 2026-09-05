import { useEffect, useState } from "react";
import axios from "axios";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/app/api/strategies";

const STOCKS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "GOOGL",
  "META",
  "TSLA",
  "TITN",
];

const INDICATORS = ["SMA", "RSI"];
const OPERATORS = [">", "<"];
const ACTIONS = ["BUY", "SELL"];

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
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
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

function StrategyEngine() {
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    symbol: "AAPL",
    indicator: "SMA",
    period: 20,
    operator: ">",
    threshold: 300,
    action: "BUY",
    quantity: 10,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const fetchStrategies = async () => {
    try {
      setFetching(true);
      setError("");

      const response = await axios.get(API_URL, {
        withCredentials: true,
      });

      const data = response.data || [];

      setStrategies(data);

      if (!selectedStrategy && data.length > 0) {
        setSelectedStrategy(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch strategies:", err);

      setError(
        err.response?.data?.error ||
          "Failed to load strategies"
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };


  const handleCreateStrategy = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Strategy name is required");
      return;
    }

    if (!form.period || Number(form.period) <= 0) {
      setError("Period must be greater than 0");
      return;
    }

    if (
      form.quantity === "" ||
      Number(form.quantity) <= 0
    ) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (
      form.threshold === "" ||
      !Number.isFinite(Number(form.threshold))
    ) {
      setError("Threshold must be a valid number");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        symbol: form.symbol,
        indicator: form.indicator,
        period: Number(form.period),
        operator: form.operator,
        threshold: Number(form.threshold),
        action: form.action,
        quantity: Number(form.quantity),
      };

      const response = await axios.post(
        API_URL,
        payload,
        {
          withCredentials: true,
        }
      );

      const newStrategy = response.data;

      setStrategies((prev) => [
        newStrategy,
        ...prev,
      ]);

      setSelectedStrategy(newStrategy);

      setSuccess("Strategy created successfully");

      setForm({
        name: "",
        symbol: "AAPL",
        indicator: "SMA",
        period: 20,
        operator: ">",
        threshold: 300,
        action: "BUY",
        quantity: 10,
      });
    } catch (err) {

      setError(
        err.response?.data?.error ||
          "Failed to create strategy"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStrategyStatus = async (
    strategy,
    newStatus
  ) => {
    try {
      setError("");
      setSuccess("");

      const response = await axios.patch(
        `${API_URL}/${strategy._id}/status`,
        {
          status: newStatus,
        },
        {
          withCredentials: true,
        }
      );

      const updatedStrategy = response.data;

      setStrategies((prev) =>
        prev.map((item) =>
          item._id === updatedStrategy._id
            ? updatedStrategy
            : item
        )
      );

      setSelectedStrategy(updatedStrategy);

      setSuccess(
        newStatus === "ACTIVE"
          ? "Strategy activated"
          : "Strategy deactivated"
      );
    } catch (err) {

      setError(
        err.response?.data?.error ||
          "Failed to update strategy"
      );
    }
  };

  const handleDeleteStrategy = async (strategy) => {
    const confirmed = window.confirm(
      `Delete "${strategy.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await axios.delete(
        `${API_URL}/${strategy._id}`,
        {
          withCredentials: true,
        }
      );

      const remaining = strategies.filter(
        (item) => item._id !== strategy._id
      );

      setStrategies(remaining);

      if (selectedStrategy?._id === strategy._id) {
        setSelectedStrategy(
          remaining.length > 0
            ? remaining[0]
            : null
        );
      }

      setSuccess("Strategy deleted successfully");
    } catch (err) {

      setError(
        err.response?.data?.error ||
          "Failed to delete strategy"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getConditionText = (strategy) => {
    if (!strategy) return "--";

    return `${strategy.indicator} ${strategy.operator} ${strategy.threshold}`;
  };

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
            <button
              onClick={() => setMenuOpen(true)}
              className="text-[#8292ac] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Strategy Engine
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-[#71829d]">
                Create and manage your trading strategies.
              </p>
            </div>

              <div>
                {MarketStatus()}
              </div>
          </header>

          <div className="mx-auto max-w-[1280px] space-y-6 p-6 lg:p-8">

            {error && (
              <div className="rounded-md border border-[#7f2935] bg-[#421820] px-4 py-3 text-sm text-[#ff8692]">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-[#176b42] bg-[#0c3928] px-4 py-3 text-sm text-gain">
                {success}
              </div>
            )}

            {/* Top Section */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">


              <section className="rounded-md border border-[#1f3155] bg-[#121b30]">

                <div className="border-b border-[#1f3155] px-5 py-4">
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    Create Strategy
                  </h2>

                  <p className="mt-1 text-xs text-[#71829d]">
                    Configure a rule-based trading strategy.
                  </p>
                </div>

                <form
                  onSubmit={handleCreateStrategy}
                  className="space-y-5 p-5"
                >

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8494ad]">
                      Strategy Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. AAPL SMA Buy Strategy"
                      className="w-full rounded-md border border-[#233b60] bg-[#0a1425] px-3 py-2.5 text-sm text-[#f1f5fb] outline-none transition placeholder:text-[#596a86] focus:border-[#367ff4] focus:ring-1 focus:ring-[#367ff4]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8494ad]">
                      Symbol
                    </label>

                    <select
                      name="symbol"
                      value={form.symbol}
                      onChange={handleChange}
                      className="w-full rounded-md border border-[#233b60] bg-[#0a1425] px-3 py-2.5 text-sm text-[#f1f5fb] outline-none focus:border-[#367ff4] focus:ring-1 focus:ring-[#367ff4]"
                    >
                      {STOCKS.map((stock) => (
                        <option
                          key={stock}
                          value={stock}
                          className="bg-[#0a1425] text-[#f1f5fb]"
                        >
                          {stock}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8494ad]">
                      Indicator
                    </label>

                    <select
                      name="indicator"
                      value={form.indicator}
                      onChange={handleChange}
                      className="w-full rounded-md border border-[#233b60] bg-[#0a1425] px-3 py-2.5 text-sm text-[#f1f5fb] outline-none focus:border-[#367ff4] focus:ring-1 focus:ring-[#367ff4]"
                    >
                      {INDICATORS.map(
                        (indicator) => (
                          <option
                            key={indicator}
                            value={indicator}
                            className="bg-[#0a1425] text-[#f1f5fb]"
                          >
                            {indicator === "SMA"
                              ? "SMA (Simple Moving Average)"
                              : "RSI (Relative Strength Index)"}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8494ad]">
                      Period
                    </label>

                    <input
                      type="number"
                      name="period"
                      min="1"
                      value={form.period}
                      onChange={handleNumberChange}
                      className="w-full rounded-md border border-[#233b60] bg-[#0a1425] px-3 py-2.5 text-sm text-[#f1f5fb] outline-none focus:border-[#367ff4] focus:ring-1 focus:ring-[#367ff4]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8494ad]">
                        Condition
                      </label>

                      <select
                        name="operator"
                        value={form.operator}
                        onChange={handleChange}
                        className="w-full rounded-md border border-[#233b60] bg-[#0a1425] px-3 py-2.5 text-sm text-[#f1f5fb] outline-none focus:border-[#367ff4] focus:ring-1 focus:ring-[#367ff4]"
                      >
                        {OPERATORS.map(
                          (operator) => (
                            <option
                              key={operator}
                              value={operator}
                              className="bg-[#0a1425] text-[#f1f5fb]"
                            >
                              {operator}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8494ad]">
                        Threshold
                      </label>

                      <input
                        type="number"
                        step="any"
                        name="threshold"
                        value={form.threshold}
                        onChange={handleNumberChange}
                        className="w-full rounded-md border border-[#233b60] bg-[#0a1425] px-3 py-2.5 text-sm text-[#f1f5fb] outline-none focus:border-[#367ff4] focus:ring-1 focus:ring-[#367ff4]"
                      />
                    </div>

                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8494ad]">
                      Action
                    </label>

                    <div className="grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            action: "BUY",
                          }))
                        }
                        className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
                          form.action === "BUY"
                            ? "border-[#16884b] bg-[#0d6337] text-[#27e278]"
                            : "border-[#233b60] bg-[#0a1425] text-[#7486a2] hover:border-[#16884b] hover:text-[#20d477]"
                        }`}
                      >
                        BUY
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            action: "SELL",
                          }))
                        }
                        className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
                          form.action === "SELL"
                            ? "border-[#8f2738] bg-[#661c2b] text-[#ff4c65]"
                            : "border-[#233b60] bg-[#0a1425] text-[#7486a2] hover:border-[#8f2738] hover:text-[#ff4c65]"
                        }`}
                      >
                        SELL
                      </button>

                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8494ad]">
                      Quantity (Shares)
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      step="1"
                      value={form.quantity}
                      onChange={handleNumberChange}
                      className="w-full rounded-md border border-[#233b60] bg-[#0a1425] px-3 py-2.5 text-sm text-[#f1f5fb] outline-none focus:border-[#367ff4] focus:ring-1 focus:ring-[#367ff4]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-[#367ff4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4389f7] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Creating Strategy..."
                      : "Create Strategy"}
                  </button>

                </form>
              </section>

              <section className="rounded-md border border-[#1f3155] bg-[#121b30]">

                <div className="border-b border-[#1f3155] px-5 py-4">
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    Strategy Details
                  </h2>

                  <p className="mt-1 text-xs text-[#71829d]">
                    View and manage the selected strategy.
                  </p>
                </div>

                {selectedStrategy ? (
                  <div className="p-5">

                    <div className="divide-y divide-[#172b48]">

                      <DetailRow
                        label="Strategy Name"
                        value={selectedStrategy.name}
                      />

                      <DetailRow
                        label="Symbol"
                        value={selectedStrategy.symbol}
                      />

                      <DetailRow
                        label="Indicator"
                        value={
                          selectedStrategy.indicator ===
                          "SMA"
                            ? "SMA (Simple Moving Average)"
                            : "RSI (Relative Strength Index)"
                        }
                      />

                      <DetailRow
                        label="Period"
                        value={selectedStrategy.period}
                      />

                      <DetailRow
                        label="Condition"
                        value={getConditionText(
                          selectedStrategy
                        )}
                      />

                      <DetailRow
                        label="Action"
                        value={
                          <span
                            className={
                              selectedStrategy.action ===
                              "BUY"
                                ? "font-semibold text-[#20d477]"
                                : "font-semibold text-[#ff4c65]"
                            }
                          >
                            {selectedStrategy.action}
                          </span>
                        }
                      />

                      <DetailRow
                        label="Quantity"
                        value={`${selectedStrategy.quantity} shares`}
                      />

                      <DetailRow
                        label="Status"
                        value={
                          <StatusBadge
                            status={
                              selectedStrategy.status
                            }
                          />
                        }
                      />

                      <DetailRow
                        label="Created At"
                        value={formatDate(
                          selectedStrategy.createdAt
                        )}
                      />

                      <DetailRow
                        label="Last Updated"
                        value={formatDate(
                          selectedStrategy.updatedAt
                        )}
                      />

                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <button
                        onClick={() =>
                          updateStrategyStatus(
                            selectedStrategy,
                            selectedStrategy.status ===
                              "ACTIVE"
                              ? "INACTIVE"
                              : "ACTIVE"
                          )
                        }
                        className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
                          selectedStrategy.status ===
                          "ACTIVE"
                            ? "border-[#16884b] bg-[#091b15] text-[#20d477] hover:bg-[#0d2a1e]"
                            : "border-[#2766d5] bg-[#0a1930] text-[#4289ff] hover:bg-[#0d2343]"
                        }`}
                      >
                        {selectedStrategy.status ===
                        "ACTIVE"
                          ? "Deactivate Strategy"
                          : "Activate Strategy"}
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteStrategy(
                            selectedStrategy
                          )
                        }
                        className="rounded-md border border-[#8f2738] bg-[#160d12] px-4 py-2.5 text-sm font-semibold text-[#ff4c65] transition hover:bg-[#26131a]"
                      >
                        Delete Strategy
                      </button>

                    </div>

                  </div>
                ) : (
                  <div className="flex min-h-[500px] flex-col items-center justify-center px-5 text-center">

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#28415f] bg-[#101c30] text-2xl text-[#5c7190]">
                      ◫
                    </div>

                    <h3 className="text-base font-semibold text-[#f1f5fb]">
                      No Strategy Selected
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-[#71819e]">
                      Create a strategy or select one
                      from your strategies below.
                    </p>

                  </div>
                )}

              </section>
            </div>


            <section className="rounded-md border border-[#1f3155] bg-[#121b30]">

              <div className="flex flex-col gap-3 border-b border-[#1f3155] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    My Strategies
                  </h2>

                  <p className="mt-1 text-xs text-[#71829d]">
                    Your configured trading strategies.
                  </p>
                </div>

                <button
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="w-fit rounded-md bg-[#3c85ff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3277eb]"
                >
                  + New Strategy
                </button>

              </div>

              <div className="overflow-x-auto p-4">

                {fetching ? (
                  <div className="py-16 text-center text-sm text-[#71819e]">
                    Loading strategies...
                  </div>
                ) : strategies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#28415f] bg-[#101c30] text-2xl text-[#5c7190]">
                      ◫
                    </div>

                    <h3 className="font-semibold text-[#f1f5fb]">
                      No strategies configured
                    </h3>

                    <p className="mt-1 text-sm text-[#71819e]">
                      Create your first strategy to start
                      generating trading signals.
                    </p>

                  </div>
                ) : (
                  <table className="w-full min-w-[1000px] border-collapse">

                    <thead>
                      <tr className="border-b border-[#1b3153] text-left">

                        <TableHeader>
                          Strategy
                        </TableHeader>

                        <TableHeader>
                          Symbol
                        </TableHeader>

                        <TableHeader>
                          Indicator
                        </TableHeader>

                        <TableHeader>
                          Period
                        </TableHeader>

                        <TableHeader>
                          Condition
                        </TableHeader>

                        <TableHeader>
                          Action
                        </TableHeader>

                        <TableHeader>
                          Quantity
                        </TableHeader>

                        <TableHeader>
                          Status
                        </TableHeader>

                        <TableHeader>
                          Actions
                        </TableHeader>

                      </tr>
                    </thead>

                    <tbody>
                      {strategies.map((strategy) => (

                        <tr
                          key={strategy._id}
                          onClick={() =>
                            setSelectedStrategy(
                              strategy
                            )
                          }
                          className={`cursor-pointer border-b border-[#172b48] transition hover:bg-[#111f35] ${
                            selectedStrategy?._id ===
                            strategy._id
                              ? "bg-[#101f37]"
                              : ""
                          }`}
                        >

                          <td className="px-3 py-4">
                            <div className="font-medium text-[#e6eaf2]">
                              {strategy.name}
                            </div>
                          </td>

                          <td className="px-3 py-4 font-medium text-[#e6eaf2]">
                            {strategy.symbol}
                          </td>

                          <td className="px-3 py-4 text-sm text-[#c2ccdb]">
                            {strategy.indicator}
                          </td>

                          <td className="px-3 py-4 text-sm text-[#c2ccdb]">
                            {strategy.period}
                          </td>

                          <td className="px-3 py-4 font-mono text-sm text-[#c2ccdb]">
                            {strategy.operator}{" "}
                            {strategy.threshold}
                          </td>

                          <td className="px-3 py-4">
                            <ActionBadge
                              action={
                                strategy.action
                              }
                            />
                          </td>

                          <td className="px-3 py-4 text-sm text-[#c2ccdb]">
                            {strategy.quantity}
                          </td>

                          <td className="px-3 py-4">
                            <StatusBadge
                              status={
                                strategy.status
                              }
                            />
                          </td>

                          <td
                            className="px-3 py-4"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            <button
                              onClick={() =>
                                updateStrategyStatus(
                                  strategy,
                                  strategy.status ===
                                    "ACTIVE"
                                    ? "INACTIVE"
                                    : "ACTIVE"
                                )
                              }
                              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                                strategy.status ===
                                "ACTIVE"
                                  ? "border-[#8f2738] bg-[#160d12] text-[#ff4c65] hover:bg-[#26131a]"
                                  : "border-[#2766d5] bg-[#0a1930] text-[#4289ff] hover:bg-[#0d2343]"
                              }`}
                            >
                              {strategy.status ===
                              "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </td>

                        </tr>

                      ))}
                    </tbody>

                  </table>
                )}

              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}


function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#172b48] py-3.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#7d8da6]">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-[#e6eaf2]">
        {value}
      </span>
    </div>
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[#7586a1]">
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const active = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
        active
          ? "border border-[#12683c] bg-[#09291c] text-[#20d477]"
          : "border border-[#263852] bg-[#1a2639] text-[#9aa7ba]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-[#20d477]"
            : "bg-[#77869d]"
        }`}
      />

      {status}
    </span>
  );
}

function ActionBadge({ action }) {
  const buy = action === "BUY";

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
        buy
          ? "bg-[#0d6337] text-[#27e278]"
          : "bg-[#661c2b] text-[#ff4c65]"
      }`}
    >
      {action}
    </span>
  );
}

export default StrategyEngine;
