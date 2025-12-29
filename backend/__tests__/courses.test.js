const request = require('supertest');
const mongoose = require('mongoose');

// Mock mongoose
jest.mock('mongoose', () => {
    const mockSchema = jest.fn().mockImplementation(function () {
        return {
            plugin: jest.fn(),
            pre: jest.fn(),
            post: jest.fn(),
            index: jest.fn(),
            methods: {},
            statics: {},
            virtual: jest.fn().mockReturnValue({
                get: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
            }),
        };
    });

    mockSchema.Types = {
        ObjectId: String,
        Mixed: Object,
    };

    const mockModel = jest.fn().mockImplementation(() => ({
        find: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        countDocuments: jest.fn(),
    }));

    return {
        connect: jest.fn().mockResolvedValue(true),
        connection: {
            host: 'localhost',
            on: jest.fn(),
            once: jest.fn(),
        },
        Schema: mockSchema,
        model: mockModel,
        models: {},
    };
});

// Mock Course model with full chaining support
const Course = require('../models/Course');
jest.mock('../models/Course', () => {
    const mockCourses = [
        { _id: 'course1', title: 'French for Beginners', category: 'General' },
        { _id: 'course2', title: 'Advanced French', category: 'Professional' }
    ];

    const queryMock = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(function (callback) {
            return callback(mockCourses);
        }),
    };

    return {
        find: jest.fn().mockReturnValue(queryMock),
        countDocuments: jest.fn().mockResolvedValue(mockCourses.length),
    };
});

const app = require('../server');

describe('Backend Courses API', () => {
    it('should return all courses', async () => {
        const res = await request(app).get('/api/courses');

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(2);
    });
});
