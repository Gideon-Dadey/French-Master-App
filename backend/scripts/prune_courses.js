const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

const PLACEHOLDER_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const prune = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/frenchmaster';
        await mongoose.connect(uri);
        console.log(`Connected to ${uri}`);

        const courses = await Course.find({});
        console.log(`Total courses found: ${courses.length}`);

        const candidates = [];

        for (const course of courses) {
            // 1. Fix relationships (Course -> Lessons)
            // Find all lessons for this course in DB
            const lessons = await Lesson.find({ course: course._id });

            // Detect if we need to update the course's lesson array
            // We update if the lengths mismatch significantly or just to be safe force sync
            const dbLessonIds = lessons.map(l => l._id.toString());

            // Update linkage
            course.lessons = lessons.map(l => l._id);
            course.totalLessons = lessons.length;
            await course.save();

            // 2. Determine "Realness"
            // Real = clearly imported/created by user, not auto-generated "Introduction"
            let isReal = false;

            if (lessons.length > 1) {
                isReal = true;
            } else if (lessons.length === 1) {
                const l = lessons[0];
                // If it DOESN'T match the placeholder signature
                if (l.title !== 'Introduction' || l.videoUrl !== PLACEHOLDER_VIDEO) {
                    isReal = true;
                }
            } else if (lessons.length === 0) {
                isReal = false; // Empty course
            }

            // Score: Priority to Featured, Students, Realness
            let score = 0;
            if (isReal) score += 10000;
            if (course.featured) score += 500;
            score += (course.studentsEnrolled || 0) * 10;
            // Tie-breaker: creation date (newer is better? or older?)
            // Let's say existing data is valuable

            candidates.push({ course, score, isReal, title: course.title });
        }

        // Sort descending by score
        candidates.sort((a, b) => b.score - a.score);

        // Keep top 20
        const KEEP_COUNT = 20;
        const toKeep = candidates.slice(0, KEEP_COUNT);
        const toDelete = candidates.slice(KEEP_COUNT);

        console.log(`\nAnalysis Results:`);
        console.log(`Top Candidate: ${toKeep[0]?.title} (Score: ${toKeep[0]?.score})`);
        console.log(`Keeping: ${toKeep.length} courses.`);
        console.log(`Deleting: ${toDelete.length} courses.`);

        // Perform Deletion
        for (const item of toDelete) {
            await Course.findByIdAndDelete(item.course._id);
            await Lesson.deleteMany({ course: item.course._id });
            console.log(`Deleted: ${item.title}`);
        }

        console.log(`\nPruning complete. Left with ${toKeep.length} courses.`);

        // Verify Linkages for kept courses
        console.log('Verifying final linkages...');
        for (const item of toKeep) {
            const c = await Course.findById(item.course._id).populate('lessons');
            // console.log(`Course: ${c.title}, Lessons: ${c.lessons.length}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

prune();
