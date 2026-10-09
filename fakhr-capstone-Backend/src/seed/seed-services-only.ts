import mongoose from "mongoose";
import connectDB from "../config/db";
import Service from "../models/Service.model";
import { servicesSeed } from "./data/services";

const seedServicesOnly = async () => {
  try {
    // Connect to database
    console.log("Connecting to database...");
    await connectDB();
    console.log("✅ Connected to database");

    // Clear existing services (optional - comment out if you want to keep existing)
    console.log("\nClearing existing services...");
    const deleteResult = await Service.deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing services`);

    // Insert services
    console.log("\nSeeding services...");
    const createdServices = await Service.insertMany(servicesSeed);
    console.log(`✅ Created ${createdServices.length} services`);

    // List created services
    console.log("\n📋 Services created:");
    createdServices.forEach((service, index) => {
      console.log(`  ${index + 1}. ${service.name} (${service.category}) - Rating: ${service.rating} ⭐`);
    });

    console.log("\n✅ Services seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding services:", error);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedServicesOnly();
}

export default seedServicesOnly;
