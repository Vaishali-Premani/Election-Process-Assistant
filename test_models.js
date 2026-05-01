import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf8");
const apiKeyLine = envContent.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : '';

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.0-flash-lite-001",
    "gemini-2.5-flash"
];

async function testModels() {
    for (const modelName of modelsToTest) {
        console.log(`\nTesting ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        let successCount = 0;
        for (let i = 0; i < 3; i++) {
            try {
                await model.generateContent(`Say test ${i}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Request ${i} failed: ${error.message.split('\n')[0]}`);
            }
        }
        console.log(`Result for ${modelName}: ${successCount}/3 successful.`);
    }
}

testModels();
