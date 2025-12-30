const aiService = require('./utils/aiService');
require('dotenv').config();

async function testChat() {
    try {
        console.log('Testing AI Chat Response...');
        const response = await aiService.getChatResponse([], 'Bonjour, comment ça va ?');
        console.log('AI Response:', response);
    } catch (error) {
        console.error('AI Chat Error:', error);
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
        }
    }
}

testChat();
