import { useState, useEffect } from "react";
import TAX_CONFIG from "../utils/loadTaxConfig";
import { parseNum, computeTax, computeLTCGTax } from "../utils/taxHelpers";

export default function useTaxCalculation(data, year) {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    setSummary(calculate(data, year));
  }, [data, year]);

  return summary;
}

function calculate(d, yr) {
  const cfg = TAX_CONFIG[yr];
  if (!cfg || !d.filingStatus) return {};

  const limits = cfg.deductionLimits;
  const compliance = cfg.compliance;

  // ---- INCOME ----------------------------------------------------------
  const w2Wages = parseNum(d.w2Wages);
  const domesticInterest = parseNum(d.domesticInterest);
  const domesticDividends = parseNum(d.domesticDividends);
  const qualifiedDividends = Math.min(parseNum(d.qualifiedDividends), domesticDividends);
  const longTermCapitalGains = parseNum(d.longTermCapitalGains);
  const foreignInterest = parseNum(d.foreignInterest);
  const foreignDividends = parseNum(d.foreignDividends);
  const businessGross = parseNum(d.businessIncome);
  const businessExpenses = parseNum(d.businessExpenses);
  const businessNet = Math.max(0, businessGross - businessExpenses);
  const pensionTaxable = parseNum(d.pensionTaxable);
  const miscTotal = (d.miscIncomes || []).reduce((s, i) => s + parseNum(i.amount), 0);
  const miscWithheld = (d.miscIncomes || []).reduce((s, i) => s + parseNum(i.withheld), 0);

  const totalIncome =
    w2Wages +
    domesticInterest +
    domesticDividends +
    longTermCapitalGains +
    foreignInterest +
    foreignDividends +
    businessNet +
    pensionTaxable +
    miscTotal;

  // ---- ABOVE-THE-LINE ADJUSTMENTS --------------------------------------
  const studentLoan = Math.min(parseNum(d.studentLoanInterest), limits.studentLoanInterest);
  const hsaSelf = parseNum(d.hsaSelfContribution);
  const traditionalIra = Math.min(parseNum(d.traditionalIraContribution), limits.traditionalIraMax);
  const halfSeTax = businessNet > 0 ? Math.round(businessNet * 0.9235 * 0.0765) : 0;

  const totalAdjustments = studentLoan + hsaSelf + traditionalIra + halfSeTax;
  const agi = Math.max(0, totalIncome - totalAdjustments);

  // ---- DEDUCTIONS: STANDARD vs ITEMIZED --------------------------------
  const stdDed = cfg.standardDeductions[d.filingStatus] || 0;

  const saltRaw = parseNum(d.statExciseTax) + parseNum(d.localPropertyTax);
  const salt = Math.min(saltRaw, limits.saltCap);
  const medical = Math.max(0, parseNum(d.medicalExpenses) - agi * limits.medicalExpenseFloor);
  const mortgage = parseNum(d.mortgageInterest) + parseNum(d.mortgagePoints);
  const charitableRaw = parseNum(d.charitableCash) + parseNum(d.charitableNonCash);
  const charitable = Math.min(charitableRaw, agi * limits.charitableCashLimit);
  const otherItemized = parseNum(d.otherItemized);

  const itemized = medical + salt + mortgage + charitable + otherItemized;
  const deductionUsed = Math.max(stdDed, itemized);
  const usesItemized = itemized > stdDed;

  const taxableIncome = Math.max(0, agi - deductionUsed);

  // ---- INCOME TAX (with qualified dividend / LTCG split) ---------------
  const preferentialIncome = Math.min(qualifiedDividends + longTermCapitalGains, taxableIncome);
  const ordinaryIncome = taxableIncome - preferentialIncome;

  const brackets = cfg.taxBrackets[d.filingStatus] || cfg.taxBrackets["single"];
  const ltcgBrackets = cfg.ltcgBrackets[d.filingStatus] || cfg.ltcgBrackets["single"];

  const ordinaryTax = computeTax(ordinaryIncome, brackets);
  const preferentialTax = computeLTCGTax(ordinaryIncome, preferentialIncome, ltcgBrackets);
  const regularTax = ordinaryTax + preferentialTax;

  // ---- AMT -------------------------------------------------------------
  const amtP = cfg.amtParams[d.filingStatus] || cfg.amtParams["single"];
  const amti = agi + salt;

  const phaseoutReduction = Math.max(0, amti - amtP.phaseoutStart) * 0.25;
  const effectiveExemption = Math.max(0, amtP.exemption - phaseoutReduction);
  const amtTaxableIncome = Math.max(0, amti - effectiveExemption);

  const amtTax =
    Math.min(amtTaxableIncome, amtP.rate26max) * 0.26 +
    Math.max(0, amtTaxableIncome - amtP.rate26max) * 0.28;

  const amtOwed = Math.max(0, amtTax - regularTax);
  const incomeTax = regularTax + amtOwed;

  // Self-employment tax
  const seTax = businessNet > 0 ? Math.round(businessNet * 0.9235 * 0.153) : 0;

  // ---- CREDITS ---------------------------------------------------------
  let credits = 0;
  if (d.childTaxCredit) credits += (d.dependents || 0) * cfg.credits.childTaxCredit.perChild;
  credits += parseNum(d.educationCredit);
  credits += parseNum(d.foreignTaxCredit);

  const taxAfterCredits = Math.max(0, incomeTax - credits);
  const totalTax = taxAfterCredits + seTax;

  // ---- PAYMENTS / WITHHOLDING ------------------------------------------
  const w2Fed = parseNum(d.w2FederalTax);
  const stateTaxWithheld = parseNum(d.w2StateTax);
  const estPayments = parseNum(d.estimatedTaxPayments);
  const totalWithholding = w2Fed + miscWithheld + estPayments;

  // ---- RESULT ----------------------------------------------------------
  const refundOrOwed = totalWithholding - totalTax;

  // ---- COMPLIANCE FLAGS ------------------------------------------------
  const fbarFlag = parseNum(d.foreignBankMaxBalance) >= compliance.fbarThreshold;
  const fatcaFlag =
    d.hasForeignAssets &&
    parseNum(d.foreignAssetsValue) > compliance.fatcaThresholdSingleEndOfYear;

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
    salt, medical, mortgage, charitable,
  };
}
