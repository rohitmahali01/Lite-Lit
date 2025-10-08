// API Configuration File
// Replace 'YOUR_API_KEY_HERE' with your actual Gemini API key

const API_CONFIG = {
    // Your Gemini API Key - Get it from https://makersuite.google.com/app/apikey
    // IMPORTANT: Replace the placeholder below with your actual API key
    GEMINI_API_KEY: '',  // ← Put your real API key here
    
    // API Settings - Using Gemini 2.5 Flash model
    API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-exp:generateContent',
    
    // Generation Configuration
    GENERATION_CONFIG: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
    },
    
    // Safety Settings
    SAFETY_SETTINGS: [
        {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
    ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
}
