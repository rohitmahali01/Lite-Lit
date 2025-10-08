// Smart Tax Platform - Main Application

// Chatbot functions will be loaded dynamically
let toggleChatbot, handleChatInput, promptChatbot;

// Function to set chatbot functions from module loader
window.setGlobalChatbotFunctions = function(toggle, handleInput, prompt) {
    toggleChatbot = toggle;
    handleChatInput = handleInput;
    promptChatbot = prompt;
    console.log('Chatbot functions loaded successfully');
};

// Function to parse PDF using GEMINI backend
async function parsePDFWithBackend(file) {
    console.log('Parsing PDF with GEMINI backend...');
    
    // Check if file is selected
    if (!file) {
        alert('Please select a file first.');
        return;
    }
    
    // Show loading state
    const parseButton = document.querySelector('[data-action="parse-file"]');
    if (parseButton) {
        parseButton.innerHTML = '<span class="animate-spin">⏳</span> PARSING WITH GEMINI...';
        parseButton.disabled = true;
    }
    
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Send file to Python backend for parsing
        const response = await fetch('http://localhost:8080/parse', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        if (result.success && result.extracted_text) {
            // Store the extracted text from Gemini
            state.userData.extractedText = result.extracted_text;
            state.userData.isDataParsed = true; // Mark that parsing happened
            
            console.log('PDF parsing completed successfully!');
            console.log('Extracted Text:', result.extracted_text);
            console.log('Metadata:', result.metadata);
            
            alert(`✅ File "${file.name}" parsed successfully with Gemini!

The extracted text is now available in Step 3.
You can copy the values from the text box into the form fields.`);
            
            // Go directly to the data entry step
            state.currentStep = 3;
            renderApp();
        } else {
            throw new Error('Invalid response format from parser');
        }
        
    } catch (error) {
        console.error('Error parsing PDF:', error);
        
        // Show error message
        alert(`❌ Error parsing PDF: ${error.message}

Please ensure the Python PDF parser server is running on port 8080.

To start the server, run: python pdf_parser.py`);
        
        // Reset button
        if (parseButton) {
            parseButton.innerHTML = 'PARSE WITH AI';
            parseButton.disabled = false;
        }
    }
}
function renderApp() {
    const app = document.getElementById('app');
    if (!app) {
        console.error('App element not found');
        return;
    }
    app.innerHTML = renderStep(state.currentStep);
    attachEventListeners();
    
    // Show a notification if data was auto-filled
    if (state.userData.isDataParsed) {
        showDataFilledNotification();
    }
}

