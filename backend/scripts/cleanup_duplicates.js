const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// Placeholder Video URL (Public Domain or generic)
const PLACEHOLDER_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const cleanup = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/frenchmaster';
        await mongoose.connect(uri);
        console.log(`Connected to ${uri}`);

        // 1. Remove Duplicates
        console.log('Scanning for duplicates...');
        const courses = await Course.find({}).sort({ createdAt: -1 });
        const map = new Map();

        for (const course of courses) {
            const key = course.title.toLowerCase().trim();
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(course);
        }

        let deletedCount = 0;

        for (const [title, list] of map) {
            if (list.length > 1) {
                console.log(`Found ${list.length} duplicates for "${title}"`);

                // Heuristic: Keep the one with the most lessons, then students, then created latest (if active) or oldest (if stable).
                // Let's keep the one with the most lessons.
                list.sort((a, b) => {
                    if (b.totalLessons !== a.totalLessons) return b.totalLessons - a.totalLessons;
                    return b.studentsEnrolled - a.studentsEnrolled;
                });

                const toKeep = list[0];
                const toDelete = list.slice(1);

                for (const d of toDelete) {
                    console.log(`Deleting duplicate: ${d.title} (${d._id})`);
                    await Course.findByIdAndDelete(d._id);
                    await Lesson.deleteMany({ course: d._id });
                    deletedCount++;
                }
            }
        }
        console.log(`Deleted ${deletedCount} duplicate courses.`);

        // 2. Ensure all courses are "Video" (have >= 1 video lesson)
        console.log('Ensuring all courses have video content...');
        const allCourses = await Course.find({});

        for (const course of allCourses) {
            const lessons = await Lesson.find({ course: course._id });

            if (lessons.length === 0) {
                console.log(`Adding intro video to empty course: ${course.title}`);
                await Lesson.create({
                    course: course._id,
                    title: 'Introduction',
                    description: 'Welcome to this course.',
                    order: 1,
                    videoUrl: PLACEHOLDER_VIDEO,
                    videoDuration: 600, // 10 mins
                    thumbnail: course.thumbnail
                });

                course.totalLessons = 1;
                await course.save();
            } else {
                // Ensure existing lessons have a videoUrl if missing
                let updated = false;
                for (const lesson of lessons) {
                    if (!lesson.videoUrl || lesson.videoUrl.trim() === '') {
                        lesson.videoUrl = PLACEHOLDER_VIDEO;
                        await lesson.save();
                        updated = true;
                    }
                }
                if (updated) console.log(`Updated lessons with missing videos for: ${course.title}`);
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanup();
