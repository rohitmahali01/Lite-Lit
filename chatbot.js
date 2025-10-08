// js/chatbot.js

// Access global state and updateUserData function
const getState = () => window.state;
const getUpdateUserData = () => window.updateUserData;

// Gemini API key storage
// API key will be loaded from config/api-config.js
let geminiApiKey = '';
let geminiInitialized = false;

// Load API key from config
function loadApiConfig() {
    if (typeof window !== 'undefined' && window.API_CONFIG) {
        geminiApiKey = window.API_CONFIG.GEMINI_API_KEY;
    }
}

// Initialize API config when module loads
setTimeout(loadApiConfig, 100);

export function toggleChatbot() {
    const popup = document.getElementById('chatbot-popup');
    const state = getState();
    if (!state) return;
    
    state.chatContext = state.chatContext || { isChatOpen: false, messageCount: 0, awaitingInput: null };
    state.chatContext.isChatOpen = !state.chatContext.isChatOpen;
    popup.style.display = state.chatContext.isChatOpen ? 'flex' : 'none';
    
    if (state.chatContext.isChatOpen && state.chatContext.messageCount === 0) {
        // Clear existing messages
        const messagesDiv = document.getElementById('chatbot-messages');
        messagesDiv.innerHTML = '';
        
        const t = window.translations[state.language];
        // Check if we need to ask for API key (only if not configured)
        if (!geminiApiKey && window.API_CONFIG) {
            geminiApiKey = window.API_CONFIG.GEMINI_API_KEY;
        }
        
        if (!geminiApiKey || geminiApiKey === 'YOUR_API_KEY_HERE') {
            addAssistantMessage(t.chatbot_set_api_key);
            addApiKeyInput();
        } else {
            addAssistantMessage(t.chatbot_hello);
        }
        state.chatContext.messageCount++;
    }
}

function addApiKeyInput() {
    const messagesDiv = document.getElementById('chatbot-messages');
    const t = window.translations[getState().language];
    const inputDiv = document.createElement('div');
    inputDiv.className = 'chat-api-key-input';
    inputDiv.innerHTML = `
        <input type="password" id="gemini-api-key" placeholder="${t.chatbot_enter_api_key}" class="input-field w-full mb-2 p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500">
        <button id="save-api-key" class="w-full p-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 text-sm">${t.chatbot_save_key}</button>
    `;
    messagesDiv.appendChild(inputDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Add event listener for saving the API key
    setTimeout(() => {
        const saveButton = document.getElementById('save-api-key');
        if (saveButton) {
            saveButton.addEventListener('click', saveApiKey);
        }
    }, 100);
}

function saveApiKey() {
    const keyInput = document.getElementById('gemini-api-key');
    const key = keyInput.value.trim();
    const t = window.translations[getState().language];
    
    if (key) {
        geminiApiKey = key;
        localStorage.setItem('geminiApiKey', key);
        addAssistantMessage(t.chatbot_key_saved);
        
        // Remove the input field
        const inputDiv = document.querySelector('.chat-api-key-input');
        if (inputDiv) inputDiv.remove();
    } else {
        addAssistantMessage("Please enter a valid API key.");
    }
}

export function promptChatbot(deductionKey) {
    const state = getState();
    if (!state) return;
    
    if (!state.chatContext.isChatOpen) {
        toggleChatbot();
    }
    
    const messages = {
        'hra': "To claim HRA, please provide your annual rent paid.",
        'lic': "How much LIC premium do you pay annually?",
        'health': "How much Health Insurance premium did you pay for self/family?",
        'nps': "How much did you contribute to NPS for the extra 80CCD(1B) deduction?"
    };
    
    if (messages[deductionKey]) {
        addAssistantMessage(messages[deductionKey]);
        state.chatContext.awaitingInput = deductionKey;
    }
}

// Function to call Gemini API
async function callGeminiAPI(prompt) {
    // Ensure API config is loaded
    if (!geminiApiKey && window.API_CONFIG) {
        geminiApiKey = window.API_CONFIG.GEMINI_API_KEY;
    }
    
    if (!geminiApiKey || geminiApiKey.includes('YOUR_API_KEY_HERE')) {
        return "Please set your Gemini API key in config/api-config.js file.";
    }
    
    console.log('Using API key:', geminiApiKey.substring(0, 10) + '...');
    
    try {
        // Use configuration from api-config.js
        const config = window.API_CONFIG || {};
        let apiEndpoint = config.API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
        
        console.log('API Endpoint:', apiEndpoint);
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: `You are a helpful tax advisor for Indian tax laws. Answer the following question in a concise and helpful way: ${prompt}`
                }]
            }],
            generationConfig: config.GENERATION_CONFIG || {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024
            },
            safetySettings: config.SAFETY_SETTINGS || [
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
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(`${apiEndpoint}?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            
            // Try fallback to gemini-pro if 2.0 model fails
            if (response.status === 404 && apiEndpoint.includes('gemini-2.0-flash-exp')) {
                console.log('Gemini 2.0 not available, falling back to gemini-pro...');
                const fallbackEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
                
                const fallbackResponse = await fetch(`${fallbackEndpoint}?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });
                
                if (fallbackResponse.ok) {
                    const data = await fallbackResponse.json();
                    console.log('Fallback API Response:', data);
                    
                    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                        return data.candidates[0].content.parts[0].text;
                    }
                }
            }
            
            if (response.status === 400) {
                return "API Error: Invalid request format or API key. Please check your Gemini API key in config/api-config.js. Make sure it starts with 'AIzaSy' and is enabled for the Generative Language API.";
            } else if (response.status === 403) {
                return "API Error: Access denied. Please ensure your API key has permissions for the Generative Language API in Google Cloud Console.";
            } else if (response.status === 404) {
                return "API Error: Model not found. The Gemini 2.0 model may not be available yet. Please try again later or contact support.";
            } else if (response.status === 429) {
                return "API Error: Rate limit exceeded. Please wait a moment before trying again.";
            } else {
                return `API Error: Request failed with status ${response.status}. Response: ${errorText}`;
            }
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            return `API Error: ${data.error.message || 'Unknown error'}`;
        } else {
            return "Sorry, I couldn't generate a response. The API returned an unexpected format.";
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        return `Network Error: ${error.message}. Please check your internet connection and API key.`;
    }
}

