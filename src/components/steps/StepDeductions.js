import React from "react";
import { parseNum, fmt } from "../../utils/taxHelpers";
import Label from "../ui/Label";
import Tip from "../ui/Tip";
import MoneyInput from "../ui/MoneyInput";
import SectionHead from "../ui/SectionHead";
import InfoBox from "../ui/InfoBox";

export default function StepDeductions({ data, set, summary, help, toggleHelp, openIRS }) {
  return (
    <div className="space-y-4">
      <InfoBox>
        We automatically compare itemized deductions to your standard deduction and use
        whichever is larger.
        {summary.usesItemized !== undefined && (
          <span className="block mt-1 font-semibold">
            Currently using:{" "}
            <strong>{summary.usesItemized ? "Itemized" : "Standard"}</strong> deduction ($
            {fmt(summary.deductionUsed)} vs{" "}
            {summary.usesItemized
              ? `standard $${fmt(summary.stdDed)}`
              : `itemized $${fmt(summary.itemized)}`}
            )
          </span>
        )}
        <button
          onClick={() => openIRS("scheduleA")}
          className="block mt-1 text-blue-600 hover:underline text-xs"
        >
          Schedule A Instructions &rarr;
        </button>
      </InfoBox>

      <SectionHead>Above-the-Line Adjustments</SectionHead>
      <div>
        <Label tip="sli" onToggleHelp={toggleHelp}>Student Loan Interest</Label>
        <Tip visible={help.sli}>
          Deductible up to $2,500. Phases out at higher AGI. This is an "above-the-line"
          deduction — you get it regardless of whether you itemize.
        </Tip>
        <MoneyInput value={data.studentLoanInterest} onChange={(v) => set("studentLoanInterest", v)} />
      </div>
      <div>
        <Label tip="hsa2" onToggleHelp={toggleHelp}>HSA Contribution (not via payroll)</Label>
        <Tip visible={help.hsa2}>
          If you made HSA contributions directly (not through employer payroll), enter the
          amount here. Employer contributions via a cafeteria plan are already pre-tax.
        </Tip>
        <MoneyInput value={data.hsaSelfContribution} onChange={(v) => set("hsaSelfContribution", v)} />
      </div>

      <SectionHead>Itemized Deductions (Schedule A)</SectionHead>
      <div>
        <Label tip="med" onToggleHelp={toggleHelp}>Medical &amp; Dental Expenses</Label>
        <Tip visible={help.med}>
          Only the portion exceeding 7.5% of your AGI is deductible. Enter your total; we
          calculate the deductible amount automatically.
        </Tip>
        <MoneyInput value={data.medicalExpenses} onChange={(v) => set("medicalExpenses", v)} />
        {summary.medical !== undefined && parseNum(data.medicalExpenses) > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            Deductible amount (after 7.5% AGI floor):{" "}
            <strong>${fmt(summary.medical)}</strong>
          </p>
        )}
      </div>

      <div>
        <Label tip="salt" onToggleHelp={toggleHelp}>State &amp; Local Taxes (SALT)</Label>
        <Tip visible={help.salt}>
          Combined deduction for state/local income (or sales) tax AND property tax is
          capped at $10,000 total. Note: SALT is also the main item that can trigger AMT —
          see the review step for details.
        </Tip>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-slate-500">State / Local Income or Sales Tax</span>
            <MoneyInput value={data.statExciseTax} onChange={(v) => set("statExciseTax", v)} />
          </div>
          <div>
            <span className="text-xs text-slate-500">Property Tax</span>
            <MoneyInput value={data.localPropertyTax} onChange={(v) => set("localPropertyTax", v)} />
          </div>
        </div>
        {summary.salt !== undefined &&
          parseNum(data.statExciseTax) + parseNum(data.localPropertyTax) > 10000 && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ SALT capped at $10,000. Your total was $
              {fmt(parseNum(data.statExciseTax) + parseNum(data.localPropertyTax))}.
            </p>
          )}
      </div>

      <div>
        <Label tip="mi" onToggleHelp={toggleHelp}>Mortgage Interest</Label>
        <Tip visible={help.mi}>
          Interest on acquisition debt up to $750,000. Enter the amount from Box 1 of Form
          1098.
        </Tip>
        <MoneyInput value={data.mortgageInterest} onChange={(v) => set("mortgageInterest", v)} />
      </div>
      <div>
        <Label>Mortgage Points Paid</Label>
        <MoneyInput value={data.mortgagePoints} onChange={(v) => set("mortgagePoints", v)} />
      </div>

      <div>
        <Label tip="char" onToggleHelp={toggleHelp}>Charitable Donations</Label>
        <Tip visible={help.char}>
          Cash donations are deductible up to 60% of AGI. Non-cash gifts over $500 require
          Form 8283.
        </Tip>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-slate-500">Cash Donations</span>
            <MoneyInput value={data.charitableCash} onChange={(v) => set("charitableCash", v)} />
          </div>
          <div>
            <span className="text-xs text-slate-500">Non-Cash Donations</span>
            <MoneyInput value={data.charitableNonCash} onChange={(v) => set("charitableNonCash", v)} />
          </div>
        </div>
      </div>

      <div>
        <Label>Other Itemized Deductions</Label>
        <MoneyInput value={data.otherItemized} onChange={(v) => set("otherItemized", v)} />
      </div>

      <SectionHead>Estimated Tax Payments</SectionHead>
      <div>
        <Label tip="est" onToggleHelp={toggleHelp}>
          Estimated Tax Payments (Form 1040-ES)
        </Label>
        <Tip visible={help.est}>
          If you made quarterly estimated tax payments during the year (common for
          self-employed, freelancers, or investment income), enter the total of all four
          payments here. Each payment is reported on Form 1040-ES. This reduces your amount
          owed / increases your refund.
        </Tip>
        <MoneyInput
          value={data.estimatedTaxPayments}
          onChange={(v) => set("estimatedTaxPayments", v)}
        />
      </div>
    </div>
  );
}
