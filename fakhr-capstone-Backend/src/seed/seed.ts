// src/seed/seed.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db";
import { hashPassword } from "../utils/hash";

// ✅ Load environment variables
dotenv.config();

// ✅ Seed configuration flag
const SEED_CARE_PATH = process.env.SEED_CARE_PATH === "true";

// ✅ Seed data imports (MUST be at top)
import { centersSeed } from "./data/centers";
import { professionalsSeed } from "./data/professionals";
import { servicesSeed } from "./data/services";

// ✅ Your real Mongoose models (adjust paths if your filenames differ)
import User from "../models/User.model";
import Child from "../models/Child.model";
import Center from "../models/Center.model";
import Professional from "../models/Professional.model";
import Service from "../models/Service.model";
import CarePathTemplate from "../models/CarePathTemplate.model";
import CarePath from "../models/CarePath.model";
import Task from "../models/Task.model";
import Checkin from "../models/Checkin.model";
import Post from "../models/Post.model";
import PostReport from "../models/PostReport.model";

// ✅ Models object for cleaner access
const models = {
  User,
  Child,
  Center,
  Professional,
  Service,
  CarePathTemplate,
  CarePath,
  Task,
  Checkin,
  Post,
  PostReport,
};

// =========================
// 1) DUMMY SEED DATA (users/children/templates/posts only)
// =========================
const dummyData = {
  users: [
    { email: "parent1@example.com", password: "password123", name: "Ahmed Ali" },
    { email: "parent2@example.com", password: "password123", name: "Fatima Hassan" },
    { email: "parent3@example.com", password: "password123", name: "Mohammed Ibrahim" },
    { email: "parent4@example.com", password: "password123", name: "Majeed Ibrahim" },
  ],

  children: [
    {
      name: "Omar Ahmed",
      age: 8,
      gender: "male",
      diagnosis: "Autism Spectrum Disorder",
      medicalHistory: "Diagnosed at age 3, receiving therapy since age 4",
      medications: "None",
      allergies: "Peanuts",
    },
    {
      name: "Layla Fatima",
      age: 6,
      gender: "female",
      diagnosis: "Down Syndrome",
      medicalHistory: "Born with Down Syndrome, regular checkups",
      medications: "Vitamin supplements",
      allergies: "None",
    },
    {
      name: "Youssef Mohammed",
      age: 10,
      gender: "male",
      diagnosis: "ADHD",
      medicalHistory: "Diagnosed at age 7, behavioral therapy",
      medications: "Prescribed medication",
      allergies: "Dairy",
    },
  ],

  carePathTemplates: [
    {
      name: "Autism Support Plan",
      description: "Comprehensive care plan for children with autism",
      duration: 12,
      tasks: [
        {
          week: 1,
          title: "Initial Assessment",
          description: "Complete initial assessment with therapist",
          instructions: "Schedule appointment and prepare questions",
          expectedOutcome: "Baseline assessment completed",
        },
        {
          week: 2,
          title: "Social Skills Training",
          description: "Begin social skills training sessions",
          instructions: "Attend weekly sessions, practice at home",
          expectedOutcome: "Improved social interaction",
        },
        {
          week: 3,
          title: "Communication Therapy",
          description: "Start communication therapy program",
          instructions: "Practice daily communication exercises",
          expectedOutcome: "Enhanced communication skills",
        },
      ],
    },
    {
      name: "Down Syndrome Care Plan",
      description: "Structured care plan for children with Down Syndrome",
      duration: 16,
      tasks: [
        {
          week: 1,
          title: "Medical Checkup",
          description: "Complete comprehensive medical evaluation",
          instructions: "Bring all medical records",
          expectedOutcome: "Health status documented",
        },
        {
          week: 2,
          title: "Physical Therapy",
          description: "Begin physical therapy sessions",
          instructions: "Attend twice weekly sessions",
          expectedOutcome: "Improved motor skills",
        },
        {
          week: 3,
          title: "Speech Therapy",
          description: "Start speech and language therapy",
          instructions: "Practice exercises daily",
          expectedOutcome: "Better speech clarity",
        },
      ],
    },
    {
      name: "ADHD Management Plan",
      description: "Behavioral and educational support for ADHD",
      duration: 10,
      tasks: [
        {
          week: 1,
          title: "Behavioral Assessment",
          description: "Complete behavioral assessment",
          instructions: "Observe and document behaviors",
          expectedOutcome: "Behavior patterns identified",
        },
        {
          week: 2,
          title: "Structured Routine",
          description: "Implement structured daily routine",
          instructions: "Create and follow daily schedule",
          expectedOutcome: "Improved routine adherence",
        },
        {
          week: 3,
          title: "Focus Training",
          description: "Begin focus and attention training",
          instructions: "Practice concentration exercises",
          expectedOutcome: "Increased attention span",
        },
      ],
    },
  ],

  posts: [
    {
      title: "Tips for Managing Meltdowns",
      content:
        "Here are some strategies for managing meltdowns with predictable routines and calm cues...",
      tags: ["autism", "parenting", "tips"],
      likes: 0,
    },
    {
      title: "Finding the Right Therapist",
      content:
        "What helped me: shortlisting by specialty, asking about experience, and trial sessions...",
      tags: ["therapy", "resources", "advice"],
      likes: 0,
    },
    {
      title: "Celebrating Small Wins",
      content:
        "Today my child made progress. Celebrate every milestone—small wins build momentum.",
      tags: ["milestones", "celebration", "progress"],
      likes: 0,
    },
  ],
};

