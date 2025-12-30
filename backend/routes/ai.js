const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const aiService = require('../utils/aiService');

router.post('/generate-content', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { type, prompt, context } = req.body;

    let systemInstruction = "You are an expert French language tutor.";

    switch (type) {
      case 'course_description':
        systemInstruction += " Generate a compelling course description based on the topic provided.";
        break;
      case 'lesson_content':
        systemInstruction += " Generate detailed lesson content in Markdown format, including examples and a short practice exercise.";
        break;
      case 'quiz_questions':
        systemInstruction += " Generate 5 multiple-choice questions in JSON format. Each question should have 'question', 'options' (array of strings), and 'correctIndex'.";
        break;
      case 'blog_post':
        systemInstruction += " Write an educational blog post about French culture or language learning.";
        break;
      default:
        systemInstruction += " Generate content based on the prompt.";
    }

    const generatedContent = await aiService.generateFrenchContent(prompt, systemInstruction);

    if (!generatedContent) {
      return res.status(503).json({
        success: false,
        message: 'AI Service currently unavailable (API Key missing)'
      });
    }

    res.json({
      success: true,
      data: {
        content: generatedContent,
        type,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: error.message
    });
  }
});

router.post('/improve-content', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { content, improvementType } = req.body;

    const prompt = `Improve the following content for ${improvementType}: "${content}"`;
    const improvedContent = await aiService.generateFrenchContent(prompt, "You are a professional editor and French language expert.");

    res.json({
      success: true,
      data: {
        original: content,
        improved: improvedContent || content,
        improvements: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to improve content',
      error: error.message
    });
  }
});

router.post('/translate', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { content, targetLanguage } = req.body;

    const prompt = `Translate the following text to ${targetLanguage}: "${content}"`;
    const translatedContent = await aiService.generateFrenchContent(prompt, "You are a professional translator specializing in French and English.");

    res.json({
      success: true,
      data: {
        original: content,
        translated: translatedContent || content,
        targetLanguage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to translate content',
      error: error.message
    });
  }
});

router.post('/evaluate-pronunciation', protect, async (req, res) => {
  try {
    const { targetText, audioBase64, mimeType } = req.body;

    if (!targetText || !audioBase64) {
      return res.status(400).json({
        success: false,
        message: 'targetText and audioBase64 are required'
      });
    }

    const evaluation = await aiService.evaluatePronunciation(targetText, audioBase64, mimeType);

    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error("Evaluation Route Error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate pronunciation',
      error: error.message
    });
  }
});

router.post('/chat', protect, async (req, res) => {
  try {
    console.log('AI Chat Request Body:', JSON.stringify(req.body, null, 2));
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const response = await aiService.getChatResponse(history || [], message);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error("AI Chat Route Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get AI response',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
