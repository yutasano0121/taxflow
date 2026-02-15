import React from "react";
import { Upload } from "lucide-react";
import Label from "../ui/Label";
import Tip from "../ui/Tip";
import TextInput from "../ui/TextInput";
import InfoBox from "../ui/InfoBox";

export default function StepPersonal({ data, set, help, toggleHelp, fileRef, handleImport, importMsg }) {
  return (
    <div className="space-y-4">
      <InfoBox color="blue">
        <strong>Returning user?</strong> Import a JSON export from last year to pre-fill
        fields. You will still need to update income and withholding amounts.
        <div className="mt-2">
          <input
            type="file"
            accept=".json"
            ref={fileRef}
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                       text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <Upload className="w-4 h-4" /> Import Prior-Year Return
          </button>
        </div>
        {importMsg && (
          <p
            className={`text-xs mt-2 font-semibold ${
              importMsg.startsWith("\u2713") ? "text-green-700" : "text-red-700"
            }`}
          >
            {importMsg}
          </p>
        )}
      </InfoBox>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <TextInput
            value={data.firstName}
            onChange={(v) => set("firstName", v)}
            placeholder="John"
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <TextInput
            value={data.lastName}
            onChange={(v) => set("lastName", v)}
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <Label tip="ssn" onToggleHelp={toggleHelp}>
          Social Security Number
        </Label>
        <Tip visible={help.ssn}>
          Enter exactly as on your SSN card (XXX-XX-XXXX). This app stores data
          locally only — nothing is sent to any server.
        </Tip>
        <TextInput
          value={data.ssn}
          onChange={(v) => set("ssn", v)}
          placeholder="XXX-XX-XXXX"
          maxLength={11}
        />
      </div>

      <div>
        <Label tip="fs" onToggleHelp={toggleHelp}>
          Filing Status
        </Label>
        <Tip visible={help.fs}>
          Determines your tax rates and standard deduction. Choose based on your
          situation on Dec 31 of the tax year.
        </Tip>
        <select
          value={data.filingStatus}
          onChange={(e) => set("filingStatus", e.target.value)}
          className="input-field w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg
                     focus:outline-none focus:border-blue-500"
        >
          <option value="">— Select —</option>
          <option value="single">Single</option>
          <option value="married-joint">Married Filing Jointly</option>
          <option value="married-separate">Married Filing Separately</option>
          <option value="head-of-household">Head of Household</option>
        </select>
      </div>

      <div>
        <Label tip="dep" onToggleHelp={toggleHelp}>
          Number of Dependents
        </Label>
        <Tip visible={help.dep}>
          Qualifying children under 17 at end of tax year. Each may qualify you
          for the Child Tax Credit.
        </Tip>
        <TextInput
          type="number"
          value={data.dependents}
          onChange={(v) => set("dependents", parseInt(v) || 0)}
          placeholder="0"
        />
      </div>
    </div>
  );
}