// =========================
// 2) SEED FUNCTION
// =========================
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing collections (seed scope only)...");
    await Promise.all([
      models.User.deleteMany({}),
      models.Child.deleteMany({}),
      models.Center.deleteMany({}),
      models.Professional.deleteMany({}),
      models.Service.deleteMany({}),
      models.Post.deleteMany({}),
      models.PostReport.deleteMany({}),

      ...(SEED_CARE_PATH
        ? [
          models.CarePathTemplate.deleteMany({}),
          models.CarePath.deleteMany({}),
          models.Task.deleteMany({}),
          models.Checkin.deleteMany({}),
        ]
        : []),
    ]);

    // -------------------------
    // Users
    // -------------------------
    console.log("👤 Seeding users...");
    const hashedUsers = await Promise.all(
      dummyData.users.map(async (u) => ({
        ...u,
        password: await hashPassword(u.password),
      }))
    );
    const createdUsers = await models.User.insertMany(hashedUsers);
    console.log(`✅ Users: ${createdUsers.length}`);

    // -------------------------
    // Children
    // -------------------------
    console.log("🧒 Seeding children...");
    const childrenToInsert = dummyData.children.map((child, index) => ({
      ...child,
      parentId: createdUsers[index % createdUsers.length]._id,
    }));
    const createdChildren = await models.Child.insertMany(childrenToInsert as any);
    console.log(`✅ Children: ${createdChildren.length}`);

    // -------------------------
    // Care Path Data (conditional)
    // -------------------------
    if (SEED_CARE_PATH) {
      // seed CarePathTemplates
      console.log("🧩 Seeding care path templates...");
      const createdTemplates = await models.CarePathTemplate.insertMany(
        dummyData.carePathTemplates as any
      );
      console.log(`✅ CarePathTemplates: ${createdTemplates.length}`);

      // seed CarePaths
      console.log("🗺️ Seeding care paths...");
      const carePathsToInsert = createdChildren.map((child, index) => ({
        childId: child._id,
        templateId: createdTemplates[index % createdTemplates.length]._id,
        startDate: new Date(),
        status: "active",
      }));
      const createdCarePaths = await models.CarePath.insertMany(carePathsToInsert as any);
      console.log(`✅ CarePaths: ${createdCarePaths.length}`);

      // seed Tasks
      console.log("✅ Seeding tasks...");
      const tasksToInsert: any[] = [];

      createdCarePaths.forEach((carePath: any, idx: number) => {
        const template = createdTemplates[idx % createdTemplates.length] as any;

        (template.tasks || []).forEach((t: any) => {
          tasksToInsert.push({
            carePathId: carePath._id,
            week: t.week,
            title: t.title,
            description: t.description,
            instructions: t.instructions,
            expectedOutcome: t.expectedOutcome,
            completed: Math.random() > 0.7,
            dueDate: new Date(Date.now() + t.week * 7 * 24 * 60 * 60 * 1000),
          });
        });
      });

      await models.Task.insertMany(tasksToInsert as any);
      console.log(`✅ Tasks: ${tasksToInsert.length}`);

      // seed Checkins
      console.log("📝 Seeding checkins...");
      const checkinsToInsert = createdCarePaths.map((carePath: any) => ({
        carePathId: carePath._id,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        notes: "Progress is going well. Child is responding positively to routines.",
        rating: Math.floor(Math.random() * 3) + 3, // 3–5
      }));
      await models.Checkin.insertMany(checkinsToInsert as any);
      console.log(`✅ Checkins: ${checkinsToInsert.length}`);
    } else {
      console.log("⏭️ Skipping Care Path seeding (SEED_CARE_PATH=false)");
    }

    // -------------------------
    // Services (from seed file)
    // -------------------------
    console.log("📋 Seeding services...");
    const createdServices = await models.Service.insertMany(servicesSeed as any);
    console.log(`✅ Services: ${createdServices.length}`);

    // -------------------------
    // Centers (from seed file)
    // -------------------------
    console.log("🏢 Seeding centers...");
    const createdCenters = await models.Center.insertMany(centersSeed as any);
    console.log(`✅ Centers: ${createdCenters.length}`);

    // -------------------------
    // Professionals (from seed file)
    // -------------------------
    console.log("🧑‍⚕️ Seeding professionals...");

    const centerIdByName = new Map<string, mongoose.Types.ObjectId>();
    createdCenters.forEach((c: any) => centerIdByName.set(c.name, c._id));

    const professionalsToInsert = professionalsSeed.map((p: any) => {
      const centerName = p.centerName;
      const centerId = centerName ? centerIdByName.get(centerName) : undefined;

      if (centerName && !centerId) {
        console.warn(`⚠️ Missing center match for professional "${p.name}": ${centerName}`);
      }

      const { centerName: _remove, email, phone, image, ...rest } = p;
      const result: any = {
        ...rest,
      };

      // Only include optional fields if they have non-empty values
      if (email && email.trim()) result.email = email;
      if (phone && phone.trim()) result.phone = phone;
      if (image && image.trim()) result.image = image;
      if (centerId) result.centerId = centerId;

      return result;
    });

    const createdProfessionals = await models.Professional.insertMany(professionalsToInsert as any);
    console.log(`✅ Professionals: ${createdProfessionals.length}`);

    const missing = await Professional.countDocuments({ centerId: { $exists: false } });
    console.log("Missing centerId:", missing);

    // -------------------------
    // Posts
    // -------------------------
    console.log("💬 Seeding posts...");
    const postsToInsert = dummyData.posts.map((post, idx) => ({
      ...post,
      authorId: createdUsers[idx % createdUsers.length]._id,
    }));
    const createdPosts = await models.Post.insertMany(postsToInsert as any);
    console.log(`✅ Posts: ${createdPosts.length}`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\nTest user credentials:");
    console.log("Email: parent1@example.com, Password: password123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;