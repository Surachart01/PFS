# ⚙️ กระบวนการทำงานหลักของระบบ (Work Processes & Workflows)

**โครงการ:** ระบบ Portfolio ออนไลน์สำหรับนักศึกษาวิศวกรรมคอมพิวเตอร์ (PFS)  
**เอกสารประกอบ:** สัปดาห์ที่ 8-9 (System Analysis & Design)

---

## 1. กระบวนการที่ 1: การเข้าสู่ระบบและการแยกสิทธิ์ (Authentication & Role Routing)

กระบวนการตรวจสอบข้อมูลยืนยันตัวตนของผู้ใช้งาน พร้อมจำแนกสิทธิ์เพื่อส่งต่อไปยังหน้าจอการทำงานที่ถูกต้อง

```mermaid
sequenceDiagram
    autonumber
    actor User as ผู้ใช้งาน (Student / Admin)
    participant Client as Next.js Client Web
    participant AuthAPI as /api/auth/login
    participant DB as MongoDB (users)

    User->>Client: 1. กรอกรหัสนักศึกษา/อีเมล และรหัสผ่าน
    Client->>AuthAPI: 2. ส่ง HTTP POST payload
    AuthAPI->>DB: 3. ค้นหาผู้ใช้จาก email หรือ studentId
    
    alt ไม่พบผู้ใช้งาน หรือรหัสผ่านไม่ตรง (scrypt verify ล้มเหลว)
        DB-->>AuthAPI: ส่งข้อมูลไม่พบ / ไม่ตรง
        AuthAPI-->>Client: HTTP 401: ข้อมูลเข้าสู่ระบบไม่ถูกต้อง
        Client-->>User: แสดงข้อความแจ้งเตือนข้อผิดพลาด
    else บัญชีมีสถานะ Inactive
        DB-->>AuthAPI: ข้อมูลผู้ใช้ (status == 'inactive')
        AuthAPI-->>Client: HTTP 403: บัญชีนี้ถูกปิดใช้งาน
        Client-->>User: แสดงข้อความติดต่อผู้ดูแลระบบ
    else ยืนยันสำเร็จ (Active + Password ตรง)
        DB-->>AuthAPI: ข้อมูลผู้ใช้ถูกต้อง (status == 'active')
        AuthAPI->>AuthAPI: 4. สร้าง Session Token (HMAC-SHA256 Sign)
        AuthAPI-->>Client: HTTP 200 + Set-Cookie (portfolio_session)
        
        alt บทบาท Student
            Client-->>User: นำทางไปยัง /student (Student Dashboard)
        else บทบาท Admin
            Client-->>User: นำทางไปยัง /admin (Admin Dashboard)
        end
    end
```

---

## 2. กระบวนการที่ 2: การสร้าง ออกแบบ และเผยแพร่ Portfolio (Portfolio Design & Publishing Flow)

กระบวนการทำงานของนักศึกษาในการจัดวางบล็อกบนตารางกริด 12 คอลัมน์ จนถึงการสร้าง URL เผยแพร่

```mermaid
flowchart TD
    Start([เริ่ม: นักศึกษาเข้าหน้า /student/editor]) --> LoadData[โหลดข้อมูล Portfolio เดิม หรือสร้างใหม่อัตโนมัติ]
    LoadData --> ActionChoice{เลือกการกระทำ}

    ActionChoice -->|เลือก Template| ApplyTemplate[เลือกจาก 6 Preset Templates<br/>จัดโครงสร้าง Grid ใหม่ทันที]
    ActionChoice -->|เพิ่ม Block ใหม่| AddBlock[คลิกหรือลากบล็อกจาก Assets Library<br/>(Profile, Skills, Projects, ฯลฯ)]
    ActionChoice -->|แก้ไข Element| SelectCard[คลิกการ์ดบน 12-Column Grid Canvas]

    ApplyTemplate --> CanvasUpdate[อัปเดตการแสดงผลบน Canvas]
    AddBlock --> CanvasUpdate

    SelectCard --> EditProp[เปิด Inspector Panel ด้านขวา<br/>- ปรับข้อความ & ข้อมูลย่อย<br/>- ปรับ Col/Row Grid (1-12)<br/>- เลือก Card Variant & สไตล์ขอบ]
    EditProp --> CanvasUpdate

    CanvasUpdate --> UserDecision{การบันทึก / เผยแพร่}

    UserDecision -->|กด บันทึก| SaveDraft[ส่ง PUT /api/portfolio/me<br/>สถานะยังคงเป็น Draft]
    SaveDraft --> SaveSuccess[แจ้งเตือน: บันทึกสำเร็จ]

    UserDecision -->|กด Publish| ValidateSlug[ตรวจสอบความถูกต้องของ Slug]
    ValidateSlug --> SavePublish[ส่ง POST /api/portfolio/me/publish<br/>อัปเดตสถานะเป็น 'published']
    SavePublish --> GenLink[สร้างลิงก์สาธารณะ /r/[slug]<br/>พร้อมปุ่มคัดลอกแชร์ผลงาน]

    UserDecision -->|กด ปิดเผยแพร่| Unpublish[ส่ง POST /api/portfolio/me/unpublish<br/>เปลี่ยนสถานะกลับเป็น 'draft']
    Unpublish --> GenLink
```

---

## 3. กระบวนการที่ 3: การบริหารจัดการนักศึกษาโดยผู้ดูแลระบบ (Admin Student Management Flow)

กระบวนการที่ผู้ดูแลระบบดูแลบัญชีผู้ใช้งานและกำกับติดตามการส่งงาน

```mermaid
flowchart TD
    AdminStart([ผู้ดูแลระบบเข้าหน้า /admin]) --> FetchAll[ดึงรายชื่อนักศึกษาทั้งหมด + สถานะ Portfolio]
    FetchAll --> DisplayTable[แสดงตารางรายชื่อนักศึกษา พร้อมตัวกรองและช่องค้นหา]
    
    DisplayTable --> AdminAction{เลือกดำเนินการ}

    AdminAction -->|1. เพิ่มนักศึกษา| AddStudent[เปิด Slide-out Drawer กรอกข้อมูล<br/>ตรวจสอบความซ้ำซ้อน -> บันทึก]
    AdminAction -->|2. แก้ไขข้อมูล| EditStudent[เปิด Edit Modal แก้ไขชื่อ/อีเมล/ชั้นปี<br/>ส่ง PUT /api/students/:id]
    AdminAction -->|3. สลับสถานะบัญชี| ToggleStatus[คลิกปุ่ม Toggle Active / Inactive<br/>ส่ง PATCH /api/students/:id]
    AdminAction -->|4. รีเซ็ตรหัสผ่าน| ResetPass[คลิกปุ่ม Reset Password<br/>ตั้งรหัสผ่านเริ่มต้นใหม่]
    AdminAction -->|5. ลบบัญชี| DeleteStudent[กดยืนยันการลบ<br/>ลบข้อมูล User + Portfolio ออกจากระบบ]
    AdminAction -->|6. ตรวจสอบผลงาน| InspectPortfolio[คลิกปุ่มเปิดดู / ตรวจแบบร่าง<br/>เปิดดูหน้าแสดงผลของนักศึกษา]

    AddStudent --> RefreshData[โหลดข้อมูลตารางใหม่]
    EditStudent --> RefreshData
    ToggleStatus --> RefreshData
    ResetPass --> RefreshData
    DeleteStudent --> RefreshData
    RefreshData --> DisplayTable
```
