export default function blankState() {
  return {
    // Personal
    firstName: "",
    lastName: "",
    ssn: "",
    filingStatus: "",
    dependents: 0,

    // W-2
    w2Wages: "",
    w2FederalTax: "",
    w2StateTax: "",
    w2SocialSecurity: "",
    w2Medicare: "",

    // Domestic interest / dividends
    domesticInterest: "",
    domesticDividends: "",
    qualifiedDividends: "",
    longTermCapitalGains: "",

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
    traditional401kContribution: "",
    roth401kContribution: "",
    pensionIncome: "",
    pensionTaxable: "",

    // Health
    hsaSelfContribution: "",

    // Adjustments
    studentLoanInterest: "",

    // Itemized deductions
    medicalExpenses: "",
    statExciseTax: "",
    localPropertyTax: "",
    mortgageInterest: "",
    mortgagePoints: "",
    charitableCash: "",
    charitableNonCash: "",
    otherItemized: "",

    // Estimated tax payments
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
    foreignAssetsValue: "",
  };
}
