# 🎓 Resume & Portfolio Builder System (PFS)

ระบบสร้างและจัดทำ Portfolio / Resume แบบ **Interactive Grid Builder** สำหรับนักศึกษาวิศวกรรมคอมพิวเตอร์ ช่วยให้นักศึกษาสามารถออกแบบ Resume ได้อย่างสวยงาม ล้ำสมัย และตรงตามสไตล์ของตนเองในรูปแบบต่อจิ๊กซอว์ (CSS Grid-based Layout)

---

## 🌟 ฟีเจอร์เด่นของระบบ (Key Features)

- **🎨 6 Layout Templates สำเร็จรูป**: เลือกโครงสร้างสำเร็จรูป (Professional, Modern, Creative, Minimal, Academic, Compact) พร้อม mini-grid preview
- **🧩 12-Column CSS Grid Layout Builder**: จัดวางบล็อกแบบต่อจิ๊กซอว์ ปรับตำแหน่ง (Col Start/End, Row Start/End) และขนาดของการ์ดได้อย่างอิสระ
- **🔤 Rich Typography**: รองรับภาษาไทยและอังกฤษด้วยแบบอักษรยอดนิยม 6 สไตล์ (`Inter`, `Prompt`, `Kanit`, `Playfair Display`, `Fira Code`, `Outfit`)
- **🌈 Canvas Background Themes**: ธีมพื้นหลัง 6 รูปแบบ (`Default Light`, `Dark Slate Mode`, `Glassmorphism`, `Mesh Gradient`, `Sunset Glow`, `Nordic Clean`)
- **📊 Interactive Display Styles**: รูปแบบแสดงผลทักษะและเนื้อหา (`Skill Progress Bars %`, `Glowing Pills ✦`, `Vertical Timeline`, `Mini Cards`, `Chips/Badges`, `Clean List`)
- **💎 Card Variants & Border Styles**: สไตล์การ์ด (`Solid`, `Glassmorphism`, `Gradient Accent`, `Outline Only`) และสไตล์ขอบ (`Accent Left Bar`, `Gradient Top Bar`, `Glowing Neon`, `Subtle Outline`, `No Border`)
- **🗑️ Easy Element Deletion**: ลบ Element ออกจาก Resume ได้ง่ายดายใน 4 ตำแหน่ง (Active Elements sidebar, Floating toolbar บนการ์ด, ปุ่มด้านบนสุดของ Inspector panel, และป้ายชื่อการ์ด)
- **🚀 Ultra-Sleek Public Portfolio Page**: หน้าแสดงผลสาธารณะ (`/r/[slug]`) แบบ Personal Portfolio Website พร้อม Hero Banner สีเข้มไล่ระดับ และปุ่มคัดลอกลิงก์แชร์

---

## 👥 สิทธิ์การใช้งานระบบ (User Roles)

| บทบาท (Role) | บัญชีเข้าใช้งานเริ่มต้น | สิทธิ์และการใช้งาน |
|---|---|---|
| **Student (นักศึกษา)** | `student@pfs.local` / `Student@1234` | ออกแบบ Resume, เลือก Template, ปรับแต่งสี/ฟอนต์, อัปโหลดรูปภาพ, เผยแพร่ (Publish/Unpublish) |
| **Admin (ผู้ดูแลระบบ)** | `admin@pfs.local` / `Admin@1234` | ตรวจสอบรายชื่อนักศึกษาทั้งหมด, ดูสถานะการเผยแพร่ Portfolio, จัดการข้อมูลผู้ใช้งาน |

---

## 📖 คู่มือวิธีการใช้งานระบบอย่างละเอียด (User Manual)

### 1. การเข้าสู่ระบบ (Login)
1. เปิดเว็บบราวเซอร์ไปที่ `http://localhost:3000/login`
2. กรอก **อีเมลหรือรหัสนักศึกษา** และ **รหัสผ่าน**
3. คลิกปุ่ม **"เข้าสู่ระบบ"** ระบบจะนำคุณไปยังหน้า Dashboard หรือ Editor

---

### 2. ส่วนประกอบในหน้าแก้ไข Resume (`/student/editor`)

