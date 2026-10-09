const { MongoMemoryServer } = require("mongodb-memory-server");

(async () => {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: "sanad",
    },
    binary: {
      // Windows ARM has no official mongod build; x64 runs via emulation.
      arch: "x64",
    },
  });
  console.log("MongoMemoryServer started at", mongod.getUri());
})().catch((error) => {
  console.error("Failed to start MongoMemoryServer:", error);
  process.exit(1);
});
