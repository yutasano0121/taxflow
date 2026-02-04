#!/usr/bin/env python3
"""
Tax Return PDF Generator
Generates a Form 1040 summary PDF from the data exported by TaxFlow Pro.

Field names match the current data model in enhanced-tax-app.jsx:
    w2Wages, w2FederalTax, domesticInterest, domesticDividends,
    foreignInterest, foreignDividends, businessIncome, businessExpenses,
    pensionTaxable, miscIncomes[], studentLoanInterest, hsaSelfContribution,
    traditionalIraContribution, medicalExpenses, statExciseTax,
    localPropertyTax, mortgageInterest, mortgagePoints, charitableCash,
    charitableNonCash, childTaxCredit, educationCredit, foreignTaxCredit,
    foreignBankMaxBalance, foreignCountry, hasForeignAssets, foreignAssetsValue

USAGE:
    python3 generate_tax_pdf.py <tax_data.json> <tax_summary.json> <output.pdf>

    tax_data.json   — the raw form data (export from the app)
    tax_summary.json — the calculated summary (totalIncome, agi, totalTax, etc.)
    output.pdf      — path for the generated PDF
"""

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import json
import sys
from datetime import datetime


def safe_float(val):
    """Safely convert a value to float, returning 0.0 on failure."""
    try:
        return float(val) if val else 0.0
    except (TypeError, ValueError):
        return 0.0


def draw_section_header(c, y, title):
    """Draw a bold section header and return the new y position."""
    c.setFont("Helvetica-Bold", 11)
    c.setFillColorRGB(0.12, 0.24, 0.45)
    c.drawString(1 * inch, y, title)
    # underline
    c.setStrokeColorRGB(0.12, 0.24, 0.45)
    c.line(1 * inch, y - 3, 7.2 * inch, y - 3)
    c.setFillColorRGB(0, 0, 0)
    return y - 0.3 * inch


def draw_line_item(c, y, label, amount, bold=False):
    """Draw a label on the left and a dollar amount right-aligned."""
    font = "Helvetica-Bold" if bold else "Helvetica"
    size = 10 if not bold else 10
    c.setFont(font, size)
    c.drawString(1.1 * inch, y, label)
    c.drawRightString(7.2 * inch, y, f"${amount:,.2f}")
    return y - 0.2 * inch


def draw_flag(c, y, message):
    """Draw a warning flag box. Returns new y position."""
    box_height = 0.45 * inch
    c.setFillColorRGB(1.0, 0.93, 0.93)
    c.rect(1 * inch, y - box_height + 0.05 * inch, 6.2 * inch, box_height, fill=1, stroke=0)
    c.setFillColorRGB(0.75, 0.0, 0.0)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(1.15 * inch, y - 0.1 * inch, "⚠  " + message)
    c.setFillColorRGB(0, 0, 0)
    return y - box_height - 0.1 * inch


