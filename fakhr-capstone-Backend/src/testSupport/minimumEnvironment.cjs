process.env.NODE_ENV='test';
process.env.JWT_SECRET='synthetic-local-validation-only';
process.env.FAKHR_AI_ENABLED='false';
delete process.env.FAKHR_RELEASE_PROFILE;
delete process.env.RENDER;
delete process.env.TRUSTED_PROXY_CIDRS;
delete process.env.CORS_ALLOWED_ORIGINS;
process.env.FRONTEND_URL='http://localhost:3000';
