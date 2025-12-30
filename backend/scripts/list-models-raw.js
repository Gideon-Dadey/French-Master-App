const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("API Key not found");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
                console.error("Error listing models:", parsed.error);
            } else if (parsed.models) {
                console.log("Available models:");
                parsed.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${m.name} (Supported)`);
                    } else {
                        console.log(`- ${m.name} (Not supported for generateContent)`);
                    }
                });
            } else {
                console.log("Unexpected response:", data);
            }
        } catch (e) {
            console.error("Parse error:", e);
            console.log("Raw data:", data);
        }
    });
}).on('error', (e) => {
    console.error("Request error:", e);
});
