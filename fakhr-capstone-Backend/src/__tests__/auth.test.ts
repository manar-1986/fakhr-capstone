import request from 'supertest';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.model';
import { register, login, forgotPassword, resetPassword } from '../modules/auth/auth.controller';
import { hashPassword } from '../utils/hash';
import { errorHandler } from '../middlewares/error.middleware';
import crypto from 'crypto';

// Mock email utility
jest.mock('../utils/email', () => ({
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('Auth Controller', () => {
    let app: Express;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.post('/register', register);
        app.post('/login', login);
        app.post('/forgot-password', forgotPassword);
        app.post('/reset-password', resetPassword);
        app.use(errorHandler);
    });

    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            };

            const response = await request(app)
                .post('/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(userData.email.toLowerCase());
            expect(response.body.data.user.name).toBe(userData.name);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.password).toBeUndefined();
        });

        it('should fail with missing email', async () => {
            const response = await request(app)
                .post('/register')
                .send({ password: 'password123' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail with invalid email format', async () => {
            const response = await request(app)
                .post('/register')
                .send({ email: 'invalid-email', password: 'password123' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail with short password', async () => {
            const response = await request(app)
                .post('/register')
                .send({ email: 'test@example.com', password: '12345' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail if email already exists', async () => {
            const userData = {
                email: 'existing@example.com',
                password: 'password123',
            };

            // Create user first
            await User.create({
                email: userData.email,
                password: await hashPassword(userData.password),
            });

            const response = await request(app)
                .post('/register')
                .send(userData)
                .expect(409);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /login', () => {
        beforeEach(async () => {
            // Create a test user
            await User.create({
                email: 'login@example.com',
                password: await hashPassword('password123'),
                name: 'Login User',
            });
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('login@example.com');
            expect(response.body.data.token).toBeDefined();
        });

        it('should fail with invalid email', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'password123',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should fail with invalid password', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should fail with missing credentials', async () => {
            const response = await request(app)
                .post('/login')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /forgot-password', () => {
        beforeEach(async () => {
            await User.create({
                email: 'reset@example.com',
                password: await hashPassword('password123'),
            });
        });

        it('should send reset token for existing user', async () => {
            const response = await request(app)
                .post('/forgot-password')
                .send({ email: 'reset@example.com' })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Check that reset token was saved
            const user = await User.findOne({ email: 'reset@example.com' });
            expect(user?.resetPasswordToken).toBeDefined();
            expect(user?.resetPasswordExpires).toBeDefined();
        });

        it('should return success even for non-existent user (security)', async () => {
            const response = await request(app)
                .post('/forgot-password')
                .send({ email: 'nonexistent@example.com' })
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it('should fail with invalid email format', async () => {
            const response = await request(app)
                .post('/forgot-password')
                .send({ email: 'invalid-email' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /reset-password', () => {
        let resetToken: string;
        let user: any;

        beforeEach(async () => {
            resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenHash = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            const resetTokenExpires = new Date();
            resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

            user = await User.create({
                email: 'reset@example.com',
                password: await hashPassword('oldpassword'),
                resetPasswordToken: resetTokenHash,
                resetPasswordExpires: resetTokenExpires,
            });
        });

        it('should reset password successfully with valid token', async () => {
            const response = await request(app)
                .post('/reset-password')
                .send({
                    token: resetToken,
                    password: 'newpassword123',
                })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify password was changed
            const updatedUser = await User.findById(user._id);
            expect(updatedUser?.resetPasswordToken).toBeUndefined();
            expect(updatedUser?.resetPasswordExpires).toBeUndefined();
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .post('/reset-password')
                .send({
                    token: 'invalid-token',
                    password: 'newpassword123',
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail with expired token', async () => {
            // Set token to expired
            user.resetPasswordExpires = new Date(Date.now() - 1000);
            await user.save();

            const response = await request(app)
                .post('/reset-password')
                .send({
                    token: resetToken,
                    password: 'newpassword123',
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail with short password', async () => {
            const response = await request(app)
                .post('/reset-password')
                .send({
                    token: resetToken,
                    password: '12345',
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
