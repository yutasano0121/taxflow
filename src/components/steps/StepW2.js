import React from "react";
import Label from "../ui/Label";
import Tip from "../ui/Tip";
import MoneyInput from "../ui/MoneyInput";
import SectionHead from "../ui/SectionHead";
import InfoBox from "../ui/InfoBox";

export default function StepW2({ data, set, help, toggleHelp, openIRS }) {
  return (
    <div className="space-y-4">
      <InfoBox>
        Enter values exactly as printed on your W-2. If you have multiple W-2s,
        add the amounts together.
        <button
          onClick={() => openIRS("form1040")}
          className="block mt-1 text-blue-600 hover:underline text-xs"
        >
          IRS Form 1040 Instructions &rarr;
        </button>
      </InfoBox>

      <div>
        <Label tip="w2w" onToggleHelp={toggleHelp}>
          Box 1 — Wages, Tips, Other Compensation
        </Label>
        <Tip visible={help.w2w}>
          Taxable wages after pre-tax deductions (401k, health premiums, etc.)
          have already been subtracted by your employer.
        </Tip>
        <MoneyInput value={data.w2Wages} onChange={(v) => set("w2Wages", v)} />
      </div>

      <div>
        <Label tip="w2f" onToggleHelp={toggleHelp}>
          Box 2 — Federal Income Tax Withheld
        </Label>
        <Tip visible={help.w2f}>
          The amount your employer already sent to the IRS on your behalf. This
          counts as a payment when we calculate your refund or amount owed.
        </Tip>
        <MoneyInput value={data.w2FederalTax} onChange={(v) => set("w2FederalTax", v)} />
      </div>

      <div>
        <Label tip="w2s" onToggleHelp={toggleHelp}>
          Box 16 — State Income Tax Withheld
        </Label>
        <Tip visible={help.w2s}>
          The amount your employer withheld for state income tax. This does not
          affect your federal return directly, but we track it here for your
          state return and for reference.
        </Tip>
        <MoneyInput value={data.w2StateTax} onChange={(v) => set("w2StateTax", v)} />
      </div>

      <SectionHead>
        Informational (for your records — not used in calculation)
      </SectionHead>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Box 3 — Social Security Wages</Label>
          <MoneyInput
            value={data.w2SocialSecurity}
            onChange={(v) => set("w2SocialSecurity", v)}
          />
        </div>
        <div>
          <Label>Box 5 — Medicare Wages</Label>
          <MoneyInput value={data.w2Medicare} onChange={(v) => set("w2Medicare", v)} />
        </div>
      </div>
    </div>
  );
}
