import { createHash, randomBytes, scryptSync } from "crypto";
import { existsSync, readFileSync } from "fs";
import { MongoClient } from "mongodb";

// Load .env.local or .env if present
for (const envPath of [".env.local", ".env"]) {
  if (existsSync(envPath)) {
    try {
      const content = readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...valParts] = trimmed.split("=");
          const k = key.trim();
          if (!process.env[k]) {
            process.env[k] = valParts.join("=").trim().replace(/^["']|["']$/g, "");
          }
        }
      }
    } catch {}
  }
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio_system";
const dbName = process.env.MONGODB_DB || "portfolio_system";
const adminEmail = process.env.ADMIN_EMAIL || "admin@pfs.local";
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function ensureIndexes(db) {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("users").createIndex({ studentId: 1 }, { unique: true, sparse: true }),
    db.collection("users").createIndex({ role: 1, status: 1 }),
    db.collection("portfolios").createIndex({ userId: 1 }, { unique: true }),
    db.collection("portfolios").createIndex({ slug: 1 }, { unique: true }),
    db.collection("portfolios").createIndex({ status: 1 }),
    db.collection("sessions").createIndex({ userId: 1 }),
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  ]);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  await ensureIndexes(db);

  const now = new Date();
  const existingAdmin = await db.collection("users").findOne({ email: adminEmail });
  if (!existingAdmin) {
    await db.collection("users").insertOne({
      firstName: "System",
      lastName: "Admin",
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: "admin",
      status: "active",
      department: "Computer Engineering",
      createdAt: now,
      updatedAt: now
    });
    console.log(`Seeded admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
