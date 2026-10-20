// Test-only values. Never load .env or connect to configured MongoDB.
jest.mock("dotenv",()=>({__esModule:true,default:{config:()=>({})}}));
process.env.NODE_ENV="test";
process.env.JWT_SECRET="isolated-school-tests-not-a-real-secret";
process.env.MONGODB_URI="mongodb://127.0.0.1:1/never-connect";
process.env.OPENAI_API_KEY="mock-only-never-use-live";
