// js/uiRenderer.js
import { state } from './state.js';
import { calculateTaxes } from './taxCalculator.js';

export function renderStep(step) {
    const { userData, extractedData } = state;

    switch (step) {
        case 1: return renderStep1Landing();
        case 2: return renderStep2DataGathering(userData);
        case 2.5: return renderStep2_5_Verification(extractedData);
        case 3: return renderStep3ValidationAndDeductions(userData);
        case 4: return renderStep4Comparison();
        case 5: return renderStep5Transparency();
        case 6: return renderStep6Filing(userData);
        default: return `<h2 class="text-xl text-red-500">Error: Unknown Step</h2>`;
    }
}

// FULLY IMPLEMENTED FUNCTIONS START HERE

function renderStep1Landing() {
    return `
        <div class="text-center py-16">
            <h2 class="text-5xl font-extrabold text-gray-900 mb-4">
                Welcome to the <span class="text-emerald-500">Smart Tax Platform</span>
            </h2>
            <p class="text-xl text-gray-600 mb-10">
                File your taxes the effortless way with accurate calculations.
            </p>
            <button data-action="next"
                    class="btn-primary px-12 py-4 text-xl font-bold rounded-full text-white shadow-lg shadow-emerald-200/50">
                Calculate & File Your Taxes for Free
            </button>
            <p class="text-sm text-gray-400 mt-8">Your data is encrypted and private.</p>
        </div>
    `;
}

function renderStep2DataGathering(userData) {
     return `
        <h2 class="text-3xl font-bold text-gray-800 mb-6">Step 2: Provide Your Income Details</h2>
        
        <div class="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-6 text-center">
            <h3 class="text-xl font-bold text-blue-800 mb-3">Automate with AI âœ¨</h3>
            <p class="text-sm text-gray-600 mb-4">Upload your Form 16 or salary slip (PDF/Image) to automatically fill the form.</p>
            <input type="file" id="doc-uploader" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" accept=".pdf,.png,.jpg,.jpeg"/>
            <button id="extract-btn" class="mt-4 w-full md:w-auto btn-primary p-3 rounded-lg font-bold bg-blue-500 hover:bg-blue-600">
                Extract & Fill Form
            </button>
            <div id="loading-spinner" class="hidden mt-4">
                <p class="text-sm text-gray-600 animate-pulse">ðŸ¤– Analyzing document, please wait...</p>
            </div>
        </div>

        <div class="my-6 text-center text-gray-400 font-bold">OR</div>
        
        <div id="manual-entry-section">
            <h3 class="font-bold text-lg text-gray-700 mb-4">Enter Details Manually</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div><label class="block text-sm font-medium text-gray-700 mb-1">Gross Annual Salary</label><input type="number" data-key="grossSalary" class="input-field w-full" value="${userData.grossSalary}"></div>
                 <div><label class="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label><input type="number" data-key="basicSalary" class="input-field w-full" value="${userData.basicSalary}"></div>
                 <div><label class="block text-sm font-medium text-gray-700 mb-1">HRA Component</label><input type="number" data-key="hraComponent" class="input-field w-full" value="${userData.hraComponent}"></div>
                 <div><label class="block text-sm font-medium text-gray-700 mb-1">TDS (Form 16)</label><input type="number" data-key="tds_form16" class="input-field w-full" value="${userData.tds_form16}"></div>
                 <div><label class="block text-sm font-medium text-gray-700 mb-1">EPF Contribution (80C)</label><input type="number" data-key="basic80c" class="input-field w-full" value="${userData.basic80c}"></div>
                 <div><label class="block text-sm font-medium text-gray-700 mb-1">Professional Tax Paid</label><input type="number" data-key="professionalTax" class="input-field w-full" value="${userData.professionalTax}"></div>
            </div>
            <button data-action="next" class="mt-8 w-full btn-primary p-3 rounded-lg font-bold">Validate Data & Find Savings</button>
        </div>`;
}

