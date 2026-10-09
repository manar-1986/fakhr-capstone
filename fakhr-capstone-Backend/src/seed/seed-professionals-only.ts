import mongoose from "mongoose";
import connectDB from "../config/db";
import Professional from "../models/Professional.model";
import { professionalsSeed } from "./data/professionals";

const seedProfessionalsOnly = async () => {
  try {
    // Connect to database
    console.log("Connecting to database...");
    await connectDB();
    console.log("✅ Connected to database");

    // Clear existing professionals (optional - comment out if you want to keep existing)
    console.log("\nClearing existing professionals...");
    const deleteResult = await Professional.deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing professionals`);

    // Insert professionals
    console.log("\nSeeding professionals...");
    const createdProfessionals = await Professional.insertMany(professionalsSeed);
    console.log(`✅ Created ${createdProfessionals.length} professionals`);

    // List created professionals
    console.log("\n📋 Professionals created:");
    createdProfessionals.forEach((professional, index) => {
      console.log(
        `  ${index + 1}. ${professional.name} (${professional.specialtyLabel}) - Rating: ${professional.rating} ⭐ - ${professional.verified ? "✓ Verified" : "Not Verified"}`
      );
    });

    // Summary by specialty
    console.log("\n📊 Summary by Specialty:");
    const bySpecialty = createdProfessionals.reduce((acc, prof) => {
      acc[prof.specialty] = (acc[prof.specialty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(bySpecialty).forEach(([specialty, count]) => {
      console.log(`  - ${specialty}: ${count} professional(s)`);
    });

    console.log("\n✅ Professionals seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding professionals:", error);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedProfessionalsOnly();
}

export default seedProfessionalsOnly;
