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
        findOne: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
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

// Mock User model
const User = require('../models/User');
jest.mock('../models/User', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({}),
    }),
}));

const app = require('../server');

describe('Backend Auth API', () => {
    it('should fail login with invalid credentials', async () => {
        // Correctly mock the chained call: User.findOne().select()
        User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should succeed login with valid credentials', async () => {
        const mockUser = {
            _id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'student',
            comparePassword: jest.fn().mockResolvedValue(true),
            generateToken: jest.fn().mockReturnValue('mock-token'),
            generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
            save: jest.fn().mockResolvedValue(true),
        };

        User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'correctpassword'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBe('mock-token');
    });
});
