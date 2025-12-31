const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Groq client
let groqClient;
let genAI;

const initGroq = () => {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }
    return groqClient;
};

// Keep Gemini for audio evaluation (Groq doesn't support audio yet)
const initGemini = () => {
    if (!genAI && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

const MIRAH_SYSTEM_PROMPT = `You are Mirah, a friendly, warm, and encouraging French tutor. Your personality:
- You're patient, supportive, and genuinely excited to help students learn French
- You speak primarily in French but provide English translations when helpful
- You gently correct mistakes and explain grammar naturally
- You use casual, conversational French (not overly formal)
- You ask follow-up questions to keep the conversation engaging
- You celebrate small victories and progress
- You occasionally share fun French cultural tidbits

Remember: Keep responses concise (2-4 sentences usually). Be conversational, not like a textbook.`;

const aiService = {
    generateFrenchContent: async (prompt, systemInstruction = "You are an expert French language tutor. Provide helpful, accurate, and educational content.") => {
        try {
            const groq = initGroq();
            if (!groq) {
                throw new Error("GROQ_API_KEY is not configured on the server.");
            }

            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2048,
            });

            return completion.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("AI Generation Error:", error);
            throw error;
        }
    },

    getChatResponse: async (history, message) => {
        try {
            const groq = initGroq();
            if (!groq) {
                throw new Error("GROQ_API_KEY is not configured on the server.");
            }

            // Build messages array for Groq (OpenAI format)
            const messages = [
                { role: "system", content: MIRAH_SYSTEM_PROMPT }
            ];

            // Add conversation history
            if (history && Array.isArray(history)) {
                for (const msg of history) {
                    // Convert from Gemini format to OpenAI format
                    const role = msg.role === 'model' ? 'assistant' : 'user';
                    const content = msg.parts?.[0]?.text || msg.text || '';
                    if (content) {
                        messages.push({ role, content });
                    }
                }
            }

            // Add current message
            messages.push({ role: "user", content: message });

            console.log('Sending to Groq:', JSON.stringify(messages, null, 2));

            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.8,
                max_tokens: 1024,
            });

            const response = completion.choices[0]?.message?.content || "";
            console.log('Groq Response:', response);

            return response;
        } catch (error) {
            console.error("AI Chat Error:", error);
            throw error;
        }
    },

    // Keep Gemini for pronunciation evaluation (requires audio input)
    evaluatePronunciation: async (targetText, audioBase64, mimeType = "audio/m4a") => {
        try {
            const ai = initGemini();
            if (!ai) {
                throw new Error("GEMINI_API_KEY is not configured for pronunciation evaluation.");
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