หน้าจัดการและตกแต่ง Resume แบ่งออกเป็น 4 ส่วนหลักดังนี้:

```
+-----------------------------------------------------------------------------------+
|                        1. แถบคำสั่งด้านบน (Command Toolbar)                       |
+----------------------+------------------------------------+-----------------------+
| 2. แถบเครื่องมือซ้าย | 3. พื้นที่ออกแบบ (Document Sheet)   | 4. พาเนลปรับแต่งขวา   |
|  - Active Elements   |    - 12-Column Grid Canvas         |    - Properties       |
|  - Block Assets      |    - Interactive Element Cards     |    - Content/Design   |
|    (Drag & Drop)     |    - Floating Action Toolbar       |    - Layout/Advanced  |
+----------------------+------------------------------------+-----------------------+
```

---

#### 📍 ส่วนที่ 1: แถบคำสั่งด้านบน (Command Toolbar)
- **ปุ่ม `✨ เลือก Template Gallery`**: เปิดหน้าเลือกโครงสร้างสำเร็จรูป 6 สไตล์ เมื่อคลิกเลือก ระบบจะจัดเรียง Element ตามโครงสร้างของ Template นั้นทันทีโดยไม่เสียข้อมูลเดิม
- **ปุ่ม `👁️ ดู Resume`**: เปิดดูหน้าแสดงผลจริงสาธารณะในแท็บใหม่ (จะแสดงเมื่อสถานะเป็น Published)
- **ปุ่ม `💾 บันทึก`**: บันทึกการเปลี่ยนแปลงทั้งหมดลงฐานข้อมูล
- **ปุ่ม `🚀 Publish`**: เผยแพร่ Resume สู่สาธารณะ (คนอื่นสามารถเข้าดูผ่านลิงก์ได้)
- **ปุ่ม `ปิดเผยแพร่`**: เปลี่ยนสถานะกลับเป็น Draft (คนอื่นจะไม่สามารถเข้าดูได้)

---

#### 📍 ส่วนที่ 2: แถบเครื่องมือด้านซ้าย (Left Sidebar)
- **Active Elements (รายการที่อยู่บน Resume)**:
  - แสดงหมวดหมู่ทั้งหมดที่มีอยู่บน Resume ในขณะนั้น
  - สามารถคลิกที่ชื่อหมวดหมู่เพื่อเลือก Element นั้นบน Canvas
  - **การลบออก**: คลิกปุ่มไอคอนถังขยะ 🗑️ ทางขวาของรายการเพื่อลบ Element นั้นออกจาก Resume ได้ทันที 1-Click
- **Assets (คลังบล็อกองค์ประกอบ)**:
  - แบ่งเป็นหมวด **Student** (ข้อมูลพื้นฐาน, การศึกษา, ช่องทางติดต่อ) และหมวด **Content** (แนะนำตัว, ทักษะ, โปรเจกต์, ประสบการณ์, Certificate, ข้อความอิสระ)
  - **การใช้งาน**: คลิกที่การ์ด หรือลากการ์ดมาวางบนพื้นที่ Document Sheet Canvas เพื่อเพิ่ม Element ใหม่

---

#### 📍 ส่วนที่ 3: พื้นที่ออกแบบการ์ด (Document Sheet Canvas)
- แสดงตัวอย่าง Resume บนตาราง 12 คอลัมน์ (Grid Canvas)
- **การเลือก Element**: คลิกที่การ์ดใดๆ บน Canvas เพื่อเปิดดูและแก้ไขรายละเอียดในพาเนลด้านขวา
- **Floating Toolbar บนการ์ด**: เมื่อคลิกเลือกการ์ด จะมีแถบเครื่องมือลอยขึ้นมาเหนือการ์ด:
  - 🗑️ **`ลบออก`**: ลบ Element นี้ออกจาก Resume
  - 📋 **`คัดลอก`**: สร้าง Element สำเนา (Duplicate)
  - 👁️ **`ซ่อน/แสดง`**: เปิด-ปิดการแสดงผล Element นี้บน Resume
- **ปุ่มถังขยะบนป้ายชื่อการ์ด**: บนป้ายชื่อสีน้ำเงินเหนือการ์ด มีปุ่มถังขยะ 🗑️ เล็กๆ สามารถกดลบได้ทันทีเช่นกัน

