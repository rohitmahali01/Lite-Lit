// apiUtils.js - Utility functions for Gemini API calls

/**
 * Extracts data from a document using the Gemini API
 * This function is for server-side use with Node.js
 * @param {File} file - The file to analyze
 * @returns {Promise<object>} - Extracted data as JSON
 */
export async function extractDataFromDocument(file) {
    // In a real implementation, this would make a server-side API call
    // For this demo, we'll return mock data
    console.log("Extracting data from document:", file.name);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock data based on file type (using configurable values)
    if (Math.random() > 0.5) {
        // Mock Form 16 data
        return {
            "documentType": "Form 16",
            "grossSalary": Math.floor(Math.random() * 1000000) + 500000,
            "basicSalary": Math.floor(Math.random() * 500000) + 300000,
            "hraComponent": Math.floor(Math.random() * 200000) + 50000,
            "tds_form16": Math.floor(Math.random() * 150000) + 50000,
            "basic80c": Math.floor(Math.random() * 100000) + 30000,
            "professionalTax": Math.floor(Math.random() * 5000) + 1000,
            "isEstimated": false
        };
    } else {
        // Mock Salary Slip data
        return {
            "documentType": "Salary Slip",
            "grossSalary": Math.floor(Math.random() * 800000) + 400000,
            "basicSalary": Math.floor(Math.random() * 400000) + 200000,
            "hraComponent": Math.floor(Math.random() * 150000) + 30000,
            "tds_form16": Math.floor(Math.random() * 100000) + 30000,
            "basic80c": Math.floor(Math.random() * 80000) + 20000,
            "professionalTax": Math.floor(Math.random() * 5000) + 1000,
            "isEstimated": true
        };
    }
}

/**
 * Extracts data from a document using the Gemini API (client-side version)
 * This function is for client-side use with browser JavaScript
 * @param {File} file - The file to analyze
 * @param {string} apiKey - The Gemini API key
 * @returns {Promise<object>} - Extracted data as JSON
 */
export async function extractDataFromDocumentClient(file, apiKey) {
    try {
        // Check if API key is provided
        if (!apiKey) {
            throw new Error("API key is required");
        }
        
        // Check if file is provided
        if (!file) {
            throw new Error("File is required");
        }
        
        console.log("Extracting data from document (client-side):", file.name);
        
        // For now, we'll return mock data since implementing the actual Gemini API
        // for document extraction in the browser requires complex file handling
        // In a real implementation, you would:
        // 1. Convert the file to base64
        // 2. Send it to the Gemini API
        // 3. Parse the response
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Return mock data based on file type
        if (file.name.toLowerCase().includes('form16') || file.name.toLowerCase().includes('form')) {
            return {
                "documentType": "Form 16",
                "grossSalary": 1250000,
                "basicSalary": 625000,
                "hraComponent": 150000,
                "tds_form16": 115000,
                "basic80c": 75000,
                "professionalTax": 2400,
                "isEstimated": false
            };
        } else {
            return {
                "documentType": "Salary Slip",
                "grossSalary": 960000,
                "basicSalary": 480000,
                "hraComponent": 120000,
                "tds_form16": 60000,
                "basic80c": 57600,
                "professionalTax": 2400,
                "isEstimated": true
            };
        }
    } catch (error) {
        console.error("Error extracting data from document:", error);
        throw error;
    }
}