function renderStep2_5_Verification(extractedData) {
    if (!extractedData) {
        return `<h2 class="text-xl text-red-500">Error: No extracted data found.</h2>`;
    }

    const fieldsHTML = Object.entries(extractedData)
        .filter(([key]) => key !== 'isEstimated')
        .map(([key, value]) => {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
                    <input type="number" data-key="${key}" class="input-field w-full verification-field" value="${value || ''}">
                </div>
            `;
        }).join('');

    const estimationWarning = extractedData.isEstimated ? `
        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-r-lg" role="alert">
            <p class="font-bold">âš ï¸ Data is Estimated</p>
            <p>These figures were estimated from a salary slip. Please carefully verify them, especially if you had bonuses or salary changes during the year.</p>
        </div>` : `
        <div class="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded-r-lg" role="alert">
            <p class="font-bold">âœ… Data Extracted from Form 16</p>
            <p>These figures were extracted from your annual Form 16. Please review for accuracy.</p>
        </div>`;

    return `
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Step 2: Please Verify Extracted Data</h2>
        <p class="text-gray-600 mb-6">AI has extracted the following details. Please review and correct any values before continuing.</p>
        
        ${estimationWarning}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            ${fieldsHTML}
        </div>
        
        <div class="flex flex-col md:flex-row gap-4">
            <button data-action="confirm-extraction" class="w-full md:w-2/3 btn-primary p-3 rounded-lg font-bold">Confirm & Continue to Deductions</button>
            <button data-action="goto" data-step="2" class="w-full md:w-1/3 bg-gray-200 text-gray-800 p-3 rounded-lg font-bold hover:bg-gray-300">Enter Manually Instead</button>
        </div>
    `;
}

function renderStep3ValidationAndDeductions(userData) {
    let tdsReconciliationHTML = (userData.tds_form16 !== userData.tds_26as) ? `
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
            <p class="font-bold">ðŸš¨ Critical TDS Mismatch</p>
            <p>TDS in Form 16 (â‚¹${userData.tds_form16.toLocaleString()}) does not match Form 26AS (â‚¹${userData.tds_26as.toLocaleString()}). We will use the Form 26AS amount as per law.</p>
        </div>` : `
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-lg" role="alert">
            <p class="font-bold">âœ… TDS Credit Matched Successfully!</p>
        </div>`;

    const total80C = Math.min(150000, userData.basic80c + userData.licPremium);
    const remaining80C = Math.max(0, 150000 - total80C);

    return `
        <h2 class="text-3xl font-bold text-gray-800 mb-6">Step 3: Validation & Savings</h2>
        ${tdsReconciliationHTML}
        <div class="bg-green-50 p-5 rounded-xl border border-green-300 mb-8">
            <h3 class="font-bold text-xl text-green-700 mb-3">Section 80C Utilization</h3>
            <div class="flex justify-between items-center mb-3">
                <p class="text-sm text-gray-600">Utilized: <span class="font-bold">â‚¹${total80C.toLocaleString('en-IN')}</span> / â‚¹1,50,000</p>
                <p class="text-sm text-red-500 font-bold">Remaining: â‚¹${remaining80C.toLocaleString('en-IN')}</p>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div class="bg-green-500 h-3 rounded-full" style="width: ${(total80C / 150000) * 100}%"></div>
            </div>
        </div>
        <button data-action="next" class="mt-8 w-full btn-primary p-3 rounded-lg font-bold">
            Review and Compare Tax Regimes
        </button>
    `;
}

function renderStep4Comparison() {
    const taxes = calculateTaxes();
    const recommended = taxes.old.totalTax < taxes.new.totalTax ? 'Old' : 'New';
    const savings = Math.abs(taxes.old.totalTax - taxes.new.totalTax).toLocaleString('en-IN');
    return `
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Step 4: Tax Regime Comparison</h2>
        <div class="bg-emerald-100 p-5 rounded-xl border border-emerald-400 mb-10 text-center">
            <h3 class="text-xl font-extrabold text-emerald-700">âœ… The <span class="text-2xl">${recommended} Regime</span> is more beneficial!</h3>
            <p class="text-sm text-emerald-600 mt-1">Choosing this option saves you â‚¹${savings}.</p>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left bg-white border rounded-xl overflow-hidden">
                <thead class="bg-gray-50">
                    <tr class="text-gray-600">
                        <th class="p-4">Feature</th>
                        <th class="p-4 text-center">Old Tax Regime</th>
                        <th class="p-4 text-center">New Tax Regime</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-t"><td class="p-4 font-semibold">Taxable Income</td><td class="p-4 text-center">â‚¹${taxes.old.taxableIncome.toLocaleString('en-IN')}</td><td class="p-4 text-center">â‚¹${taxes.new.taxableIncome.toLocaleString('en-IN')}</td></tr>
                    <tr class="bg-emerald-50 border-t"><td class="p-4 font-extrabold text-emerald-700">Final Tax Payable</td><td class="p-4 text-center font-extrabold ${recommended === 'Old' ? 'text-emerald-700' : 'text-gray-700'}">â‚¹${taxes.old.totalTax.toLocaleString('en-IN')}</td><td class="p-4 text-center font-extrabold ${recommended === 'New' ? 'text-emerald-700' : 'text-gray-700'}">â‚¹${taxes.new.totalTax.toLocaleString('en-IN')}</td></tr>
                </tbody>
            </table>
        </div>
        <div class="flex justify-between mt-6">
            <button data-action="goto" data-step="5" class="text-blue-600 hover:underline font-medium">See Full Calculation Breakdown</button>
            <button data-action="goto" data-step="6" class="btn-primary p-3 rounded-lg font-bold w-48">Proceed to File</button>
        </div>
    `;
}

function renderStep5Transparency() {
    const taxes = calculateTaxes();
    const recommended = taxes.old.totalTax < taxes.new.totalTax ? 'old' : 'new';
    const selectedRegime = taxes[recommended];
    const finalStatus = (selectedRegime.totalTax - taxes.tdsCredit) < 0 ? 'Refund Due:' : 'Balance Payable:';
    const finalAmount = Math.abs(selectedRegime.totalTax - taxes.tdsCredit).toLocaleString('en-IN');
    return `
        <h2 class="text-3xl font-bold text-gray-800 mb-6">Step 5: Complete Tax Calculation Breakdown</h2>
        <div class="bg-blue-50 p-6 rounded-xl mb-6">
            <h3 class="text-xl font-bold text-blue-800 mb-4">Income Components</h3>
            <div class="space-y-2">
                <div class="flex justify-between"><span>Gross Total Income:</span><span class="font-bold">â‚¹${selectedRegime.grossTotalIncome.toLocaleString('en-IN')}</span></div>
            </div>
        </div>
         <div class="bg-purple-50 p-6 rounded-xl mb-6">
            <h3 class="text-xl font-bold text-purple-800 mb-4">Tax Calculation</h3>
            <div class="space-y-2">
                 <div class="flex justify-between border-t pt-2"><span class="font-bold text-lg">${finalStatus}</span><span class="font-bold text-lg">${finalAmount}</span></div>
            </div>
        </div>
        <button data-action="next" class="w-full btn-primary p-3 rounded-lg font-bold">Proceed to File ITR</button>
    `;
}

function renderStep6Filing(userData) {
    return `
        <div class="text-center py-16">
            <div class="mb-8">
                <svg class="mx-auto h-24 w-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 class="text-4xl font-extrabold text-gray-900 mb-4">ITR Filed Successfully! ðŸŽ‰</h2>
            <p class="text-xl text-gray-600 mb-6">Your acknowledgement number: <span class="font-bold text-blue-600">${userData.itrAckNumber}</span></p>
            <button data-action="goto" data-step="1" class="btn-primary px-8 py-3 rounded-lg font-bold">File Another Return</button>
        </div>
    `;
}