---

#### 📍 ส่วนที่ 4: พาเนลปรับแต่งด้านขวา (Properties & Design Inspector)
ใช้สำหรับกำหนดรายละเอียดและสไตล์ของ Element ที่เลือก แบ่งเป็น 4 แถบ (Tabs):

##### ⚙️ การตั้งค่าทั่วไปของ Resume (ส่วนบนสุด)
- **ชื่อ Resume**: กำหนดชื่อหัวเรื่องของ Resume
- **Slug**: กำหนด URL ต่อท้ายสำหรับแชร์ (เช่น `my-resume-2026`)
- **Font Family**: เลือกแบบอักษร (`Inter`, `Prompt`, `Kanit`, `Playfair Display`, `Fira Code`, `Outfit`)
- **Canvas Background Theme**: เลือกธีมพื้นหลัง (`Default Light`, `Dark Slate Mode`, `Glassmorphism`, `Mesh Gradient`, `Sunset Glow`, `Nordic Clean`)
- **ธีมโครงสร้าง & สีหลัก**: กำหนดโทนสีหลักของ Resume และขนาดตัวอักษรเริ่มต้น

##### 🔴 ปุ่มลบด่วน (Quick Action)
- ปุ่มสีแดง **`🗑️ ลบ Element นี้ออก`**: แสดงอยู่ด้านบนสุดของ Inspector panel สามารถกดลบ Element ที่กำลังเลือกอยู่ออกได้ทันทีทุกเมื่อ

##### 📝 Tab 1: Content (แก้ไขเนื้อหา)
- **ชื่อ element**: แก้ไขชื่อหัวข้อที่จะแสดง
- **รายละเอียด**: กรอกข้อความอธิบายตัวตน ประวัติ หรือรายละเอียด
- **รายการเพิ่มเติม**: กรอกรายการย่อย (เช่น ชื่อทักษะ หรือ ชื่อผลงาน) **หนึ่งบรรทัดต่อหนึ่งรายการ**
- **รูปภาพใน element**: อัปโหลดไฟล์รูปภาพ (ไม่เกิน 900KB) หรือใส่ Image URL

##### 🎨 Tab 2: Design (ตกแต่งสไตล์)
- **สีเส้น/หัวข้อ & สีพื้น**: ปรับแต่งสีประจำ Element หรือเลือกจากชุดสีเร็ว (Swatches)
- **Card Variant (สไตล์การ์ด)**:
  - `Solid`: การ์ดทึบมาตรฐาน
  - `Glassmorphism`: การ์ดกระจกใสพร่ามัว
  - `Gradient Accent`: การ์ดไล่เฉดสีเน้น
  - `Outline Only`: การ์ดขอบบางสะอาดตา
- **Border Style (สไตล์เส้นขอบ)**:
  - `Accent Left Bar`: แถบสีหนาทางซ้าย
  - `Gradient Top Bar`: แถบสีไล่ระดับด้านบน
  - `Glowing Neon`: ขอบเรืองแสงสไตล์นีออน
  - `Subtle Outline`: ขอบบางเนียน
  - `No Border`: ไร้ขอบ
- **มุมการ์ด & เงา**: ปรับความโค้งของมุม (None, Soft, Round) และระดับเงา (None, Soft, Lift)

##### 📐 Tab 3: Layout (จัดตำแหน่ง Grid & รูปแบบแสดงผล)
- **ตำแหน่ง Grid (12 Columns)**:
  - `Col Start` / `Col End`: กำหนดจุดเริ่มต้นและจุดสิ้นสุดคอลัมน์ (1 ถึง 13)
  - `Row Start` / `Row End`: กำหนดแถวในตาราง Grid
