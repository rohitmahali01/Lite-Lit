// js/translations.js

const translations = {
    en: {
        // Step 0: Intro
        welcome_title: "Welcome to the Smart Tax Platform",
        welcome_subtitle: "Your intelligent assistant for easy and accurate tax filing in India.",
        select_language: "Select Your Language",
        english: "English",
        hindi: "Hindi",
        continue: "Continue",

        // Step 1: File Upload
        step1_title: "Upload Your <span class=\"text-blue-700\">Tax Document (Form 16/26AS)</span>",
        step1_subtitle: "Let our Smart AI (powered by Gemini) auto-fill all your data fields instantly.",
        step1_upload_instruction: "Click to Upload or Drag & Drop",
        step1_select_file_button: "SELECT FILE FOR AI PARSING",
        step1_supported_formats: "Supported formats: PDF, JPG, PNG (Max 10MB)",
        step1_file_selected: "File selected:",
        step1_parse_button: "PARSE WITH AI",
        step1_skip_button: "SKIP UPLOAD AND START MANUAL DATA ENTRY (Step 3)",

        // Step 2: Landing
        step2_title: "Data Ready! <span class=\"text-emerald-700\">Proceed to Review</span>",
        step2_subtitle_parsed: "Your data has been successfully parsed by the AI. Review and edit in the next step.",
        step2_subtitle_manual: "File your taxes the effortless way with accurate and transparent calculations.",
        step2_button_parsed: "REVIEW PARSED DATA (STEP 3)",
        step2_button_manual: "CALCULATE & FILE YOUR TAXES FOR FREE",

        // Step 3: Data Gathering
        step3_header_parsed: "STEP 3: ENTER DATA FROM GEMINI EXTRACTION",
        step3_header_manual: "STEP 3: PROVIDE YOUR INCOME DETAILS",
        step3_extracted_text_title: "📄 Extracted Text from Gemini",
        step3_extracted_text_subtitle: "Copy the values from this box and paste them into the corresponding fields below.",
        step3_gross_salary_label: "Your Total Gross Annual Income (Form 16)",
        step3_gross_salary_hint: "Hint: Enter the total 'Salary as per Section 17(1)' from your Form 16 (Part B).",
        step3_basic_salary_label: "Basic Salary Component",
        step3_hra_label: "House Rent Allowance (HRA) Amount",
        step3_lta_label: "Leave Travel Assistance",
        step3_tds_label: "Total Tax Deducted (TDS)",
        step3_medical_label: "Medical Allowance",
        step3_flexi_label: "Flexi Allowance",
        step3_overtime_label: "Overtime Salary Amount",
        step3_transport_label: "Transportation Allowance",
        step3_city_type_label: "Your City Type (Metro or Non-Metro)",
        step3_metro_option: "Metro (Delhi, Mumbai, Kolkata, Chennai)",
        step3_non_metro_option: "Non-Metro (All other cities)",
        step3_age_label: "Your Current Age",
        step3_interest_label: "Interest from Savings Accounts (80TTA)",
        step3_validate_button: "VALIDATE DATA & FIND SAVINGS",

        // Step 4: Validation
        step4_title: "STEP 4: VALIDATION & SAVINGS",
        step4_subtitle: "Data Ready for Review. Click the links below to check your deductions and potential savings!",
        step4_explore_deductions: "Explore Key Deductions",
        step4_hra_exemption: "HRA Exemption (House Rent Allowance)",
        step4_hra_calculated: "Calculated Exemption:",
        step4_80c_deduction: "Section 80C Deduction",
        step4_80c_claimed: "Claimed:",
        step4_learn_more: "Learn More",
        step4_review_button: "REVIEW AND COMPARE TAX REGIMES",

        // Step 5: Comparison
        step5_title: "STEP 5: TAX REGIME COMPARISON",
        step5_recommendation: "OUR RECOMMENDATION:",
        step5_regime: "REGIME",
        step5_saving_you: "Saving you",
        step5_compared_to: "compared to the alternative.",
        step5_old_regime_tax: "Old Regime Tax",
        step5_new_regime_tax: "New Regime Tax",
        step5_net_taxable_income: "Net Taxable Income:",
        step5_best_choice: "BEST CHOICE",
        step5_breakdown_button: "🔍 SEE FULL BREAKDOWN",
        step5_start_over_button: "COMPLETE FILING & START OVER",

        // Step 6: Transparency (omitted for brevity, will be added if requested)

        // General
        tax_assistant_title: "Tax Assistant",
        ask_a_question: "Ask a question...",
        thinking: "Thinking...",
        chatbot_hello: "Hello! I'm your tax assistant. How can I help you with your tax questions today?",
        chatbot_set_api_key: "Hello! I'm your tax assistant powered by Gemini AI. Please set your API key in config/api-config.js file or enter it below:",
        chatbot_enter_api_key: "Enter your Gemini API key",
        chatbot_save_key: "Save Key",
        chatbot_key_saved: "API key saved successfully! You can now ask me any questions.",
    },
    hi: {
        // Step 0: Intro
        welcome_title: "स्मार्ट टैक्स प्लेटफॉर्म में आपका स्वागत है",
        welcome_subtitle: "भारत में आसान और सटीक टैक्स फाइलिंग के लिए आपका बुद्धिमान सहायक।",
        select_language: "अपनी भाषा चुनें",
        english: "अंग्रेज़ी",
        hindi: "हिन्दी",
        continue: "जारी रखें",

        // Step 1: File Upload
        step1_title: "अपना <span class=\"text-blue-700\">कर दस्तावेज़ (फॉर्म 16/26AS)</span> अपलोड करें",
        step1_subtitle: "हमारे स्मार्ट एआई (जेमिनी द्वारा संचालित) को आपके सभी डेटा फ़ील्ड को तुरंत भरने दें।",
        step1_upload_instruction: "अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें",
        step1_select_file_button: "एआई पार्सिंग के लिए फ़ाइल चुनें",
        step1_supported_formats: "समर्थित प्रारूप: PDF, JPG, PNG (अधिकतम 10MB)",
        step1_file_selected: "फ़ाइल चयनित:",
        step1_parse_button: "एआई के साथ पार्स करें",
        step1_skip_button: "अपलोड छोड़ें और मैन्युअल डेटा प्रविष्टि शुरू करें (चरण 3)",

        // Step 2: Landing
        step2_title: "डेटा तैयार! <span class=\"text-emerald-700\">समीक्षा के लिए आगे बढ़ें</span>",
        step2_subtitle_parsed: "आपका डेटा एआई द्वारा सफलतापूर्वक पार्स कर लिया गया है। अगले चरण में समीक्षा और संपादन करें।",
        step2_subtitle_manual: "सटीक और पारदर्शी गणनाओं के साथ सहज तरीके से अपना टैक्स दाखिल करें।",
        step2_button_parsed: "पार्स किए गए डेटा की समीक्षा करें (चरण 3)",
        step2_button_manual: "मुफ्त में अपने कर की गणना करें और दाखिल करें",

        // Step 3: Data Gathering
        step3_header_parsed: "चरण 3: जेमिनी से निकाले गए डेटा दर्ज करें",
        step3_header_manual: "चरण 3: अपनी आय का विवरण प्रदान करें",
        step3_extracted_text_title: "📄 जेमिनी से निकाला गया पाठ",
        step3_extracted_text_subtitle: "इस बॉक्स से मानों को कॉपी करें और उन्हें नीचे दिए गए संबंधित फ़ील्ड में पेस्ट करें।",
        step3_gross_salary_label: "आपकी कुल सकल वार्षिक आय (फॉर्म 16)",
        step3_gross_salary_hint: "संकेत: अपने फॉर्म 16 (भाग बी) से कुल 'धारा 17(1) के अनुसार वेतन' दर्ज करें।",
        step3_basic_salary_label: "मूल वेतन घटक",
        step3_hra_label: "मकान किराया भत्ता (HRA) राशि",
        step3_lta_label: "छुट्टी यात्रा सहायता",
        step3_tds_label: "कुल कर कटौती (TDS)",
        step3_medical_label: "चिकित्सा भत्ता",
        step3_flexi_label: "फ्लेक्सी भत्ता",
        step3_overtime_label: "ओवरटाइम वेतन राशि",
        step3_transport_label: "परिवहन भत्ता",
        step3_city_type_label: "आपके शहर का प्रकार (मेट्रो या गैर-मेट्रो)",
        step3_metro_option: "मेट्रो (दिल्ली, मुंबई, कोलकाता, चेन्नई)",
        step3_non_metro_option: "गैर-मेट्रो (अन्य सभी शहर)",
        step3_age_label: "आपकी वर्तमान आयु",
        step3_interest_label: "बचत खातों से ब्याज (80TTA)",
        step3_validate_button: "डेटा सत्यापित करें और बचत खोजें",

        // Step 4: Validation
        step4_title: "चरण 4: सत्यापन और बचत",
        step4_subtitle: "डेटा समीक्षा के लिए तैयार है। अपनी कटौतियों और संभावित बचतों की जांच के लिए नीचे दिए गए लिंक पर क्लिक करें!",
        step4_explore_deductions: "प्रमुख कटौतियों का अन्वेषण करें",
        step4_hra_exemption: "एचआरए छूट (मकान किराया भत्ता)",
        step4_hra_calculated: "गणना की गई छूट:",
        step4_80c_deduction: "धारा 80सी कटौती",
        step4_80c_claimed: "दावा किया गया:",
        step4_learn_more: "और जानें",
        step4_review_button: "कर व्यवस्थाओं की समीक्षा और तुलना करें",

        // Step 5: Comparison
        step5_title: "चरण 5: कर व्यवस्था की तुलना",
        step5_recommendation: "हमारी सिफारिश:",
        step5_regime: "व्यवस्था",
        step5_saving_you: "आपकी बचत",
        step5_compared_to: "विकल्प की तुलना में।",
        step5_old_regime_tax: "पुरानी व्यवस्था कर",
        step5_new_regime_tax: "नई व्यवस्था कर",
        step5_net_taxable_income: "शुद्ध कर योग्य आय:",
        step5_best_choice: "सबसे अच्छा विकल्प",
        step5_breakdown_button: "🔍 पूरा विवरण देखें",
        step5_start_over_button: "फाइलिंग पूरी करें और फिर से शुरू करें",

        // Step 6: Transparency (omitted for brevity, will be added if requested)
        // General
        tax_assistant_title: "कर सहायक",
        ask_a_question: "एक सवाल पूछो...",
        thinking: "सोच रहा है...",
        chatbot_hello: "नमस्ते! मैं आपका कर सहायक हूँ। मैं आज आपके कर संबंधी प्रश्नों में कैसे मदद कर सकता हूँ?",
        chatbot_set_api_key: "नमस्ते! मैं जेमिनी एआई द्वारा संचालित आपका कर सहायक हूँ। कृपया अपनी एपीआई कुंजी config/api-config.js फ़ाइल में सेट करें या नीचे दर्ज करें:",
        chatbot_enter_api_key: "अपनी जेमिनी एपीआई कुंजी दर्ज करें",
        chatbot_save_key: "कुंजी सहेजें",
        chatbot_key_saved: "एपीआई कुंजी सफलतापूर्वक सहेजी गई! अब आप मुझसे कोई भी प्रश्न पूछ सकते हैं।",
    }
};

if (typeof window !== 'undefined') {
    window.translations = translations;
}
