import React from "react";

export default function SectionHead({ children }) {
  return (
    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-5 mb-2 border-b border-slate-200 pb-1">
      {children}
    </div>
  );
}
