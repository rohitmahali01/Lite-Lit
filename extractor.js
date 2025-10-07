// Step 1: Load environment variables from the .env file
require('dotenv').config();

// Import our API utility functions
const { extractDataFromDocument } = require('./apiUtils.js');

// Step 2: Import the Google AI SDK
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const fs = require('fs');

// Step 3: Get the API key from the environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in the .env file.");
}

// Step 4: Initialize the Gemini Model
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-pro-latest",
});

// Helper function to convert a file to a Base64-encoded object
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

/**
 * Analyzes a document using the Gemini API.
 * @param {string} filePath - The local path to the document (e.g., './form16-sample.pdf').
 * @param {string} mimeType - The MIME type of the file (e.g., 'application/pdf').
 * @returns {Promise<object>} - A promise that resolves to the extracted JSON data.
 */
async function extractDataFromDocument(filePath, mimeType) {
    console.log(`Analyzing document: ${filePath}`);

    const prompt = process.env.EXTRACTION_PROMPT || `
        You are an expert Indian tax form analyst. Your task is to analyze the provided document and extract key financial details.

        **Step 1: Identify the Document Type**
        First, determine if the document is a **monthly salary slip** or an **annual Form 16**.

        **Step 2: Extract Data Based on Document Type**
        - If it is a Form 16: Extract the final, annual figures directly.
        - If it is a Salary Slip: Extract the monthly figures and then calculate the estimated annual amount by multiplying by 12.

        **Step 3: Provide JSON Output**
        Return the information ONLY as a valid JSON object with the following structure.

        Fields to Extract:
        1. "grossSalary": Total gross salary.
        2. "basicSalary": The basic salary component.
        3. "hraComponent": House Rent Allowance (HRA) received.
        4. "tds_form16": Total tax deducted at source (TDS).
        5. "basic80c": Employee's contribution to Provident Fund (EPF).
        6. "professionalTax": Total professional tax paid.
        7. "isEstimated": A boolean flag. Set to **true** if the source was a salary slip, and **false** if it was a Form 16.

        Instructions:
        - All values must be numbers, without currency symbols or commas.
        - If a field cannot be found, use the value null.
    `;

    try {
        const imagePart = fileToGenerativePart(filePath, mimeType);

        const result = await model.generateContent({
            contents: [{ parts: [{ text: prompt }, imagePart] }],
            generationConfig: {
                response_mime_type: "application/json",
            }
        });

        const responseText = result.response.text();
        return JSON.parse(responseText);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return null;
    }
}

// --- Example Usage ---
// To run this example, create a file named 'sample.png' in this folder
// and then run 'node extractor.js' in your terminal.
async function main() {
    // Make sure you have a sample file to test with.
    const sampleFilePath = process.env.SAMPLE_FILE_PATH || 'sample.png'; // Or 'sample.pdf'
    const sampleMimeType = process.env.SAMPLE_MIME_TYPE || 'image/png'; // Or 'application/pdf'

    if (!fs.existsSync(sampleFilePath)) {
        console.error(`Error: Sample file not found at '${sampleFilePath}'. Please add a file to test.`);
        return;
    }
    
    const extractedData = await extractDataFromDocument(sampleFilePath, sampleMimeType);
    
    if (extractedData) {
        console.log("\n--- Extracted Data ---");
        console.log(extractedData);
        console.log("----------------------\n");
    } else {
        console.log("Extraction failed.");
    }
}

main();