- **ปุ่มขนาดทางเลือก (Quick Size)**: กดปรับขนาดได้ด่วน (เต็มความกว้าง, ครึ่งซ้าย, ครึ่งขวา, ⅓ ซ้าย)
- **รูปแบบแสดงผลรายการ (Item Style)**:
  - `Skill Progress Bars`: แสดงหลอดความสามารถเป็น % (เหมาะกับหมวดทักษะ)
  - `Glowing Pills (✦)`: แสดงเป็นป้ายสไตล์นีออน
  - `Vertical Timeline`: แสดงเป็นเส้นไทม์ไลน์ตามลำดับเวลา (เหมาะกับประสบการณ์/การศึกษา)
  - `Chips / Tags Badge`: ป้ายเรียงมาตรฐาน
  - `Mini Cards`: การ์ดย่อยพร้อมไอคอน
  - `Clean List`: รายการเรียบง่าย
- **รูปแบบ Column & Alignment**: เลือกแสดง 1 หรือ 2 คอลัมน์ และจัดแนวข้อความ (ซ้าย, กลาง, ขวา)

##### 🛠️ Tab 4: Advanced (การตั้งค่าขั้นสูง)
- แสดง Component ID และมีปุ่มคัดลอก (Duplicate) / ลบ (Delete)

---

### 3. หน้าแสดงผลสาธารณะ (Public Portfolio View - `/r/[slug]`)
เมื่อทำการกด **Publish** คนอื่นจะสามารถเข้าชม Resume ของคุณได้ทาง URL `http://localhost:3000/r/[slug]`
- **Hero Banner สีเข้ม**: แสดงชื่อผู้จัดทำ พร้อมป้ายสถานะ `Online Portfolio`
- **ปุ่มแชร์**: กด **"แชร์ Portfolio"** เพื่อคัดลอกลิงก์ส่งให้ผู้อื่นหรือผู้ว่าจ้างได้ทันที
- **การแสดงผล**: แสดงผลตามโครงสร้าง Grid, ฟอนต์, ธีม และสไตล์ที่คุณออกแบบไว้ใน Editor

---

## 🛠️ ขั้นตอนการติดตั้งและรันโปรเจกต์ (Developer Setup)

### 1. ความต้องการของระบบ (Requirements)
- Node.js 18.x ขึ้นไป
- Docker Desktop (สำหรับรัน MongoDB)

### 2. การตั้งค่า Environment Variables
สร้างไฟล์ `.env` ที่โฟลเดอร์หลักของโปรเจกต์:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio_system
MONGODB_DB=portfolio_system
AUTH_SECRET=development-secret-change-me
ADMIN_EMAIL=admin@pfs.local
ADMIN_PASSWORD=Admin@1234
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. รันฐานข้อมูล MongoDB ด้วย Docker
```bash
docker run -d --name portfolio_mongo -p 27017:27017 mongo:7
```

### 4. ติดตั้ง Dependencies และเริ่มรันระบบ
```bash
# ติดตั้ง package
npm install

# รันระบบในโหมด Development
npm run dev

# หรือสร้าง Production Build
npm run build
npm run start
```

เข้าใช้งานผ่านบราวเซอร์ที่ `http://localhost:3000`

---

## 📝 สรุปโครงสร้างไฟล์ของโปรเจกต์ (Project Structure)

```
PFS/
├── app/
│   ├── api/                  # API Routes (auth, portfolio CRUD, publish)
│   ├── dashboard/            # หน้า Directory รวมนักศึกษา
│   ├── login/                # หน้า เข้าสู่ระบบ
│   ├── r/[slug]/             # หน้า Public Portfolio สาธารณะ
│   ├── student/editor/       # หน้า Editor ออกแบบ Resume หลัก
│   └── globals.css           # สไตล์ CSS หลักของทั้งระบบ
├── components/
│   ├── PortfolioRenderer.tsx # Component สำหรับ Render หน้า Portfolio สาธารณะ
│   ├── StudentEditor.tsx     # Component Editor หลักสำหรับนักศึกษา
│   └── TemplateGallery.tsx   # Component หน้าเลือก 6 Template สำเร็จรูป
├── lib/
│   ├── auth.ts               # ระบบ Session & Password Hashing
│   ├── mongodb.ts            # การเชื่อมต่อ MongoDB พร้อม Reconnect logic
│   ├── portfolio.ts          # Logic จัดการ Template, Sections, และ Defaults
│   └── types.ts              # TypeScript Data Models & Types
└── README.md                 # คู่มือการใช้งานระบบ
```
