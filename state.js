// --- GEMINI API Configuration ---
// Keep this empty string. Canvas will provide the key at runtime.
const GEMINI_API_KEY = ""; 
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" + GEMINI_API_KEY;

// --- STATE MANAGEMENT ---
let state = {
    currentStep: 0,
    language: 'en',
    userData: {
        grossSalary: 850000,
        basicSalary: 380000,
        hraComponent: 200000,
        interestIncome: 0, // User input required
        tds_26as: 45000,
        leaveTravelAssistance: 0, // Usually not in all PDFs
        medicalAllowance: 0, // Usually not in all PDFs
        flexiAllowance: 0, // Usually not in all PDFs
        overtimeAmount: 0, // Usually minimal or not present
        transportationAllowance: 0, // Usually not in all PDFs
        isMetro: 'true',
        age: 35,
        itrAckNumber: null,
        // Additional fields for chatbot
        rentPaid: 0,
        licPremium: 0,
        basic80c: 0, // For 80C investments like PPF, ELSS etc.
        professionalTax: 0, // Professional Tax paid
        healthInsurance: 0,
        npsContribution: 0,
        // Added to control the flow
        isDataParsed: false
    },
    taxCalculation: null,
    chatContext: {
        isChatOpen: false,
        messageCount: 0,
        awaitingInput: null
    }
};

// Function to update user data
function updateUserData(key, value) {
    if (state.userData.hasOwnProperty(key)) {
        state.userData[key] = value;
    }
}

// Make functions available globally for ES5 compatibility
window.state = state;
window.updateUserData = updateUserData;

// --- TAX CONSTANTS for FY 2024-25 (AY 2025-26) ---
const TAX_CONSTANTS = {
    STANDARD_DEDUCTION: 50000,
    MAX_80C: 150000,
    MAX_80TTA: 10000,
    CESS_RATE: 0.04,
    OLD_SLABS: [
        { limit: 250000, rate: 0.00 },
        { limit: 500000, rate: 0.05 },
        { limit: 1000000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 }
    ],
    NEW_SLABS: [
        { limit: 300000, rate: 0.00 },
        { limit: 600000, rate: 0.05 },
        { limit: 900000, rate: 0.10 },
        { limit: 1200000, rate: 0.15 },
        { limit: 1500000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 }
    ]
};
