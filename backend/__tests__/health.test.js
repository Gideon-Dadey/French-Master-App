const request = require('supertest');
const mongoose = require('mongoose');

// Better mock for mongoose to support models
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

    const mockModel = jest.fn().mockReturnValue({
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
    });

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

const app = require('../server');

describe('Backend API Health Check', () => {
    it('should return 200 OK for the health endpoint', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'OK');
    });

    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/api/unknown-route');
        expect(res.statusCode).toEqual(404);
    });
});
