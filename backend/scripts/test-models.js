const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    console.log("Checking API Key availability...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing from environment variables");
        return;
    }
    // Print first 5 chars of key to verify it's loaded (safe for logs)
    console.log("Key loaded:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        console.log("Checking gemini-flash-latest...");
        const flashModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const flashResult = await flashModel.generateContent("Say hello");
        console.log("gemini-flash-latest works:", flashResult.response.text());
    } catch (error) {
        console.error("gemini-flash-latest failed:", error.message);
    }

    try {
        console.log("Checking gemini-pro...");
        const proModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await proModel.generateContent("Say hello");
        console.log("gemini-pro works:", result.response.text());
    } catch (error) {
        console.error("gemini-pro failed:", error.message);
    }
}

listModels();
