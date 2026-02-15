import React from "react";
import Label from "../ui/Label";
import Tip from "../ui/Tip";
import MoneyInput from "../ui/MoneyInput";
import InfoBox from "../ui/InfoBox";

export default function StepRetirement({ data, set, help, toggleHelp }) {
  return (
    <div className="space-y-4">
      <InfoBox>
        Traditional IRA contributions may be deductible depending on income and workplace
        plan coverage. Pre-tax 401(k) and Roth contributions are noted here for
        completeness but are handled differently at the tax level.
      </InfoBox>

      <div>
        <Label tip="tira" onToggleHelp={toggleHelp}>
          Traditional IRA Contribution
        </Label>
        <Tip visible={help.tira}>
          Deductible up to $7,000 for 2024 (under age 50). If you or your spouse have a
          workplace retirement plan, deductibility phases out at higher incomes. This app
          applies the full deduction — verify eligibility with a tax professional if your
          income is high.
        </Tip>
        <MoneyInput
          value={data.traditionalIraContribution}
          onChange={(v) => set("traditionalIraContribution", v)}
        />
        <p className="text-xs text-slate-500 mt-1">
          2024 limit: $7,000 (under 50) / $8,000 (50+)
        </p>
      </div>

      <div>
        <Label tip="r401" onToggleHelp={toggleHelp}>
          Traditional 401(k) Contribution (informational)
        </Label>
        <Tip visible={help.r401}>
          Pre-tax 401(k) contributions are already excluded from W-2 Box 1 by your
          employer. Do not deduct again here. Enter for your records only.
        </Tip>
        <MoneyInput
          value={data.traditional401kContribution}
          onChange={(v) => set("traditional401kContribution", v)}
        />
      </div>

      <div>
        <Label>Roth 401(k) / Roth IRA Contribution (informational)</Label>
        <MoneyInput
          value={data.roth401kContribution}
          onChange={(v) => set("roth401kContribution", v)}
        />
        <p className="text-xs text-slate-500 mt-1">
          Roth contributions are after-tax — not deductible now, but qualified
          withdrawals in retirement are tax-free.
        </p>
      </div>
    </div>
  );
}
