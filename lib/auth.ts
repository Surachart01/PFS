import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getDb } from "@/lib/mongodb";
import type { SafeUser, SessionPayload, UserDoc, UserRole } from "@/lib/types";

export const SESSION_COOKIE = "portfolio_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * ฟังก์ชัน 1.1: ดึงรหัสลับประจำระบบ (Secret Key)
 * หน้าที่: อ่านค่า AUTH_SECRET จากตัวแปรสภาพแวดล้อม (.env) เพื่อใช้เป็นกุญแจหลักในการเซ็นชื่อกำกับข้อมูลความปลอดภัย
 * คืนค่า: string รหัสลับของระบบ
 */
function authSecret() {
  return process.env.AUTH_SECRET || "development-secret-change-me";
}

/**
 * ฟังก์ชัน 1.2: แปลงข้อมูลเป็น Base64URL
 * หน้าที่: แปลงข้อมูลสตริงหรือไบนารีให้อยู่ในรูปแบบ URL-Safe Base64 เพื่อให้สามารถส่งผ่าน URL หรือ Cookie ได้โดยปลอดภัย
 * พารามิเตอร์: input - ข้อความหรือ Buffer ที่ต้องการแปลง
 * คืนค่า: string ข้อความ Base64URL ที่ปลอดภัยต่อเว็บ
 */
function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

/**
 * ฟังก์ชัน 1.3: ประทับตรารับรองดิจิทัล (HMAC-SHA256 Signature)
 * หน้าที่: นำข้อมูลมาเซ็นกำกับด้วยรหัสลับของระบบ เพื่อป้องกันไม่ให้ผู้ใช้หรือผู้ไม่หวังดีแอบแก้ไขข้อมูล Token ได้เอง
 * พารามิเตอร์: value - ข้อความที่ต้องการสร้างลายเซ็น
 * คืนค่า: string ลายเซ็นดิจิทัล
 */
function sign(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

/**
 * ฟังก์ชัน 1.4: เปรียบเทียบข้อมูลแบบป้องกันการจับเวลา (Timing Attack Safe Compare)
 * หน้าที่: ตรวจสอบข้อความ 2 ตัวว่าตรงกันหรือไม่ โดยใช้เวลาในการตรวจสอบคงที่เสมอ ป้องกันแฮกเกอร์จับเวลาเพื่อเดารหัสผ่าน
 * พารามิเตอร์: a, b - ข้อความสองตัวที่ต้องการเปรียบเทียบ
 * คืนค่า: boolean (true หากตรงกัน, false หากไม่ตรงกัน)
 */
function safeCompare(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
}

/**
 * ฟังก์ชัน 1.5: ตรวจสอบระดับความปลอดภัยของ Cookie
 * หน้าที่: ตรวจสอบว่าระบบกำลังทำงานบน Production หรือ HTTPS หรือไม่ เพื่อเปิดใช้งานการส่ง Cookie แบบ Secure
 * คืนค่า: boolean (true = ส่งผ่าน HTTPS เท่านั้น, false = ยอมรับ HTTP ในช่วงพัฒนา)
 */
function shouldUseSecureCookie() {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https://") || process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

/**
 * ฟังก์ชัน 1.6: เข้ารหัสผ่านผู้ใช้ (Scrypt Password Hash)
 * หน้าที่: แปลงรหัสผ่านเป็นรหัสแฮชที่ถอดกลับไม่ได้ โดยสุ่มสร้าง Salt 16 ไบต์ขึ้นมาผสมก่อนแฮช เพื่อความปลอดภัยสูงสุด
 * พารามิเตอร์: password - รหัสผ่านตัวจริงที่ผู้ใช้พิมพ์เข้ามา
 * คืนค่า: string รหัสผ่านในรูปแบบ scrypt:[salt]:[hash] สำหรับบันทึกลงฐานข้อมูล
 */
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

/**
 * ฟังก์ชัน 1.7: ตรวจสอบความถูกต้องของรหัสผ่าน (Verify Password)
 * หน้าที่: นำรหัสผ่านที่ผู้ใช้พิมพ์ตอนล็อกอิน มาคำนวณซ้ำด้วย Salt เดิม แล้วตรวจว่าตรงกับค่าที่บันทึกไว้ในฐานข้อมูลหรือไม่
 * พารามิเตอร์: password - รหัสผ่านที่ผู้ใช้พิมพ์, stored - รหัสผ่านที่เข้ารหัสไว้ในฐานข้อมูล
 * คืนค่า: boolean (true = รหัสผ่านถูกต้อง, false = รหัสผ่านไม่ถูกต้อง)
 */
export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, expected] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !expected) return false;
  const actual = scryptSync(password, salt, 64).toString("hex");
  return safeCompare(actual, expected);
}

/**
 * ฟังก์ชัน 1.8: สร้างเซสชันโทเคน (Create Session Token)
 * หน้าที่: ออกตั๋วผ่านประตูระบุตัวตนของผู้ใช้ (userId, role) กำหนดอายุใช้งาน 7 วัน และประทับลายเซ็นดิจิทัลกำกับ
 * พารามิเตอร์: payload - ข้อมูลผู้ใช้ { userId, role }
 * คืนค่า: string ตั๋วเซสชันในรูปแบบ [encodedPayload].[signature]
 */
