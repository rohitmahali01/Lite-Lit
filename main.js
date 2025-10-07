// js/main.js
import { state, updateUserData, setCurrentStep } from './state.js';
import { renderStep } from './uiRenderer.js';

const appContainer = document.getElementById('app-container');

function mainRender(step = state.currentStep) {
    setCurrentStep(step);
    appContainer.innerHTML = renderStep(step);
}

function navigate(forceStep = null) {
    const nextStep = forceStep !== null ? forceStep : (state.currentStep + 1);
    mainRender(nextStep);
}

// MOCK API RESPONSES FOR DEMONSTRATION
const MOCK_FORM16_DATA = {
    "grossSalary": 1250000, "basicSalary": 625000, "hraComponent": 150000,
    "tds_form16": 115000, "basic80c": 75000, "professionalTax": 2400,
    "isEstimated": false
};
const MOCK_SALARYSLIP_DATA = {
    "grossSalary": 960000, "basicSalary": 480000, "hraComponent": 120000,
    "tds_form16": 60000, "basic80c": 57600, "professionalTax": 2400,
    "isEstimated": true
};

// Function to mock API call for document extraction
async function mockApiCall(file) {
    return new Promise(resolve => {
        console.log(`Simulating API call for file: ${file.name}`);
        setTimeout(() => {
            const data = Math.random() > 0.5 ? MOCK_FORM16_DATA : MOCK_SALARYSLIP_DATA;
            console.log("Mock API response:", data);
            resolve(data);
        }, 2000);
    });
}

// Main event handler using event delegation
document.addEventListener('click', async (event) => {
    // Use .closest() to find a button, even if the user clicks an icon or text inside it
    const target = event.target.closest('button'); 
    if (!target) return; // If the click wasn't on or inside a button, do nothing

    const action = target.dataset.action;

    if (action) {
        if (action === 'next') navigate();
        else if (action === 'goto') navigate(parseInt(target.dataset.step, 10));
        else if (action === 'confirm-extraction') {
            const verifiedFields = document.querySelectorAll('.verification-field');
            verifiedFields.forEach(input => {
                updateUserData(input.dataset.key, input.value);
            });
            navigate(3);
        }
    }

    if (target.id === 'extract-btn') {
        const uploader = document.getElementById('doc-uploader');
        const spinner = document.getElementById('loading-spinner');
        const file = uploader.files[0];

        if (!file) {
            alert("Please select a file first!");
            return;
        }

        spinner.classList.remove('hidden');
        target.disabled = true;

        try {
            const extractedData = await mockApiCall(file);
            if (extractedData) {
                state.extractedData = extractedData;
                mainRender(2.5);
            } else {
                alert("Sorry, could not extract data from the document.");
            }
        } catch (error) {
            console.error("Extraction failed:", error);
            alert("An error occurred during extraction.");
        } finally {
            spinner.classList.add('hidden');
            target.disabled = false;
        }
    }
});

// Event listener for manual data entry updates
appContainer.addEventListener('change', (event) => {
    const key = event.target.dataset.key;
    if (key) {
        updateUserData(key, event.target.value);
        if (state.currentStep === 3) {
            mainRender(3);
        }
    }
});

// Initial Load
window.addEventListener('DOMContentLoaded', () => mainRender(1));