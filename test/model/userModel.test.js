const userModel = require('../../model/userModel');
const dbConnect = require('../../database/index');
const bcrypt = require('bcrypt');

jest.mock('../../database/index');

describe('User Model - loginUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return null if email does not exist', async () => {
        dbConnect.query.mockResolvedValue([null]);

        const requestData = {
            email: 'nonexistent@example.com',
            password: 'password123',
            sessionId: 'sessionId123',
        };

        const result = await userModel.loginUser(requestData);
        expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);

        dbConnect.query.mockResolvedValue([
            {
                user_id: 1,
                email: 'test@example.com',
                password: hashedPassword,
                nickname: 'testuser',
                file_id: null,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
            },
        ]);

        const requestData = {
            email: 'test@example.com',
            password: 'wrongpassword',
            sessionId: 'sessionId123',
        };

        const result = await userModel.loginUser(requestData);
        expect(result).toBeNull();
    });

    it('should return user data if email and password match', async () => {
        const hashedPassword = await bcrypt.hash('1q2w3e4r!!A', 10);

        dbConnect.query.mockResolvedValueOnce([
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
        ]);

        dbConnect.query.mockResolvedValueOnce(null); // For session update

        const requestData = {
            email: 'valid@valid.kr',
            password: '1q2w3e4r!!A',
            sessionId: 'sessionId123',
        };

        const result = await userModel.loginUser(requestData);

        expect(result).toHaveProperty('userId');
        expect(result).toHaveProperty('email', 'test@example.com');
        expect(result).toHaveProperty('nickname', 'testuser');
        expect(result).toHaveProperty('sessionId', 'sessionId123');
    });
});
