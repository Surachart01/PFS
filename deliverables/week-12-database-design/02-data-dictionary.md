# 📖 พจนานุกรมข้อมูลฉบับสมบูรณ์ (Data Dictionary)

**โครงการ:** ระบบ Portfolio ออนไลน์สำหรับนักศึกษาวิศวกรรมคอมพิวเตอร์ (PFS)  
**เอกสารประกอบ:** สัปดาห์ที่ 12 (Database Design & Data Dictionary)  
**ระบบฐานข้อมูล:** MongoDB (BSON Specification)

---

## 1. คอลเลกชัน: `users` (ตารางข้อมูลผู้ใช้งาน)

จัดเก็บข้อมูลบัญชีผู้ใช้งานทั้งหมดในระบบ ทั้งนักศึกษาและผู้ดูแลระบบ

| ลำดับ | ชื่อฟิลด์ (Field Name) | ชนิดข้อมูล (BSON Type) | ขนาด / ข้อจำกัด (Constraints) | ค่าเริ่มต้น (Default) | อนุญาตว่าง (Nullable) | คำอธิบายและความหมาย (Description) | ตัวอย่างข้อมูล (Sample Data) |
|:---:|---|---|---|---|:---:|---|---|
| 1 | `_id` | `ObjectId` | PK (Primary Key), Auto-generated | *(Auto)* | No | รหัสระบุเอกลักษณ์ประจำตัวผู้ใช้งานในระบบ | `ObjectId("668f12a3b4c5d6e7f8a9b0c1")` |
| 2 | `studentId` | `String` | UK (Unique, Sparse Index), 8-15 ตัวอักษร | `null` | Yes | รหัสนักศึกษา (จำเป็นสำหรับ Role `student`) | `"64010123"` |
| 3 | `firstName` | `String` | Not Null, ความยาว 1-100 ตัวอักษร | - | No | ชื่อจริงของผู้ใช้งาน | `"สมชาย"` |
| 4 | `lastName` | `String` | Not Null, ความยาว 1-100 ตัวอักษร | - | No | นามสกุลของผู้ใช้งาน | `"ใจดี"` |
| 5 | `email` | `String` | UK (Unique Index), รูปแบบอีเมลมาตรฐาน | - | No | อีเมลสำหรับติดต่อและเข้าสู่ระบบ (ตัวพิมพ์เล็ก) | `"somchai.j@university.ac.th"` |
| 6 | `passwordHash`| `String` | Not Null, ความยาว 128 ตัวอักษร | - | No | รหัสผ่านที่ผ่านการเข้ารหัสด้วยอัลกอริทึม scrypt (`scrypt:salt:hash`) | `"scrypt:4a8f...:9e2b..."` |
| 7 | `role` | `String` | Not Null, Enum: `"student"`, `"admin"` | `"student"` | No | บทบาทและสิทธิ์การใช้งานในระบบ | `"student"` |
| 8 | `department` | `String` | ความยาวไม่เกิน 150 ตัวอักษร | `"Computer Engineering"`| Yes | สาขาวิชาหรือภาควิชาที่สังกัด | `"Computer Engineering"` |
| 9 | `year` | `Int32` | ค่าตัวเลขระหว่าง 1 ถึง 8 | `1` | Yes | ชั้นปีการศึกษาปัจจุบันของนักศึกษา | `3` |
| 10 | `status` | `String` | Not Null, Enum: `"active"`, `"inactive"`| `"active"` | No | สถานะบัญชีผู้ใช้งาน (`active` = ใช้งานได้ปกติ, `inactive` = ระงับการใช้งาน) | `"active"` |
| 11 | `createdAt` | `Date` | Not Null, ISODate Timestamp | `now()` | No | วันที่และเวลาที่บันทึกบัญชีเข้าสู่ระบบ | `ISODate("2026-07-12T08:30:00Z")` |
| 12 | `updatedAt` | `Date` | Not Null, ISODate Timestamp | `now()` | No | วันที่และเวลาที่มีการปรับปรุงข้อมูลล่าสุด | `ISODate("2026-09-05T10:15:00Z")` |

---

## 2. คอลเลกชัน: `portfolios` (ตารางข้อมูล Portfolio และการจัดวาง)

จัดเก็บการตั้งค่าผลงาน โครงสร้างตารางกริด 12 คอลัมน์ ธีม และเนื้อหาผลงานทั้งหมดของนักศึกษา

