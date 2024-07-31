const request = require('supertest');
const app = require('../../app');
const dbConnect = require('../../database/index');
const bcrypt = require('bcrypt');

jest.mock('../../database/index');
jest.mock('../../models/userModel');

describe('User Controller - loginUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if email is not provided', async () => {
        const res = await request(app)
            .post('/login')
            .send({ password: 'password123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe({
            "status": 400,
            "message": "required_email",
            "data": null
        });
    });
});