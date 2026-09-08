import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio_system";
const dbName = process.env.MONGODB_DB || "portfolio_system";

type MongoGlobal = typeof globalThis & {
  _portfolioMongoClient?: MongoClient;
  _portfolioMongoPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

/**
 * ฟังก์ชัน 2.1: ตัวจัดการท่อเชื่อมต่อ MongoDB แบบแคช (Get Mongo Client - Singleton Pattern)
 * หน้าที่: สร้างและส่งคืน Connection Client ของ MongoDB โดยเปิดท่อเชื่อมต่อเพียงครั้งเดียวแล้วเก็บไว้ใน globalThis
 *         เพื่อป้องกันปัญหาเปิด Connection ซ้ำซ้อนหลายร้อยท่อ ช่วยให้เว็บทำงานรวดเร็วและไม่ทำให้ฐานข้อมูลล่ม
 * คืนค่า: Promise<MongoClient> อินสแตนซ์ไคลเอ็นต์ของ MongoDB ที่เชื่อมต่อสำเร็จ
 */
export function getMongoClient() {
  if (!globalForMongo._portfolioMongoPromise) {
    globalForMongo._portfolioMongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });
    globalForMongo._portfolioMongoPromise = globalForMongo._portfolioMongoClient.connect().catch((err) => {
      // รีเซ็ตค่าแคชหากการเชื่อมต่อล้มเหลว เพื่อให้คำสั่งถัดไปลองเชื่อมต่อใหม่อัตโนมัติ
      globalForMongo._portfolioMongoPromise = undefined;
      globalForMongo._portfolioMongoClient = undefined;
      throw err;
    });
  }
  return globalForMongo._portfolioMongoPromise;
}

/**
 * ฟังก์ชัน 2.2: ดึงออบเจกต์ฐานข้อมูลพร้อมใช้งาน (Get Database Instance)
 * หน้าที่: รอรับการเชื่อมต่อจาก MongoClient แล้วเลือกฐานข้อมูล portfolio_system ตามที่กำหนดใน Environment
 * คืนค่า: Promise<Db> ออบเจกต์ฐานข้อมูลสำหรับสั่ง find, insert, update หรือ delete ได้ทันที
 */
export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

/**
 * ฟังก์ชัน 2.3: สร้างดัชนีเพื่อเร่งความเร็วในการค้นหาข้อมูล (Ensure Database Indexes)
 * หน้าที่: สั่งให้ MongoDB สร้างดัชนี (Indexes) บนฟิลด์ที่ใช้งานบ่อย เช่น email, studentId, slug, และ status
 *         ช่วยให้การค้นหาและล็อกอินทำได้รวดเร็วในระดับมิลลิวินาที พร้อมป้องกันข้อมูลซ้ำซ้อน (Unique Constraint)
 */
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
