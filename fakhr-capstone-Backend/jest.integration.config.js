module.exports = {
 ...require('./jest.config'),
 testMatch: ['**/__tests__/**/*.test.ts'],
 setupFilesAfterEnv: ['<rootDir>/src/testSupport/integrationMongo.ts'],
 testTimeout: 180000,
};