export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const body: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  };
  const encoded = base64url(JSON.stringify(body));
  return `${encoded}.${sign(encoded)}`;
}

/**
 * ฟังก์ชัน 1.9: ตรวจสอบความถูกต้องของเซสชันโทเคน (Verify Session Token)
 * หน้าที่: ตรวจสอบว่าโทเคนที่ผู้ใช้ถืออยู่เป็นของจริง ไม่ถูกดัดแปลงแก้ไข และยังไม่หมดอายุ
 * พารามิเตอร์: token - ตั๋วเซสชันที่อ่านได้จาก Cookie
 * คืนค่า: SessionPayload (ข้อมูลผู้ใช้) หากถูกต้อง หรือ null หากไม่ถูกต้อง/หมดอายุ
 */
export function verifySessionToken(token?: string): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !safeCompare(sign(encoded), signature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || !payload.role || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * ฟังก์ชัน 1.10: บันทึกคุกกี้เซสชันลงเบราว์เซอร์ (Set Session Cookie)
 * หน้าที่: แนบคุกกี้ portfolio_session ไปกับ Response โดยตั้งค่า HttpOnly ป้องกัน JavaScript แอบขโมยคุกกี้
 * พารามิเตอร์: response - ออบเจกต์ NextResponse, token - ตั๋วเซสชัน
 */
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/"
  });
}

/**
 * ฟังก์ชัน 1.11: ลบคุกกี้เซสชันเพื่อออกจากระบบ (Clear Session Cookie)
 * หน้าที่: สั่งให้เบราว์เซอร์ทำลายคุกกี้ portfolio_session ทิ้งทันทีเมื่อผู้ใช้กด Logout
 * พารามิเตอร์: response - ออบเจกต์ NextResponse
 */
export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
    maxAge: 0,
    path: "/"
  });
}

/**
 * ฟังก์ชัน 1.12: คัดกรองข้อมูลผู้ใช้เพื่อความปลอดภัย (To Safe User)
 * หน้าที่: ตัดฟิลด์ความลับ (เช่น passwordHash) ออก เหลือเฉพาะข้อมูลทั่วไปที่ปลอดภัยสำหรับส่งไปแสดงผลที่หน้าจอ
 * พารามิเตอร์: user - เอกสารผู้ใช้ตัวเต็มจากฐานข้อมูล
 * คืนค่า: SafeUser ออบเจกต์ข้อมูลผู้ใช้ที่ปลอดภัย
 */
export function toSafeUser(user: UserDoc): SafeUser {
  return {
    id: user._id.toString(),
    studentId: user.studentId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    department: user.department,
    year: user.year,
    status: user.status
  };
}

/**
 * ฟังก์ชัน 1.13: ดึงข้อมูลผู้ใช้ปัจจุบันที่กำลังล็อกอินอยู่ (Get Current User)
 * หน้าที่: อ่านคุกกี้ของผู้ใช้ ถอดรหัสโทเคน และดึงข้อมูลผู้ใช้ล่าสุดจากฐานข้อมูล MongoDB โดยต้องมีสถานะเป็น active
 * คืนค่า: Promise<SafeUser | null> ข้อมูลผู้ใช้ปัจจุบัน หรือ null หากไม่ได้ล็อกอิน
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload || !ObjectId.isValid(payload.userId)) return null;

  const db = await getDb();
  const user = await db.collection<UserDoc>("users").findOne({ _id: new ObjectId(payload.userId), status: "active" });
  return user ? toSafeUser(user) : null;
}

/**
 * ฟังก์ชัน 1.14: ตรวจสอบสิทธิ์การเข้าถึง API (Require API User Guard)
 * หน้าที่: ป้อมยามสำหรับ API Routes ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่ และมีสิทธิ์ตรงตามที่กำหนด (roles) หรือไม่
 * พารามิเตอร์: roles - รายการสิทธิ์ที่อนุญาต เช่น ['admin'] หรือ ['student']
 * คืนค่า: { user, response } หากผ่านจะได้ user / หากไม่ผ่านจะได้ response ข้อผิดพลาด HTTP 401 หรือ 403
 */
export async function requireApiUser(roles?: UserRole[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 }) };
  }
  if (roles && !roles.includes(user.role)) {
    return { user: null, response: NextResponse.json({ message: "ไม่มีสิทธิ์ใช้งานส่วนนี้" }, { status: 403 }) };
  }
  return { user, response: null };
}

/**
 * ฟังก์ชัน 1.15: ตรวจสอบความถูกต้องของอีเมลสถาบัน (@kmitl.ac.th)
 * หน้าที่: ตรวจสอบรูปแบบอีเมลและบังคับให้ลงท้ายด้วยโดเมน @kmitl.ac.th เท่านั้น
 * พารามิเตอร์: email - ที่อยู่อีเมลที่ต้องการตรวจสอบ
 * คืนค่า: boolean (true หากเป็นอีเมล @kmitl.ac.th ที่ถูกต้อง, false หากไม่ใช่)
 */
export function isValidKmitlEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@kmitl\.ac\.th$/.test(trimmed);
}