| ลำดับ | ชื่อฟิลด์ (Field Name) | ชนิดข้อมูล (BSON Type) | ขนาด / ข้อจำกัด (Constraints) | ค่าเริ่มต้น (Default) | อนุญาตว่าง (Nullable) | คำอธิบายและความหมาย (Description) | ตัวอย่างข้อมูล (Sample Data) |
|:---:|---|---|---|---|:---:|---|---|
| 1 | `_id` | `ObjectId` | PK (Primary Key), Auto-generated | *(Auto)* | No | รหัสระบุเอกลักษณ์ประจำ Portfolio | `ObjectId("669b23c4d5e6f7a8b9c0d1e2")` |
| 2 | `userId` | `ObjectId` | FK (Foreign Key -> `users._id`), UK | - | No | รหัสผู้ใช้งานที่เป็นเจ้าของผลงานนี้ (1:1) | `ObjectId("668f12a3b4c5d6e7f8a9b0c1")` |
| 3 | `title` | `String` | Not Null, ความยาว 1-120 ตัวอักษร | `"My Resume"` | No | ชื่อหัวข้อของ Portfolio หรือ Resume | `"Somchai - Software Engineer Portfolio"` |
| 4 | `slug` | `String` | UK (Unique Index), `[a-z0-9-]` | Auto slug | No | URL Slug ประจำตัวสำหรับแชร์ผลงานสาธารณะ | `"somchai-portfolio-2026"` |
| 5 | `status` | `String` | Not Null, Enum: `"draft"`, `"published"`, `"unpublished"` | `"draft"` | No | สถานะการเปิดเผยผลงานสู่สาธารณะ | `"published"` |
| 6 | `theme` | `String` | Enum: `"modern"`, `"classic"`, `"minimal"` | `"modern"` | No | สไตล์โครงสร้างหลักของหน้า | `"modern"` |
| 7 | `templateId` | `String` | Enum: `"professional"`, `"modern"`, `"creative"`, `"minimal"`, `"academic"`, `"compact"` | `"professional"` | Yes | รหัส Template สำเร็จรูปที่เลือกใช้ | `"creative"` |
| 8 | `styleSettings` | `Object` | Embedded Document (ดูตารางย่อย 2.1) | Object | No | การตั้งค่าสไตล์ เช่น โทนสี ฟอนต์ และพื้นหลัง | `{ primaryColor: "#4f46e5", ... }` |
| 9 | `sections` | `Array<Object>` | Embedded Array of Sections (ดูตารางย่อย 2.2) | `[]` | No | รายการบล็อกองค์ประกอบทั้งหมดบน Canvas | `[ { id: "sec-1", ... } ]` |
| 10 | `publishedAt` | `Date` | ISODate Timestamp | `null` | Yes | วันที่และเวลาที่สั่งเผยแพร่สู่สาธารณะล่าสุด | `ISODate("2026-08-01T14:20:00Z")` |
| 11 | `createdAt` | `Date` | Not Null, ISODate Timestamp | `now()` | No | วันที่และเวลาที่สร้าง Portfolio | `ISODate("2026-07-15T09:00:00Z")` |
| 12 | `updatedAt` | `Date` | Not Null, ISODate Timestamp | `now()` | No | วันที่และเวลาที่บันทึกข้อมูลล่าสุด | `ISODate("2026-09-05T12:00:00Z")` |

---

### 2.1 โครงสร้างย่อย: `styleSettings` (Embedded Object)

| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อจำกัด / ค่าที่รองรับ | ค่าเริ่มต้น | คำอธิบาย |
|---|---|---|---|---|
| `primaryColor` | `String` | รูปแบบ Hex Color (`#RRGGBB`) | `"#4f46e5"` | โทนสีหลักที่ใช้เน้นหัวข้อ ปุ่ม และแถบกราฟิก |
| `fontFamily` | `String` | Enum: `"Inter"`, `"Prompt"`, `"Kanit"`, `"Playfair Display"`, `"Fira Code"`, `"Outfit"` | `"Prompt"` | รูปแบบตัวอักษรของทั้งหน้า Portfolio |
| `fontSize` | `Int32` | ค่าตัวเลขระหว่าง 12 ถึง 24 (px) | `16` | ขนาดตัวอักษรพื้นฐาน |
| `backgroundTheme` | `String` | Enum: `"default"`, `"dark-slate"`, `"glassmorphism"`, `"mesh-gradient"`, `"sunset"`, `"nordic"` | `"default"` | ธีมและเอฟเฟกต์พื้นหลังของหน้า Document Canvas |
| `layout` | `String` | Enum: `"clean"`, `"project-first"`, `"profile-first"` | `"clean"` | แนวทางการจัดกลุ่มและเรียงลำดับเนื้อหา |