export async function handleChatInput(renderCallback) {
    const input = document.getElementById('chatbot-input');
    const userText = input.value.trim();
    
    if (userText === '') return;
    
    const state = getState();
    const updateUserData = getUpdateUserData();
    if (!state || !updateUserData) return;
    
    addUserMessage(userText);
    input.value = '';
    
    // Handle API key input if we're waiting for it
    if (document.getElementById('gemini-api-key') && document.getElementById('save-api-key')) {
        return;
    }
    
    if (state.chatContext.awaitingInput) {
        const amount = parseFloat(userText);
        if (!isNaN(amount)) {
            const keyMap = {
                hra: 'rentPaid', lic: 'licPremium', health: 'healthInsurance', nps: 'npsContribution'
            };
            const dataKey = keyMap[state.chatContext.awaitingInput];
            updateUserData(dataKey, amount);
            addAssistantMessage(`Great! I've updated your ${dataKey} to ₹${amount.toLocaleString('en-IN')}.`);
            
            state.chatContext.awaitingInput = null;
            if (state.currentStep === 3 && renderCallback) {
                renderCallback(); // Re-render the main content to reflect changes
            }
        } else {
            addAssistantMessage("Please enter a valid amount in numbers.");
        }
    } else {
        // Use Gemini API for general questions
        const t = window.translations[state.language];
        addAssistantMessage(t.thinking);
        try {
            const response = await callGeminiAPI(userText);
            // Replace the "Thinking..." message with the actual response
            const messages = document.querySelectorAll('.chat-assistant');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.textContent === t.thinking) {
                lastMessage.textContent = response;
            } else {
                addAssistantMessage(response);
            }
        } catch (error) {
            addAssistantMessage(`Sorry, I encountered an error: ${error.message}`);
        }
    }
}

function addAssistantMessage(text) {
    addMessage(text, 'chat-assistant');
}

function addUserMessage(text) {
    addMessage(text, 'chat-user');
}

function addMessage(text, className) {
    const messagesDiv = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${className}`;
    msgDiv.textContent = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
