const mongoose = require('mongoose');
require('dotenv').config();
const Blog = require('../models/Blog');

// Sample blog posts based on thefrenchmastergh.com
const blogPosts = [
  {
    title: 'Aisha, la mécanicienne – (Stéréotype de genre)',
    slug: 'aisha-la-mecanicienne-stereotype-de-genre',
    excerpt: 'Tous droits de cette publication reservés à l\'OIF. Cette publication fait partie de mon projet',
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
    excerpt: 'Dear French teacher, THE FRENCH MASTER GH team has prepared a comprehensive French lesson plans for',
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
    excerpt: 'Dear French teacher, THE FRENCH MASTER GH team has compiled a comprehensive French test for',
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
    excerpt: 'In French, personal pronouns are essential for communication as they replace nouns to avoid repetition and make sentences more concise.',
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
    excerpt: 'Dans cette leçon, nous allons apprendre quelques termes informatiques de base en français, ainsi que leurs équivalents en anglais.',
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
    excerpt: 'In French, just like in English, definite articles are used to refer to specific nouns that are already known to both the speaker and the listener.',
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
    excerpt: 'Indefinite articles are essential components of the French language and are used to introduce nouns that are not specific or known to the listener.',
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
    excerpt: 'In this beginner\'s lesson, we\'ll cover various ways to apologize in French and provide examples to help you understand how to use them effectively.',
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
    excerpt: 'In French, expressing gratitude and saying "thank you" is an important aspect of politeness and communication.',
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
    excerpt: 'In this lesson, beginners will learn essential greetings in French, including how to greet people, introduce themselves, and respond to greetings.',
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
    excerpt: 'Colors are an essential part of everyday communication and can be quite fun to learn in a new language.',
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
    excerpt: 'By the end of this lesson, you\'ll be able to form plural nouns and use them correctly in sentences.',
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
    excerpt: 'In this lesson, the French Master Gh will teach you how to count from 0 to 50 in French.',
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

