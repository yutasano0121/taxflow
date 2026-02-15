import React from "react";

export default function MoneyInput({ value, onChange }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
        $
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className="input-field w-full pl-7 pr-3 py-2.5 border-2 border-slate-200 rounded-lg
                   focus:outline-none focus:border-blue-500 text-slate-900"
      />
    </div>
  );
}
