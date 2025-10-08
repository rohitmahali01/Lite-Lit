// Tax Calculator for Indian Income Tax (FY 2024-25)

function calculateTaxes() {
    const data = state.userData;
    
    // Gross total income
    const grossTotalIncome = parseFloat(data.grossSalary || 0) + parseFloat(data.interestIncome || 0);
    
    // Calculate HRA exemption for Old Regime
    const basicSalary = parseFloat(data.basicSalary || 0);
    const hraComponent = parseFloat(data.hraComponent || 0);
    const rentPaid = parseFloat(data.rentPaid || 0);
    const isMetro = data.isMetro === 'true';
    
    // HRA exemption is minimum of:
    // 1. Actual HRA received
    // 2. Rent paid minus 10% of basic salary
    // 3. 50% of basic (metro) or 40% of basic (non-metro)
    const hraPercentage = isMetro ? 0.5 : 0.4;
    const rentDeduction = Math.max(0, rentPaid - (0.10 * basicSalary));
    const hraExemption = Math.min(hraComponent, rentDeduction, basicSalary * hraPercentage);
    
    // Professional tax deduction
    const professionalTax = Math.min(parseFloat(data.professionalTax || 0), 2500);
    
    // 80C deduction
    const basic80c = Math.min(parseFloat(data.basic80c || 0), 150000);
    
    // Interest income deduction under 80TTA
    const interestDeduction80TTA = Math.min(parseFloat(data.interestIncome || 0), 10000);
    
    // OLD REGIME CALCULATION
    const oldRegimeDeductions = hraExemption + professionalTax + basic80c + interestDeduction80TTA + TAX_CONSTANTS.STANDARD_DEDUCTION;
    const oldNetTaxableIncome = Math.max(0, grossTotalIncome - oldRegimeDeductions);
    const oldTaxBeforeRebate = calculateTaxOnIncome(oldNetTaxableIncome, 'old', data.age);
    const oldRebate = oldNetTaxableIncome <= 500000 ? Math.min(12500, oldTaxBeforeRebate) : 0;
    const oldTotalTax = Math.max(0, oldTaxBeforeRebate - oldRebate) * (1 + TAX_CONSTANTS.CESS_RATE);
    
    // NEW REGIME CALCULATION (Higher standard deduction, no other deductions)
    const newRegimeDeductions = TAX_CONSTANTS.STANDARD_DEDUCTION; // Standard deduction is same for both now
    const newNetTaxableIncome = Math.max(0, grossTotalIncome - newRegimeDeductions);
    const newTaxBeforeRebate = calculateTaxOnIncome(newNetTaxableIncome, 'new', data.age);
    const newRebate = newNetTaxableIncome <= 700000 ? Math.min(25000, newTaxBeforeRebate) : 0;
    const newTotalTax = Math.max(0, newTaxBeforeRebate - newRebate);
    
    // Store calculation results
    state.taxCalculation = {
        old: {
            grossTotalIncome,
            deductions: oldRegimeDeductions,
            netTaxableIncome: oldNetTaxableIncome,
            taxBeforeRebate: oldTaxBeforeRebate,
            rebate: oldRebate, // Rebate is applied before cess
            totalTax: oldTotalTax,
            detail: {
                hraExemption,
                professionalTax,
                old_80c_deduction: basic80c,
                interestDeduction80TTA,
                standardDeduction: 50000
            }
        },
        new: {
            grossTotalIncome,
            deductions: newRegimeDeductions,
            netTaxableIncome: newNetTaxableIncome,
            taxBeforeRebate: newTaxBeforeRebate,
            rebate: newRebate,
            totalTax: Math.round(newTotalTax),
            detail: {
                standardDeduction: 75000
            }
        }
    };
    
    return state.taxCalculation;
}

function calculateTaxOnIncome(income, regime, age = 30) {
    if (income <= 0) return 0;
    
    let tax = 0;
    const isOld = regime === 'old';
    const isSenior = age >= 60;
    const isSuperSenior = age >= 80;
    
    if (isOld) {
        // Old regime tax slabs (FY 2024-25)
        let exemptionLimit = 250000;
        if (isSuperSenior) exemptionLimit = 500000;
        else if (isSenior) exemptionLimit = 300000;
        
        if (income > exemptionLimit) {
            // 5% on income from exemption limit to 5,00,000
            tax += Math.min(income - exemptionLimit, 500000 - exemptionLimit) * 0.05;
        }
        if (income > 500000) {
            // 20% on income from 5,00,001 to 10,00,000
            tax += Math.min(income - 500000, 500000) * 0.20;
        }
        if (income > 1000000) {
            // 30% on income above 10,00,000
            tax += (income - 1000000) * 0.30;
        }
    } else {
        // New regime tax slabs (FY 2024-25)
        if (income > 300000) {
            // 5% on income from 3,00,001 to 6,00,000
            tax += Math.min(income - 300000, 300000) * 0.05;
        }
        if (income > 600000) {
            // 10% on income from 6,00,001 to 9,00,000
            tax += Math.min(income - 600000, 300000) * 0.10;
        }
        if (income > 900000) {
            // 15% on income from 9,00,001 to 12,00,000
            tax += Math.min(income - 900000, 300000) * 0.15;
        }
        if (income > 1200000) {
            // 20% on income from 12,00,001 to 15,00,000
            tax += Math.min(income - 1200000, 300000) * 0.20;
        }
        if (income > 1500000) {
            // 30% on income above 15,00,000
            tax += (income - 1500000) * 0.30;
        }
    }
    
    // Cess is applied after rebate, so we return the tax before cess here.
    // The main function will apply cess.
    return tax;
}

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateTaxes, calculateTaxOnIncome };
}
