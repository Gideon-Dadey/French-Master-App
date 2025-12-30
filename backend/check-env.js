require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'MISSING');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'MISSING');
if (process.env.GEMINI_API_KEY) {
    console.log('Length of GEMINI_API_KEY:', process.env.GEMINI_API_KEY.length);
}
