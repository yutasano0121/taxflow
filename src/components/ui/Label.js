import React from "react";
import { HelpCircle } from "lucide-react";

export default function Label({ children, tip, onToggleHelp }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children}
      {tip && (
        <button
          onClick={() => onToggleHelp(tip)}
          className="ml-2 text-blue-500 hover:text-blue-700"
        >
          <HelpCircle className="w-4 h-4 inline" />
        </button>
      )}
    </label>
  );
}
