import React, { useState, useRef } from "react";
import {
  ChevronRight, ChevronLeft, Check, DollarSign, FileText,
  User, Briefcase, Calculator, PiggyBank, Heart, ExternalLink, Calendar,
} from "lucide-react";
import "./App.css";
import TAX_CONFIG from "./utils/loadTaxConfig";
import blankState from "./data/blankState";
import usePersistence from "./hooks/usePersistence";
import useTaxCalculation from "./hooks/useTaxCalculation";
import StepPersonal from "./components/steps/StepPersonal";
import StepW2 from "./components/steps/StepW2";
import StepIncome from "./components/steps/StepIncome";
import StepRetirement from "./components/steps/StepRetirement";
import StepDeductions from "./components/steps/StepDeductions";
import StepCredits from "./components/steps/StepCredits";
import StepReview from "./components/steps/StepReview";

const STEPS = [
  { id: "personal", title: "Personal Info", icon: User, desc: "Your basic information" },
  { id: "w2", title: "W-2 & Withholding", icon: FileText, desc: "Wages and tax withheld" },
  { id: "income", title: "Other Income", icon: DollarSign, desc: "Interest, dividends, business, foreign" },
  { id: "retirement", title: "Retirement", icon: PiggyBank, desc: "IRA, 401(k), pensions" },
  { id: "deductions", title: "Deductions", icon: Heart, desc: "Itemized or standard" },
  { id: "credits", title: "Credits & Gifts", icon: Briefcase, desc: "Credits, gifts, foreign assets" },
  { id: "review", title: "Review", icon: Calculator, desc: "Summary and refund" },
];

const STEP_COMPONENTS = [
  StepPersonal, StepW2, StepIncome, StepRetirement, StepDeductions, StepCredits, StepReview,
];

export default function TaxReturnApp() {
  const { data, setData, set, step, setStep, year, setYear } = usePersistence();
  const summary = useTaxCalculation(data, year);
  const [help, setHelp] = useState({});
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef(null);

  const toggleHelp = (k) => setHelp((prev) => ({ ...prev, [k]: !prev[k] }));

  const openIRS = (key) => {
    const url = TAX_CONFIG[year]?.irsLinks?.[key];
    if (url) window.open(url, "_blank");
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const incoming = parsed.data ? parsed.data : parsed;
        setData({ ...blankState(), ...incoming });
        setImportMsg("\u2713 Prior-year data imported successfully. Review each step before filing.");
      } catch {
        setImportMsg("\u2717 Could not read file. Make sure it is a valid JSON export from TaxFlow Pro.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const canProceed = () => {
    if (step === 0) return !!(data.firstName && data.lastName && data.ssn && data.filingStatus);
    return true;
  };

  const stepProps = {
    data, set, summary, year, help, toggleHelp, openIRS,
    config: TAX_CONFIG[year],
  };

  const CurrentStep = STEP_COMPONENTS[step];

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-black text-white"
              style={{ fontFamily: '"Merriweather", serif' }}
            >
              TaxFlow Pro
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Professional Tax Return Software</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700">
              <Calendar className="w-4 h-4 text-blue-400" />
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-transparent text-white border-none outline-none cursor-pointer font-semibold text-sm"
              >
                <option value="2024">Tax Year 2024</option>
                <option value="2025">Tax Year 2025</option>
              </select>
            </div>
            <span className="text-xs text-slate-500">Auto-saved</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 ${
                    i < step
                      ? "bg-blue-500 text-white"
                      : i === step
                      ? "bg-white text-slate-900"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 bg-slate-700 mx-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: i < step ? "100%" : "0%",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex-1 text-center">
                <span
                  className={`text-xs font-semibold ${
                    i === step ? "text-white" : "text-slate-500"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="step-card bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2
                  className="text-2xl font-bold text-slate-900"
                  style={{ fontFamily: '"Merriweather", serif' }}
                >
                  {STEPS[step].title}
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">{STEPS[step].desc}</p>
              </div>
              <button
                onClick={() => openIRS("form1040")}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" /> IRS Instructions
              </button>
            </div>
            <CurrentStep
              {...stepProps}
              fileRef={fileRef}
              handleImport={handleImport}
              importMsg={importMsg}
            />
          </div>

          {/* Navigation */}
          <div className="bg-slate-50 px-6 py-4 md:px-8 flex items-center justify-between border-t border-slate-200">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                step === 0
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-xs text-slate-400">
              Step {step + 1} of {STEPS.length}
            </span>
            <button
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              disabled={step === STEPS.length - 1 || !canProceed()}
              className={`btn-primary flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm transition ${
                step === STEPS.length - 1 || !canProceed()
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
              }`}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
