import { ChevronDown } from "lucide-react";

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

      <p className="mb-2 text-xs font-semibold tracking-wider text-[#3c85ff]">
        {title}
      </p>

      <div className="grid gap-3 md:grid-cols-3">

        <Field label="Indicator">
          <Select
            value={indicator}
            onChange={setIndicator}
          >
            <option>SMA</option>
            <option>RSI</option>
          </Select>
        </Field>

        <Field label="Operator">
          <Select
            value={operator}
            onChange={setOperator}
          >
            <option>&gt;</option>
            <option>&lt;</option>
          </Select>
        </Field>

        <Field label="Threshold">
          <Input
            type="number"
            value={threshold}
            onChange={setThreshold}
          />
        </Field>

      </div>

      <p className="mt-2 text-xs text-[#71829d]">
        {helper}
      </p>

    </div>
  );
}