---

### 2.2 โครงสร้างย่อย: `sections` (Embedded Array of Objects)

| ชื่อฟิลด์ | ชนิดข้อมูล | ข้อจำกัด / ค่าที่รองรับ | ค่าเริ่มต้น | คำอธิบาย |
|---|---|---|---|---|
| `id` | `String` | PK ภายในอาเรย์ (UUID หรือ Timestamp ID) | - | รหัสอ้างอิงบล็อกสำหรับ Drag and Drop และลบการ์ด |
| `type` | `String` | Enum: `"profile"`, `"about"`, `"education"`, `"skills"`, `"projects"`, `"experience"`, `"certificates"`, `"contact"`, `"custom"` | - | ชนิดของบล็อกองค์ประกอบ |
| `title` | `String` | ความยาว 1-100 ตัวอักษร | - | ชื่อป้ายหัวข้อของการ์ด |
| `visible` | `Boolean` | `true` หรือ `false` | `true` | กำหนดการซ่อน/แสดงบล็อกนี้บนหน้าสาธารณะ |
| `order` | `Int32` | ค่าตัวเลขลำดับ | `0` | ลำดับการแสดงผลในกรณีเรียงแบบแถวเดียว |
| `gridPlacement` | `Object` | `{ colStart, colEnd, rowStart, rowEnd }` | - | พิกัดตำแหน่งบน 12-Column CSS Grid Canvas |
| `gridPlacement.colStart` | `Int32` | ค่าตัวเลขระหว่าง 1 ถึง 12 | `1` | คอลัมน์เริ่มต้นของบล็อก |
| `gridPlacement.colEnd` | `Int32` | ค่าตัวเลขระหว่าง 2 ถึง 13 | `13` | คอลัมน์สิ้นสุดของบล็อก |
| `gridPlacement.rowStart` | `Int32` | ค่าตัวเลข >= 1 | `1` | แถวเริ่มต้นของบล็อก |
| `gridPlacement.rowEnd` | `Int32` | ค่าตัวเลข >= 2 | `2` | แถวสิ้นสุดของบล็อก |
| `settings` | `Object` | Object ค่าการตกแต่งการ์ด | `{}` | กำหนดรูปแบบ `cardVariant`, `borderStyle`, `itemStyle` |
| `content` | `Object` | Object เนื้อหาภายในบล็อก | `{}` | จัดเก็บ `body` (คำอธิบาย), `items` (รายการย่อย), `imageUrl` (รูปภาพ) |

---

## 3. คอลเลกชัน: `sessions` (ตารางบันทึกการเข้าสู่ระบบ)

จัดเก็บประวัติ Session การใช้งานและความถูกต้องของ Token ในการเข้าสู่ระบบ

| ลำดับ | ชื่อฟิลด์ (Field Name) | ชนิดข้อมูล (BSON Type) | ขนาด / ข้อจำกัด (Constraints) | ค่าเริ่มต้น (Default) | อนุญาตว่าง (Nullable) | คำอธิบายและความหมาย (Description) | ตัวอย่างข้อมูล (Sample Data) |
|:---:|---|---|---|---|:---:|---|---|
| 1 | `_id` | `ObjectId` | PK (Primary Key), Auto-generated | *(Auto)* | No | รหัสระบุเอกลักษณ์ประจำ Session | `ObjectId("669c34d5e6f7a8b9c0d1e2f3")` |
| 2 | `userId` | `ObjectId` | FK (Foreign Key -> `users._id`) | - | No | รหัสผู้ใช้งานที่เข้าสู่ระบบ | `ObjectId("668f12a3b4c5d6e7f8a9b0c1")` |
| 3 | `sessionToken` | `String` | UK (Unique Index), Base64URL + HMAC | - | No | ค่า Session Token ที่ลงนามความปลอดภัย | `"eyJhbGciOiJIUzI1...signature"` |
| 4 | `expiresAt` | `Date` | Not Null, TTL Index (7 วัน) | `now() + 7 days` | No | วันเวลาหมดอายุของ Session | `ISODate("2026-09-12T13:00:00Z")` |
| 5 | `createdAt` | `Date` | Not Null, ISODate Timestamp | `now()` | No | วันเวลาที่เข้าสู่ระบบสำเร็จ | `ISODate("2026-09-05T13:00:00Z")` |
