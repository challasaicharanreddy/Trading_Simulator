import { useState, useEffect } from "react";
import { BookOpen, Menu, X, ListTree, ChevronRight } from "lucide-react";
import Sidebar from "../components/Sidebar";

const sections = [
  ["Introduction", "introduction"],
  ["Dashboard", "dashboard"],
  ["Portfolio", "portfolio"],
  ["Transactions", "transactions"],
  ["Order Engine", "order-engine"],
  ["Strategies", "strategies"],
  ["Backtesting", "backtesting"],
  ["Backtest Results", "backtest-results"],
  ["StockPage","stockpage"],
  ["Glossary", "glossary"],
];

function Flow({ children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#26395b] bg-[#0b1222] px-4 py-4 font-mono text-xs leading-7 text-[#9dc5ff] shadow-inner">
      {children}
    </div>
  );
}

function Section({ id, number, title, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-b border-[#1c2a45] py-8 first:pt-0"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#3d8bff]">
          {number}
        </span>
        <span className="h-px w-6 bg-[#26395b]" />
      </div>

      <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">
        {title}
      </h2>

      <div className="space-y-4 text-sm leading-7 text-[#a6b3c9]">
        {children}
      </div>
    </section>
  );
}

function Formula({ children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#26395b] bg-[#0b1222] px-4 py-3 font-mono text-xs text-[#8fc0ff] shadow-inner">
      {children}
    </div>
  );
}

function Term({ name, children }) {
  return (
    <div className="rounded-lg border border-[#1b2b48] bg-[#0d1627] p-3.5 transition-colors hover:border-[#2b4472]">
      <dt className="font-semibold text-white text-sm">{name}</dt>
      <dd className="mt-1 text-xs leading-relaxed text-[#8f9db5]">{children}</dd>
    </div>
  );
}

export default function DocumentationPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [docNavOpen, setDocNavOpen] = useState(false);
  const [active, setActive] = useState("introduction");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(sections[i][1]);
        if (sectionEl) {
          const top = sectionEl.offsetTop;
          if (scrollPosition >= top) {
            setActive(sections[i][1]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const jump = (id, e) => {
    if (e) e.preventDefault();
    setActive(id);
    setDocNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#080e19] text-white">
      <div className="flex min-h-screen">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        {menuOpen && (
          <button
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu overlay"
          />
        )}

        <main className="min-w-0 flex-1 flex flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#182944] bg-[#080e19]/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                className="text-[#8292ac] hover:text-white lg:hidden"
                aria-label="Open main menu"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-md bg-[#438cff]/15 text-[#438cff]">
                  <BookOpen size={16} />
                </div>
                <span className="text-sm font-semibold tracking-tight text-white">
                  Documentation
                </span>
                <span className="hidden rounded-full border border-[#234270] bg-[#11223e] px-2 py-0.5 text-[10px] font-medium text-[#7faeff] sm:inline-block">
                  Reference
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDocNavOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#233b63] bg-[#0f1b32] px-3 py-1.5 text-xs font-medium text-[#8ea5cc] transition-colors hover:border-[#3c78da] hover:text-white xl:hidden"
                aria-label="Open documentation navigation"
              >
                <ListTree size={14} className="text-[#438cff]" />
                <span>On this page</span>
              </button>

              <span className="hidden text-[10px] uppercase tracking-[0.16em] text-[#5c6d8a] md:block">
                QUANT_X Engine v1.0
              </span>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:gap-12">
            <article className="min-w-0 flex-1 max-w-4xl">
            <div className="mb-8 border-b border-[#1c2a45] pb-7">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3d8bff]">
                QUANT_X
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                QUANT_X Documentation
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#8c9bb5]">
                Learn how QUANT_X works, understand the statistics shown in
                the application, and see how each feature is executed
                internally.
              </p>
            </div>

            <Section
              id="introduction"
              number="01"
              title="Introduction"
            >
              <p>
                QUANT_X is a stock trading simulator for learning and
                testing systematic trading decisions without using live
                capital. It combines portfolio monitoring, market prices,
                order execution, strategies, backtesting, and transaction
                history.
              </p>

              <p>
                The basic workflow is: monitor the Dashboard, review your
                Portfolio, place or simulate orders through the Order
                Engine, and test strategy ideas with Backtesting before
                evaluating the results.
              </p>
            </Section>

            <Section id="dashboard" number="02" title="Dashboard">
              <p>
                The Dashboard is the account overview. It brings cash,
                 market activity, and recent trades into one
                real-time view.
              </p>

              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-white">
                    Portfolio Value:
                  </strong>{" "}
                  available cash plus the current market value of all
                  holdings.
                </li>

                <li>
                  <strong className="text-white">
                    Available Cash:
                  </strong>{" "}
                  cash that can be used for new BUY orders.
                </li>

                <li>
                  <strong className="text-white">
                    Today's P&amp;L:
                  </strong>{" "}
                  the change in portfolio's value since the end of recent market.
                </li>

                <li>
                  <strong className="text-white">
                    Total Profit:
                  </strong>{" "}
                  overall gain or loss of the portfolio compared with the initial capital provided at the start.
                </li>

                <li>
                  <strong className="text-white">
                    Market Overview:
                  </strong>{" "}
                  a watchlist of choosen 8 stocks and their latest
                  changes.
                </li>

                <li>
                  <strong className="text-white">
                    Live Price Updates:
                  </strong>{" "}
                  incoming prices refresh the selected stock, market
                  value, and P&amp;L without a page refresh.
                </li>
                <li>
                  <strong className="text-white">
                    Portfolio performance:
                  </strong>{" "}
                  graph which shows your total portfolio value over the previous week.
                </li>
                <li>
                  <strong className="text-white">
                    Recent Transactions:
                  </strong>{" "}
                  shows the most recent trades done by you.
                </li>
              </ul>

              <Formula>
                Total Profit = Current Portfolio Value - Initial Capital ($1,000,000)
                <br />
                Market Value = Quantity × Current Price
                <br />
                P&amp;L = (Current Price − Average Cost) × Quantity
                <br />
                Portfolio Value = Available Cash + Total Market Value
                of Holdings
              </Formula>

              <p>
                When a market price changes, the holding market value and
                unrealized P&amp;L change immediately. Cash does not change
                until an order is executed.
              </p>
            </Section>

            <Section id="portfolio" number="03" title="Portfolio">
              <p>
                A holding is a current position in one stock. The Portfolio
                page summarizes every open position and how it contributes
                to account value.
              </p>

              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-white">Best Performer:</strong> The stock with the highest positive
                   P&L percentage among the current holdings.
                </li>

                <li>
                  <strong className="text-white">Holdings P&L:</strong>{" "}
                  The net result of profit and loss incurred by each of your holdings.
                </li>

                <li>
                  <strong className="text-white">Holdings Investments:</strong>{" "}
                  Total cash invested to have current number of holdings.
                </li>

                <li>
                  <strong className="text-white">Active Holdings:</strong>{" "}
                  Total number of holdings you own among all the stocks
                </li>
                <li>
                  <strong className="text-white">Current P/L by Holding:</strong>{" "}
                  shows the profit or loss incurred by particular stock currently.
                </li>
                <li>
                  <strong className="text-white">Portfoio Allocation:</strong>{" "}
                  shows the division of your portfolio value among all the assets owned.
                </li>
                <li>
                  <strong className="text-white">Holdings:</strong>{" "}
                  shows the various facts at the current moment about the holdings you own.
                </li>

                <li>
                  <strong className="text-white">
                    Unrealized P&amp;L:
                  </strong>{" "}
                  gain or loss that would be realized if the position were
                  sold now.
                </li>
                <li>
                  <strong className="text-white">
                    P&amp;L%:
                  </strong>{" "}
                  Percentage of invested price which corresponds to the unrealized P&L for that stock
                </li>
              </ul>

              <p>
                This page will be updated in realtime whenever a price change occurs for any stock.
              </p>
            </Section>

            <Section
              id="transactions"
              number="04"
              title="Transactions"
            >
              <p>
                This page shows the details of transactions done since the birth of your portfolio. You can apply various
                filters on those transactions.
              </p>

              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-white">Total Orders:</strong> Total buy and sell orders executed over the time.
                </li>

                <li>
                  <strong className="text-white">Buy Orders:</strong> Total Buy orders over the time.
                </li>

                <li>
                  <strong className="text-white">
                    Sell Orders:
                  </strong>{" "}
                  Total sell orders over the time.
                </li>

                <li>
                  <strong className="text-white">Average Trade Size:</strong> Represents the average amount of money involved in each trade, 
                  based on the total value of all BUY and SELL orders executed.
                </li>
              </ul>
            </Section>

            <Section
              id="order-engine"
              number="05"
              title="Order Engine"
            >
              <p>
                The Order Engine validates an order, applies it at an
                execution price, updates the account, and returns the
                updated portfolio state.
              </p>

              <Flow>
                BUY FLOW
                <br />
                User places BUY order → Validate order → Check available
                cash
                <br />
                → Get execution price → Update cash → Update holdings
                <br />
                → Update average cost → Create transaction → Return
                updated portfolio
                <br />
                <br />
                SELL FLOW
                <br />
                User places SELL order → Validate order → Check available
                quantity
                <br />
                → Get execution price → Update cash → Update holdings
                <br />
                → Calculate profit/loss → Create transaction → Return
                updated portfolio
              </Flow>
            </Section>

            <Section id="strategies" number="06" title="Strategies">
              <p>
                A trading strategy is a repeatable set of conditions used
                to decide when to enter or exit a position. An indicator
                transforms price data into a measurable value.
              </p>

              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-white underline"><a href="https://www.investopedia.com/terms/s/sma.asp">SMA:</a></strong> simple
                  moving average of closing prices over a selected period.
                </li>

                <li>
                  <strong className="text-white underline"><a href="https://www.investopedia.com/terms/r/rsi.asp">RSI:</a></strong> bounded
                  momentum indicator used to identify strong or weak
                  recent price movement.
                </li>

                <li>
                  <strong className="text-white">
                    Buy condition:
                  </strong>{" "}
                  rule that can generate an entry signal.
                </li>

                <li>
                  <strong className="text-white">
                    Sell condition:
                  </strong>{" "}
                  rule that can generate an exit signal.
                </li>

                <li>
                  <strong className="text-white">Operator:</strong>{" "}
                  comparison such as &lt;, &gt;
                </li>

                <li>
                  <strong className="text-white">Threshold:</strong>{" "}
                  value used in the comparison.
                </li>
              </ul>

              <Flow>
                Indicator: RSI
                <br />
                Operator: &lt;
                <br />
                Threshold: 30
                <br />
                <br />
                RSI &lt; 30 → BUY Signal
              </Flow>
            </Section>

            <Section id="backtesting" number="07" title="Backtesting">
              <p>
                Backtesting applies a strategy to historical market data
                to estimate how it would have behaved.
              </p>

              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-white">Symbol:</strong>{" "}
                  instrument being tested.
                </li>

                <li>
                  <strong className="text-white">
                    Start Date / End Date:
                  </strong>{" "}
                  historical test window.
                </li>

                <li>
                  <strong className="text-white">Quantity:</strong>{" "}
                  virtual shares used per trade.
                </li>

                <li>
                  <strong className="text-white">
                    Buy/Sell Indicator:
                  </strong>{" "}
                  indicator used for entry and exit conditions.
                </li>

                <li>
                  <strong className="text-white">
                    Buy/Sell Threshold:
                  </strong>{" "}
                  comparison value for each signal.
                </li>

                <li>
                  <strong className="text-white">
                    Buy/Sell Operator:
                  </strong>{" "}
                  comparison applied to the indicator value.
                </li>
              </ul>

              <Flow>
                Historical Market Data → Process candles chronologically
                <br />
                → Calculate indicators → Evaluate strategy → Generate
                BUY/SELL signals
                <br />
                → Execute virtual trades → Calculate portfolio value →
                Generate results
              </Flow>
            </Section>

            <Section
              id="backtest-results"
              number="08"
              title="Backtest Results"
            >
              <p>
                Backtest results describe both return and risk. Interpret
                every number alongside the test period, starting capital,
                strategy rules, and assumptions.
              </p>

              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-white">
                    Total Trades:
                  </strong>{" "}
                  number of virtual executions generated.
                </li>

                <li>
                  <strong className="text-white">
                    Profitable Trades:
                  </strong>{" "}
                  trades that ended with positive realized P&amp;L.
                </li>

                <li>
                  <strong className="text-white">Win Rate:</strong>{" "}
                  profitable trades divided by total trades.
                </li>

                <li>
                  <strong className="text-white">
                    Initial Capital:
                  </strong>{" "}
                  virtual account value at the start.
                </li>

                <li>
                  <strong className="text-white">
                    Final Portfolio Value:
                  </strong>{" "}
                  cash plus open-position market value at the end.
                </li>

                <li>
                  <strong className="text-white">
                    Total Return:
                  </strong>{" "}
                  percentage change from initial to final value.
                </li>

                <li>
                  <strong className="text-white">
                    Maximum Drawdown:
                  </strong>{" "}
                  largest decline from a previous portfolio peak.
                </li>

                <li>
                  <strong className="text-white">
                    Equity Curve:
                  </strong>{" "}
                  portfolio value plotted through the test.
                </li>

                <li>
                  <strong className="text-white">
                    Trade History:
                  </strong>{" "}
                  chronological list of generated virtual trades.
                </li>
              </ul>

              <Formula>
                Win Rate = Profitable Trades ÷ Total Trades × 100
                <br />
                Total Return % = (Final Portfolio Value − Initial Capital)
                ÷ Initial Capital × 100
                <br />
                Maximum Drawdown = Largest percentage decline from a
                previous portfolio peak
              </Formula>
            </Section>

            <Section id="stockpage" number="09" title="Stock Page">
                <p>
                    The Stock Page provides detailed information about a selected stock,
                    including its current price, price movement, chart, and other market
                    details.
                </p>

                <ul className="list-disc space-y-1 pl-5">
                    <li>
                    <strong className="text-white">
                        Stock Symbol:
                    </strong>{" "}
                    identifies the selected stock using its market ticker.
                    </li>

                    <li>
                    <strong className="text-white">
                        Current Price:
                    </strong>{" "}
                    displays the latest available market price of the selected stock.
                    </li>

                    <li>
                    <strong className="text-white">
                        Price Change:
                    </strong>{" "}
                    shows how much the stock price has changed over the selected period.
                    </li>

                    <li>
                    <strong className="text-white">
                        Price Chart:
                    </strong>{" "}
                    displays the historical price movement of the selected stock over
                    the chosen time period.
                    </li>

                    <li>
                    <strong className="text-white">
                        Time Period:
                    </strong>{" "}
                    allows you to view price movements across different time intervals.
                    </li>

                    <li>
                    <strong className="text-white">
                        Candlestick Data:
                    </strong>{" "}
                    represents the opening, highest, lowest, and closing prices of the
                    stock during each time interval.
                    </li>

                    <li>
                    <strong className="text-white">
                        High and Low:
                    </strong>{" "}
                    show the highest and lowest prices recorded during the selected
                    interval.
                    </li>

                    <li>
                    <strong className="text-white">
                        Live Price Updates:
                    </strong>{" "}
                    updates the stock's current price in real time as new market data
                    is received.
                    </li>

                    <li>
                    <strong className="text-white">
                        Interactive Chart:
                    </strong>{" "}
                    allows you to inspect price information for a specific point in
                    time by moving the cursor across the chart.
                    </li>
                </ul>

                <p>
                    The stock price displayed on the page is updated whenever new market
                    data is received, while historical price information is used to
                    construct the chart for the selected time period.
                </p>
                </Section>

            <Section id="glossary" number="10" title="Glossary">
              <dl className="grid gap-4">
                <Term name="P&L">
                  Profit and loss from a position or portfolio.
                </Term>

                <Term name="Portfolio">
                  All cash and holdings belonging to the simulated
                  account.
                </Term>

                <Term name="Holding">
                  An open position in a stock.
                </Term>

                <Term name="Position">
                  The quantity and exposure held in an instrument.
                </Term>

                <Term name="Equity">
                  The current total value of the account.
                </Term>

                <Term name="Market Value">
                  The current price multiplied by quantity.
                </Term>

                <Term name="Average Cost">
                  Weighted average purchase price of a holding.
                </Term>

                <Term name="Indicator">
                  A calculated value derived from market data.
                </Term>

                <Term name="Threshold">
                  A value used to trigger a comparison.
                </Term>

                <Term name="Signal">
                  A strategy instruction such as BUY or SELL.
                </Term>

                <Term name="Candle">
                  A time interval containing open, high, low, and close
                  prices.
                </Term>

                <Term name="Backtesting">
                  Applying rules to historical data with virtual trades.
                </Term>

                <Term name="Drawdown">
                  Decline from an equity peak to a later low.
                </Term>

                <Term name="Win Rate">
                  Percentage of trades that were profitable.
                </Term>

                <Term name="Return">
                  Percentage change in portfolio value.
                </Term>
              </dl>
            </Section>

            <footer className="py-8 text-xs text-[#5c6d8a]">
              QUANT_X Documentation · Keep your rules explicit,
              measurable, and reviewable.
            </footer>
          </article>

          <aside className="hidden w-56 shrink-0 xl:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#438cff]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#788ba8]">
                  On this page
                </p>
              </div>

              <nav
                className="relative border-l border-[#1f3152] pl-2"
                aria-label="Documentation sections"
              >
                {sections.map(([label, id]) => {
                  const isCurrent = active === id;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={(e) => jump(id, e)}
                      className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                        isCurrent
                          ? "bg-[#142340] text-[#5aa1ff] shadow-sm"
                          : "text-[#7a8ba7] hover:bg-[#0f1a30] hover:text-white"
                      }`}
                    >
                      <span className="truncate">{label}</span>
                      {isCurrent && (
                        <ChevronRight size={12} className="shrink-0 text-[#5aa1ff]" />
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      </main>
    </div>

      {docNavOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setDocNavOpen(false)}
            aria-label="Close table of contents"
          />

          <aside className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col border-l border-[#1e365f] bg-[#0b1222] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[#1c2e4f] pb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <div className="flex size-7 items-center justify-center rounded-md bg-[#438cff]/15 text-[#438cff]">
                  <ListTree size={16} />
                </div>
                <span>On this page</span>
              </div>

              <button
                onClick={() => setDocNavOpen(false)}
                className="rounded-md p-1.5 text-[#8292ac] hover:bg-[#16233d] hover:text-white"
                aria-label="Close table of contents"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
              {sections.map(([label, id]) => {
                const isCurrent = active === id;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => jump(id, e)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isCurrent
                        ? "border border-[#367eff]/60 bg-[#172852] text-white shadow-sm"
                        : "text-[#8b9ab5] hover:bg-[#151f36] hover:text-white"
                    }`}
                  >
                    <span>{label}</span>
                    {isCurrent && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#438cff]" />
                    )}
                  </a>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}