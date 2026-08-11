import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio_system";
const dbName = process.env.MONGODB_DB || "portfolio_system";

type MongoGlobal = typeof globalThis & {
  _portfolioMongoClient?: MongoClient;
  _portfolioMongoPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

export function getMongoClient() {
  if (!globalForMongo._portfolioMongoPromise) {
    globalForMongo._portfolioMongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });
    globalForMongo._portfolioMongoPromise = globalForMongo._portfolioMongoClient.connect().catch((err) => {
      // Reset cached promise so next call retries the connection
      globalForMongo._portfolioMongoPromise = undefined;
      globalForMongo._portfolioMongoClient = undefined;
      throw err;
    });
  }
  return globalForMongo._portfolioMongoPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

export async function ensureIndexes() {
  const db = await getDb();
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
