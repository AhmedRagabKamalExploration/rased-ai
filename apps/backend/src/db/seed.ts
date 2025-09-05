import { db } from "@/db";
import { organizations } from "./schema";
import { CryptoUtils } from "@/utils/crypto";

/**
 * Seed script to create sample organizations for testing.
 * Run with: bun run src/db/seed.ts
 */

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create sample organizations
    const sampleOrgs = [
      {
        id: "org-0vhk0196-6cn954w2-j6rd7vx3q-fcssk2xj",
        name: "Example Bank",
        secretApiKey: CryptoUtils.generateApiKey(),
        whitelistedDomains: [
          "localhost:3000",
          "*.example-bank.com",
          "app.example-bank.com",
        ],
        isActive: true,
      },
      {
        id: "org-demo-12345678-abcd-efgh-ijkl-mnopqrstuvwx",
        name: "Demo Organization",
        secretApiKey: CryptoUtils.generateApiKey(),
        whitelistedDomains: ["localhost:3000", "localhost:3001", "*.demo.com"],
        isActive: true,
      },
    ];

    for (const org of sampleOrgs) {
      const existing = await db.query.organizations.findFirst({
        where: (organizations, { eq }) => eq(organizations.id, org.id),
      });

      if (!existing) {
        await db.insert(organizations).values(org);
        console.log(`✅ Created organization: ${org.name} (${org.id})`);
        console.log(`   API Key: ${org.secretApiKey}`);
        console.log(`   Domains: ${org.whitelistedDomains.join(", ")}`);
      } else {
        console.log(`⏭️  Organization already exists: ${org.name}`);
      }
    }

    console.log("\n🎉 Database seeding completed!");
    console.log("\n📋 You can now use these API keys for testing:");

    for (const org of sampleOrgs) {
      console.log(`\n${org.name}:`);
      console.log(`Organization ID: ${org.id}`);
      console.log(`API Key: ${org.secretApiKey}`);
      console.log(`Test curl command:`);
      console.log(
        `curl -H "Authorization: Bearer ${org.secretApiKey}" http://localhost:8000/v1/config`
      );
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (import.meta.main) {
  await seedDatabase();
  process.exit(0);
}
