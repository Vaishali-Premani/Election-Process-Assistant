import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Read API key directly from .env file
const envContent = fs.readFileSync(".env", "utf8");
const apiKeyLine = envContent.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : '';

if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Fetching models...");
        // This is a manual fetch because the SDK doesn't have a direct listModels sometimes, but actually it might?
        // Let's use fetch directly to the API endpoint to list models.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.error) {
             console.error("API Error:", JSON.stringify(data.error, null, 2));
             return;
        }
        
        console.log("Available Models that support generateContent:");
        for (const model of data.models) {
            if (model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${model.name}`);
            }
        }
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
