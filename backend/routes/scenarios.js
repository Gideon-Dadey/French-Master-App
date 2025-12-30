const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// This could eventually be a DB model, but for now we'll serve it from here
const SCENARIOS = [
    {
        id: 'ai_tutor',
        title: 'Free AI Tutor',
        category: 'Experimental',
        difficulty: 'All Levels',
        location: 'Personal Tutor "Mirah"',
        description: 'Talk about anything with your personal AI French tutor.',
        icon: 'sparkles',
        isAi: true,
        steps: []
    },
    {
        id: 'cafe_morning',
        title: 'Morning Coffee',
        category: 'Daily Life',
        difficulty: 'Beginner',
        location: 'Le Café Flore',
        description: 'Order your morning coffee and a pastry like a local.',
        icon: 'cafe',
        steps: [
            {
                id: 1,
                speaker: 'Waiter',
                text: 'Bonjour! Bienvenue au Café Flore. Installez-vous.',
                translation: 'Hello! Welcome to Café Flore. Please have a seat.',
                options: [
                    { id: 'a', text: 'Bonjour, merci.', nextStep: 2, xp: 10, feedback: 'Simple and polite!' },
                    { id: 'b', text: 'Salut!', nextStep: 2, xp: 5, feedback: 'A bit informal for a waiter, but okay.' }
                ]
            },
            {
                id: 2,
                speaker: 'Waiter',
                text: 'Que désirez-vous boire ce matin?',
                translation: 'What would you like to drink this morning?',
                options: [
                    { id: 'a', text: 'Un café, s\'il vous plaît.', nextStep: 3, xp: 20, feedback: 'Perfect usage of politeness.' },
                    { id: 'b', text: 'Je veux un café.', nextStep: 3, xp: 5, feedback: 'Correct, but "Je voudrais" is more polite.' },
                    { id: 'c', text: 'Donne-moi un café.', nextStep: 3, xp: 0, feedback: 'Too rude/direct!' }
                ]
            },
            {
                id: 3,
                speaker: 'Waiter',
                text: 'Un café noir ou avec du lait?',
                translation: 'Black coffee or with milk?',
                options: [
                    { id: 'a', text: 'Un café crème, s\'il vous plaît.', nextStep: 4, xp: 15, feedback: 'Excellent choice.' },
                    { id: 'b', text: 'Noir, juste noir.', nextStep: 4, xp: 10, feedback: 'Clear and direct.' }
                ]
            },
            {
                id: 4,
                speaker: 'Waiter',
                text: 'Très bien. Et pour manger?',
                translation: 'Very good. And to eat?',
                options: [
                    { id: 'a', text: 'Un croissant, s\'il vous plaît.', nextStep: 5, xp: 20, feedback: 'A classic French breakfast!' },
                    { id: 'b', text: 'Rien, merci.', nextStep: 5, xp: 10, feedback: 'Polite refusal.' }
                ]
            },
            {
                id: 5,
                speaker: 'Waiter',
                text: 'Parfait. Je vous apporte ça tout de suite.',
                translation: 'Perfect. I\'ll bring that to you right away.',
                options: [
                    { id: 'a', text: 'Merci beaucoup!', nextStep: 'end', xp: 10, feedback: 'Great conclusion.' }
                ]
            }
        ]
    },
    {
        id: 'market_fresh',
        title: 'At the Market',
        category: 'Shopping',
        difficulty: 'Intermediate',
        location: 'Marché Bastille',
        description: 'Buy fresh fruits and vegetables from a vendor.',
        icon: 'basket',
        steps: [
            {
                id: 1,
                speaker: 'Vendor',
                text: 'Bonjour! Ils sont beaux mes fruits aujourd\'hui!',
                translation: 'Hello! My fruits are beautiful today!',
                options: [
                    { id: 'a', text: 'Bonjour, je voudrais des pommes.', nextStep: 2, xp: 15, feedback: 'Direct and polite.' },
                    { id: 'b', text: 'C\'est combien?', nextStep: 2, xp: 10, feedback: 'Okay, but maybe greet them back first.' }
                ]
            }
        ]
    },
];

router.get('/', protect, async (req, res) => {
    res.json({
        success: true,
        data: SCENARIOS
    });
});

module.exports = router;
