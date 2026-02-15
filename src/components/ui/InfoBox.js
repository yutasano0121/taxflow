import React from "react";

const STYLES = {
  blue: "bg-blue-50 border-blue-200 text-blue-900",
  amber: "bg-amber-50 border-amber-200 text-amber-900",
  red: "bg-red-50 border-red-200 text-red-900",
  green: "bg-green-50 border-green-200 text-green-900",
};

export default function InfoBox({ children, color = "blue" }) {
  return (
    <div className={`p-3 rounded-lg border text-sm ${STYLES[color] || STYLES.blue}`}>
      {children}
    </div>
  );
}
