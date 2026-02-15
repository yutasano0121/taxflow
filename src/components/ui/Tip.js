import React from "react";

export default function Tip({ visible, children }) {
  if (!visible) return null;
  return (
    <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
      {children}
    </div>
  );
}