def create_form_1040_summary(tax_data, tax_summary, output_path):
    """
    Create a Form 1040 summary PDF from tax_data and tax_summary dicts.
    This is a readable summary document — not an official IRS fillable form.
    """
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # ----------------------------------------------------------------
    # HEADER
    # ----------------------------------------------------------------
    c.setFillColorRGB(0.1, 0.18, 0.35)
    c.rect(0, height - 1.0 * inch, width, 1.0 * inch, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(1 * inch, height - 0.45 * inch, "U.S. Individual Income Tax Return")
    c.setFont("Helvetica", 10)
    tax_year = tax_data.get("taxYear", 2024)
    c.drawString(1 * inch, height - 0.7 * inch, f"Form 1040 Summary  •  Tax Year {tax_year}")
    c.setFillColorRGB(0, 0, 0)

    y = height - 1.3 * inch

    # ----------------------------------------------------------------
    # PERSONAL INFORMATION
    # ----------------------------------------------------------------
    y = draw_section_header(c, y, "Personal Information")

    filing_status_labels = {
        "single": "Single",
        "married-joint": "Married Filing Jointly",
        "married-separate": "Married Filing Separately",
        "head-of-household": "Head of Household"
    }

    c.setFont("Helvetica", 10)
    lines = [
        f"Name:              {tax_data.get('firstName', '')} {tax_data.get('lastName', '')}",
        f"SSN:               {tax_data.get('ssn', '')}",
        f"Filing Status:     {filing_status_labels.get(tax_data.get('filingStatus', ''), '')}",
        f"Dependents:        {tax_data.get('dependents', 0)}"
    ]
    for line in lines:
        c.drawString(1.1 * inch, y, line)
        y -= 0.2 * inch

    # ----------------------------------------------------------------
    # INCOME
    # ----------------------------------------------------------------
    y -= 0.15 * inch
    y = draw_section_header(c, y, "Income")

    w2_wages            = safe_float(tax_data.get("w2Wages"))
    domestic_interest   = safe_float(tax_data.get("domesticInterest"))
    domestic_dividends  = safe_float(tax_data.get("domesticDividends"))
    foreign_interest    = safe_float(tax_data.get("foreignInterest"))
    foreign_dividends   = safe_float(tax_data.get("foreignDividends"))
    business_income     = safe_float(tax_data.get("businessIncome"))
    business_expenses   = safe_float(tax_data.get("businessExpenses"))
    business_net        = max(0, business_income - business_expenses)
    pension_taxable     = safe_float(tax_data.get("pensionTaxable"))

    # Misc incomes
    misc_items = tax_data.get("miscIncomes", [])
    misc_total = sum(safe_float(item.get("amount")) for item in misc_items)

    y = draw_line_item(c, y, "1.  Wages, salaries, tips (W-2 Box 1)",                  w2_wages)
    y = draw_line_item(c, y, "2b. Taxable interest (domestic)",                         domestic_interest)
    y = draw_line_item(c, y, "3b. Ordinary dividends (domestic)",                       domestic_dividends)
    if foreign_interest > 0 or foreign_dividends > 0:
        y = draw_line_item(c, y, "    Interest income (foreign)",                       foreign_interest)
        y = draw_line_item(c, y, "    Dividend income (foreign)",                       foreign_dividends)
    if business_net > 0:
        y = draw_line_item(c, y, "8.  Business income, net (Schedule C)",               business_net)
    if pension_taxable > 0:
        y = draw_line_item(c, y, "5a. Pensions and annuities — taxable (1099-R)",       pension_taxable)
    if misc_total > 0:
        y = draw_line_item(c, y, "8.  Other income (misc / 1099)",                      misc_total)
        for item in misc_items:
            desc = item.get("description", "Unspecified")
            amt  = safe_float(item.get("amount"))
            if amt > 0:
                c.setFont("Helvetica", 8.5)
                c.setFillColorRGB(0.4, 0.4, 0.4)
                c.drawString(1.4 * inch, y, f"— {desc}")
                c.drawRightString(7.2 * inch, y, f"${amt:,.2f}")
                c.setFillColorRGB(0, 0, 0)
                y -= 0.17 * inch

    total_income = safe_float(tax_summary.get("totalIncome"))
    y = draw_line_item(c, y, "9.  Total income", total_income, bold=True)

    # ----------------------------------------------------------------
    # ADJUSTMENTS & AGI
    # ----------------------------------------------------------------
    y -= 0.15 * inch
    y = draw_section_header(c, y, "Adjustments to Income")

    student_loan = min(safe_float(tax_data.get("studentLoanInterest")), 2500)
    hsa_self     = safe_float(tax_data.get("hsaSelfContribution"))
    ira          = min(safe_float(tax_data.get("traditionalIraContribution")), 7000)

    if student_loan > 0:
        y = draw_line_item(c, y, "Student loan interest deduction",           student_loan)
    if hsa_self > 0:
        y = draw_line_item(c, y, "HSA deduction (self-contributed)",          hsa_self)
    if ira > 0:
        y = draw_line_item(c, y, "Traditional IRA deduction",                 ira)

    total_adjustments = safe_float(tax_summary.get("totalAdjustments"))
    agi               = safe_float(tax_summary.get("agi"))
    y = draw_line_item(c, y, "10. Total adjustments",                         total_adjustments, bold=True)
    y = draw_line_item(c, y, "11. Adjusted Gross Income (AGI)",               agi,              bold=True)

    # ----------------------------------------------------------------
    # DEDUCTIONS
    # ----------------------------------------------------------------
    y -= 0.15 * inch
    y = draw_section_header(c, y, "Deductions")

    uses_itemized  = tax_summary.get("usesItemized", False)
    deduction_used = safe_float(tax_summary.get("deductionUsed"))
    std_ded        = safe_float(tax_summary.get("stdDed"))
    itemized_total = safe_float(tax_summary.get("itemized"))

    if uses_itemized:
        medical   = safe_float(tax_summary.get("medical"))
        salt      = safe_float(tax_summary.get("salt"))
        mortgage  = safe_float(tax_summary.get("mortgage"))
        charit    = safe_float(tax_summary.get("charitable"))
        other_it  = safe_float(tax_data.get("otherItemized"))

        y = draw_line_item(c, y, "Medical expenses (after 7.5% AGI floor)",  medical)
        y = draw_line_item(c, y, "State & local taxes (SALT, capped $10k)",  salt)
        y = draw_line_item(c, y, "Mortgage interest + points",               mortgage)
        y = draw_line_item(c, y, "Charitable contributions",                 charit)
        if other_it > 0:
            y = draw_line_item(c, y, "Other itemized deductions",            other_it)
        y = draw_line_item(c, y, "12. Itemized deductions (total)",          itemized_total, bold=True)
    else:
        y = draw_line_item(c, y, "12. Standard deduction",                   std_ded, bold=True)

    taxable_income = safe_float(tax_summary.get("taxableIncome"))
    y = draw_line_item(c, y, "15. Taxable income",                           taxable_income, bold=True)

    # ----------------------------------------------------------------
    # TAX & CREDITS
    # ----------------------------------------------------------------
    y -= 0.15 * inch
    y = draw_section_header(c, y, "Tax and Credits")

    income_tax = safe_float(tax_summary.get("incomeTax"))
    se_tax     = safe_float(tax_summary.get("seTax"))
    credits    = safe_float(tax_summary.get("credits"))
    total_tax  = safe_float(tax_summary.get("totalTax"))

    y = draw_line_item(c, y, "16. Tax (from tax brackets)",                  income_tax)
    if se_tax > 0:
        y = draw_line_item(c, y, "    Self-employment tax",                  se_tax)
    if credits > 0:
        y = draw_line_item(c, y, "19. Credits (child, education, foreign)",  credits)
    y = draw_line_item(c, y, "24. Total tax",                                total_tax, bold=True)

    # ----------------------------------------------------------------
    # PAYMENTS
    # ----------------------------------------------------------------
    y -= 0.15 * inch
    y = draw_section_header(c, y, "Payments")

    w2_fed_withheld   = safe_float(tax_data.get("w2FederalTax"))
    misc_withheld     = sum(safe_float(item.get("withheld")) for item in misc_items)
    total_withholding = safe_float(tax_summary.get("totalWithholding"))

    y = draw_line_item(c, y, "25a. Federal tax withheld (W-2 Box 2)",        w2_fed_withheld)
    if misc_withheld > 0:
        y = draw_line_item(c, y, "25b. Federal tax withheld (1099 / other)", misc_withheld)
    y = draw_line_item(c, y, "33. Total payments",                           total_withholding, bold=True)

    # ----------------------------------------------------------------
    # REFUND / AMOUNT OWED
    # ----------------------------------------------------------------
    y -= 0.2 * inch
    refund_or_owed = safe_float(tax_summary.get("refundOrOwed"))

    if refund_or_owed >= 0:
        c.setFillColorRGB(0.0, 0.45, 0.2)
        label = "34. Refund"
    else:
        c.setFillColorRGB(0.7, 0.0, 0.0)
        label = "37. Amount You Owe"

    c.setFont("Helvetica-Bold", 13)
    c.drawString(1 * inch, y, label)
    c.drawRightString(7.2 * inch, y, f"${abs(refund_or_owed):,.2f}")
    c.setFillColorRGB(0, 0, 0)
    y -= 0.4 * inch

    # ----------------------------------------------------------------
    # COMPLIANCE FLAGS
    # ----------------------------------------------------------------
    foreign_max_balance = safe_float(tax_data.get("foreignBankMaxBalance"))
    if foreign_max_balance >= 10000:
        y = draw_flag(c, y, "FBAR REQUIRED — Foreign account balance exceeded $10,000. File FinCEN Form 114 at FinCEN.gov.")

    has_foreign_assets  = tax_data.get("hasForeignAssets", False)
    foreign_asset_value = safe_float(tax_data.get("foreignAssetsValue"))
    if has_foreign_assets and foreign_asset_value > 50000:
        y = draw_flag(c, y, "FATCA — Form 8938 may be required. Foreign asset value exceeds reporting threshold.")

    gifts = tax_data.get("giftsReceived", [])
    if any(g.get("isFromForeigner") and safe_float(g.get("amount")) > 100000 for g in gifts):
        y = draw_flag(c, y, "Form 3520 REQUIRED — Gift over $100,000 received from a foreign person.")

    # ----------------------------------------------------------------
    # FOOTER
    # ----------------------------------------------------------------
    c.setFillColorRGB(0.45, 0.45, 0.45)
    c.setFont("Helvetica", 7.5)
    c.drawString(1 * inch, 0.55 * inch, f"Generated by TaxFlow Pro on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    c.drawString(1 * inch, 0.40 * inch, "This is a simplified summary for demonstration purposes only.")
    c.drawString(1 * inch, 0.25 * inch, "For actual tax filing, use official IRS forms and certified tax software. Consult a tax professional.")
    c.setFillColorRGB(0, 0, 0)

    c.save()
    return output_path


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python3 generate_tax_pdf.py <tax_data.json> <tax_summary.json> <output.pdf>")
        sys.exit(1)

    with open(sys.argv[1], "r") as f:
        tax_data = json.load(f)

    with open(sys.argv[2], "r") as f:
        tax_summary = json.load(f)

    output_path = create_form_1040_summary(tax_data, tax_summary, sys.argv[3])
    print(f"PDF generated: {output_path}")
