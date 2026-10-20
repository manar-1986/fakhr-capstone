module.exports={...require('./jest.deployment.config'),setupFiles:['<rootDir>/src/testSupport/minimumEnvironment.cjs'],testMatch:['**/__tests__/minimumRelease.test.ts','**/__tests__/minimumEmail.test.ts','**/__tests__/emailSecurity.test.ts','**/__tests__/productionConfiguration.test.ts','**/__tests__/deploymentSafety.test.ts','**/__tests__/compiledStartup.test.ts']};


