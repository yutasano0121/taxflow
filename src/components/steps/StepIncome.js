import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { parseNum, fmt } from "../../utils/taxHelpers";
import Label from "../ui/Label";
import Tip from "../ui/Tip";
import MoneyInput from "../ui/MoneyInput";
import TextInput from "../ui/TextInput";
import SectionHead from "../ui/SectionHead";
import InfoBox from "../ui/InfoBox";

function updateArrayItem(data, set, key, idx, patch) {
  const arr = [...data[key]];
  arr[idx] = { ...arr[idx], ...patch };
  set(key, arr);
}

export default function StepIncome({ data, set, summary, help, toggleHelp, openIRS }) {
  return (
    <div className="space-y-4">
      {/* Domestic */}
      <SectionHead>Domestic Interest &amp; Dividends (1099-INT / 1099-DIV)</SectionHead>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label tip="dint" onToggleHelp={toggleHelp}>Interest (Domestic)</Label>
          <Tip visible={help.dint}>
            From U.S. banks, credit unions, CDs, bonds. Check your 1099-INT forms.
          </Tip>
          <MoneyInput value={data.domesticInterest} onChange={(v) => set("domesticInterest", v)} />
        </div>
        <div>
          <Label tip="ddiv" onToggleHelp={toggleHelp}>Ordinary Dividends — Box 1a (Domestic)</Label>
          <Tip visible={help.ddiv}>
            Total ordinary dividends from your 1099-DIV, Box 1a. This includes qualified
            dividends as a subset — enter the full amount here, then enter the qualified
            portion below.
          </Tip>
          <MoneyInput value={data.domesticDividends} onChange={(v) => set("domesticDividends", v)} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label tip="qdiv" onToggleHelp={toggleHelp}>Qualified Dividends — Box 1b</Label>
          <Tip visible={help.qdiv}>
            A subset of ordinary dividends that qualifies for lower capital-gains tax rates
            (0%, 15%, or 20% depending on your income). Enter Box 1b of your 1099-DIV.
            Must be &le; Box 1a.
          </Tip>
          <MoneyInput value={data.qualifiedDividends} onChange={(v) => set("qualifiedDividends", v)} />
        </div>
        <div>
          <Label tip="ltcg" onToggleHelp={toggleHelp}>Long-Term Capital Gains — Box 2a</Label>
          <Tip visible={help.ltcg}>
            Gains on assets held longer than one year. Reported on 1099-DIV Box 2a or 1099-B.
            Taxed at the same preferential rates as qualified dividends (0 / 15 / 20%).
          </Tip>
          <MoneyInput value={data.longTermCapitalGains} onChange={(v) => set("longTermCapitalGains", v)} />
        </div>
      </div>
      {summary.preferentialIncome > 0 && (
        <InfoBox color="green">
          <strong>${fmt(summary.preferentialIncome)}</strong> of your income qualifies for
          preferential rates. Tax on that portion:{" "}
          <strong>${fmt(summary.preferentialTax)}</strong> (vs{" "}
          <strong>${fmt(Math.round(summary.preferentialIncome * 0.22))}</strong>+ if taxed at
          ordinary rates).
        </InfoBox>
      )}

      {/* Foreign */}
      <SectionHead>Foreign Income</SectionHead>
      <InfoBox color="amber">
        <strong>Foreign interest and dividends are taxable U.S. income</strong> — report them
        even if the foreign bank did not issue a tax form.
        {summary.fbarFlag && (
          <span className="block mt-1.5 font-semibold text-red-700">
            ⚠️ Your foreign account balance meets or exceeds the{" "}
            <strong>$10,000 FBAR threshold</strong>. You are required to file FinCEN Form 114
            (FBAR) separately at FinCEN.gov. This app does not file that form.
            <button onClick={() => openIRS("fbar")} className="ml-1 underline">
              IRS FBAR info &rarr;
            </button>
          </span>
        )}
      </InfoBox>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Interest (Foreign)</Label>
          <MoneyInput value={data.foreignInterest} onChange={(v) => set("foreignInterest", v)} />
        </div>
        <div>
          <Label>Dividends (Foreign)</Label>
          <MoneyInput value={data.foreignDividends} onChange={(v) => set("foreignDividends", v)} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label tip="fcountry" onToggleHelp={toggleHelp}>Country of Foreign Bank</Label>
          <Tip visible={help.fcountry}>
            Used for FBAR / Form 8938 reference. Enter the country where the bank is located.
          </Tip>
          <TextInput
            value={data.foreignCountry}
            onChange={(v) => set("foreignCountry", v)}
            placeholder="e.g. Japan"
          />
        </div>
        <div>
          <Label tip="fbal" onToggleHelp={toggleHelp}>
            Highest Balance in Foreign Account (any point in year)
          </Label>
          <Tip visible={help.fbal}>
            If this exceeds $10,000 at any time you must file a separate FBAR (FinCEN 114).
            We flag that for you but do not file it.
          </Tip>
          <MoneyInput value={data.foreignBankMaxBalance} onChange={(v) => set("foreignBankMaxBalance", v)} />
        </div>
      </div>

      {/* Business */}
      <SectionHead>Business / Self-Employment (Schedule C)</SectionHead>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Gross Business Income</Label>
          <MoneyInput value={data.businessIncome} onChange={(v) => set("businessIncome", v)} />
        </div>
        <div>
          <Label>Business Expenses</Label>
          <MoneyInput value={data.businessExpenses} onChange={(v) => set("businessExpenses", v)} />
        </div>
      </div>
      {summary.businessNet !== undefined &&
        (summary.businessNet > 0 || parseNum(data.businessIncome) > 0) && (
          <p className="text-sm text-slate-500">
            Net business income: <strong>${fmt(summary.businessNet)}</strong> · Est.
            self-employment tax: <strong>${fmt(summary.seTax)}</strong>
          </p>
        )}

      {/* Pension */}
      <SectionHead>Pension / Retirement Distributions (1099-R)</SectionHead>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label tip="pgtotal" onToggleHelp={toggleHelp}>Total Distribution (Box 1)</Label>
          <Tip visible={help.pgtotal}>
            The full amount distributed from the retirement account.
          </Tip>
          <MoneyInput value={data.pensionIncome} onChange={(v) => set("pensionIncome", v)} />
        </div>
        <div>
          <Label tip="pgtax" onToggleHelp={toggleHelp}>Taxable Amount (Box 2a)</Label>
          <Tip visible={help.pgtax}>
            Often equals Box 1, unless you had after-tax contributions (e.g. Roth). Only this
            amount is added to your taxable income.
          </Tip>
          <MoneyInput value={data.pensionTaxable} onChange={(v) => set("pensionTaxable", v)} />
        </div>
      </div>

      {/* Misc */}
      <SectionHead>Miscellaneous / 1099 Income</SectionHead>
      <InfoBox>
        Add any other income: freelance (1099-NEC), rent, prizes, alimony, gambling winnings,
        etc. Include any federal tax already withheld on each item.
      </InfoBox>
      {(data.miscIncomes || []).map((item, idx) => (
        <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-600">Income #{idx + 1}</span>
            <button
              onClick={() => {
                const arr = [...data.miscIncomes];
                arr.splice(idx, 1);
                set("miscIncomes", arr);
              }}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Description (e.g. Freelance, Rent)"
            value={item.description || ""}
            onChange={(e) => updateArrayItem(data, set, "miscIncomes", idx, { description: e.target.value })}
            className="input-field w-full px-3 py-2 border-2 border-slate-200 rounded-lg
                       focus:outline-none focus:border-blue-500 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-slate-500">Amount</span>
              <MoneyInput
                value={item.amount || ""}
                onChange={(v) => updateArrayItem(data, set, "miscIncomes", idx, { amount: v })}
              />
            </div>
            <div>
              <span className="text-xs text-slate-500">Fed Tax Withheld</span>
              <MoneyInput
                value={item.withheld || ""}
                onChange={(v) => updateArrayItem(data, set, "miscIncomes", idx, { withheld: v })}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={() =>
          set("miscIncomes", [
            ...(data.miscIncomes || []),
            { description: "", amount: "", withheld: "" },
          ])
        }
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        <Plus className="w-4 h-4" /> Add Income Source
      </button>

      {/* Running total */}
      {summary.totalIncome !== undefined && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-2">
          <div className="text-sm text-blue-700 font-semibold">Total Income (all sources)</div>
          <div className="text-2xl font-bold text-blue-800">${fmt(summary.totalIncome)}</div>
        </div>
      )}
    </div>
  );
}
