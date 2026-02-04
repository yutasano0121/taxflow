# Tax Update Guide

How to add a new tax year to TaxFlow Pro. You need to do this once per year,
usually in late October or November after the IRS publishes the new numbers.

---

## Where to Find the Numbers

| What | Where | Published |
|------|-------|-----------|
| Tax brackets & standard deductions | IRS Revenue Procedure (e.g. Rev. Proc. 2024-35 for 2025) | Oct / Nov |
| Press release with all numbers | https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments | Oct / Nov |
| Child Tax Credit, EITC amounts | Same press release | Oct / Nov |
| FBAR threshold | FinCEN — currently $10,000, rarely changes | — |
| Gift tax annual exclusion | IRS Rev. Proc. | Oct / Nov |
| IRA contribution limits | IRS Rev. Proc. | Oct / Nov |

Secondary sources for cross-checking:
- Tax Foundation — https://taxfoundation.org/data/all/federal/
- Tax Policy Center — https://www.taxpolicycenter.org/

---

## What Changes Each Year vs. What Stays the Same

### Usually changes (inflation-adjusted)

- Tax bracket thresholds (the dollar boundaries between rates)
- Standard deduction amounts
- Traditional IRA contribution limit
- Child Tax Credit phase-out thresholds
- EITC maximum amounts and income thresholds
- Gift tax annual exclusion ($17,000 in 2024, $18,000 in 2025)

### Rarely changes

- Tax rates themselves (10 %, 12 %, 22 %, 24 %, 32 %, 35 %, 37 %)
- Child Tax Credit base amount (currently $2,000)
- Student loan interest deduction cap ($2,500)
- Medical expense AGI floor (7.5 %)
- SALT deduction cap ($10,000)
- Mortgage debt limit ($750,000)
- FBAR threshold ($10,000)
- Form 3520 foreign gift threshold ($100,000)

---

## Step-by-Step: Adding a New Year

### Step 1 — Collect the numbers

From the IRS press release, write down:

```
Standard deductions:
    Single:                 $______
    Married Filing Jointly: $______
    Married Separately:     $______
    Head of Household:      $______

Tax brackets (Single):
    10 %  up to  $______
    12 %  up to  $______
    22 %  up to  $______
    24 %  up to  $______
    32 %  up to  $______
    35 %  up to  $______
    37 %  above  $______

(Repeat for the other three filing statuses)

Credits:
    Child Tax Credit per child:     $______
    Child Tax Credit refundable max: $______
    EITC (0 dependents):            $______
    EITC (1 dependent):             $______
    EITC (2 dependents):            $______
    EITC (3+ dependents):           $______

Deduction limits:
    Traditional IRA max (under 50): $______
    Traditional IRA max (50+):      $______
    Gift tax annual exclusion:      $______
```

### Step 2 — Update `taxConfig.json`

