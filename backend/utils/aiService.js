const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;

const initAI = () => {
    if (!genAI && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

const aiService = {
    generateFrenchContent: async (prompt, systemInstruction = "You are an expert French language tutor. Provide helpful, accurate, and educational content.") => {
        try {
            const ai = initAI();
            if (!ai) {
                throw new Error("GEMINI_API_KEY is not configured on the server.");
            }

            const model = ai.getGenerativeModel({
                model: "gemini-flash-latest",
                systemInstruction: systemInstruction
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Generation Error:", error);
            throw error;
        }
    },

    getChatResponse: async (history, message) => {
        try {
            const ai = initAI();
            if (!ai) {
                throw new Error("GEMINI_API_KEY is not configured on the server.");
            }

            const model = ai.getGenerativeModel({
                model: "gemini-flash-latest",
                systemInstruction: "You are a friendly French tutor named 'Mirah'. Help the student learn French by engaging in conversation and correcting their mistakes politely."
            });

            // Gemini's history MUST start with 'user' and alternate.
            let validHistory = [];
            let lastRole = null;

            if (history && Array.isArray(history)) {
                for (const msg of history) {
                    // Skip if current role is same as last (Gemini requirement)
                    if (msg.role === lastRole) continue;

                    // First message must be 'user'
                    if (validHistory.length === 0 && msg.role !== 'user') continue;

                    validHistory.push(msg);
                    lastRole = msg.role;
                }
            }

            const chat = model.startChat({
                history: validHistory,
            });
            console.log('Processed History:', JSON.stringify(validHistory, null, 2));
            console.log('Sending Message:', message);

            const result = await chat.sendMessage(message);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Chat Error:", error);
            throw error;
        }
    },

    evaluatePronunciation: async (targetText, audioBase64, mimeType = "audio/m4a") => {
        try {
            const ai = initAI();
            if (!ai) {
                throw new Error("GEMINI_API_KEY is not configured on the server.");
            }

            const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });

            const prompt = `
        Evaluate the pronunciation of this French phrase: "${targetText}".
        Compare the provided audio with the target phrase.
        Return ONLY a JSON object with this exact structure:
        {
            "score": 85,
            "transcription": "the transcribed phrase you heard",
            "feedback": "specific feedback on vowels, consonants or rhythm",
            "accuracyScore": 90,
            "fluencyScore": 80
        }
    `;

            const audioPart = {
                inlineData: {
                    data: audioBase64,
                    mimeType: mimeType
                }
            };

            const result = await model.generateContent([prompt, audioPart]);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Could not parse AI response as JSON: " + text);
        } catch (error) {
            console.error("Pronunciation Evaluation Error:", error);
            throw error;
        }
    }
};

module.exports = aiService;
