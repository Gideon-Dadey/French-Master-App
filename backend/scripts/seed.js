// Seed script to populate database with sample data
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Resource = require('../models/Resource');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/frenchmaster');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Create sample instructor
    let instructor = await User.findOne({ email: 'instructor@frenchmaster.com' });
    if (!instructor) {
      instructor = await User.create({
        name: 'French Master Instructor',
        email: 'instructor@frenchmaster.com',
        password: 'password123',
        role: 'instructor',
      });
    }

    // Create courses from thefrenchmastergh.com
    const courses = [
      {
        title: 'FRENCH COURSE A1-A2',
        description: 'Comprehensive French course for beginners covering A1 and A2 levels. Learn essential French vocabulary, grammar, pronunciation, and conversation skills for daily communication.',
        shortDescription: 'Master French basics with A1-A2 level course',
        instructor: instructor._id,
        thumbnail: 'courses/COURSES-THUMBNAIL-1-768x432.jpg',
        category: 'french',
        level: 'beginner',
        language: 'french',
        price: 500,
        originalPrice: 1000,
        currency: 'GHS',
        isFree: false,
        duration: 16,
        status: 'published',
        featured: true,
        whatYouWillLearn: [
          'French vocabulary (1000+ essential words)',
          'Basic to intermediate grammar rules',
          'Pronunciation and accent training',
          'Daily conversation skills',
          'Reading and writing in French',
          'Understanding French culture',
        ],
        requirements: ['No prior French knowledge required', 'Basic English proficiency helpful'],
      },
      {
        title: 'FRENCH COURSE B1-B2',
        description: 'Advanced French course covering B1 and B2 levels. Enhance your fluency, master complex grammar, and develop professional communication skills.',
        shortDescription: 'Advance your French to intermediate-advanced level',
        instructor: instructor._id,
        thumbnail: 'courses/COURSES-THUMBNAIL-2-768x432.jpg',
        category: 'french',
        level: 'intermediate',
        language: 'french',
        price: 500,
        originalPrice: 1000,
        currency: 'GHS',
        isFree: false,
        duration: 20,
        status: 'published',
        featured: true,
        whatYouWillLearn: [
          'Advanced French vocabulary and expressions',
          'Complex grammar structures and tenses',
          'Professional and business French',
          'Debate and discussion skills',
          'Writing formal and informal texts',
          'Cultural nuances and idioms',
        ],
        requirements: ['Completed A2 level or equivalent', 'Basic French conversation skills'],
      },
      {
        title: 'COURS D\'ANGLAIS A1-A2',
        description: 'Complete English course for beginners covering A1 and A2 levels. Perfect for French speakers learning English from scratch.',
        shortDescription: 'Learn English basics with A1-A2 level course',
        instructor: instructor._id,
        thumbnail: 'courses/COURSES-THUMBNAIL-3-768x432.jpg',
        category: 'english',
        level: 'beginner',
        language: 'english',
        price: 500,
        originalPrice: 1000,
        currency: 'GHS',
        isFree: false,
        duration: 16,
        status: 'published',
        featured: true,
        whatYouWillLearn: [
          'Essential English vocabulary (1000+ words)',
          'Basic to intermediate grammar',
          'English pronunciation and accent',
          'Daily conversation in English',
          'Reading and writing skills',
          'Understanding English-speaking cultures',
        ],
        requirements: ['No prior English knowledge required', 'French language background helpful'],
      },
      {
        title: 'COURS D\'ANGLAIS – B1-B2',
        description: 'Advanced English course covering B1 and B2 levels. Improve your fluency, master advanced grammar, and develop professional English communication.',
        shortDescription: 'Advance your English to intermediate-advanced level',
        instructor: instructor._id,
        thumbnail: 'courses/COURSES-THUMBNAIL-4-768x432.jpg',
        category: 'english',
        level: 'intermediate',
        language: 'english',
        price: 500,
        originalPrice: 1000,
        currency: 'GHS',
        isFree: false,
        duration: 20,
        status: 'published',
        featured: true,
        whatYouWillLearn: [
          'Advanced English vocabulary and idioms',
          'Complex grammar and sentence structures',
          'Business and professional English',
          'Academic writing skills',
          'Fluency in discussions and debates',
          'Cultural understanding and context',
        ],
        requirements: ['Completed A2 level or equivalent', 'Basic English conversation skills'],
      },
      {
        title: 'CERTIFICATE IN FRENCH EDUCATION',
        description: 'Professional certification course in French education. Designed for teachers and educators who want to teach French effectively.',
        shortDescription: 'Get certified to teach French professionally',
        instructor: instructor._id,
        thumbnail: 'courses/CERT-IN-FRENCH-EDUCATION-WEB-BANNER-768x384.png',
        category: 'french',
        level: 'advanced',
        language: 'french',
        price: 150,
        originalPrice: 200,
        currency: 'GHS',
        isFree: false,
        duration: 12,
        status: 'published',
        featured: true,
        whatYouWillLearn: [
          'French teaching methodologies',
          'Curriculum design and lesson planning',
          'Classroom management techniques',
          'Assessment and evaluation methods',
          'French linguistics and pedagogy',
          'Cultural education in language teaching',
        ],
        requirements: ['B2 level French proficiency', 'Teaching experience preferred but not required'],
      },
    ];

    // Clear existing courses (optional)
    // await Course.deleteMany({});

    // Remove old courses by title
    const coursesToRemove = [
      'French Basics',
      'French basics',
      'Free French Basics',
      'Free French basics',
      'free french basics',
      'English for Francophones - Beginner',
      'English for francophones - beginner',
      'DELF A1 Preparation',
      'DELF A1 preparation',
      'Intermediate French Conversation',
      'Intermediate French conversation',
      'French for Beginners',
      'French for beginners',
    ];
    
    for (const title of coursesToRemove) {
      const deleted = await Course.deleteMany({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
      if (deleted.deletedCount > 0) {
        console.log(`Removed course: ${title}`);
      }
    }

    for (const courseData of courses) {
      const existingCourse = await Course.findOne({ title: courseData.title });
      if (!existingCourse) {
        const course = await Course.create(courseData);
        console.log(`Created course: ${course.title}`);
      }
    }

    // Create sample resources
    const resources = [
      {
        title: 'French Beginner Vocabulary List',
        description: 'Comprehensive vocabulary list for French beginners covering 500+ essential words',
        category: 'vocabulary',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Sample PDF URL
        size: 2621440, // 2.5 MB in bytes
        sizeFormatted: '2.5 MB',
        downloads: 1234,
        rating: { average: 4.8, count: 45 },
        isFree: true,
        language: 'french',
        level: 'beginner',
        status: 'published',
        featured: true,
        uploadedBy: instructor._id,
        tags: ['vocabulary', 'beginner', 'french', 'words'],
      },
      {
        title: 'DELF A1 Practice Test',
        description: 'Complete practice test for DELF A1 exam with answer key',
        category: 'practice-tests',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 1887436, // 1.8 MB
        sizeFormatted: '1.8 MB',
        downloads: 856,
        rating: { average: 4.9, count: 32 },
        isFree: true,
        language: 'french',
        level: 'beginner',
        status: 'published',
        featured: true,
        uploadedBy: instructor._id,
        tags: ['delf', 'a1', 'practice', 'exam'],
      },
      {
        title: 'DELF A2 Practice Test - Listening & Reading',
        description: 'Comprehensive DELF A2 practice test focusing on listening comprehension and reading skills',
        category: 'practice-tests',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 2621440, // 2.5 MB
        sizeFormatted: '2.5 MB',
        downloads: 642,
        rating: { average: 4.8, count: 28 },
        isFree: true,
        language: 'french',
        level: 'intermediate',
        status: 'published',
        featured: true,
        uploadedBy: instructor._id,
        tags: ['delf', 'a2', 'listening', 'reading', 'practice'],
      },
      {
        title: 'DELF B1 Mock Exam - Complete Test',
        description: 'Full-length DELF B1 mock exam with all four sections: listening, reading, writing, and speaking',
        category: 'practice-tests',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 3670016, // 3.5 MB
        sizeFormatted: '3.5 MB',
        downloads: 523,
        rating: { average: 4.7, count: 41 },
        isFree: true,
        language: 'french',
        level: 'intermediate',
        status: 'published',
        featured: false,
        uploadedBy: instructor._id,
        tags: ['delf', 'b1', 'mock', 'exam', 'complete'],
      },
      {
        title: 'French Beginner Grammar Practice Test',
        description: 'Test your understanding of basic French grammar with this comprehensive practice test',
        category: 'practice-tests',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 1572864, // 1.5 MB
        sizeFormatted: '1.5 MB',
        downloads: 1123,
        rating: { average: 4.6, count: 67 },
        isFree: true,
        language: 'french',
        level: 'beginner',
        status: 'published',
        featured: false,
        uploadedBy: instructor._id,
        tags: ['grammar', 'beginner', 'practice', 'test', 'french'],
      },
      {
        title: 'French Vocabulary Practice Quiz - Level 1',
        description: 'Interactive vocabulary quiz covering essential French words for beginners',
        category: 'practice-tests',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 1048576, // 1 MB
        sizeFormatted: '1 MB',
        downloads: 987,
        rating: { average: 4.5, count: 54 },
        isFree: true,
        language: 'french',
        level: 'beginner',
        status: 'published',
        featured: false,
        uploadedBy: instructor._id,
        tags: ['vocabulary', 'quiz', 'beginner', 'practice'],
      },
      {
        title: 'TCF Practice Test - Reading Comprehension',
        description: 'TCF exam practice test focusing on reading comprehension skills with detailed explanations',
        category: 'practice-tests',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 3145728, // 3 MB
        sizeFormatted: '3 MB',
        downloads: 734,
        rating: { average: 4.8, count: 39 },
        isFree: true,
        language: 'french',
        level: 'intermediate',
        status: 'published',
        featured: true,
        uploadedBy: instructor._id,
        tags: ['tcf', 'reading', 'comprehension', 'practice'],
      },
      {
        title: 'French Grammar Basics Guide',
        description: 'Essential French grammar rules and explanations for beginners',
        category: 'grammar',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 3355443, // 3.2 MB
        sizeFormatted: '3.2 MB',
        downloads: 2103,
        rating: { average: 4.7, count: 89 },
        isFree: true,
        language: 'french',
        level: 'beginner',
        status: 'published',
        featured: true,
        uploadedBy: instructor._id,
        tags: ['grammar', 'rules', 'basics', 'french'],
      },
      {
        title: 'English Pronunciation Audio Guide',
        description: 'Audio guide for English pronunciation with native speaker examples',
        category: 'audio',
        type: 'MP3',
        fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Sample audio URL
        size: 16148070, // 15.4 MB
        sizeFormatted: '15.4 MB',
        downloads: 987,
        rating: { average: 4.6, count: 67 },
        isFree: true,
        language: 'english',
        level: 'all-levels',
        status: 'published',
        featured: false,
        uploadedBy: instructor._id,
        tags: ['pronunciation', 'audio', 'english', 'speaking'],
      },
      {
        title: 'TCF Exam Preparation Guide',
        description: 'Complete guide for TCF exam preparation with tips and strategies',
        category: 'study-guides',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 4299161, // 4.1 MB
        sizeFormatted: '4.1 MB',
        downloads: 1456,
        rating: { average: 4.8, count: 123 },
        isFree: true,
        language: 'french',
        level: 'intermediate',
        status: 'published',
        featured: true,
        uploadedBy: instructor._id,
        tags: ['tcf', 'exam', 'preparation', 'guide'],
      },
      {
        title: 'Complete DELF A1 Study Guide',
        description: 'Comprehensive study guide covering all DELF A1 topics, strategies, and tips for success',
        category: 'study-guides',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 5242880, // 5 MB
        sizeFormatted: '5 MB',
        downloads: 1834,
        rating: { average: 4.9, count: 156 },
        isFree: true,
        language: 'french',
        level: 'beginner',
        status: 'published',
        featured: true,
        uploadedBy: instructor._id,
        tags: ['delf', 'a1', 'study', 'guide', 'complete'],
      },
      {
        title: 'DELF A2 Exam Preparation Guide',
        description: 'Step-by-step guide to prepare for DELF A2 exam with study plans and practice strategies',
        category: 'study-guides',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 4718592, // 4.5 MB
        sizeFormatted: '4.5 MB',
        downloads: 1245,
        rating: { average: 4.7, count: 98 },
        isFree: true,
        language: 'french',
        level: 'intermediate',
        status: 'published',
        featured: true,
        uploadedBy: instructor._id,
        tags: ['delf', 'a2', 'preparation', 'exam', 'guide'],
      },
      {
        title: 'French Grammar Study Guide - Beginner to Intermediate',
        description: 'Comprehensive grammar guide covering all essential French grammar rules from beginner to intermediate level',
        category: 'study-guides',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 6291456, // 6 MB
        sizeFormatted: '6 MB',
        downloads: 2156,
        rating: { average: 4.8, count: 178 },
        isFree: true,
        language: 'french',
        level: 'all-levels',
        status: 'published',
        featured: true,
        uploadedBy: instructor._id,
        tags: ['grammar', 'study', 'guide', 'beginner', 'intermediate'],
      },
      {
        title: 'French Pronunciation Study Guide',
        description: 'Complete guide to French pronunciation with phonetic rules, examples, and practice exercises',
        category: 'study-guides',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 3670016, // 3.5 MB
        sizeFormatted: '3.5 MB',
        downloads: 892,
        rating: { average: 4.6, count: 65 },
        isFree: true,
        language: 'french',
        level: 'beginner',
        status: 'published',
        featured: false,
        uploadedBy: instructor._id,
        tags: ['pronunciation', 'study', 'guide', 'phonetics', 'french'],
      },
      {
        title: 'French Conversation Study Guide - Daily Situations',
        description: 'Practical guide for everyday French conversations covering greetings, shopping, dining, and more',
        category: 'study-guides',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 4194304, // 4 MB
        sizeFormatted: '4 MB',
        downloads: 1456,
        rating: { average: 4.7, count: 112 },
        isFree: true,
        language: 'french',
        level: 'beginner',
        status: 'published',
        featured: true,
        uploadedBy: instructor._id,
        tags: ['conversation', 'daily', 'situations', 'study', 'guide'],
      },
      {
        title: 'Business French Study Guide',
        description: 'Essential French for business professionals covering meetings, emails, presentations, and negotiations',
        category: 'study-guides',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 5242880, // 5 MB
        sizeFormatted: '5 MB',
        downloads: 567,
        rating: { average: 4.9, count: 43 },
        isFree: true,
        language: 'french',
        level: 'advanced',
        status: 'published',
        featured: false,
        uploadedBy: instructor._id,
        tags: ['business', 'professional', 'french', 'study', 'guide'],
      },
      {
        title: 'French Verb Tenses Study Guide',
        description: 'Complete reference guide for all French verb tenses with conjugation patterns and usage examples',
        category: 'study-guides',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 4718592, // 4.5 MB
        sizeFormatted: '4.5 MB',
        downloads: 1234,
        rating: { average: 4.8, count: 89 },
        isFree: true,
        language: 'french',
        level: 'all-levels',
        status: 'published',
        featured: false,
        uploadedBy: instructor._id,
        tags: ['verbs', 'tenses', 'conjugation', 'study', 'guide'],
      },
      {
        title: 'French Vocabulary Builder - Intermediate Level',
        description: 'Systematic vocabulary building guide for intermediate learners with themed word lists and exercises',
        category: 'study-guides',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 3670016, // 3.5 MB
        sizeFormatted: '3.5 MB',
        downloads: 987,
        rating: { average: 4.7, count: 71 },
        isFree: true,
        language: 'french',
        level: 'intermediate',
        status: 'published',
        featured: false,
        uploadedBy: instructor._id,
        tags: ['vocabulary', 'intermediate', 'builder', 'study', 'guide'],
      },
      {
        title: 'French Verb Conjugation Chart',
        description: 'Complete chart of French verb conjugations for all tenses',
        category: 'grammar',
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 1048576, // 1 MB
        sizeFormatted: '1 MB',
        downloads: 2341,
        rating: { average: 4.9, count: 156 },
        isFree: true,
        language: 'french',
        level: 'all-levels',
        status: 'published',
        featured: false,
        uploadedBy: instructor._id,
        tags: ['verbs', 'conjugation', 'grammar', 'french'],
      },
    ];

    for (const resourceData of resources) {
      const existingResource = await Resource.findOne({ title: resourceData.title });
      if (!existingResource) {
        const resource = await Resource.create(resourceData);
        console.log(`Created resource: ${resource.title}`);
      }
    }

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

