// js/state.js

export const state = {
    currentStep: 1,
    totalSteps: 6,
    // This will hold the data from Gemini for user verification
    extractedData: null, 
    userData: {
        name: "Priya Sharma",
        pan: "ABCDE1234F",
        employer: "TechCorp Solutions",
        grossSalary: 1200000,
        basicSalary: 600000,
        hraComponent: 150000,
        daComponent: 0,
        lta: 30000,
        professionalTax: 2400,
        tds_form16: 110240,
        tds_26as: 110240,
        interestIncome: 8500,
        deduction80TTA: 0,
        basic80c: 110000,
        rentPaid: 0,
        licPremium: 0,
        healthInsurance: 0,
        educationLoanInterest: 0,
        npsContribution: 0,
        isMetro: true,
        age: 28,
        taxRegime: null,
        finalTaxPayable: 0,
        isHraClaimed: false,
        itrAckNumber: "ITR-2024-567890"
    }
};

export function updateUserData(key, value) {
    const numericValue = parseFloat(value);
    if (key === 'isMetro') {
        state.userData[key] = value === 'true';
    } else {
        // Ensure that numeric strings are converted to numbers
        state.userData[key] = !isNaN(numericValue) ? numericValue : value;
    }
    console.log(`Updated ${key}:`, state.userData[key]);
}

export function setCurrentStep(step) {
    state.currentStep = step;
}