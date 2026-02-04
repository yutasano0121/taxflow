import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Check, DollarSign, FileText, User, Briefcase, Calculator, Download, ExternalLink, HelpCircle, Calendar, Plus, Trash2, PiggyBank, Heart, Upload } from 'lucide-react';

// ---------------------------------------------------------------------------
// TAX CONFIGURATION — hardcoded from official IRS publications.
// Update this block each year when IRS publishes new numbers (~October).
// Sources listed in comments.
// ---------------------------------------------------------------------------
const TAX_CONFIG = {
    "2024": {
        // IRS Rev. Proc. 2023-34
        standardDeductions: {
            "single": 14600,
            "married-joint": 29200,
            "married-separate": 14600,
            "head-of-household": 21900
        },
        // IRS Rev. Proc. 2023-34, Section 2
        taxBrackets: {
            "single": [
                { min: 0,      max: 11600,   rate: 0.10 },
                { min: 11600,  max: 47150,   rate: 0.12 },
                { min: 47150,  max: 100525,  rate: 0.22 },
                { min: 100525, max: 191950,  rate: 0.24 },
                { min: 191950, max: 243725,  rate: 0.32 },
                { min: 243725, max: 609350,  rate: 0.35 },
                { min: 609350, max: Infinity, rate: 0.37 }
            ],
            "married-joint": [
                { min: 0,      max: 23200,   rate: 0.10 },
                { min: 23200,  max: 94300,   rate: 0.12 },
                { min: 94300,  max: 201050,  rate: 0.22 },
                { min: 201050, max: 383900,  rate: 0.24 },
                { min: 383900, max: 487450,  rate: 0.32 },
                { min: 487450, max: 731200,  rate: 0.35 },
                { min: 731200, max: Infinity, rate: 0.37 }
            ],
            "married-separate": [
                { min: 0,      max: 11600,   rate: 0.10 },
                { min: 11600,  max: 47150,   rate: 0.12 },
                { min: 47150,  max: 100525,  rate: 0.22 },
                { min: 100525, max: 191950,  rate: 0.24 },
                { min: 191950, max: 243725,  rate: 0.32 },
                { min: 243725, max: 365600,  rate: 0.35 },
                { min: 365600, max: Infinity, rate: 0.37 }
            ],
            "head-of-household": [
                { min: 0,      max: 16550,   rate: 0.10 },
                { min: 16550,  max: 63100,   rate: 0.12 },
                { min: 63100,  max: 100500,  rate: 0.22 },
                { min: 100500, max: 191950,  rate: 0.24 },
                { min: 191950, max: 243700,  rate: 0.32 },
                { min: 243700, max: 609350,  rate: 0.35 },
                { min: 609350, max: Infinity, rate: 0.37 }
            ]
        },
        // Qualified dividends & long-term capital gains are taxed at 0 / 15 / 20 %
        // depending on where the taxpayer's taxable income falls.
        // These thresholds are on TAXABLE INCOME (after deductions).
        // Source: IRS Rev. Proc. 2023-34
        ltcgBrackets: {
            "single":            [{ max: 47025,  rate: 0.00 }, { max: 518900,  rate: 0.15 }, { max: Infinity, rate: 0.20 }],
            "married-joint":     [{ max: 94050,  rate: 0.00 }, { max: 583750,  rate: 0.15 }, { max: Infinity, rate: 0.20 }],
            "married-separate":  [{ max: 47025,  rate: 0.00 }, { max: 291850,  rate: 0.15 }, { max: Infinity, rate: 0.20 }],
            "head-of-household": [{ max: 63000,  rate: 0.00 }, { max: 551350,  rate: 0.15 }, { max: Infinity, rate: 0.20 }]
        },
        // AMT parameters — IRS Rev. Proc. 2023-34
        // exemption phases out at $0.25 for every $1 of AMTI above phaseoutStart
        amtParams: {
            "single":            { exemption: 85700,  phaseoutStart: 609350,  rate26max: 232600 },
            "married-joint":     { exemption: 133300, phaseoutStart: 1218700, rate26max: 465200 },
            "married-separate":  { exemption: 66650,  phaseoutStart: 609350,  rate26max: 232600 },
            "head-of-household": { exemption: 85700,  phaseoutStart: 609350,  rate26max: 232600 }
        },
        childTaxCreditPerChild: 2000,
        // FinCEN rule (not IRS), but noted here so the app can flag it
        fbarThreshold: 10000,
        irsLinks: {
            form1040:  "https://www.irs.gov/pub/irs-pdf/i1040gi.pdf",
            scheduleA: "https://www.irs.gov/pub/irs-pdf/i1040sca.pdf",
            scheduleB: "https://www.irs.gov/pub/irs-pdf/i1040sb.pdf",
            scheduleC: "https://www.irs.gov/pub/irs-pdf/i1040sc.pdf",
            schedule1: "https://www.irs.gov/pub/irs-pdf/i1040s1.pdf",
            fbar:      "https://www.irs.gov/filing/fbar-filing"
        }
    },
    "2025": {
        // IRS Rev. Proc. 2024-35
        standardDeductions: {
            "single": 15000,
            "married-joint": 30000,
            "married-separate": 15000,
            "head-of-household": 22500
        },
        taxBrackets: {
            "single": [
                { min: 0,      max: 11925,   rate: 0.10 },
                { min: 11925,  max: 48475,   rate: 0.12 },
                { min: 48475,  max: 103350,  rate: 0.22 },
                { min: 103350, max: 197300,  rate: 0.24 },
                { min: 197300, max: 250525,  rate: 0.32 },
                { min: 250525, max: 626350,  rate: 0.35 },
                { min: 626350, max: Infinity, rate: 0.37 }
            ],
            "married-joint": [
                { min: 0,      max: 23850,   rate: 0.10 },
                { min: 23850,  max: 96950,   rate: 0.12 },
                { min: 96950,  max: 206700,  rate: 0.22 },
                { min: 206700, max: 394600,  rate: 0.24 },
                { min: 394600, max: 501050,  rate: 0.32 },
                { min: 501050, max: 751600,  rate: 0.35 },
                { min: 751600, max: Infinity, rate: 0.37 }
            ],
            "married-separate": [
                { min: 0,      max: 11925,   rate: 0.10 },
                { min: 11925,  max: 48475,   rate: 0.12 },
                { min: 48475,  max: 103350,  rate: 0.22 },
                { min: 103350, max: 197300,  rate: 0.24 },
                { min: 197300, max: 250525,  rate: 0.32 },
                { min: 250525, max: 375800,  rate: 0.35 },
                { min: 375800, max: Infinity, rate: 0.37 }
            ],
            "head-of-household": [
                { min: 0,      max: 16550,   rate: 0.10 },
                { min: 16550,  max: 63100,   rate: 0.12 },
                { min: 63100,  max: 100500,  rate: 0.22 },
                { min: 100500, max: 191950,  rate: 0.24 },
                { min: 191950, max: 243700,  rate: 0.32 },
                { min: 243700, max: 609350,  rate: 0.35 },
                { min: 609350, max: Infinity, rate: 0.37 }
            ]
        },
        // IRS Rev. Proc. 2024-35
        ltcgBrackets: {
            "single":            [{ max: 48350,  rate: 0.00 }, { max: 533400,  rate: 0.15 }, { max: Infinity, rate: 0.20 }],
            "married-joint":     [{ max: 96700,  rate: 0.00 }, { max: 600050,  rate: 0.15 }, { max: Infinity, rate: 0.20 }],
            "married-separate":  [{ max: 48350,  rate: 0.00 }, { max: 300025,  rate: 0.15 }, { max: Infinity, rate: 0.20 }],
            "head-of-household": [{ max: 64650,  rate: 0.00 }, { max: 566700,  rate: 0.15 }, { max: Infinity, rate: 0.20 }]
        },
        // IRS Rev. Proc. 2024-35
        amtParams: {
            "single":            { exemption: 88600,  phaseoutStart: 626350,  rate26max: 239600 },
            "married-joint":     { exemption: 137300, phaseoutStart: 1252700, rate26max: 479200 },
            "married-separate":  { exemption: 68650,  phaseoutStart: 626350,  rate26max: 239600 },
            "head-of-household": { exemption: 88600,  phaseoutStart: 626350,  rate26max: 239600 }
        },
        childTaxCreditPerChild: 2000,
        fbarThreshold: 10000,
        irsLinks: {
            form1040:  "https://www.irs.gov/pub/irs-pdf/i1040gi.pdf",
            scheduleA: "https://www.irs.gov/pub/irs-pdf/i1040sca.pdf",
            scheduleB: "https://www.irs.gov/pub/irs-pdf/i1040sb.pdf",
            scheduleC: "https://www.irs.gov/pub/irs-pdf/i1040sc.pdf",
            schedule1: "https://www.irs.gov/pub/irs-pdf/i1040s1.pdf",
            fbar:      "https://www.irs.gov/filing/fbar-filing"
        }
    }
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const $ = (n) => (parseFloat(n) || 0);

const fmt = (n) => Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

// Tax on ordinary income using progressive brackets { min, max, rate }
function computeTax(taxableIncome, brackets) {
    let tax = 0;
    for (const b of brackets) {
        if (taxableIncome <= b.min) break;
        const chunk = Math.min(taxableIncome, b.max) - b.min;
        tax += chunk * b.rate;
    }
    return tax;
}

// Tax on qualified dividends + LTCG using the "stacking" method.
// The preferential-rate income is stacked on top of ordinary income so
// it occupies the highest slices of taxable income first.
// ltcgBrackets are { max, rate } — each tier applies up to that taxableIncome threshold.
function computeLTCGTax(ordinaryIncome, preferentialIncome, ltcgBrackets) {
    let tax = 0;
    let remaining = preferentialIncome;
    // The preferential block starts where ordinary income ends
    let cursor = ordinaryIncome;

    for (const tier of ltcgBrackets) {
        if (remaining <= 0) break;
        const spaceInTier = Math.max(0, tier.max - cursor);
        const taxableHere = Math.min(remaining, spaceInTier);
        tax += taxableHere * tier.rate;
        remaining -= taxableHere;
        cursor += taxableHere;
    }
    return tax;
}

// ---------------------------------------------------------------------------
// BLANK STATE
// ---------------------------------------------------------------------------
function blankState() {
    return {
        // Personal
        firstName: "", lastName: "", ssn: "",
        filingStatus: "", dependents: 0,

        // W-2
        w2Wages: "",          // Box 1
        w2FederalTax: "",     // Box 2
        w2StateTax: "",       // Box 16 — state income tax withheld
        w2SocialSecurity: "", // Box 3 (informational)
        w2Medicare: "",       // Box 5 (informational)

        // Domestic interest / dividends
        domesticInterest: "",
        domesticDividends: "",
        qualifiedDividends: "",       // 1099-DIV Box 1b — subset of domesticDividends
        longTermCapitalGains: "",     // 1099-DIV Box 2a (or 1099-B) — preferential rate

        // Foreign income
        foreignInterest: "",
        foreignDividends: "",
        foreignCountry: "",
        foreignBankMaxBalance: "",

        // Business
        businessIncome: "",
        businessExpenses: "",

        // Misc incomes — array of { description, amount, withheld }
        miscIncomes: [],

        // Retirement
        traditionalIraContribution: "",
        traditional401kContribution: "",  // informational (already pre-tax)
        roth401kContribution: "",         // informational
        pensionIncome: "",                // 1099-R Box 1
        pensionTaxable: "",               // 1099-R Box 2a

        // Health
        hsaSelfContribution: "",

        // Adjustments
        studentLoanInterest: "",

        // Itemized deductions
        medicalExpenses: "",
        statExciseTax: "",       // state/local income or sales tax (for SALT deduction)
        localPropertyTax: "",
        mortgageInterest: "",
        mortgagePoints: "",
        charitableCash: "",
        charitableNonCash: "",
        otherItemized: "",

        // Estimated tax payments (sum of four 1040-ES quarterly payments)
        estimatedTaxPayments: "",

        // Credits
        childTaxCredit: false,
        educationCredit: "",
        earnedIncomeCredit: false,
        foreignTaxCredit: "",

        // Gifts — array of { from, amount, isFromForeigner }
        giftsReceived: [],

        // Foreign assets
        hasForeignAssets: false,
        foreignAssetsValue: ""
    };
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function TaxReturnApp() {
    const [year, setYear]       = useState("2024");
    const [step, setStep]       = useState(0);
    const [help, setHelp]       = useState({});
    const [data, setData]       = useState(blankState());
    const [summary, setSummary] = useState({});
    const [importMsg, setImportMsg] = useState(""); // feedback after import
    const fileRef               = useRef(null);      // hidden file input for import

    // --- persistence ----------------------------------------------------------
    useEffect(() => {
        (async () => {
            try {
                const r = await window.storage.get("taxflow-pro-data");
                if (r && r.value) {
                    const s = JSON.parse(r.value);
                    setData(s.data || blankState());
                    setStep(s.step || 0);
                    setYear(s.year || "2024");
                }
            } catch (e) { /* fresh start */ }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                await window.storage.set("taxflow-pro-data", JSON.stringify({
                    data, step, year, saved: new Date().toISOString()
                }));
            } catch (e) { console.error(e); }
        })();
    }, [data, step, year]);

    // --- recalc on every change -----------------------------------------------
    useEffect(() => { setSummary(calculate(data, year)); }, [data, year]);

    // --- small helpers --------------------------------------------------------
    const set        = (k, v)  => setData(prev => ({ ...prev, [k]: v }));
    const toggleHelp = (k)     => setHelp(prev => ({ ...prev, [k]: !prev[k] }));
    const openIRS    = (key)   => {
        const url = TAX_CONFIG[year]?.irsLinks?.[key];
        if (url) window.open(url, "_blank");
    };

    // --- prior-year import ----------------------------------------------------
    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const parsed = JSON.parse(evt.target.result);
                // Accept either a bare data object or our full save envelope
                const incoming = parsed.data ? parsed.data : parsed;
                // Merge: start from a blank state so unknown keys don't linger,
                // then overlay whatever the file contained.
                const merged = { ...blankState(), ...incoming };
                setData(merged);
                setImportMsg("✓ Prior-year data imported successfully. Review each step before filing.");
            } catch {
                setImportMsg("✗ Could not read file. Make sure it is a valid JSON export from TaxFlow Pro.");
            }
        };
        reader.readAsText(file);
        // Reset so the same file can be re-selected if needed
        e.target.value = "";
    };

    // ---------------------------------------------------------------------------
    // TAX CALCULATION ENGINE
    // ---------------------------------------------------------------------------
    function calculate(d, yr) {
        const cfg = TAX_CONFIG[yr];
        if (!cfg || !d.filingStatus) return {};

        // ---- INCOME ----------------------------------------------------------
        const w2Wages              = $(d.w2Wages);
        const domesticInterest     = $(d.domesticInterest);
        const domesticDividends    = $(d.domesticDividends);
        const qualifiedDividends   = Math.min($(d.qualifiedDividends), domesticDividends);
        const longTermCapitalGains = $(d.longTermCapitalGains);
        const foreignInterest      = $(d.foreignInterest);
        const foreignDividends     = $(d.foreignDividends);
        const businessGross        = $(d.businessIncome);
        const businessExpenses     = $(d.businessExpenses);
        const businessNet          = Math.max(0, businessGross - businessExpenses);
        const pensionTaxable       = $(d.pensionTaxable);
        const miscTotal            = (d.miscIncomes || []).reduce((s, i) => s + $(i.amount), 0);
        const miscWithheld         = (d.miscIncomes || []).reduce((s, i) => s + $(i.withheld), 0);

        const totalIncome =
            w2Wages
            + domesticInterest  + domesticDividends
            + longTermCapitalGains
            + foreignInterest   + foreignDividends
            + businessNet
            + pensionTaxable
            + miscTotal;

        // ---- ABOVE-THE-LINE ADJUSTMENTS --------------------------------------
        const studentLoan    = Math.min($(d.studentLoanInterest), 2500);
        const hsaSelf        = $(d.hsaSelfContribution);
        const traditionalIra = Math.min($(d.traditionalIraContribution), 7000);
        const halfSeTax      = businessNet > 0
            ? Math.round(businessNet * 0.9235 * 0.0765)
            : 0;

        const totalAdjustments = studentLoan + hsaSelf + traditionalIra + halfSeTax;
        const agi = Math.max(0, totalIncome - totalAdjustments);

        // ---- DEDUCTIONS: STANDARD vs ITEMIZED --------------------------------
        const stdDed = cfg.standardDeductions[d.filingStatus] || 0;

        const saltRaw       = $(d.statExciseTax) + $(d.localPropertyTax);
        const salt          = Math.min(saltRaw, 10000);
        const medical       = Math.max(0, $(d.medicalExpenses) - agi * 0.075);
        const mortgage      = $(d.mortgageInterest) + $(d.mortgagePoints);
        const charitableRaw = $(d.charitableCash) + $(d.charitableNonCash);
        const charitable    = Math.min(charitableRaw, agi * 0.60);
        const otherItemized = $(d.otherItemized);

        const itemized      = medical + salt + mortgage + charitable + otherItemized;
        const deductionUsed = Math.max(stdDed, itemized);
        const usesItemized  = itemized > stdDed;

        const taxableIncome = Math.max(0, agi - deductionUsed);

        // ---- INCOME TAX (with qualified dividend / LTCG split) ---------------
        // Preferential income = qualified dividends + long-term capital gains.
        // Ordinary income = everything else.  We tax them separately.
        const preferentialIncome = Math.min(qualifiedDividends + longTermCapitalGains, taxableIncome);
        const ordinaryIncome     = taxableIncome - preferentialIncome;

        const brackets    = cfg.taxBrackets[d.filingStatus] || cfg.taxBrackets["single"];
        const ltcgBrackets = cfg.ltcgBrackets[d.filingStatus] || cfg.ltcgBrackets["single"];

        const ordinaryTax     = computeTax(ordinaryIncome, brackets);
        const preferentialTax = computeLTCGTax(ordinaryIncome, preferentialIncome, ltcgBrackets);
        const regularTax      = ordinaryTax + preferentialTax;

        // ---- AMT -------------------------------------------------------------
        // Simplified AMT: add back SALT (the most common preference item for
        // middle-income filers).  Real AMT has many more add-backs — this covers
        // the most frequent trigger.
        const amtP = cfg.amtParams[d.filingStatus] || cfg.amtParams["single"];
        const amti = agi + salt;   // add back SALT that was deducted

        // Exemption phases out: reduce by $0.25 per $1 of AMTI above phaseoutStart
        const phaseoutReduction = Math.max(0, (amti - amtP.phaseoutStart)) * 0.25;
        const effectiveExemption = Math.max(0, amtP.exemption - phaseoutReduction);
        const amtTaxableIncome   = Math.max(0, amti - effectiveExemption);

        // AMT rate: 26 % up to rate26max, 28 % above
        const amtTax =
            (Math.min(amtTaxableIncome, amtP.rate26max) * 0.26)
            + (Math.max(0, amtTaxableIncome - amtP.rate26max) * 0.28);

        // The taxpayer pays whichever is larger: regular tax or AMT
        const amtOwed     = Math.max(0, amtTax - regularTax);  // extra tax due to AMT
        const incomeTax   = regularTax + amtOwed;              // final income tax

        // Self-employment tax
        const seTax = businessNet > 0
            ? Math.round(businessNet * 0.9235 * 0.153)
            : 0;

        // ---- CREDITS ---------------------------------------------------------
        let credits = 0;
        if (d.childTaxCredit) credits += (d.dependents || 0) * cfg.childTaxCreditPerChild;
        credits += $(d.educationCredit);
        credits += $(d.foreignTaxCredit);

        const taxAfterCredits = Math.max(0, incomeTax - credits);
        const totalTax        = taxAfterCredits + seTax;

        // ---- PAYMENTS / WITHHOLDING ------------------------------------------
        const w2Fed              = $(d.w2FederalTax);
        const stateTaxWithheld   = $(d.w2StateTax);        // informational for state; not federal
        const estPayments        = $(d.estimatedTaxPayments);
        const totalWithholding   = w2Fed + miscWithheld + estPayments;
        // Note: stateTaxWithheld is tracked but does NOT reduce federal tax owed.
        // It is shown in the review for completeness / state-return reference.

        // ---- RESULT ----------------------------------------------------------
        const refundOrOwed = totalWithholding - totalTax;

        // ---- COMPLIANCE FLAGS ------------------------------------------------
        const fbarFlag  = $(d.foreignBankMaxBalance) >= cfg.fbarThreshold;
        const fatcaFlag = d.hasForeignAssets && $(d.foreignAssetsValue) > 50000;

        return {
            w2Wages, domesticInterest, domesticDividends,
            qualifiedDividends, longTermCapitalGains,
            foreignInterest, foreignDividends,
            businessNet, pensionTaxable, miscTotal,
            totalIncome, totalAdjustments, agi,
            stdDed, itemized, deductionUsed, usesItemized,
            taxableIncome,
            ordinaryIncome, preferentialIncome, ordinaryTax, preferentialTax,
            regularTax, amtTax, amtOwed, incomeTax,
            seTax, credits, taxAfterCredits, totalTax,
            w2Fed, stateTaxWithheld, estPayments, miscWithheld, totalWithholding,
            refundOrOwed, fbarFlag, fatcaFlag,
            salt, medical, mortgage, charitable
        };
    }

    // ---------------------------------------------------------------------------
    // STEP DEFINITIONS
    // ---------------------------------------------------------------------------
    const STEPS = [
        { id: "personal",   title: "Personal Info",     icon: User,        desc: "Your basic information" },
        { id: "w2",         title: "W-2 & Withholding", icon: FileText,    desc: "Wages and tax withheld" },
        { id: "income",     title: "Other Income",      icon: DollarSign,  desc: "Interest, dividends, business, foreign" },
        { id: "retirement", title: "Retirement",        icon: PiggyBank,   desc: "IRA, 401(k), pensions" },
        { id: "deductions", title: "Deductions",        icon: Heart,       desc: "Itemized or standard" },
        { id: "credits",    title: "Credits & Gifts",   icon: Briefcase,   desc: "Credits, gifts, foreign assets" },
        { id: "review",     title: "Review",            icon: Calculator,  desc: "Summary and refund" }
    ];

    const canProceed = () => {
        if (step === 0) return !!(data.firstName && data.lastName && data.ssn && data.filingStatus);
        return true;
    };

    // ---------------------------------------------------------------------------
    // REUSABLE UI PIECES
    // ---------------------------------------------------------------------------
    const Label = ({ children, tip }) => (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {children}
            {tip && (
                <button onClick={() => toggleHelp(tip)} className="ml-2 text-blue-500 hover:text-blue-700">
                    <HelpCircle className="w-4 h-4 inline" />
                </button>
            )}
        </label>
    );

    const Tip = ({ id, children }) => help[id] && (
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
            {children}
        </div>
    );

    const MoneyInput = ({ value, onChange }) => (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
            <input
                type="number" min="0" value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="0.00"
                className="input-field w-full pl-7 pr-3 py-2.5 border-2 border-slate-200 rounded-lg
                           focus:outline-none focus:border-blue-500 text-slate-900"
            />
        </div>
    );

    const SectionHead = ({ children }) => (
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider
                        mt-5 mb-2 border-b border-slate-200 pb-1">
            {children}
        </div>
    );

    const InfoBox = ({ children, color = "blue" }) => {
        const styles = {
            blue:  "bg-blue-50  border-blue-200  text-blue-900",
            amber: "bg-amber-50 border-amber-200 text-amber-900",
            red:   "bg-red-50   border-red-200   text-red-900",
            green: "bg-green-50 border-green-200 text-green-900"
        };
        return (
            <div className={`p-3 rounded-lg border text-sm ${styles[color] || styles.blue}`}>
                {children}
            </div>
        );
    };

    // ---------------------------------------------------------------------------
    // STEP 0 — Personal Info  (+ prior-year import)
    // ---------------------------------------------------------------------------
    const StepPersonal = () => (
        <div className="space-y-4">
            {/* Prior-year import */}
            <InfoBox color="blue">
                <strong>Returning user?</strong> Import a JSON export from last year to pre-fill
                fields. You will still need to update income and withholding amounts.
                <div className="mt-2">
                    <input
                        type="file" accept=".json" ref={fileRef}
                        onChange={handleImport}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                                   text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
                        <Upload className="w-4 h-4" /> Import Prior-Year Return
                    </button>
                </div>
                {importMsg && (
                    <p className={`text-xs mt-2 font-semibold ${
                        importMsg.startsWith("✓") ? "text-green-700" : "text-red-700"
                    }`}>
                        {importMsg}
                    </p>
                )}
            </InfoBox>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label>First Name</Label>
                    <input type="text" value={data.firstName}
                        onChange={e => set("firstName", e.target.value)}
                        placeholder="John"
                        className="input-field w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg
                                   focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                    <Label>Last Name</Label>
                    <input type="text" value={data.lastName}
                        onChange={e => set("lastName", e.target.value)}
                        placeholder="Doe"
                        className="input-field w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg
                                   focus:outline-none focus:border-blue-500" />
                </div>
            </div>

            <div>
                <Label tip="ssn">Social Security Number</Label>
                <Tip id="ssn">
                    Enter exactly as on your SSN card (XXX-XX-XXXX).
                    This app stores data locally only — nothing is sent to any server.
                </Tip>
                <input type="text" value={data.ssn} maxLength={11}
                    onChange={e => set("ssn", e.target.value)}
                    placeholder="XXX-XX-XXXX"
                    className="input-field w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg
                               focus:outline-none focus:border-blue-500" />
            </div>

            <div>
                <Label tip="fs">Filing Status</Label>
                <Tip id="fs">
                    Determines your tax rates and standard deduction.
                    Choose based on your situation on Dec 31 of the tax year.
                </Tip>
                <select value={data.filingStatus}
                    onChange={e => set("filingStatus", e.target.value)}
                    className="input-field w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg
                               focus:outline-none focus:border-blue-500">
                    <option value="">— Select —</option>
                    <option value="single">Single</option>
                    <option value="married-joint">Married Filing Jointly</option>
                    <option value="married-separate">Married Filing Separately</option>
                    <option value="head-of-household">Head of Household</option>
                </select>
            </div>

            <div>
                <Label tip="dep">Number of Dependents</Label>
                <Tip id="dep">
                    Qualifying children under 17 at end of tax year.
                    Each may qualify you for the Child Tax Credit.
                </Tip>
                <input type="number" min={0} value={data.dependents}
                    onChange={e => set("dependents", parseInt(e.target.value) || 0)}
                    className="input-field w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg
                               focus:outline-none focus:border-blue-500" />
            </div>
        </div>
    );

    // ---------------------------------------------------------------------------
    // STEP 1 — W-2 & Withholding
    // ---------------------------------------------------------------------------
    const StepW2 = () => (
        <div className="space-y-4">
            <InfoBox>
                Enter values exactly as printed on your W-2. If you have multiple W-2s, add the amounts together.
                <button onClick={() => openIRS("form1040")}
                    className="block mt-1 text-blue-600 hover:underline text-xs">
                    IRS Form 1040 Instructions →
                </button>
            </InfoBox>

            <div>
                <Label tip="w2w">Box 1 — Wages, Tips, Other Compensation</Label>
                <Tip id="w2w">
                    Taxable wages after pre-tax deductions (401k, health premiums, etc.)
                    have already been subtracted by your employer.
                </Tip>
                <MoneyInput value={data.w2Wages} onChange={v => set("w2Wages", v)} />
            </div>

            <div>
                <Label tip="w2f">Box 2 — Federal Income Tax Withheld</Label>
                <Tip id="w2f">
                    The amount your employer already sent to the IRS on your behalf.
                    This counts as a payment when we calculate your refund or amount owed.
                </Tip>
                <MoneyInput value={data.w2FederalTax} onChange={v => set("w2FederalTax", v)} />
            </div>

            <div>
                <Label tip="w2s">Box 16 — State Income Tax Withheld</Label>
                <Tip id="w2s">
                    The amount your employer withheld for state income tax.
                    This does not affect your federal return directly, but we
                    track it here for your state return and for reference.
                </Tip>
                <MoneyInput value={data.w2StateTax} onChange={v => set("w2StateTax", v)} />
            </div>

            <SectionHead>Informational (for your records — not used in calculation)</SectionHead>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label>Box 3 — Social Security Wages</Label>
                    <MoneyInput value={data.w2SocialSecurity}
                        onChange={v => set("w2SocialSecurity", v)} />
                </div>
                <div>
                    <Label>Box 5 — Medicare Wages</Label>
                    <MoneyInput value={data.w2Medicare}
                        onChange={v => set("w2Medicare", v)} />
                </div>
            </div>
        </div>
    );

    // ---------------------------------------------------------------------------
    // STEP 2 — Other Income
    // ---------------------------------------------------------------------------
    const StepIncome = () => (
        <div className="space-y-4">
            {/* Domestic */}
            <SectionHead>Domestic Interest & Dividends (1099-INT / 1099-DIV)</SectionHead>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label tip="dint">Interest (Domestic)</Label>
                    <Tip id="dint">
                        From U.S. banks, credit unions, CDs, bonds.
                        Check your 1099-INT forms.
                    </Tip>
                    <MoneyInput value={data.domesticInterest}
                        onChange={v => set("domesticInterest", v)} />
                </div>
                <div>
                    <Label tip="ddiv">Ordinary Dividends — Box 1a (Domestic)</Label>
                    <Tip id="ddiv">
                        Total ordinary dividends from your 1099-DIV, Box 1a.
                        This includes qualified dividends as a subset — enter the
                        full amount here, then enter the qualified portion below.
                    </Tip>
                    <MoneyInput value={data.domesticDividends}
                        onChange={v => set("domesticDividends", v)} />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label tip="qdiv">Qualified Dividends — Box 1b</Label>
                    <Tip id="qdiv">
                        A subset of ordinary dividends that qualifies for lower
                        capital-gains tax rates (0 %, 15 %, or 20 % depending on
                        your income). Enter Box 1b of your 1099-DIV. Must be ≤ Box 1a.
                    </Tip>
                    <MoneyInput value={data.qualifiedDividends}
                        onChange={v => set("qualifiedDividends", v)} />
                </div>
                <div>
                    <Label tip="ltcg">Long-Term Capital Gains — Box 2a</Label>
                    <Tip id="ltcg">
                        Gains on assets held longer than one year. Reported on
                        1099-DIV Box 2a or 1099-B. Taxed at the same preferential
                        rates as qualified dividends (0 / 15 / 20 %).
                    </Tip>
                    <MoneyInput value={data.longTermCapitalGains}
                        onChange={v => set("longTermCapitalGains", v)} />
                </div>
            </div>
            {(summary.preferentialIncome > 0) && (
                <InfoBox color="green">
                    <strong>${fmt(summary.preferentialIncome)}</strong> of your income qualifies
                    for preferential rates. Tax on that portion: <strong>${fmt(summary.preferentialTax)}</strong>
                    (vs <strong>${fmt(Math.round(summary.preferentialIncome * 0.22))}</strong>+ if taxed at ordinary rates).
                </InfoBox>
            )}

            {/* Foreign */}
            <SectionHead>Foreign Income</SectionHead>
            <InfoBox color="amber">
                <strong>Foreign interest and dividends are taxable U.S. income</strong> — report
                them even if the foreign bank did not issue a tax form.
                {summary.fbarFlag && (
                    <span className="block mt-1.5 font-semibold text-red-700">
                        ⚠️ Your foreign account balance meets or exceeds the <strong>$10,000 FBAR threshold</strong>.
                        You are required to file FinCEN Form 114 (FBAR) separately at FinCEN.gov.
                        This app does not file that form.
                        <button onClick={() => openIRS("fbar")}
                            className="ml-1 underline">IRS FBAR info →</button>
                    </span>
                )}
            </InfoBox>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label>Interest (Foreign)</Label>
                    <MoneyInput value={data.foreignInterest}
                        onChange={v => set("foreignInterest", v)} />
                </div>
                <div>
                    <Label>Dividends (Foreign)</Label>
                    <MoneyInput value={data.foreignDividends}
                        onChange={v => set("foreignDividends", v)} />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label tip="fcountry">Country of Foreign Bank</Label>
                    <Tip id="fcountry">
                        Used for FBAR / Form 8938 reference.
                        Enter the country where the bank is located.
                    </Tip>
                    <input type="text" value={data.foreignCountry}
                        onChange={e => set("foreignCountry", e.target.value)}
                        placeholder="e.g. Japan"
                        className="input-field w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg
                                   focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                    <Label tip="fbal">Highest Balance in Foreign Account (any point in year)</Label>
                    <Tip id="fbal">
                        If this exceeds $10,000 at any time you must file a separate
                        FBAR (FinCEN 114). We flag that for you but do not file it.
                    </Tip>
                    <MoneyInput value={data.foreignBankMaxBalance}
                        onChange={v => set("foreignBankMaxBalance", v)} />
                </div>
            </div>

            {/* Business */}
            <SectionHead>Business / Self-Employment (Schedule C)</SectionHead>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label>Gross Business Income</Label>
                    <MoneyInput value={data.businessIncome}
                        onChange={v => set("businessIncome", v)} />
                </div>
                <div>
                    <Label>Business Expenses</Label>
                    <MoneyInput value={data.businessExpenses}
                        onChange={v => set("businessExpenses", v)} />
                </div>
            </div>
            {summary.businessNet !== undefined &&
             (summary.businessNet > 0 || $(data.businessIncome) > 0) && (
                <p className="text-sm text-slate-500">
                    Net business income: <strong>${fmt(summary.businessNet)}</strong>
                    · Est. self-employment tax: <strong>${fmt(summary.seTax)}</strong>
                </p>
            )}

            {/* Pension */}
            <SectionHead>Pension / Retirement Distributions (1099-R)</SectionHead>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label tip="pgtotal">Total Distribution (Box 1)</Label>
                    <Tip id="pgtotal">The full amount distributed from the retirement account.</Tip>
                    <MoneyInput value={data.pensionIncome}
                        onChange={v => set("pensionIncome", v)} />
                </div>
                <div>
                    <Label tip="pgtax">Taxable Amount (Box 2a)</Label>
                    <Tip id="pgtax">
                        Often equals Box 1, unless you had after-tax contributions (e.g. Roth).
                        Only this amount is added to your taxable income.
                    </Tip>
                    <MoneyInput value={data.pensionTaxable}
                        onChange={v => set("pensionTaxable", v)} />
                </div>
            </div>

            {/* Misc */}
            <SectionHead>Miscellaneous / 1099 Income</SectionHead>
            <InfoBox>
                Add any other income: freelance (1099-NEC), rent, prizes, alimony,
                gambling winnings, etc. Include any federal tax already withheld on each item.
            </InfoBox>
            {(data.miscIncomes || []).map((item, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-600">
                            Income #{idx + 1}
                        </span>
                        <button
                            onClick={() => {
                                const arr = [...data.miscIncomes];
                                arr.splice(idx, 1);
                                set("miscIncomes", arr);
                            }}
                            className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <input type="text" placeholder="Description (e.g. Freelance, Rent)"
                        value={item.description || ""}
                        onChange={e => {
                            const arr = [...data.miscIncomes];
                            arr[idx] = { ...arr[idx], description: e.target.value };
                            set("miscIncomes", arr);
                        }}
                        className="input-field w-full px-3 py-2 border-2 border-slate-200 rounded-lg
                                   focus:outline-none focus:border-blue-500 text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <span className="text-xs text-slate-500">Amount</span>
                            <MoneyInput value={item.amount || ""}
                                onChange={v => {
                                    const arr = [...data.miscIncomes];
                                    arr[idx] = { ...arr[idx], amount: v };
                                    set("miscIncomes", arr);
                                }} />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500">Fed Tax Withheld</span>
                            <MoneyInput value={item.withheld || ""}
                                onChange={v => {
                                    const arr = [...data.miscIncomes];
                                    arr[idx] = { ...arr[idx], withheld: v };
                                    set("miscIncomes", arr);
                                }} />
                        </div>
                    </div>
                </div>
            ))}
            <button
                onClick={() => set("miscIncomes", [
                    ...(data.miscIncomes || []),
                    { description: "", amount: "", withheld: "" }
                ])}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
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

    // ---------------------------------------------------------------------------
    // STEP 3 — Retirement
    // ---------------------------------------------------------------------------
    const StepRetirement = () => (
        <div className="space-y-4">
            <InfoBox>
                Traditional IRA contributions may be deductible depending on income and
                workplace plan coverage. Pre-tax 401(k) and Roth contributions are noted
                here for completeness but are handled differently at the tax level.
            </InfoBox>

            <div>
                <Label tip="tira">Traditional IRA Contribution</Label>
                <Tip id="tira">
                    Deductible up to $7,000 for 2024 (under age 50).
                    If you or your spouse have a workplace retirement plan, deductibility
                    phases out at higher incomes. This app applies the full deduction —
                    verify eligibility with a tax professional if your income is high.
                </Tip>
                <MoneyInput value={data.traditionalIraContribution}
                    onChange={v => set("traditionalIraContribution", v)} />
                <p className="text-xs text-slate-500 mt-1">
                    2024 limit: $7,000 (under 50) / $8,000 (50+)
                </p>
            </div>

            <div>
                <Label tip="r401">Traditional 401(k) Contribution (informational)</Label>
                <Tip id="r401">
                    Pre-tax 401(k) contributions are already excluded from W-2 Box 1
                    by your employer. Do not deduct again here. Enter for your records only.
                </Tip>
                <MoneyInput value={data.traditional401kContribution}
                    onChange={v => set("traditional401kContribution", v)} />
            </div>

            <div>
                <Label>Roth 401(k) / Roth IRA Contribution (informational)</Label>
                <MoneyInput value={data.roth401kContribution}
                    onChange={v => set("roth401kContribution", v)} />
                <p className="text-xs text-slate-500 mt-1">
                    Roth contributions are after-tax — not deductible now,
                    but qualified withdrawals in retirement are tax-free.
                </p>
            </div>
        </div>
    );

    // ---------------------------------------------------------------------------
    // STEP 4 — Deductions  (+ estimated tax payments)
    // ---------------------------------------------------------------------------
    const StepDeductions = () => (
        <div className="space-y-4">
            <InfoBox>
                We automatically compare itemized deductions to your standard deduction
                and use whichever is larger.
                {summary.usesItemized !== undefined && (
                    <span className="block mt-1 font-semibold">
                        Currently using: <strong>{summary.usesItemized ? "Itemized" : "Standard"}</strong> deduction
                        (${fmt(summary.deductionUsed)} vs{" "}
                        {summary.usesItemized
                            ? `standard $${fmt(summary.stdDed)}`
                            : `itemized $${fmt(summary.itemized)}`})
                    </span>
                )}
                <button onClick={() => openIRS("scheduleA")}
                    className="block mt-1 text-blue-600 hover:underline text-xs">
                    Schedule A Instructions →
                </button>
            </InfoBox>

            <SectionHead>Above-the-Line Adjustments</SectionHead>
            <div>
                <Label tip="sli">Student Loan Interest</Label>
                <Tip id="sli">
                    Deductible up to $2,500. Phases out at higher AGI.
                    This is an "above-the-line" deduction — you get it
                    regardless of whether you itemize.
                </Tip>
                <MoneyInput value={data.studentLoanInterest}
                    onChange={v => set("studentLoanInterest", v)} />
            </div>
            <div>
                <Label tip="hsa2">HSA Contribution (not via payroll)</Label>
                <Tip id="hsa2">
                    If you made HSA contributions directly (not through employer
                    payroll), enter the amount here. Employer contributions via
                    a cafeteria plan are already pre-tax.
                </Tip>
                <MoneyInput value={data.hsaSelfContribution}
                    onChange={v => set("hsaSelfContribution", v)} />
            </div>

            <SectionHead>Itemized Deductions (Schedule A)</SectionHead>
            <div>
                <Label tip="med">Medical & Dental Expenses</Label>
                <Tip id="med">
                    Only the portion exceeding 7.5 % of your AGI is deductible.
                    Enter your total; we calculate the deductible amount automatically.
                </Tip>
                <MoneyInput value={data.medicalExpenses}
                    onChange={v => set("medicalExpenses", v)} />
                {summary.medical !== undefined && $(data.medicalExpenses) > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                        Deductible amount (after 7.5 % AGI floor):
                        <strong> ${fmt(summary.medical)}</strong>
                    </p>
                )}
            </div>

            <div>
                <Label tip="salt">State & Local Taxes (SALT)</Label>
                <Tip id="salt">
                    Combined deduction for state/local income (or sales) tax AND
                    property tax is capped at $10,000 total. Note: SALT is also the
                    main item that can trigger AMT — see the review step for details.
                </Tip>
                <div className="grid md:grid-cols-2 gap-3">
                    <div>
                        <span className="text-xs text-slate-500">State / Local Income or Sales Tax</span>
                        <MoneyInput value={data.statExciseTax}
                            onChange={v => set("statExciseTax", v)} />
                    </div>
                    <div>
                        <span className="text-xs text-slate-500">Property Tax</span>
                        <MoneyInput value={data.localPropertyTax}
                            onChange={v => set("localPropertyTax", v)} />
                    </div>
                </div>
                {summary.salt !== undefined &&
                 ($(data.statExciseTax) + $(data.localPropertyTax) > 10000) && (
                    <p className="text-xs text-amber-600 mt-1">
                        ⚠️ SALT capped at $10,000. Your total was
                        ${fmt($(data.statExciseTax) + $(data.localPropertyTax))}.
                    </p>
                )}
            </div>

            <div>
                <Label tip="mi">Mortgage Interest</Label>
                <Tip id="mi">
                    Interest on acquisition debt up to $750,000.
                    Enter the amount from Box 1 of Form 1098.
                </Tip>
                <MoneyInput value={data.mortgageInterest}
                    onChange={v => set("mortgageInterest", v)} />
            </div>
            <div>
                <Label>Mortgage Points Paid</Label>
                <MoneyInput value={data.mortgagePoints}
                    onChange={v => set("mortgagePoints", v)} />
            </div>

            <div>
                <Label tip="char">Charitable Donations</Label>
                <Tip id="char">
                    Cash donations are deductible up to 60 % of AGI.
                    Non-cash gifts over $500 require Form 8283.
                </Tip>
                <div className="grid md:grid-cols-2 gap-3">
                    <div>
                        <span className="text-xs text-slate-500">Cash Donations</span>
                        <MoneyInput value={data.charitableCash}
                            onChange={v => set("charitableCash", v)} />
                    </div>
                    <div>
                        <span className="text-xs text-slate-500">Non-Cash Donations</span>
                        <MoneyInput value={data.charitableNonCash}
                            onChange={v => set("charitableNonCash", v)} />
                    </div>
                </div>
            </div>

            <div>
                <Label>Other Itemized Deductions</Label>
                <MoneyInput value={data.otherItemized}
                    onChange={v => set("otherItemized", v)} />
            </div>

            {/* Estimated tax payments — logically a "payment" but placed here
                because users fill deductions and payments at the same time */}
            <SectionHead>Estimated Tax Payments</SectionHead>
            <div>
                <Label tip="est">Estimated Tax Payments (Form 1040-ES)</Label>
                <Tip id="est">
                    If you made quarterly estimated tax payments during the year
                    (common for self-employed, freelancers, or investment income),
                    enter the total of all four payments here. Each payment is
                    reported on Form 1040-ES. This reduces your amount owed /
                    increases your refund.
                </Tip>
                <MoneyInput value={data.estimatedTaxPayments}
                    onChange={v => set("estimatedTaxPayments", v)} />
            </div>
        </div>
    );

    // ---------------------------------------------------------------------------
    // STEP 5 — Credits & Gifts
    // ---------------------------------------------------------------------------
    const StepCredits = () => (
        <div className="space-y-4">
            <InfoBox>
                Tax credits reduce your tax bill dollar-for-dollar —
                more valuable than deductions.
            </InfoBox>

            <SectionHead>Tax Credits</SectionHead>
            <div className="border-2 border-slate-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                    <div className="font-semibold text-slate-900 text-sm">Child Tax Credit</div>
                    <div className="text-xs text-slate-500">
                        ${(TAX_CONFIG[year]?.childTaxCreditPerChild || 0).toLocaleString()} per qualifying child under 17
                    </div>
                </div>
                <input type="checkbox" checked={data.childTaxCredit}
                    onChange={e => set("childTaxCredit", e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600" />
            </div>

            <div>
                <Label tip="edu">Education Credit</Label>
                <Tip id="edu">
                    American Opportunity Credit: up to $2,500 (first 4 years of college).
                    Lifetime Learning Credit: up to $2,000.
                    Enter the amount you are claiming.
                </Tip>
                <MoneyInput value={data.educationCredit}
                    onChange={v => set("educationCredit", v)} />
            </div>

            <div>
                <Label tip="ftc">Foreign Tax Credit</Label>
                <Tip id="ftc">
                    If you paid income tax to a foreign government, you may claim a
                    credit to avoid double taxation. Enter total foreign tax paid.
                    For large amounts or multiple countries you may need Form 1116.
                </Tip>
                <MoneyInput value={data.foreignTaxCredit}
                    onChange={v => set("foreignTaxCredit", v)} />
            </div>

            <div className="border-2 border-slate-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                    <div className="font-semibold text-slate-900 text-sm">Earned Income Tax Credit (EITC)</div>
                    <div className="text-xs text-slate-500">For low to moderate income workers</div>
                </div>
                <input type="checkbox" checked={data.earnedIncomeCredit}
                    onChange={e => set("earnedIncomeCredit", e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600" />
            </div>

            {/* Gifts */}
            <SectionHead>Gifts Received (informational)</SectionHead>
            <InfoBox color="amber">
                You generally do not owe tax on gifts you receive. However, if you
                received a gift over <strong>$17,000 (2024)</strong> from a single person,
                the <em>giver</em> may need to file a gift tax return. Gifts from foreign
                persons over <strong>$100,000</strong> must be reported on <strong>Form 3520</strong>.
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
                            className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <input type="text" placeholder="From (name or relationship)"
                        value={g.from || ""}
                        onChange={e => {
                            const arr = [...data.giftsReceived];
                            arr[idx] = { ...arr[idx], from: e.target.value };
                            set("giftsReceived", arr);
                        }}
                        className="input-field w-full px-3 py-2 border-2 border-slate-200 rounded-lg
                                   focus:outline-none focus:border-blue-500 text-sm" />
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <span className="text-xs text-slate-500">Amount</span>
                            <MoneyInput value={g.amount || ""}
                                onChange={v => {
                                    const arr = [...data.giftsReceived];
                                    arr[idx] = { ...arr[idx], amount: v };
                                    set("giftsReceived", arr);
                                }} />
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 mt-5">
                            <input type="checkbox" checked={g.isFromForeigner || false}
                                onChange={e => {
                                    const arr = [...data.giftsReceived];
                                    arr[idx] = { ...arr[idx], isFromForeigner: e.target.checked };
                                    set("giftsReceived", arr);
                                }}
                                className="w-4 h-4" />
                            Foreign giver
                        </label>
                    </div>
                </div>
            ))}
            <button
                onClick={() => set("giftsReceived", [
                    ...(data.giftsReceived || []),
                    { from: "", amount: "", isFromForeigner: false }
                ])}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                <Plus className="w-4 h-4" /> Add Gift
            </button>
            {(data.giftsReceived || []).some(g => g.isFromForeigner && $(g.amount) > 100000) && (
                <InfoBox color="red">
                    ⚠️ You reported a gift over $100,000 from a foreign person.
                    You are required to report this on <strong>Form 3520</strong>.
                    Consult a tax professional.
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
                <input type="checkbox" checked={data.hasForeignAssets}
                    onChange={e => set("hasForeignAssets", e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600" />
            </div>
            {data.hasForeignAssets && (
                <div>
                    <Label tip="fav">Highest Value of Foreign Assets During the Year</Label>
                    <Tip id="fav">
                        If this exceeds $50,000 (end of year) or $75,000 (at any point)
                        for single filers, you must file Form 8938 (FATCA).
                        Thresholds double for married filing jointly.
                    </Tip>
                    <MoneyInput value={data.foreignAssetsValue}
                        onChange={v => set("foreignAssetsValue", v)} />
                    {summary.fatcaFlag && (
                        <InfoBox color="red">
                            ⚠️ Your foreign asset value may trigger a
                            <strong> Form 8938 (FATCA)</strong> filing requirement.
                            Consult a tax professional.
                        </InfoBox>
                    )}
                </div>
            )}
        </div>
    );

    // ---------------------------------------------------------------------------
    // STEP 6 — Review
    // ---------------------------------------------------------------------------
    const StepReview = () => {
        const s = summary;
        if (s.totalIncome === undefined) {
            return <p className="text-slate-500">Complete earlier steps to see your summary.</p>;
        }

        const incomeRows = [
            ["W-2 Wages",              s.w2Wages],
            ["Domestic Interest",      s.domesticInterest],
            ["Ordinary Dividends",     s.domesticDividends],
            ["  ↳ Qualified Div.",     s.qualifiedDividends],
            ["Long-Term Cap. Gains",   s.longTermCapitalGains],
            ["Foreign Interest",       s.foreignInterest],
            ["Foreign Dividends",      s.foreignDividends],
            ["Business (net)",         s.businessNet],
            ["Pension (taxable)",      s.pensionTaxable],
            ["Misc / 1099",            s.miscTotal]
        ].filter(([, v]) => v > 0);

        const detailRows = [
            ["Adjustments",                                              s.totalAdjustments],
            ["Adjusted Gross Income (AGI)",                              s.agi],
            [`Deduction (${s.usesItemized ? "Itemized" : "Standard"})`, s.deductionUsed],
            ["Taxable Income",                                           s.taxableIncome],
            ["Tax on Ordinary Income",                                   s.ordinaryTax],
            ["Tax on Qualified Div. / LTCG",                             s.preferentialTax],
            ["Regular Tax",                                              s.regularTax],
            ["AMT (additional)",                                         s.amtOwed],
            ["Self-Employment Tax",                                      s.seTax],
            ["Credits",                                                  s.credits],
            ["Total Tax",                                                s.totalTax]
        ];

        const paymentRows = [
            ["W-2 Federal Withheld",   s.w2Fed],
            ["1099 / Other Withheld",  s.miscWithheld],
            ["Estimated Tax Payments", s.estPayments],
            ["Total Payments",         s.totalWithholding]
        ].filter(([, v]) => v > 0);

        return (
            <div className="space-y-4">
                {/* Hero */}
                <div className={`rounded-xl p-6 text-white text-center ${
                    s.refundOrOwed >= 0
                        ? "bg-gradient-to-br from-emerald-600 to-teal-700"
                        : "bg-gradient-to-br from-red-600 to-orange-700"
                }`}>
                    <div className="text-sm opacity-80 mb-1">{year} Estimated</div>
                    <div className="text-3xl font-bold" style={{ fontFamily: '"Merriweather", serif' }}>
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
                        <div key={label} className="flex justify-between px-4 py-1.5 text-sm border-t border-slate-100">
                            <span className={`${label.startsWith("  ↳") ? "text-slate-400 italic" : "text-slate-600"}`}>{label}</span>
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
                        <div key={label} className={`rounded-lg px-4 py-3 ${
                            label === "AMT (additional)" && val > 0
                                ? "bg-amber-50 border border-amber-200"
                                : "bg-slate-50"
                        }`}>
                            <div className="text-xs text-slate-500">{label}</div>
                            <div className={`text-lg font-bold ${
                                label === "AMT (additional)" && val > 0
                                    ? "text-amber-700"
                                    : "text-slate-800"
                            }`}>${fmt(val)}</div>
                        </div>
                    ))}
                </div>

                {/* Payments breakdown */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Payments
                    </div>
                    {paymentRows.map(([label, val]) => (
                        <div key={label} className={`flex justify-between px-4 py-1.5 text-sm border-t border-slate-100 ${
                            label === "Total Payments" ? "bg-slate-50 font-bold border-slate-200" : ""
                        }`}>
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
                        ⚠️ <strong>Alternative Minimum Tax (AMT)</strong> added <strong>${fmt(s.amtOwed)}</strong> to
                        your tax bill. AMT is a parallel tax system designed to ensure high-income
                        taxpayers pay a minimum amount. The most common trigger is deducting state
                        and local taxes (SALT). This app calculates AMT using a simplified method —
                        consult a tax professional if you want to explore ways to reduce it.
                    </InfoBox>
                )}

                {/* Compliance flags */}
                {s.fbarFlag && (
                    <InfoBox color="red">
                        ⚠️ <strong>FBAR Required</strong> — Foreign bank balance exceeded $10,000.
                        File FinCEN Form 114 at FinCEN.gov (separate from your tax return).
                        <button onClick={() => openIRS("fbar")}
                            className="block mt-1 underline text-red-600 text-xs">
                            IRS FBAR guidance →
                        </button>
                    </InfoBox>
                )}
                {s.fatcaFlag && (
                    <InfoBox color="red">
                        ⚠️ <strong>Form 8938 (FATCA) may be required</strong> — Foreign asset
                        value is high. Consult a tax professional.
                    </InfoBox>
                )}
                {(data.giftsReceived || []).some(g => g.isFromForeigner && $(g.amount) > 100000) && (
                    <InfoBox color="red">
                        ⚠️ <strong>Form 3520 Required</strong> — Gift over $100,000
                        received from a foreign person.
                    </InfoBox>
                )}

                {/* E-file note */}
                <InfoBox color="amber">
                    <strong>About e-filing:</strong> This app cannot e-file directly. The IRS requires
                    authorized e-file provider status, which is a separate certification process.
                    To file your return: (1) download the PDF below and mail it, or (2) use the
                    numbers from this summary to enter your return into a certified e-file provider
                    such as <strong>IRS Free File</strong> (https://www.irs.gov/filing/free-file-do-your-federal-taxes-for-free)
                    — free for most taxpayers.
                </InfoBox>

                <InfoBox color="amber">
                    ⚠️ This calculation is simplified. AMT uses only SALT as an add-back (real AMT
                    has additional preference items). Phase-outs for IRA deductibility and some
                    credits are not fully modeled. Consult a tax professional before filing.
                </InfoBox>

                <div className="grid gap-3">
                    <button
                        onClick={() => alert("In production this would generate and download a filled Form 1040 PDF.")}
                        className="btn-primary w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white
                                   py-3 rounded-lg font-bold flex items-center justify-center gap-2
                                   hover:from-blue-700 hover:to-blue-900">
                        <Download className="w-5 h-5" /> Download Form 1040 (PDF)
                    </button>
                    <button
                        onClick={() => openIRS("form1040")}
                        className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold
                                   flex items-center justify-center gap-2 hover:bg-blue-50 transition">
                        <ExternalLink className="w-5 h-5" /> IRS Form 1040 Instructions
                    </button>
                </div>
            </div>
        );
    };

    // ---------------------------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------------------------
    const STEP_COMPONENTS = [
        StepPersonal, StepW2, StepIncome,
        StepRetirement, StepDeductions, StepCredits, StepReview
    ];
    const CurrentStep = STEP_COMPONENTS[step];

    return (
        <div className="min-h-screen" style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            fontFamily: '"Inter", -apple-system, system-ui, sans-serif'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Merriweather:wght@700;900&display=swap');
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(24px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .step-card { animation: slideIn 0.35s ease-out; }
                .input-field { transition: all 0.2s ease; }
                .input-field:focus { box-shadow: 0 4px 14px rgba(59,130,246,0.25); }
                .btn-primary { transition: all 0.2s ease; }
                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(59,130,246,0.35);
                }
            `}</style>

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white"
                            style={{ fontFamily: '"Merriweather", serif' }}>
                            TaxFlow Pro
                        </h1>
                        <p className="text-slate-400 text-xs mt-0.5">Professional Tax Return Software</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <select value={year} onChange={e => setYear(e.target.value)}
                                className="bg-transparent text-white border-none outline-none cursor-pointer font-semibold text-sm">
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
                                <div className={`flex items-center justify-center w-7 h-7 rounded-full
                                    text-xs font-bold flex-shrink-0 ${
                                        i < step  ? "bg-blue-500 text-white" :
                                        i === step ? "bg-white text-slate-900" :
                                                     "bg-slate-700 text-slate-400"
                                    }`}>
                                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className="flex-1 h-0.5 bg-slate-700 mx-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full"
                                            style={{
                                                width: i < step ? "100%" : "0%",
                                                transition: "width 0.5s ease"
                                            }} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex justify-between mt-1.5">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex-1 text-center">
                                <span className={`text-xs font-semibold ${
                                    i === step ? "text-white" : "text-slate-500"
                                }`}>{s.title}</span>
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
                                <h2 className="text-2xl font-bold text-slate-900"
                                    style={{ fontFamily: '"Merriweather", serif' }}>
                                    {STEPS[step].title}
                                </h2>
                                <p className="text-slate-500 text-sm mt-0.5">{STEPS[step].desc}</p>
                            </div>
                            <button onClick={() => openIRS("form1040")}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800
                                           text-xs font-medium shrink-0">
                                <ExternalLink className="w-3.5 h-3.5" /> IRS Instructions
                            </button>
                        </div>
                        <CurrentStep />
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
                            }`}>
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <span className="text-xs text-slate-400">
                            Step {step + 1} of {STEPS.length}
                        </span>
                        <button
                            onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
                            disabled={step === STEPS.length - 1 || !canProceed()}
                            className={`btn-primary flex items-center gap-1.5 px-5 py-2 rounded-lg
                                font-semibold text-sm transition ${
                                    step === STEPS.length - 1 || !canProceed()
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
                                }`}>
                            Continue <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
