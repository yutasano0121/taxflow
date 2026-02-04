# TaxFlow Pro — Open Source Tax Return Application

A comprehensive, step-by-step tax return application built with React and Python.
Handles W-2 income, foreign bank interest, business income, retirement accounts,
itemized deductions, tax credits, and compliance flags for FBAR, FATCA, and Form 3520.

---

## Features

### Income Reporting
- **W-2 wages** with actual federal tax withheld (Box 1 and Box 2)
- **Domestic interest and dividends** (1099-INT / 1099-DIV)
- **Foreign interest and dividends** — taxed as U.S. income even without a foreign tax form
- **Business / self-employment income** with expense deduction (Schedule C)
- **Pension and annuity distributions** (1099-R, taxable portion)
- **Miscellaneous / 1099 income** — add any number of extra sources, each with its own
  description and federal withholding amount

### Deductions
- **Above-the-line adjustments**: student loan interest (capped at $2,500), HSA contributions,
  traditional IRA contributions (capped at annual limit)
- **Standard vs. itemized** — calculated automatically; the app picks whichever is larger
- **Full Schedule A support**: medical expenses (7.5 % AGI floor applied automatically),
  SALT ($10,000 cap applied automatically), mortgage interest and points, charitable
  donations (cash and non-cash), and an open "other" field

### Tax Credits
- Child Tax Credit ($2,000 per qualifying child)
- Education credits (American Opportunity / Lifetime Learning)
- Foreign Tax Credit (avoids double taxation on foreign income)
- Earned Income Tax Credit (EITC) checkbox

### Retirement
- Traditional IRA contribution (deducted from income up to the annual limit)
- Traditional 401(k) and Roth 401(k)/IRA fields (informational — these are already
  handled pre-tax or post-tax by the employer)
- Pension / annuity distributions (1099-R)

### Foreign & Compliance Awareness
- **FBAR flag**: if the highest foreign bank balance at any point in the year meets or
  exceeds $10,000, the app displays a warning and links to the IRS FBAR guidance page.
  (The actual FinCEN Form 114 must be filed separately.)
- **FATCA flag**: if foreign financial assets exceed the Form 8938 threshold, the app
  flags it for the user.
- **Form 3520 flag**: if a gift over $100,000 was received from a foreign person, the
  app flags the reporting requirement.
- **Gifts received** — an expandable list where each gift records the giver, amount, and
  whether the giver is foreign.

### Calculation & UX
- Real-time progressive tax bracket calculation
- Actual withholding used (W-2 Box 2 + any 1099 withholding) — no guessing
- Self-employment tax calculated automatically when business income is present
- Auto-save via browser storage — progress is never lost
- 7-step guided workflow with a progress bar
- Context-sensitive help tooltips on every field
- Direct links to official IRS instruction PDFs throughout

### PDF Generation
- Python backend (ReportLab) generates a Form 1040 summary PDF
- Renders all income sources, deductions, credits, and payments
- Prints FBAR / FATCA / Form 3520 warning boxes onto the PDF when triggered
- Uses the same field names as the React app — no mapping step needed

---

## Project Structure

```
taxflow-pro/
├── enhanced-tax-app.jsx       # Main React application (copy to src/App.js)
├── taxConfig.json             # Tax data: brackets, deductions, credits, compliance thresholds
├── generate_tax_pdf.py        # Python PDF generator
├── package.json               # Node.js dependencies
├── README.md                  # This file
└── TAX_UPDATE_GUIDE.md        # How to add a new tax year
```

---

## Setup

### Prerequisites

- **Node.js 18+** and **npm** — download from https://nodejs.org/
- **Python 3.8+** — only needed if you want PDF generation

### React App

```bash
# Create a new React project
npx create-react-app taxflow-pro
cd taxflow-pro

# Install the icon library
npm install lucide-react

# Copy the app file into src/ and rename it
cp ../enhanced-tax-app.jsx src/App.js

# Start the dev server
npm start
# → opens http://localhost:3000
```

### PDF Generation

```bash
# Install the PDF library
pip install reportlab

# Generate a PDF from exported data
python3 generate_tax_pdf.py tax_data.json tax_summary.json output.pdf
```

`tax_data.json` is the raw form data and `tax_summary.json` is the calculated summary.
Both can be exported from the app (or constructed manually — see the field list in the
docstring at the top of `generate_tax_pdf.py`).

---

## How Tax Data is Stored

All tax numbers (brackets, standard deductions, credit amounts, compliance thresholds)
are hardcoded in two places that must stay in sync:

| File | Role |
|------|------|
| `TAX_CONFIG` object inside `enhanced-tax-app.jsx` | Read by the React app at runtime |
| `taxConfig.json` | Reference copy; also used by the PDF generator if you wire it up |

The numbers only change once a year (IRS publishes them around October/November).
See `TAX_UPDATE_GUIDE.md` for the step-by-step process of adding a new year.

---

## Roadmap (not yet implemented)

- [ ] Import W-2 via photo / scan
- [ ] State tax returns
- [ ] Audit risk indicator
- [ ] Crypto tax reporting
- [ ] E-filing integration (requires IRS authorization)
- [ ] Multi-language support

---

## Technologies

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Lucide React icons |
| Styling | Tailwind utility classes (via className) |
| PDF | Python 3, ReportLab |
| Persistence | Browser storage API (local, encrypted) |
| Tax data | JSON, hardcoded in source |

---

## Resources

- IRS Forms & Instructions — https://www.irs.gov/forms-instructions
- IRS Tax Bracket Announcements — https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments
- IRS FBAR Filing — https://www.irs.gov/filing/fbar-filing
- React docs — https://react.dev
- ReportLab docs — https://www.reportlab.com/docs/

---

*Built for open-source tax software.*
