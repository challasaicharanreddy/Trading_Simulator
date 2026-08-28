import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  PieChart,
  Play,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";

function Sidebar({ open, onClose }) {
  const nav = [
    ["Dashboard", LayoutDashboard, "/"],
    ["Portfolio", PieChart, "/"],
    ["Transactions", Activity, "/transactions"],
    ["Order Engine", Play, "/"],
    ["Strategies", Settings, "/"],
    ["Backtesting", BarChart3, "/"],
  ];

  return (
    <aside
      className={`${
        open ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col border-r border-[#1e365f] bg-[#0b1222] px-3 py-6 transition-transform lg:static lg:translate-x-0`}
    >
      <div className="flex items-center gap-3 px-3">
        <div className="grid size-7 place-items-center rounded-sm bg-[#3c85ff] text-white">
          <TrendingUp size={16} />
        </div>

        <span className="text-sm font-bold tracking-wide text-white">
          QUANT_X
        </span>

        <button
          onClick={onClose}
          className="ml-auto text-slate-400 lg:hidden"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="mt-6 space-y-1">
        {nav.map(([label, Icon, to], index) => (
          <Link
            key={label}
            to={to}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
              index === 0
                ? "border border-[#367eff] bg-[#172852] text-white"
                : "text-[#70819f] hover:bg-[#17203a] hover:text-white"
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-md border border-[#1d2e4e] bg-[#101a2e] p-2">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded bg-[#294465] text-xs font-bold text-white">
            AM
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Alex Mercer
            </p>

            <p className="text-xs text-[#6f819e]">
              Terminal ID: #8204
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;