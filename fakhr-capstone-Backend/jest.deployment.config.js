module.exports = {
 ...require('./jest.config'),
 setupFilesAfterEnv: [],
 testMatch: ['**/__tests__/deploymentSafety.test.ts', '**/__tests__/productionConfiguration.test.ts', '**/__tests__/compiledStartup.test.ts'],
};
