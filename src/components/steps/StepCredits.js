import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { parseNum } from "../../utils/taxHelpers";
import TAX_CONFIG from "../../utils/loadTaxConfig";
import Label from "../ui/Label";
import Tip from "../ui/Tip";
import MoneyInput from "../ui/MoneyInput";
import SectionHead from "../ui/SectionHead";
import InfoBox from "../ui/InfoBox";

function updateArrayItem(data, set, key, idx, patch) {
  const arr = [...data[key]];
  arr[idx] = { ...arr[idx], ...patch };
  set(key, arr);
}

export default function StepCredits({ data, set, summary, year, help, toggleHelp }) {
  return (
    <div className="space-y-4">
      <InfoBox>
        Tax credits reduce your tax bill dollar-for-dollar — more valuable than deductions.
      </InfoBox>

      <SectionHead>Tax Credits</SectionHead>
      <div className="border-2 border-slate-200 rounded-lg p-3 flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-900 text-sm">Child Tax Credit</div>
          <div className="text-xs text-slate-500">
            ${(TAX_CONFIG[year]?.credits?.childTaxCredit?.perChild || 0).toLocaleString()} per
            qualifying child under 17
          </div>
        </div>
        <input
          type="checkbox"
          checked={data.childTaxCredit}
          onChange={(e) => set("childTaxCredit", e.target.checked)}
          className="w-5 h-5 rounded border-slate-300 text-blue-600"
        />
      </div>

      <div>
        <Label tip="edu" onToggleHelp={toggleHelp}>Education Credit</Label>
        <Tip visible={help.edu}>
          American Opportunity Credit: up to $2,500 (first 4 years of college). Lifetime
          Learning Credit: up to $2,000. Enter the amount you are claiming.
        </Tip>
        <MoneyInput value={data.educationCredit} onChange={(v) => set("educationCredit", v)} />
      </div>

      <div>
        <Label tip="ftc" onToggleHelp={toggleHelp}>Foreign Tax Credit</Label>
        <Tip visible={help.ftc}>
          If you paid income tax to a foreign government, you may claim a credit to avoid
          double taxation. Enter total foreign tax paid. For large amounts or multiple
          countries you may need Form 1116.
        </Tip>
        <MoneyInput value={data.foreignTaxCredit} onChange={(v) => set("foreignTaxCredit", v)} />
      </div>

      <div className="border-2 border-slate-200 rounded-lg p-3 flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-900 text-sm">
            Earned Income Tax Credit (EITC)
          </div>
          <div className="text-xs text-slate-500">For low to moderate income workers</div>
        </div>
        <input
          type="checkbox"
          checked={data.earnedIncomeCredit}
          onChange={(e) => set("earnedIncomeCredit", e.target.checked)}
          className="w-5 h-5 rounded border-slate-300 text-blue-600"
        />
      </div>

      {/* Gifts */}
      <SectionHead>Gifts Received (informational)</SectionHead>
      <InfoBox color="amber">
        You generally do not owe tax on gifts you receive. However, if you received a gift
        over <strong>$17,000 (2024)</strong> from a single person, the <em>giver</em> may
        need to file a gift tax return. Gifts from foreign persons over{" "}
        <strong>$100,000</strong> must be reported on <strong>Form 3520</strong>.
      </InfoBox>
      {(data.giftsReceived || []).map((g, idx) => (
        <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-600">Gift #{idx + 1}</span>
            <button
              onClick={() => {
                const arr = [...data.giftsReceived];
                arr.splice(idx, 1);
                set("giftsReceived", arr);
              }}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="From (name or relationship)"
            value={g.from || ""}
            onChange={(e) =>
              updateArrayItem(data, set, "giftsReceived", idx, { from: e.target.value })
            }
            className="input-field w-full px-3 py-2 border-2 border-slate-200 rounded-lg
                       focus:outline-none focus:border-blue-500 text-sm"
          />
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-xs text-slate-500">Amount</span>
              <MoneyInput
                value={g.amount || ""}
                onChange={(v) => updateArrayItem(data, set, "giftsReceived", idx, { amount: v })}
              />
            </div>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 mt-5">
              <input
                type="checkbox"
                checked={g.isFromForeigner || false}
                onChange={(e) =>
                  updateArrayItem(data, set, "giftsReceived", idx, {
                    isFromForeigner: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              Foreign giver
            </label>
          </div>
        </div>
      ))}
      <button
        onClick={() =>
          set("giftsReceived", [
            ...(data.giftsReceived || []),
            { from: "", amount: "", isFromForeigner: false },
          ])
        }
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        <Plus className="w-4 h-4" /> Add Gift
      </button>
      {(data.giftsReceived || []).some(
        (g) => g.isFromForeigner && parseNum(g.amount) > 100000
      ) && (
        <InfoBox color="red">
          ⚠️ You reported a gift over $100,000 from a foreign person. You are required to
          report this on <strong>Form 3520</strong>. Consult a tax professional.
        </InfoBox>
      )}

      {/* Foreign Assets */}
      <SectionHead>Foreign Assets (FATCA / Form 8938)</SectionHead>
      <div className="border-2 border-slate-200 rounded-lg p-3 flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-900 text-sm">
            Do you hold foreign financial assets?
          </div>
          <div className="text-xs text-slate-500">
            Bank accounts, stocks, bonds, pensions held outside the U.S.
          </div>
        </div>
        <input
          type="checkbox"
          checked={data.hasForeignAssets}
          onChange={(e) => set("hasForeignAssets", e.target.checked)}
          className="w-5 h-5 rounded border-slate-300 text-blue-600"
        />
      </div>
      {data.hasForeignAssets && (
        <div>
          <Label tip="fav" onToggleHelp={toggleHelp}>
            Highest Value of Foreign Assets During the Year
          </Label>
          <Tip visible={help.fav}>
            If this exceeds $50,000 (end of year) or $75,000 (at any point) for single
            filers, you must file Form 8938 (FATCA). Thresholds double for married filing
            jointly.
          </Tip>
          <MoneyInput
            value={data.foreignAssetsValue}
            onChange={(v) => set("foreignAssetsValue", v)}
          />
          {summary.fatcaFlag && (
            <InfoBox color="red">
              ⚠️ Your foreign asset value may trigger a{" "}
              <strong>Form 8938 (FATCA)</strong> filing requirement. Consult a tax
              professional.
            </InfoBox>
          )}
        </div>
      )}
    </div>
  );
}