Add a new top-level key for the year. The structure must match this template exactly
(4-space indentation, `min`/`max`/`rate` for brackets, `null` for the top bracket's max):

```json
{
    "2024": { ... },
    "2025": { ... },
    "2026": {
        "taxYear": 2026,
        "lastUpdated": "2025-11-01",
        "source": "IRS Rev. Proc. 2025-XX",
        "standardDeductions": {
            "single": 15400,
            "married-joint": 30800,
            "married-separate": 15400,
            "head-of-household": 23100
        },
        "taxBrackets": {
            "single": [
                { "min": 0,      "max": 12000,   "rate": 0.10 },
                { "min": 12000,  "max": 48800,   "rate": 0.12 },
                { "min": 48800,  "max": 104200,  "rate": 0.22 },
                { "min": 104200, "max": 198300,  "rate": 0.24 },
                { "min": 198300, "max": 252525,  "rate": 0.32 },
                { "min": 252525, "max": 630350,  "rate": 0.35 },
                { "min": 630350, "max": null,    "rate": 0.37 }
            ],
            "married-joint": [
                ...
            ],
            "married-separate": [
                ...
            ],
            "head-of-household": [
                ...
            ]
        },
        "credits": {
            "childTaxCredit": {
                "perChild": 2000,
                "refundableMax": 1700,
                "phaseoutStart": {
                    "single": 200000,
                    "married-joint": 400000,
                    "married-separate": 200000,
                    "head-of-household": 200000
                }
            },
            "americanOpportunityCredit": { "max": 2500 },
            "lifetimeLearningCredit": { "max": 2000 },
            "earnedIncomeCredit": {
                "0dependents": 660,
                "1dependent": 4400,
                "2dependents": 7250,
                "3plusDependents": 8150
            }
        },
        "deductionLimits": {
            "studentLoanInterest": 2500,
            "traditionalIraMax": 7000,
            "traditionalIraMaxAge50Plus": 8000,
            "medicalExpenseFloor": 0.075,
            "charitableCashLimit": 0.60,
            "saltCap": 10000,
            "mortgageDebtLimit": 750000
        },
        "compliance": {
            "fbarThreshold": 10000,
            "fatcaThresholdSingleEndOfYear": 50000,
            "fatcaThresholdSingleAnyPoint": 75000,
            "giftTaxAnnualExclusion": 18000,
            "form3520ForeignGiftThreshold": 100000
        },
        "irsLinks": {
            "form1040": "https://www.irs.gov/pub/irs-pdf/i1040gi.pdf",
            "scheduleA": "https://www.irs.gov/pub/irs-pdf/i1040sca.pdf",
            "scheduleB": "https://www.irs.gov/pub/irs-pdf/i1040sb.pdf",
            "scheduleC": "https://www.irs.gov/pub/irs-pdf/i1040sc.pdf",
            "schedule1": "https://www.irs.gov/pub/irs-pdf/i1040s1.pdf",
            "fbar": "https://www.irs.gov/filing/fbar-filing"
        }
    }
}
```

Key things to get right:
- Brackets use `"min"` and `"max"`, **not** `"limit"` or `"base"`.
- The top bracket's `"max"` is `null` (JSON has no `Infinity`).
- Every bracket's `"min"` must equal the previous bracket's `"max"`.
- The `"compliance"` block rarely changes — copy it from the previous year unless
  the gift tax exclusion or FATCA thresholds shift.

### Step 3 — Update `enhanced-tax-app.jsx`

The `TAX_CONFIG` object at the top of the file is a duplicate of `taxConfig.json`
(written as JavaScript so it can use `Infinity` instead of `null`). Add the new year
there in the same way, but use `Infinity` for the top bracket:

```javascript
"2026": {
    standardDeductions: {
        "single": 15400,
        ...
    },
    taxBrackets: {
        "single": [
            { min: 0,      max: 12000,   rate: 0.10 },
            ...
            { min: 630350, max: Infinity, rate: 0.37 }
        ],
        ...
    },
    childTaxCreditPerChild: 2000,
    fbarThreshold: 10000,
    irsLinks: { ... }
}
```

Then add the new year to the `<select>` dropdown in the header:

```javascript
<option value="2026">Tax Year 2026</option>
```

### Step 4 — Verify with test cases

Run through these scenarios manually and compare against the IRS tax withholding
estimator at https://apps.irs.gov/app/tax-withholding-estimator:

**Case A — Single, $50,000 W-2, standard deduction, no credits**
```
Taxable income = 50000 − standard deduction
Tax = sum of each bracket chunk × rate
```

**Case B — Married Filing Jointly, $120,000 W-2, standard deduction, 2 children**
```
Tax after Child Tax Credit should match IRS estimator
```

**Case C — Single, $80,000 W-2 + $5,000 foreign interest, itemized deductions**
```
Confirm foreign interest is added to total income
Confirm itemized total is compared against standard deduction
```

**Case D — Single with business income of $30,000 and $8,000 expenses**
```
Business net = 22000
SE tax ≈ 22000 × 0.9235 × 0.153 ≈ 3108
Half SE tax (adjustment) ≈ 1554
Confirm both appear in the review summary
```

### Step 5 — QA checklist

- [ ] All four filing statuses have complete bracket arrays (7 entries each)
- [ ] Every bracket's `min` equals the previous bracket's `max`
- [ ] Standard deductions match the IRS press release exactly
- [ ] Child Tax Credit amount and phase-out thresholds are correct
- [ ] EITC amounts match (these change every year)
- [ ] IRA contribution limit is updated if it changed
- [ ] Gift tax annual exclusion is updated if it changed
- [ ] Test Cases A–D all produce expected results
- [ ] FBAR warning appears when foreign balance ≥ threshold
- [ ] FATCA warning appears when foreign assets ≥ threshold
- [ ] Form 3520 warning appears for large foreign gifts
- [ ] PDF generator produces correct numbers for a sample return

---

## How the Bracket Calculation Works

Tax is progressive — each dollar is taxed only at the rate for the bracket it falls into.

**Example: Single filer, $60,000 taxable income, 2024 brackets**

| Bracket | Range | Dollars in bracket | Rate | Tax |
|---------|-------|--------------------|------|-----|
| 1 | $0 – $11,600 | $11,600 | 10 % | $1,160.00 |
| 2 | $11,600 – $47,150 | $35,550 | 12 % | $4,266.00 |
| 3 | $47,150 – $60,000 | $12,850 | 22 % | $2,827.00 |
| | | | **Total** | **$8,253.00** |

The code that does this (in `enhanced-tax-app.jsx`):

```javascript
function computeTax(taxableIncome, brackets) {
    let tax = 0;
    for (const b of brackets) {
        if (taxableIncome <= b.min) break;
        const chunk = Math.min(taxableIncome, b.max) - b.min;
        tax += chunk * b.rate;
    }
    return tax;
}
```

Each iteration takes the slice of income that falls inside that bracket
(`chunk`), multiplies it by the bracket's rate, and accumulates the total.
The loop stops as soon as it reaches a bracket whose `min` is at or above
the taxable income.

---

## Need help?

- IRS Taxpayer Assistance: 1-800-829-1040
- For calculation accuracy, have a CPA or enrolled agent review the numbers
  before deploying for real use.