// Function to show notification that data was auto-filled
function showDataFilledNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-pulse';
    notification.innerHTML = `
        <div class="flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-semibold">✅ Gemini has extracted text from your document!</span>
        </div>
        <p class="text-sm mt-1">Review and edit the fields below as needed.</p>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function renderStep(step) {
    const { userData } = state;
    const t = window.translations[state.language];

    switch (step) {
        case 0: return renderStep0Intro(t);
        case 1: return renderStep1FileImport(t); // New Step 1: File Upload
        case 2: return renderStep2Landing(t); // Old Step 1: Landing
        case 3: return renderStep3DataGathering(userData, t); // Old Step 2: Data Gathering
        case 4: return renderStep4ValidationAndDeductions(userData, t); // Old Step 3: Validation
        case 5: return renderStep5Comparison(t); // Old Step 4: Comparison
        case 6: return renderStep6Transparency(); // Old Step 5: Transparency
        default: return '<h2 class="text-xl text-red-500">Error: Unknown Step</h2>';
    }
}

// --- New Step 0: Intro and Language Selection ---
function renderStep0Intro(t) {
    return `
        <div class="text-center py-20 step-card shadow-2xl shadow-blue-200/50">
            <h2 class="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">${t.welcome_title}</h2>
            <p class="text-xl text-gray-500 mb-12 font-light">${t.welcome_subtitle}</p>
            
            <div class="mb-8">
                <p class="text-lg font-semibold text-gray-700 mb-4">${t.select_language}</p>
                <div class="flex justify-center gap-4">
                    <button data-action="set-lang" data-lang="en" class="px-8 py-3 rounded-lg font-bold text-lg transition duration-200 ${state.language === 'en' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                        ${t.english}
                    </button>
                    <button data-action="set-lang" data-lang="hi" class="px-8 py-3 rounded-lg font-bold text-lg transition duration-200 ${state.language === 'hi' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                        ${t.hindi}
                    </button>
                </div>
            </div>

            <button data-action="goto" data-step="1" class="btn-primary text-white px-16 py-5 text-xl font-semibold rounded-full shadow-xl transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50">
                ${t.continue}
            </button>
        </div>`;
}

// --- New Step 1: File Upload for AI Parsing ---
function renderStep1FileImport(t) {
    return `
        <div class="text-center py-20 step-card shadow-2xl shadow-blue-200/50">
            <h2 class="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight uppercase">${t.step1_title}</h2>
            <p class="text-xl text-gray-500 mb-12 font-light">${t.step1_subtitle}</p>
            
            <div class="border-4 border-dashed border-blue-300 p-10 rounded-xl max-w-lg mx-auto bg-blue-50 hover:bg-blue-100 transition duration-200">
                <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                </div>
                <p class="text-2xl text-blue-800 mb-4">${t.step1_upload_instruction}</p>
                <input type="file" id="tax-file-upload" accept=".pdf,.jpg,.jpeg,.png" class="hidden">
                <button id="upload-button" class="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-xl transition duration-300 transform hover:scale-[1.02]">
                    ${t.step1_select_file_button}
                </button>
                <p class="text-sm text-gray-500 mt-4">${t.step1_supported_formats}</p>
                <div id="file-info" class="mt-4 hidden">
                    <p class="text-green-700 font-semibold">${t.step1_file_selected} <span id="file-name"></span></p>
                    <button data-action="parse-file" class="mt-3 bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-semibold">
                        ${t.step1_parse_button}
                    </button>
                </div>
            </div>

            <p class="text-lg text-gray-600 mt-12 mb-4 font-semibold">OR</p>
            <button data-action="goto" data-step="3" class="text-md text-emerald-600 hover:text-emerald-800 hover:underline font-bold transition duration-150">
                ${t.step1_skip_button}
            </button>
        </div>`;
}

// Renamed current renderStep1Landing to renderStep2Landing
function renderStep2Landing(t) {
    return `
        <div class="text-center py-20 step-card shadow-2xl shadow-emerald-200/50">
            <h2 class="text-6xl font-extrabold text-gray-900 mb-6 tracking-tight uppercase">${t.step2_title}</h2>
            <p class="text-2xl text-gray-500 mb-12 font-light">${state.userData.isDataParsed ? t.step2_subtitle_parsed : t.step2_subtitle_manual}</p>
            <button data-action="next" class="btn-primary text-white px-16 py-5 text-xl font-semibold rounded-full shadow-xl transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50">
                ${state.userData.isDataParsed ? t.step2_button_parsed : t.step2_button_manual}
            </button>
            <p class="text-sm text-gray-400 mt-10">Your data is encrypted and private. We make tax filing cool. 😎</p>
        </div>`;
}

function renderStep3DataGathering(userData, t) {
    const isDataParsed = userData.isDataParsed;
    const headerText = isDataParsed ? t.step3_header_parsed : t.step3_header_manual;
    const extractedTextBox = isDataParsed ? `
        <div class="mb-8 bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
            <h3 class="text-lg font-bold text-blue-800 mb-2">${t.step3_extracted_text_title}</h3>
            <p class="text-sm text-gray-600 mb-3">${t.step3_extracted_text_subtitle}</p>
            <textarea readonly class="w-full h-48 p-3 font-mono text-sm bg-white border border-gray-300 rounded-md">${userData.extractedText || 'No text extracted.'}</textarea>
        </div>
    ` : '';
    
    const headerNote = isDataParsed ? '<div class="bg-green-100 p-4 rounded-lg border border-green-300 mb-6"><p class="text-green-800 font-semibold flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Data has been extracted by Gemini. Please copy the values into the form below.</p></div>' : '';
    
    // We no longer auto-fill, so we can use the existing userData to pre-fill if the user goes back and forth.
    const getValue = (key) => userData[key] || '';
    
    return `
        <h2 class="text-4xl font-extrabold text-emerald-800 mb-8 pb-4 border-b border-emerald-200 uppercase">${headerText}</h2>
        ${headerNote}
        <div id="manual-entry-section" class="step-card p-6 md:p-8">
            ${extractedTextBox}
            <div class="space-y-7">
                <div class="space-y-1 w-full">
                    <label class="block text-base font-bold text-gray-800">${t.step3_gross_salary_label}</label>
                    <input type="number" data-key="grossSalary" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 118521" value="${getValue('grossSalary')}">
                    <p class="text-xs text-emerald-600 font-medium mt-1">${t.step3_gross_salary_hint}</p>
                </div>
                <div class="space-y-1 w-full">
                    <label class="block text-base font-bold text-gray-800">${t.step3_basic_salary_label}</label>
                    <input type="number" data-key="basicSalary" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 35833" value="${getValue('basicSalary')}">
                    <p class="text-xs text-gray-500 mt-1">The fixed, core part of your pay, as seen on your payslips or Form 16.</p>
                </div>
                <div class="space-y-1 w-full">
                    <label class="block text-base font-bold text-gray-800">${t.step3_hra_label}</label>
                    <input type="number" data-key="hraComponent" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 17917" value="${getValue('hraComponent')}">
                    <p class="text-xs text-gray-500 mt-1">The annual House Rent Allowance amount mentioned in your salary structure/Form 16.</p>
                </div>
                <div class="space-y-1 w-full">
                    <label class="block text-base font-bold text-gray-800">${t.step3_lta_label}</label>
                    <input type="number" data-key="leaveTravelAssistance" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 0" value="${getValue('leaveTravelAssistance')}">
                    <p class="text-xs text-gray-500 mt-1">Annual Leave Travel Assistance as per your salary slip.</p>
                </div>
                <div class="space-y-1 w-full">
                    <label class="block text-base font-bold text-gray-800">${t.step3_tds_label}</label>
                    <input type="number" data-key="tds_26as" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 2000" value="${getValue('tds_26as')}">
                    <p class="text-xs text-gray-500 mt-1">Total tax deducted as shown in your salary slip.</p>
                </div>
                <div class="space-y-1 w-full">
                    <label class="block text-base font-bold text-gray-800">${t.step3_medical_label}</label>
                    <input type="number" data-key="medicalAllowance" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 0" value="${getValue('medicalAllowance')}">
                    <p class="text-xs text-gray-500 mt-1">Annual medical allowance/reimbursement from your employer.</p>
                </div>
                <div class="space-y-1 w-full">
                    <label class="block text-base font-bold text-gray-800">${t.step3_flexi_label}</label>
                    <input type="number" data-key="flexiAllowance" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 0" value="${getValue('flexiAllowance')}">
                    <p class="text-xs text-gray-500 mt-1">Flexible allowance as per your salary structure.</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1 w-full">
                        <label class="block text-base font-bold text-gray-800">${t.step3_overtime_label}</label>
                        <input type="number" data-key="overtimeAmount" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 44654" value="${getValue('overtimeAmount')}">
                        <p class="text-xs text-gray-500 mt-1">Total overtime salary earned (not hours).</p>
                    </div>
                    <div class="space-y-1 w-full">
                        <label class="block text-base font-bold text-gray-800">${t.step3_transport_label}</label>
                        <input type="number" data-key="transportationAllowance" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 0" value="${getValue('transportationAllowance')}">
                        <p class="text-xs text-gray-500 mt-1">Transportation/conveyance allowance.</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1 w-full">
                        <label class="block text-base font-bold text-gray-800">${t.step3_city_type_label}</label>
                        <select data-key="isMetro" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm">
                            <option value="true" ${userData.isMetro === 'true' ? 'selected' : ''}>${t.step3_metro_option}</option>
                            <option value="false" ${userData.isMetro === 'false' ? 'selected' : ''}>${t.step3_non_metro_option}</option>
                        </select>
                        <p class="text-xs text-gray-500 mt-1">Affects HRA calculation.</p>
                    </div>
                    <div class="space-y-1 w-full">
                        <label class="block text-base font-bold text-gray-800">${t.step3_age_label}</label>
                        <input type="number" data-key="age" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 35" value="${getValue('age')}">
                        <p class="text-xs text-gray-500 mt-1">Your age for tax slab benefits.</p>
                    </div>
                </div>
                <div class="space-y-1 w-full">
                    <label class="block text-base font-bold text-gray-800">${t.step3_interest_label}</label>
                    <input type="number" data-key="interestIncome" class="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition duration-150 hover:shadow-sm" placeholder="e.g., 8500" value="${getValue('interestIncome')}">
                    <p class="text-xs text-gray-500 mt-1">Total interest earned on all Savings Accounts (Max ₹10,000 deduction via 80TTA).</p>
                </div>
            </div>
            <button data-action="save-and-next" class="mt-10 w-full btn-primary text-white p-4 rounded-xl font-semibold text-lg shadow-md transition duration-200 hover:shadow-xl transform hover:scale-[1.005]">
                ${t.step3_validate_button}
            </button>
        </div>`;
}

function renderStep4ValidationAndDeductions(userData, t) {
    calculateTaxes();
    return `
        <h2 class="text-4xl font-extrabold text-emerald-800 mb-8 pb-4 border-b border-emerald-200 uppercase">${t.step4_title}</h2>
        <div class="bg-emerald-100 p-6 rounded-xl border border-emerald-400 mb-10 shadow-lg">
            <p class="text-emerald-900 font-semibold flex items-center">
                <span class="w-6 h-6 mr-2">✓</span>
                ${t.step4_subtitle}
            </p>
        </div>
        <h3 class="font-bold text-2xl text-gray-700 mb-5 border-l-4 border-emerald-500 pl-3">${t.step4_explore_deductions}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button data-action="open-chat" data-prompt="hra" class="p-5 step-card border-2 border-emerald-100 rounded-xl text-left shadow-md hover:shadow-xl hover:border-emerald-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <span class="text-lg font-bold text-gray-800 block">${t.step4_hra_exemption}</span>
                <p class="text-sm text-gray-600 mt-1">${t.step4_hra_calculated} <strong class="text-emerald-700">₹${state.taxCalculation.old.detail.hraExemption.toLocaleString('en-IN')}</strong> (Old Regime).</p>
                <span class="mt-3 text-sm text-blue-600 font-bold hover:underline inline-block">${t.step4_learn_more}</span>
            </button>
            <button data-action="open-chat" data-prompt="80c" class="p-5 step-card border-2 border-emerald-100 rounded-xl text-left shadow-md hover:shadow-xl hover:border-emerald-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <span class="text-lg font-bold text-gray-800 block">${t.step4_80c_deduction}</span>
                <p class="text-sm text-gray-600 mt-1">${t.step4_80c_claimed} <strong class="text-emerald-700">₹${state.taxCalculation.old.detail.old_80c_deduction.toLocaleString('en-IN')}</strong> (Old Regime).</p>
                <span class="mt-3 text-sm text-blue-600 font-bold hover:underline inline-block">${t.step4_learn_more}</span>
            </button>
        </div>
        <button data-action="next" class="mt-10 w-full btn-primary text-white p-4 rounded-xl font-semibold text-lg shadow-md transition duration-200 hover:shadow-xl transform hover:scale-[1.005]">
            ${t.step4_review_button}
        </button>`;
}

function renderStep5Comparison(t) {
    const taxes = state.taxCalculation || calculateTaxes();
    const recommended = taxes.old.totalTax < taxes.new.totalTax ? 'Old' : 'New';
    const oldIsRecommended = recommended === 'Old';
    const newIsRecommended = recommended === 'New';

    return `
        <h2 class="text-4xl font-extrabold text-emerald-800 mb-8 pb-4 border-b border-emerald-200 uppercase">${t.step5_title}</h2>
        <div class="step-card p-8">
            <div class="text-center mb-10">
                <p class="text-2xl font-bold text-gray-700 tracking-wide">${t.step5_recommendation}</p>
                <h3 class="text-5xl font-extrabold ${oldIsRecommended ? 'text-blue-700' : 'text-emerald-700'} mt-2 p-3 bg-gray-50 inline-block rounded-xl shadow-inner animate-pulse">
                    ${recommended.toUpperCase()} ${t.step5_regime.toUpperCase()}
                </h3>
                <p class="text-base text-gray-600 mt-2">${t.step5_saving_you} <strong class="text-xl ${oldIsRecommended ? 'text-blue-800' : 'text-emerald-800'}">₹${Math.abs(taxes.old.totalTax - taxes.new.totalTax).toLocaleString('en-IN')}</strong> ${t.step5_compared_to}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div class="p-5 rounded-xl border-4 ${oldIsRecommended ? 'border-blue-500 bg-blue-50 shadow-2xl shadow-blue-200/50' : 'border-gray-200 bg-white shadow-lg'} transition duration-300 relative">
                    ${oldIsRecommended ? `<span class="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-xl tracking-wider">${t.step5_best_choice}</span>` : ''}
                    <p class="text-base font-semibold text-gray-600">${t.step5_old_regime_tax}</p>
                    <p class="text-3xl font-extrabold ${oldIsRecommended ? 'text-blue-700' : 'text-gray-900'} mt-1">₹ ${taxes.old.totalTax.toLocaleString('en-IN')}</p>
                    <p class="text-xs text-gray-500 mt-2">${t.step5_net_taxable_income} ₹${taxes.old.netTaxableIncome.toLocaleString('en-IN')}</p>
                </div>
                <div class="p-5 rounded-xl border-4 ${newIsRecommended ? 'border-emerald-500 bg-emerald-50 shadow-2xl shadow-emerald-200/50' : 'border-gray-200 bg-white shadow-lg'} transition duration-300 relative">
                    ${newIsRecommended ? `<span class="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-xl tracking-wider">${t.step5_best_choice}</span>` : ''}
                    <p class="text-base font-semibold text-gray-600">${t.step5_new_regime_tax}</p>
                    <p class="text-3xl font-extrabold ${newIsRecommended ? 'text-emerald-700' : 'text-gray-900'} mt-1">₹ ${taxes.new.totalTax.toLocaleString('en-IN')}</p>
                    <p class="text-xs text-gray-500 mt-2">${t.step5_net_taxable_income} ₹${taxes.new.netTaxableIncome.toLocaleString('en-IN')}</p>
                </div>
            </div>
            <div class="flex justify-between mt-10">
                <button data-action="goto" data-step="6" class="text-lg text-blue-600 hover:text-blue-800 hover:underline font-bold p-2 transition duration-150">${t.step5_breakdown_button}</button>
                <button data-action="goto" data-step="1" class="btn-primary text-white p-3 rounded-xl font-semibold w-56 text-lg shadow-lg transition duration-200 hover:shadow-xl transform hover:scale-[1.005]">
                    ${t.step5_start_over_button}
                </button>
            </div>
        </div>`;
}

function renderStep6Transparency() {
    const taxes = state.taxCalculation || calculateTaxes();
    const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

    const generateTable = (regime, data) => `
        <h3 class="text-xl font-bold text-gray-800 mb-4 ${regime === 'Old' ? 'text-blue-700' : 'text-emerald-700'}">${regime} Regime DETAILS</h3>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 shadow-xl rounded-xl overflow-hidden">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Item</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr><td class="px-6 py-3 whitespace-nowrap font-medium">Gross Salary + Other Income</td><td class="px-6 py-3 whitespace-nowrap text-right">${formatter.format(data.grossTotalIncome).replace('₹', '')}</td></tr>
                    <tr><td class="px-6 py-3 whitespace-nowrap font-medium text-red-700">Total Deductions Applied</td><td class="px-6 py-3 whitespace-nowrap text-right text-red-700">- ${formatter.format(data.deductions).replace('₹', '')}</td></tr>
                    <tr><td class="px-6 py-3 whitespace-nowrap font-semibold">Net Taxable Income</td><td class="px-6 py-3 whitespace-nowrap text-right font-semibold">${formatter.format(data.netTaxableIncome).replace('₹', '')}</td></tr>
                    <tr><td class="px-6 py-3 whitespace-nowrap">Tax Calculated (Before Rebate)</td><td class="px-6 py-3 whitespace-nowrap text-right">${formatter.format(data.taxBeforeRebate).replace('₹', '')}</td></tr>
                    <tr><td class="px-6 py-3 whitespace-nowrap text-blue-600">Rebate U/S 87A</td><td class="px-6 py-3 whitespace-nowrap text-right text-blue-600">- ${formatter.format(data.rebate).replace('₹', '')}</td></tr>
                    <tr class="bg-emerald-200 border-t-4 border-emerald-600 hover:bg-emerald-300 transition duration-150"><td class="px-6 py-4 whitespace-nowrap font-black text-lg text-emerald-900 uppercase">TOTAL TAX LIABILITY</td><td class="px-6 py-4 whitespace-nowrap text-right font-black text-2xl text-emerald-900">${formatter.format(data.totalTax).replace('₹', '')}</td></tr>
                </tbody>
            </table>
        </div>
    `;

    return `
        <h2 class="text-4xl font-extrabold text-emerald-800 mb-8 pb-4 border-b border-emerald-200 uppercase">STEP 6: COMPLETE TAX CALCULATION BREAKDOWN</h2>
        <div class="step-card p-6 space-y-10">
            <p class="text-gray-600">This detailed breakdown shows how your tax liability was determined under both schemes. All calculations use the latest FY 2024-25 slabs.</p>
            ${generateTable('Old', taxes.old)}
            ${generateTable('New', taxes.new)}
        </div>
        <button data-action="goto" data-step="1" class="mt-10 w-full btn-primary text-white p-4 rounded-xl font-semibold text-lg shadow-md transition duration-200 hover:shadow-xl transform hover:scale-[1.005]">
            FINISH REVIEW & START NEW RETURN
        </button>`;
}

// Event handlers
function handleNavigation(event) {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    let targetStep = parseInt(target.dataset.step);

    // Handle Language Selection
    if (action === 'set-lang') {
        const lang = target.dataset.lang;
        if (lang && state.language !== lang) {
            state.language = lang;
            renderApp();
        }
        return;
    }

    // Handle File Parsing Action
    if (action === 'parse-file') {
        // Parse PDF using PyMuPDF backend
        parsePDFWithBackend(window.selectedFile);
        return; 
    }

    // Handle chatbot actions
    if (action === 'open-chat') {
        const toggleFunc = window.toggleChatbot || toggleChatbot;
        if (toggleFunc) {
            toggleFunc();
        }
        const prompt = target.dataset.prompt;
        if (prompt) {
            const promptFunc = window.promptChatbot || promptChatbot;
            if (promptFunc) {
                setTimeout(() => promptFunc(prompt), 100);
            }
        }
        return;
    }
    
    if (action === 'close-chat') {
        const toggleFunc = window.toggleChatbot || toggleChatbot;
        if (toggleFunc) {
            toggleFunc();
        }
        return;
    }

    // Handle Navigation Actions
    if (action === 'next') {
        if (state.currentStep >= 6) {
            state.currentStep = 1; // Loop back to the new Step 1
        } else {
            state.currentStep += 1;
        }
    } else if (action === 'goto' && targetStep) {
        state.currentStep = targetStep;
    } else if (action === 'save-and-next') {
        const inputs = document.querySelectorAll('#manual-entry-section input, #manual-entry-section select');
        inputs.forEach(input => {
            const key = input.dataset.key;
            if (input.type === 'number') {
                state.userData[key] = parseFloat(input.value) || 0;
            } else {
                state.userData[key] = input.value;
            }
        });
        calculateTaxes();
        state.currentStep = 4; // Move to the new Step 4
    }
    renderApp();
}

function attachEventListeners() {
    const app = document.getElementById('app');
    if (app) {
        app.onclick = handleNavigation;
    }
    
    // Chatbot event listeners
    const chatWidget = document.getElementById('chatbot-widget');
    if (chatWidget) {
        chatWidget.onclick = handleNavigation;
    }
    
    // Chat input handler
    const chatInput = document.getElementById('chatbot-input');
    if (chatInput) {
        chatInput.onkeydown = function(event) {
            if (event.key === 'Enter') {
                // Use global functions if available
                const handleInputFunc = window.handleChatInput || handleChatInput;
                if (handleInputFunc) {
                    handleInputFunc(renderApp);
                }
            }
        };
    }
    
    // File upload handlers
    setupFileUploadHandlers();
}

// File upload functionality
function setupFileUploadHandlers() {
    // Handle upload button click
    const uploadButton = document.getElementById('upload-button');
    if (uploadButton) {
        uploadButton.onclick = function() {
            const fileInput = document.getElementById('tax-file-upload');
            if (fileInput) {
                fileInput.click();
            }
        };
    }
    
    // Handle file selection
    const fileInput = document.getElementById('tax-file-upload');
    if (fileInput) {
        fileInput.onchange = function(event) {
            const file = event.target.files[0];
            if (file) {
                handleFileSelection(file);
            }
        };
    }
    
    // Handle drag and drop
    const dropArea = document.querySelector('.border-dashed');
    if (dropArea) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        // Handle dropped files
        dropArea.addEventListener('drop', handleDrop, false);
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    const dropArea = e.currentTarget;
    dropArea.classList.add('bg-blue-200', 'border-blue-500');
}

function unhighlight(e) {
    const dropArea = e.currentTarget;
    dropArea.classList.remove('bg-blue-200', 'border-blue-500');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
}

function handleFileSelection(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, JPG, or PNG file.');
        return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        alert('File size must be less than 10MB.');
        return;
    }
    
    // Show file info
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    
    if (fileInfo && fileName) {
        fileName.textContent = file.name;
        fileInfo.classList.remove('hidden');
    }
    
    // Store file for processing
    window.selectedFile = file;
    
    console.log('File selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
}

// Initialize the application
function initializeApp() {
    try {
        calculateTaxes();
        renderApp();
        console.log('Smart Tax Platform initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = '<div class="text-center p-8"><h2 class="text-2xl text-red-600">Error loading application</h2><p class="text-gray-600 mt-2">Please refresh the page and try again.</p></div>';
        }
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
