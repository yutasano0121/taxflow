import React from "react";

export default function TextInput({ value, onChange, placeholder, maxLength, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="input-field w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg
                 focus:outline-none focus:border-blue-500"
    />
  );
}
