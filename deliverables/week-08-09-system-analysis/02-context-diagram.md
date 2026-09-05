# 🌐 Context Diagram (DFD Level 0)

**โครงการ:** ระบบ Portfolio ออนไลน์สำหรับนักศึกษาวิศวกรรมคอมพิวเตอร์ (PFS)  
**เอกสารประกอบ:** สัปดาห์ที่ 8-9 (System Analysis & Design)

---

## 1. ภาพรวม Context Diagram

Context Diagram (หรือ Data Flow Diagram Level 0) แสดงขอบเขตสูงสุดของระบบ (System Boundary) ปฏิสัมพันธ์ระหว่างระบบจัดการ Portfolio ออนไลน์กับ External Entities ภายนอก 3 กลุ่มหลัก ได้แก่:
1. **Student (นักศึกษา)**
2. **Admin (ผู้ดูแลระบบ)**
3. **Public Visitor / Employer (ผู้เข้าชมทั่วไป / ผู้ว่าจ้าง)**

---

## 2. แผนภาพแสดงการไหลของข้อมูล (Mermaid Diagram)

```mermaid
flowchart TD
    subgraph External_Entities["External Entities (ผู้มีส่วนเกี่ยวข้องภายนอก)"]
        Student["🎓 Student (นักศึกษา)"]
        Admin["🛡️ Admin (ผู้ดูแลระบบ)"]
        Visitor["👥 Public Visitor / Employer (ผู้เข้าชม/นายจ้าง)"]
    end

    System(("💻 0.0<br/>ระบบ Portfolio ออนไลน์<br/>(Portfolio System - PFS)"))

    %% Student Data Flows
    Student -->|"1. ข้อมูลเข้าสู่ระบบ (Student ID/Email, Password)"| System
    Student -->|"2. ข้อมูลส่วนตัว & รหัสผ่านใหม่"| System
    Student -->|"3. โครงสร้างบล็อก Grid & เนื้อหาผลงาน"| System
    Student -->|"4. คำสั่งเลือก Template, สไตล์สี, บันทึก และ Publish"| System

    System -->|"a. สถานะการเข้าสู่ระบบ & ข้อมูล Session"| Student
    System -->|"b. สถิติภาพรวมบน Dashboard & ข้อมูล Portfolio เดิม"| Student
    System -->|"c. URL ลิงก์สาธารณะสำหรับแชร์ผลงาน (/r/slug)"| Student

    %% Admin Data Flows
    Admin -->|"1. ข้อมูลเข้าสู่ระบบผู้ดูแลระบบ"| System
    Admin -->|"2. ข้อมูลบัญชีนักศึกษาใหม่ (เพิ่ม/แก้ไข/ลบ)"| System
    Admin -->|"3. คำสั่งเปลี่ยนสถานะบัญชี (Active/Inactive) & รีเซ็ตรหัสผ่าน"| System
    Admin -->|"4. คำค้นหา & ตัวกรองรายชื่อนักศึกษา"| System

    System -->|"a. สถิติรวมของระบบ (จำนวนนักศึกษา, สถานะ Portfolio)"| Admin
    System -->|"b. รายชื่อและสถานะบัญชีนักศึกษาทั้งหมด"| Admin
    System -->|"c. ตัวอย่างผลงาน Portfolio ของนักศึกษา (Draft & Published)"| Admin

    %% Visitor Data Flows
    Visitor -->|"1. คำขอเข้าชมผ่าน URL Slug (/r/[slug])"| System
    System -->|"a. หน้าเว็บ Portfolio และ Resume ที่แสดงผลตาม Grid"| Visitor
```

---

## 3. ตารางวิเคราะห์กระแสข้อมูล (Data Flow Dictionary)

### 3.1 ข้อมูลนำเข้าสู่ระบบ (Inputs to System)
| จาก Entity | ชื่อกระแสข้อมูล (Data Flow) | คำอธิบายรายละเอียดของข้อมูล |
|---|---|---|
| **Student** | ข้อมูลเข้าสู่ระบบ | รหัสนักศึกษา/อีเมล และรหัสผ่านเพื่อยืนยันตัวตน |
| **Student** | ข้อมูลส่วนตัว & บัญชี | ชื่อ, นามสกุล, ภาควิชา, ชั้นปี, รหัสผ่านเดิมและใหม่ |
| **Student** | ข้อมูลและบล็อก Portfolio | ประเภท Section, ข้อมูลข้อความ, ทักษะ, ลิงก์โปรเจกต์, รูปภาพ |
| **Student** | ค่าการจัดวาง Layout & Design | Col Start/End, Row Start/End, ธีมสี, ฟอนต์, สไตล์การ์ด, คำสั่งบันทึกหรือ Publish |
| **Admin** | ข้อมูลจัดการนักศึกษา | ข้อมูลนักศึกษาใหม่ (รหัส, ชื่อ, อีเมล, ชั้นปี, รหัสผ่านเริ่มต้น) หรือข้อมูลที่ต้องการแก้ไข |
| **Admin** | คำสั่งบริหารจัดการบัญชี | คำสั่งสลับสถานะ `active/inactive`, คำสั่งรีเซ็ตรหัสผ่าน, คำสั่งลบบัญชี |
| **Admin** | คำค้นหาและตัวกรอง | คำค้นหาชื่อ/รหัส, คีย์สำหรับการจัดเรียงข้อมูล |
| **Visitor** | URL Request | คำขอเปิดหน้า Portfolio ผ่านพารามิเตอร์ `slug` |

### 3.2 ข้อมูลส่งออกจากระบบ (Outputs from System)
| ไปยัง Entity | ชื่อกระแสข้อมูล (Data Flow) | คำอธิบายรายละเอียดของข้อมูล |
|---|---|---|
| **Student** | ผลยืนยันตัวตน & สิทธิ์ | ผลการเข้าสู่ระบบ, Session Cookie ที่เข้ารหัส, การนำทางไปยังหน้า Dashboard |
| **Student** | ข้อมูลและสถานะ Portfolio | ข้อมูลบล็อกบน Canvas, ค่าเปอร์เซ็นต์ความสมบูรณ์, ลิงก์สาธารณะ |
| **Admin** | สถิติภาพรวมระบบ | จำนวนนักศึกษาทั้งหมด, จำนวน Portfolio ที่เผยแพร่แล้ว, ฉบับร่าง, ยังไม่สร้าง |
| **Admin** | รายชื่อและสถานะนักศึกษา | ตารางรายชื่อ, อีเมล, ชั้นปี, สถานะบัญชี, สถานะ Portfolio |
| **Admin** | ข้อมูลผลงานนักศึกษา | หน้าพรีวิวผลงานของนักศึกษาทั้งฉบับร่างและเผยแพร่แล้ว |
| **Visitor** | หน้าเว็บแสดงผลงาน | โครงสร้าง HTML/CSS Grid ของ Resume พร้อมข้อมูลผลงาน ทักษะ และการติดต่อ |
