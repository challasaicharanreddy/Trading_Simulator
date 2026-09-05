import { useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound, Activity } from "lucide-react"
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-slate-100">
      <span className="grid size-8 place-items-center rounded-md bg-blue-500 text-slate-950 shadow-[0_0_24px_rgba(59,130,246,0.22)]">
        <Activity className="size-4" strokeWidth={2.5} />
      </span>
      QUANT_X
    </Link>
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
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange, icon: Icon, action }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <input
          required
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-11 w-full rounded-md border border-slate-700/80 bg-slate-950/50 pl-10 pr-11 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
        />
        {action}
      </span>
    </label>
  )
}

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { checkAuth } = useAuth()
  const isRegister = location.pathname === "/register"
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const messageref=useRef(null)

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    if(!isRegister) {
        try{
            const reply=await axios.post(`http://localhost:5000/auth/login`,{
            email:form.email,
            password:form.password
            },{withCredentials:true});
            setSubmitted(true)
            if(reply.status==200) {
                await checkAuth()
                messageref.current.textContent=reply.data.message;
                navigate("/");
            }
        }catch(error) {
            messageref.current.textContent="Invalid Credentials Brooo...Please recheck!!"
        }
    }else{
        try{
            if(form.confirm!=form.password) {
                messageref.current.textContent="Confirm Password differs from Given Password. Check again!!"
                return;
            }
            const reply=await axios.post(`http://localhost:5000/auth/register`,{
                username:form.name,
                email:form.email,
                password:form.password
            },{withCredentials:true});
            if(reply.status==200) {
                messageref.current.textContent=reply.data.message;
                navigate("/login")
            }
        }catch(error) {
            messageref.current.textContent="User already exist..Please remember your details.";
        }
    }
    
  }

  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100 lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(470px,0.92fr)]">
      <section className="relative flex min-h-[360px] flex-col overflow-hidden border-b border-slate-800/80 bg-[#09111f] px-6 py-6 sm:px-10 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-14 lg:py-10">
        <div className="absolute inset-0 bg-[url('/quant-trading-room.png')] bg-cover bg-center opacity-45" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,20,0.78)_0%,rgba(6,13,27,0.68)_48%,rgba(5,10,20,0.96)_100%)]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(37,99,235,0.16),transparent_34%)]" aria-hidden="true" />

        <div className="relative z-10 flex items-center justify-between">
          <Brand />
          <div className="lg:hidden"><MarketStatus/></div>
        </div>

        <div className="relative z-10 mt-auto max-w-xl pt-24 lg:pb-2">
          <div className="mb-6 hidden items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-blue-300 lg:flex">
            <span className="h-px w-8 bg-blue-400" />
            Algorithmic trading simulator
          </div>
          <h1 className="max-w-lg text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
            Trade smarter.<br /><span className="text-blue-400">Test deeper.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
            Build strategies, simulate trades, backtest ideas, and analyze performance in a focused environment made for better decisions.
          </p>
          <div className="mt-8 hidden items-center gap-4 lg:flex">
            <MarketStatus />
            <span className="text-xs text-slate-500">Live simulation environment</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-[600px] items-center justify-center px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="w-full max-w-md">
          <div className="mb-9">
            <div className="mb-7 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="size-4 text-blue-400" />
              Secure simulator access
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-slate-50">
              {isRegister ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {isRegister ? "Start building and testing your trading edge." : "Sign in to continue to your trading workspace."}
            </p>
          </div>

          {submitted && (
            <div ref={messageref} className="mb-5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300" role="status">
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegister && <Field label="Full name" placeholder="Alex Mercer" value={form.name} onChange={update("name")} icon={UserRound} />}
            <Field label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} icon={Mail} />
            <Field
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={update("password")}
              icon={LockKeyhole}
              action={<button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>}
            />
            {isRegister && <Field label="Confirm password" type={showPassword ? "text" : "password"} placeholder="Re-enter your password" value={form.confirm} onChange={update("confirm")} icon={LockKeyhole} />}

            {!isRegister && <div className="flex justify-end"><button type="button" className="text-xs font-medium text-blue-400 transition hover:text-blue-300">Forgot password?</button></div>}

            <button type="submit" className="group flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-500 text-sm font-semibold text-slate-950 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50">
              {isRegister ? "Create Account" : "Sign In"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="my-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.16em] text-slate-600"><span className="h-px flex-1 bg-slate-800" />or<span className="h-px flex-1 bg-slate-800" /></div>

          <p className="text-center text-sm text-slate-500">
            {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button type="button" onClick={() => navigate(isRegister ? "/login" : "/register")} className="font-medium text-blue-400 transition hover:text-blue-300">
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}
