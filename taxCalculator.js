// js/taxCalculator.js
import { state } from './state.js';

function calculateOldRegimeTax(grossSalary, interestIncome, totalDeductions) {
    const standardDeduction = 50000;
    const grossTotalIncome = grossSalary + interestIncome;
    const incomeAfterStandardDeduction = Math.max(0, grossTotalIncome - standardDeduction);
    const taxableIncome = Math.max(0, incomeAfterStandardDeduction - totalDeductions);
    
    let tax = 0;
    if (taxableIncome <= 250000) tax = 0;
    else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
    else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
    else tax = 12500 + 100000 + (taxableIncome - 1000000) * 0.30;
    
    const rebate87A = (taxableIncome <= 500000) ? Math.min(tax, 12500) : 0;
    tax = Math.max(0, tax - rebate87A);
    const cess = tax * 0.04;
    const totalTax = tax + cess;
    
    // Note: Surcharge logic was simplified as it's not applicable at this income level.
    return {
        grossTotalIncome, standardDeduction, totalDeductions, taxableIncome,
        taxBeforeRebate: Math.round(tax + rebate87A), rebate87A: Math.round(rebate87A),
        taxAfterRebate: Math.round(tax), cess: Math.round(cess), totalTax: Math.round(totalTax)
    };
}

function calculateNewRegimeTax(grossSalary, interestIncome) {
    const standardDeduction = 75000;
    const grossTotalIncome = grossSalary + interestIncome;
    const taxableIncome = Math.max(0, grossTotalIncome - standardDeduction);
    
    let tax = 0;
    if (taxableIncome <= 300000) tax = 0;
    else if (taxableIncome <= 700000) tax = (taxableIncome - 300000) * 0.05;
    else if (taxableIncome <= 1000000) tax = 20000 + (taxableIncome - 700000) * 0.10;
    else if (taxableIncome <= 1200000) tax = 50000 + (taxableIncome - 1000000) * 0.15;
    else if (taxableIncome <= 1500000) tax = 80000 + (taxableIncome - 1200000) * 0.20;
    else tax = 140000 + (taxableIncome - 1500000) * 0.30;

    const rebate87A = (taxableIncome <= 700000) ? Math.min(tax, 25000) : 0;
    tax = Math.max(0, tax - rebate87A);
    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return {
        grossTotalIncome, standardDeduction, totalDeductions: 0, taxableIncome,
        taxBeforeRebate: Math.round(tax + rebate87A), rebate87A: Math.round(rebate87A),
        taxAfterRebate: Math.round(tax), cess: Math.round(cess), totalTax: Math.round(totalTax)
    };
}

function calculateHraExemption(rentPaid, hraReceived, basicSalary, daComponent, isMetro) {
    if (rentPaid === 0 || hraReceived === 0) return 0;
    const salaryForHRA = basicSalary + daComponent;
    const metroPercent = isMetro ? 0.50 : 0.40;
    
    const actual = hraReceived;
    const percentOfBasic = salaryForHRA * metroPercent;
    const rentMinusTenPercent = Math.max(0, rentPaid - (salaryForHRA * 0.10));
    return Math.min(actual, percentOfBasic, rentMinusTenPercent);
}

export function calculateTaxes() {
    const { userData } = state;
    const hraExemption = calculateHraExemption(userData.rentPaid, userData.hraComponent, userData.basicSalary, userData.daComponent, userData.isMetro);
    const total80C = Math.min(150000, userData.basic80c + userData.licPremium);
    const total80TTA = (userData.age < 60) ? Math.min(10000, userData.interestIncome) : 0;
    const total80CCD1B = Math.min(50000, userData.npsContribution);
    
    const totalDeductions = total80C + userData.professionalTax + userData.lta + hraExemption + userData.healthInsurance + userData.educationLoanInterest + total80TTA + total80CCD1B;

    return {
        old: calculateOldRegimeTax(userData.grossSalary, userData.interestIncome, totalDeductions),
        new: calculateNewRegimeTax(userData.grossSalary, userData.interestIncome),
        tdsCredit: userData.tds_26as,
        hraExemption: Math.round(hraExemption),
        total80C, total80TTA, total80CCD1B
    };
}