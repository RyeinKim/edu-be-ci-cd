const request = require('supertest');
const app = require('../../app');
const dbConnect = require('../../database/index');
const bcrypt = require('bcrypt');

jest.mock('../../database/index');

describe('User Controller - loginUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if email is not provided', async () => {
        const res = await request(app)
            .post('/login')
            .send({ password: 'password123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Required email');
    });

    it('should return 400 if password is not provided', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'test@example.com' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Required password');
    });

    it('should return 401 if email or password is invalid', async () => {
        dbConnect.query.mockResolvedValue([null]);

        const res = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 200 and login user successfully', async () => {
        const hashedPassword = await bcrypt.hash('1q2w3e4r!!A', 10);

        dbConnect.query.mockImplementation((sql, params) => {
            if (sql.includes('SELECT * FROM user_table')) {
                return [
                    {
                        user_id: 2,
                        email: 'valid@valid.kr',
                        password: hashedPassword,
                        nickname: '검증용',
                        file_id: null,
                        created_at: new Date(),
                        updated_at: new Date(),
                        deleted_at: null,
                    },
                ];
            }
            if (sql.includes('UPDATE user_table SET session_id')) {
                return null;
            }
        });

        const res = await request(app)
            .post('/login')
            .send({ email: 'valid@valid.kr', password: '1q2w3e4r!!A' });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Login success');
        expect(res.body.data).toHaveProperty('userId');
        expect(res.body.data).toHaveProperty('email', 'test@example.com');
    });
});
