import React from "react";
import { Download, ExternalLink } from "lucide-react";
import { parseNum, fmt } from "../../utils/taxHelpers";
import InfoBox from "../ui/InfoBox";

export default function StepReview({ data, summary, year, openIRS }) {
  const s = summary;
  if (s.totalIncome === undefined) {
    return <p className="text-slate-500">Complete earlier steps to see your summary.</p>;
  }

  const incomeRows = [
    ["W-2 Wages", s.w2Wages],
    ["Domestic Interest", s.domesticInterest],
    ["Ordinary Dividends", s.domesticDividends],
    ["  \u21b3 Qualified Div.", s.qualifiedDividends],
    ["Long-Term Cap. Gains", s.longTermCapitalGains],
    ["Foreign Interest", s.foreignInterest],
    ["Foreign Dividends", s.foreignDividends],
    ["Business (net)", s.businessNet],
    ["Pension (taxable)", s.pensionTaxable],
    ["Misc / 1099", s.miscTotal],
  ].filter(([, v]) => v > 0);

  const detailRows = [
    ["Adjustments", s.totalAdjustments],
    ["Adjusted Gross Income (AGI)", s.agi],
    [`Deduction (${s.usesItemized ? "Itemized" : "Standard"})`, s.deductionUsed],
    ["Taxable Income", s.taxableIncome],
    ["Tax on Ordinary Income", s.ordinaryTax],
    ["Tax on Qualified Div. / LTCG", s.preferentialTax],
    ["Regular Tax", s.regularTax],
    ["AMT (additional)", s.amtOwed],
    ["Self-Employment Tax", s.seTax],
    ["Credits", s.credits],
    ["Total Tax", s.totalTax],
  ];

  const paymentRows = [
    ["W-2 Federal Withheld", s.w2Fed],
    ["1099 / Other Withheld", s.miscWithheld],
    ["Estimated Tax Payments", s.estPayments],
    ["Total Payments", s.totalWithholding],
  ].filter(([, v]) => v > 0);

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div
        className={`rounded-xl p-6 text-white text-center ${
          s.refundOrOwed >= 0
            ? "bg-gradient-to-br from-emerald-600 to-teal-700"
            : "bg-gradient-to-br from-red-600 to-orange-700"
        }`}
      >
        <div className="text-sm opacity-80 mb-1">{year} Estimated</div>
        <div
          className="text-3xl font-bold"
          style={{ fontFamily: '"Merriweather", serif' }}
        >
          {s.refundOrOwed >= 0 ? "Refund" : "Amount Owed"}
        </div>
        <div className="text-5xl font-black mt-2">${fmt(s.refundOrOwed)}</div>
      </div>

      {/* Income breakdown */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Income
        </div>
        {incomeRows.map(([label, val]) => (
          <div
            key={label}
            className="flex justify-between px-4 py-1.5 text-sm border-t border-slate-100"
          >
            <span
              className={
                label.startsWith("  \u21b3") ? "text-slate-400 italic" : "text-slate-600"
              }
            >
              {label}
            </span>
            <span className="font-medium text-slate-800">${fmt(val)}</span>
          </div>
        ))}
        <div className="flex justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-sm font-bold">
          <span>Total Income</span>
          <span>${fmt(s.totalIncome)}</span>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {detailRows.map(([label, val]) => (
          <div
            key={label}
            className={`rounded-lg px-4 py-3 ${
              label === "AMT (additional)" && val > 0
                ? "bg-amber-50 border border-amber-200"
                : "bg-slate-50"
            }`}
          >
            <div className="text-xs text-slate-500">{label}</div>
            <div
              className={`text-lg font-bold ${
                label === "AMT (additional)" && val > 0
                  ? "text-amber-700"
                  : "text-slate-800"
              }`}
            >
              ${fmt(val)}
            </div>
          </div>
        ))}
      </div>

      {/* Payments breakdown */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Payments
        </div>
        {paymentRows.map(([label, val]) => (
          <div
            key={label}
            className={`flex justify-between px-4 py-1.5 text-sm border-t border-slate-100 ${
              label === "Total Payments"
                ? "bg-slate-50 font-bold border-slate-200"
                : ""
            }`}
          >
            <span className="text-slate-600">{label}</span>
            <span className="font-medium text-slate-800">${fmt(val)}</span>
          </div>
        ))}
      </div>

      {/* State tax note */}
      {s.stateTaxWithheld > 0 && (
        <InfoBox color="blue">
          <strong>State tax withheld: ${fmt(s.stateTaxWithheld)}</strong> — this does not
          affect your federal return. Use it when you file your state return.
        </InfoBox>
      )}

      {/* AMT explanation if triggered */}
      {s.amtOwed > 0 && (
        <InfoBox color="amber">
          ⚠️ <strong>Alternative Minimum Tax (AMT)</strong> added{" "}
          <strong>${fmt(s.amtOwed)}</strong> to your tax bill. AMT is a parallel tax system
          designed to ensure high-income taxpayers pay a minimum amount. The most common
          trigger is deducting state and local taxes (SALT). This app calculates AMT using a
          simplified method — consult a tax professional if you want to explore ways to
          reduce it.
        </InfoBox>
      )}

      {/* Compliance flags */}
      {s.fbarFlag && (
        <InfoBox color="red">
          ⚠️ <strong>FBAR Required</strong> — Foreign bank balance exceeded $10,000. File
          FinCEN Form 114 at FinCEN.gov (separate from your tax return).
          <button
            onClick={() => openIRS("fbar")}
            className="block mt-1 underline text-red-600 text-xs"
          >
            IRS FBAR guidance &rarr;
          </button>
        </InfoBox>
      )}
      {s.fatcaFlag && (
        <InfoBox color="red">
          ⚠️ <strong>Form 8938 (FATCA) may be required</strong> — Foreign asset value is
          high. Consult a tax professional.
        </InfoBox>
      )}
      {(data.giftsReceived || []).some(
        (g) => g.isFromForeigner && parseNum(g.amount) > 100000
      ) && (
        <InfoBox color="red">
          ⚠️ <strong>Form 3520 Required</strong> — Gift over $100,000 received from a
          foreign person.
        </InfoBox>
      )}

      {/* E-file note */}
      <InfoBox color="amber">
        <strong>About e-filing:</strong> This app cannot e-file directly. The IRS requires
        authorized e-file provider status, which is a separate certification process. To
        file your return: (1) download the PDF below and mail it, or (2) use the numbers
        from this summary to enter your return into a certified e-file provider such as{" "}
        <strong>IRS Free File</strong>{" "}
        (https://www.irs.gov/filing/free-file-do-your-federal-taxes-for-free) — free for
        most taxpayers.
      </InfoBox>

      <InfoBox color="amber">
        ⚠️ This calculation is simplified. AMT uses only SALT as an add-back (real AMT has
        additional preference items). Phase-outs for IRA deductibility and some credits are
        not fully modeled. Consult a tax professional before filing.
      </InfoBox>

      <div className="grid gap-3">
        <button
          onClick={() =>
            alert(
              "In production this would generate and download a filled Form 1040 PDF."
            )
          }
          className="btn-primary w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white
                     py-3 rounded-lg font-bold flex items-center justify-center gap-2
                     hover:from-blue-700 hover:to-blue-900"
        >
          <Download className="w-5 h-5" /> Download Form 1040 (PDF)
        </button>
        <button
          onClick={() => openIRS("form1040")}
          className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold
                     flex items-center justify-center gap-2 hover:bg-blue-50 transition"
        >
          <ExternalLink className="w-5 h-5" /> IRS Form 1040 Instructions
        </button>
      </div>
    </div>
  );
}
