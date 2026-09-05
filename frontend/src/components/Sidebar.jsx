import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  PieChart,
  Play,
  Settings,
  TrendingUp,
  X,
  LogOut,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const nav = [
    ["Dashboard", LayoutDashboard, "/dashboard"],
    ["Portfolio", PieChart, "/portfolio"],
    ["Transactions", Activity, "/transactions"],
    ["Order Engine", Play, "/order-engine"],
    ["Strategies", Settings, "/strategy-engine"],
    ["Backtesting", BarChart3, "/backtest"],
    ["Documentation", BookOpen, "/documentation"],
  ];
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, {}, { withCredentials: true });
      if (res) {
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <aside
      className={`${
        open ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-30 flex h-screen w-[240px] shrink-0 flex-col border-r border-[#1e365f] bg-[#0b1222] px-3 py-6 transition-transform lg:sticky lg:top-0 lg:translate-x-0`}
    >
      <div className="flex shrink-0 items-center gap-3 px-3">
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

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
        {nav.map(([label, Icon, to]) => {
          const isActive =
            location.pathname === to ||
            (to === "/dashboard" && location.pathname === "/") ||
            (to === "/" && location.pathname === "/dashboard");
          return (
            <Link
              key={label}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "border border-[#367eff] bg-[#172852] font-medium text-white"
                  : "text-[#70819f] hover:bg-[#17203a] hover:text-white"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 pt-3">
        <div className="rounded-md border border-[#1d2e4e] bg-[#101a2e] p-2">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded bg-[#294465] text-xs font-bold text-white">
              {user?.username
                ? user.username.split(" ")[0][0].toUpperCase()
                : "U"}
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                {user?.username || "User"}
              </p>

              <p className="text-xs text-[#6f819e]">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-[#70819f] hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;