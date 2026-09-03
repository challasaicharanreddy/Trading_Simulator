import {
  ArrowLeft,
  BarChart3,
  Check,
  ChevronDown,
  LoaderCircle,
  Play,
  RotateCcw,
} from "lucide-react";

function Select({ value, onChange, children }) {
  return (
    <span className="relative block">
      <select
        value={value}
        onChange={onChange}
        className="h-10 w-full appearance-none rounded border border-[#1f3155] bg-[#0e1729] px-3 pr-8 text-[12px] text-[#b8c4d8] outline-none focus:border-[#3c85ff]"
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
      <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-[#71829d]">
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
      className="h-10 w-full rounded border border-[#1f3155] bg-[#0e1729] px-3 text-[12px] text-[#b8c4d8] outline-none focus:border-[#3c85ff]"
    />
  );
}


function Metric({
  label,
  value,
  tone = "",
}) {
  return (
    <div className="rounded-md border border-[#1f3155] bg-[#121b30] p-3">
      <p className="text-[10px] uppercase tracking-wider text-[#71829d]">
        {label}
      </p>

      <p
        className={`mt-2 font-mono text-[18px] font-semibold ${
          tone === "positive"
            ? "text-emerald-400"
            : tone === "negative"
            ? "text-red-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}


export default function Condition({
  title,
  indicator,
  operator,
  threshold,
  setIndicator,
  setOperator,
  setThreshold,
  helper,
}) {
  return (
    <div>

      <p className="mb-2 text-[10px] font-semibold tracking-widest text-[#3c85ff]">
        {title}
      </p>

      <div className="grid gap-3 md:grid-cols-3">

        {/* Indicator */}
        <Field label="Indicator">
          <Select
            value={indicator}
            onChange={setIndicator}
          >
            <option>SMA</option>
            <option>RSI</option>
          </Select>
        </Field>


        {/* Operator */}
        <Field label="Operator">
          <Select
            value={operator}
            onChange={setOperator}
          >
            <option>&gt;</option>
            <option>&lt;</option>
          </Select>
        </Field>


        {/* Threshold */}
        <Field label="Threshold">
          <Input
            type="number"
            value={threshold}
            onChange={setThreshold}
          />
        </Field>

      </div>

      <p className="mt-2 text-[10px] text-[#71829d]">
        {helper}
      </p>

    </div>
  );
}