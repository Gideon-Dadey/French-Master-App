const mongoose = require('mongoose');
require('dotenv').config();
const Blog = require('../models/Blog');

// Sample blog posts based on thefrenchmastergh.com
const blogPosts = [
  {
    title: 'Aisha, la mécanicienne – (Stéréotype de genre)',
    slug: 'aisha-la-mecanicienne-stereotype-de-genre',
    excerpt: 'Tous droits de cette publication reservés à l\'OIF. Cette publication fait partie de mon projet. Explorez cette leçon fascinante qui aborde les stéréotypes de genre dans la société française moderne. Découvrez comment Aisha, une mécanicienne compétente, défie les attentes traditionnelles et brise les barrières dans un domaine traditionnellement masculin. Cette leçon vous aidera à comprendre le vocabulaire lié aux professions, les expressions culturelles françaises, et les discussions importantes sur l\'égalité des genres dans le contexte francophone.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2024-12-10'),
    readTime: '5 min read',
    status: 'published',
  },
  {
    title: 'DOWNLOAD TERM 2 FRENCH LESSON PLANS',
    slug: 'download-term-2-french-lesson-plans',
    excerpt: 'Dear French teacher, THE FRENCH MASTER GH team has prepared a comprehensive French lesson plans for Term 2. These meticulously crafted lesson plans are designed to help educators deliver engaging and effective French language instruction. Each plan includes detailed learning objectives, interactive activities, assessment strategies, and supplementary resources. Perfect for both experienced teachers and those new to French language education, these plans cover essential topics from basic vocabulary to advanced grammar concepts, ensuring your students receive a well-rounded French learning experience.',
    category: 'news',
    type: 'NEWS',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2024-01-03'),
    readTime: '3 min read',
    status: 'published',
  },
  {
    title: 'DOWNLOAD END OF TERM 1 EXAM FOR FRENCH',
    slug: 'download-end-of-term-1-exam-for-french',
    excerpt: 'Dear French teacher, THE FRENCH MASTER GH team has compiled a comprehensive French test for the end of Term 1. This examination package includes multiple sections covering reading comprehension, grammar, vocabulary, writing, and listening skills. The test is carefully aligned with the curriculum and designed to accurately assess students\' progress. Each question has been crafted by experienced French educators to ensure validity and reliability. Download this resource to save time on exam preparation while ensuring your students are evaluated fairly and comprehensively on their French language skills.',
    category: 'news',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-10-27'),
    readTime: '2 min read',
    status: 'published',
  },
  {
    title: 'ALL ABOUT PERSONAL PRONOUNS IN FRENCH',
    slug: 'all-about-personal-pronouns-in-french',
    excerpt: 'In French, personal pronouns are essential for communication as they replace nouns to avoid repetition and make sentences more concise. This comprehensive lesson covers all forms of personal pronouns including subject pronouns (je, tu, il, elle, nous, vous, ils, elles), direct object pronouns (me, te, le, la, nous, vous, les), indirect object pronouns (me, te, lui, nous, vous, leur), and reflexive pronouns. You\'ll learn the correct placement of pronouns in sentences, how to use them with different verb tenses, and common mistakes to avoid. Master this fundamental aspect of French grammar to significantly improve your speaking and writing skills.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-08-06'),
    readTime: '8 min read',
    status: 'published',
  },
  {
    title: 'SOME COMPUTER WORDS IN FRENCH',
    slug: 'some-computer-words-in-french',
    excerpt: 'Dans cette leçon, nous allons apprendre quelques termes informatiques de base en français, ainsi que leurs équivalents en anglais. Cette leçon moderne et pratique vous enseignera le vocabulaire essentiel pour naviguer dans le monde numérique en français. Apprenez les termes pour ordinateur, clavier, souris, écran, logiciel, application, internet, email, et bien plus encore. Parfait pour les étudiants qui veulent communiquer efficacement dans un environnement technologique francophone, que ce soit pour le travail, les études, ou la vie quotidienne.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-08-06'),
    readTime: '5 min read',
    status: 'published',
  },
  {
    title: 'DEFINITE ARTICLES IN FRENCH',
    slug: 'definite-articles-in-french',
    excerpt: 'In French, just like in English, definite articles are used to refer to specific nouns that are already known to both the speaker and the listener. This detailed lesson explores the four forms of definite articles: le (masculine singular), la (feminine singular), l\' (before vowels), and les (plural). You\'ll discover when to use each form, how they contract with prepositions (à + le = au, de + le = du), and common exceptions. Understanding definite articles is crucial for proper French grammar, as they appear in almost every sentence. Master this topic to avoid common errors and speak French more naturally.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-08-06'),
    readTime: '6 min read',
    status: 'published',
  },
  {
    title: 'INDEFINITE ARTICLES IN FRENCH',
    slug: 'indefinite-articles-in-french',
    excerpt: 'Indefinite articles are essential components of the French language and are used to introduce nouns that are not specific or known to the listener. This comprehensive guide covers un (masculine), une (feminine), and des (plural), explaining when and how to use each form correctly. Learn the differences between indefinite and definite articles, when to omit articles entirely, and how indefinite articles change in negative sentences. With practical examples and exercises, you\'ll quickly master this fundamental grammar concept that appears in everyday French conversation and writing.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-08-06'),
    readTime: '5 min read',
    status: 'published',
  },
  {
    title: 'HOW TO APOLOGIZE IN FRENCH',
    slug: 'how-to-apologize-in-french',
    excerpt: 'In this beginner\'s lesson, we\'ll cover various ways to apologize in French and provide examples to help you understand how to use them effectively. Learn the most common expressions including "Je suis désolé(e)", "Pardon", "Excusez-moi", and "Je m\'excuse", along with when to use each one appropriately. Discover formal and informal ways to apologize, how to express regret for different situations, and cultural nuances that make your apologies sound more natural and sincere. This practical lesson is essential for polite communication in French-speaking countries and will help you navigate social situations with confidence.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-08-06'),
    readTime: '4 min read',
    status: 'published',
  },
  {
    title: 'HOW TO THANK SOMEONE IN FRENCH',
    slug: 'how-to-thank-someone-in-french',
    excerpt: 'In French, expressing gratitude and saying "thank you" is an important aspect of politeness and communication. This essential lesson teaches you various ways to express thanks, from the basic "Merci" to more elaborate expressions like "Merci beaucoup", "Je vous remercie", and "Je te remercie". Learn the differences between formal and informal expressions, when to use "de" or "pour" after merci, and how to respond to thanks appropriately. Understanding these expressions will help you show appreciation in a culturally appropriate way and make a positive impression in French-speaking environments.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-08-06'),
    readTime: '3 min read',
    status: 'published',
  },
  {
    title: 'GREETINGS IN FRENCH – LA SALUTATION',
    slug: 'greetings-in-french-la-salutation',
    excerpt: 'In this lesson, beginners will learn essential greetings in French, including how to greet people, introduce themselves, and respond to greetings. Master the fundamental expressions like "Bonjour", "Bonsoir", "Salut", "Comment allez-vous?", and "Comment ça va?". Discover the appropriate times to use formal versus informal greetings, how to greet people at different times of day, and cultural tips for making a good first impression. This comprehensive guide also covers introductions, asking about someone\'s well-being, and proper farewells. Perfect for anyone starting their French learning journey or wanting to refresh their basic conversation skills.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-08-06'),
    readTime: '7 min read',
    status: 'published',
  },
  {
    title: 'COLORS IN FRENCH – LES COULEURS',
    slug: 'colors-in-french-les-couleurs',
    excerpt: 'Colors are an essential part of everyday communication and can be quite fun to learn in a new language. This vibrant lesson covers all the basic colors in French including rouge, bleu, vert, jaune, noir, blanc, and many more. Learn how colors function as adjectives in French, including their agreement with nouns (masculine/feminine, singular/plural), and discover interesting cultural associations with different colors. Practice using colors in sentences, describing objects, and expressing preferences. This colorful vocabulary will enhance your ability to describe the world around you in French and make your conversations more vivid and engaging.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-08-06'),
    readTime: '5 min read',
    status: 'published',
  },
  {
    title: 'THE PLURAL FORM IN FRENCH – LE PLURIEL',
    slug: 'the-plural-form-in-french-le-pluriel',
    excerpt: 'By the end of this lesson, you\'ll be able to form plural nouns and use them correctly in sentences. This comprehensive grammar lesson covers the general rule of adding -s to form plurals, as well as important exceptions including nouns ending in -eau, -eu, -al, -ou, and irregular plurals. Learn how pluralization affects articles, adjectives, and verbs, and discover special cases like nouns that don\'t change in plural form. With clear explanations, numerous examples, and practice exercises, you\'ll master this essential aspect of French grammar and avoid common mistakes that many learners make.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-08-06'),
    readTime: '6 min read',
    status: 'published',
  },
  {
    title: 'HOW TO COUNT IN FRENCH – SAVOIR COMPTER',
    slug: 'how-to-count-in-french-savoir-compter',
    excerpt: 'In this lesson, the French Master Gh will teach you how to count from 0 to 50 in French. Master the fundamentals of French numbers with this comprehensive guide that covers pronunciation, spelling, and usage. Learn the unique patterns in French numbering, including the special rules for numbers 70-99 (soixante-dix, quatre-vingts, etc.), and discover how to use numbers in practical contexts like telling time, giving phone numbers, and expressing quantities. This essential skill will help you in everyday situations like shopping, making appointments, and understanding prices. Perfect for beginners who want to build a solid foundation in French numeracy.',
    category: 'written-lessons',
    type: 'Written lessons',
    author: 'Elvis Kossi FIATI',
    publishedAt: new Date('2023-08-06'),
    readTime: '5 min read',
    status: 'published',
  },
];

const seedBlog = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/frenchmaster', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing blog posts (optional - remove if you want to keep existing)
    // await Blog.deleteMany({});

    // Insert blog posts
    for (const post of blogPosts) {
      await Blog.findOneAndUpdate(
        { slug: post.slug },
        post,
        { upsert: true, new: true }
      );
    }

    console.log(`✅ Successfully seeded ${blogPosts.length} blog posts`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blog posts:', error);
    process.exit(1);
  }
};

seedBlog();

