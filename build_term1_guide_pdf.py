import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>คู่มือการตรวจและเปิดดูโค้ดตามขอบเขตโครงงานภาคเรียนที่ 1</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Sarabun:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4 portrait;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-right {
      content: counter(page);
    }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Sarabun', 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1e293b;
    background: #ffffff;
    font-size: 13.5px;
    line-height: 1.65;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .header-container {
    border-bottom: 2px solid #0f766e;
    padding-bottom: 16px;
    margin-bottom: 22px;
  }

  .badge-topic {
    display: inline-block;
    background: #0f766e;
    color: #ffffff;
    font-family: 'Prompt', sans-serif;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  h1 {
    font-family: 'Prompt', sans-serif;
    color: #0f172a;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.35;
    margin-bottom: 6px;
  }

  .subtitle {
    font-size: 13px;
    color: #64748b;
  }

  .intro-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #0f766e;
    border-radius: 6px;
    padding: 12px 14px;
    margin-bottom: 20px;
    font-size: 12.5px;
  }

  .intro-box strong {
    color: #0f766e;
    font-family: 'Prompt', sans-serif;
  }

  .table-container {
    margin-bottom: 24px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  th {
    background: #f1f5f9;
    color: #334155;
    font-family: 'Prompt', sans-serif;
    font-weight: 600;
    text-align: left;
    padding: 9px 12px;
    border-bottom: 1px solid #cbd5e1;
  }

  td {
    padding: 8px 12px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:nth-child(even) td {
    background-color: #fafbfc;
  }

  .tag {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    font-family: 'Prompt', sans-serif;
    white-space: nowrap;
  }

  .tag-code { background: #dcfce7; color: #166534; }
  .tag-doc { background: #e0f2fe; color: #075985; }
  .tag-arch { background: #f3e8ff; color: #6b21a8; }
  .tag-test { background: #ffedd5; color: #9a3412; }

  .section-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 16px;
    background: #ffffff;
    page-break-inside: avoid;
  }

  .section-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 8px;
    margin-bottom: 10px;
  }

  .section-title {
    font-family: 'Prompt', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
  }

  .section-title span.num {
    background: #0f766e;
    color: #ffffff;
    padding: 2px 8px;
    border-radius: 4px;
    margin-right: 6px;
    font-size: 12px;
  }

  .file-list {
    list-style: none;
    padding-left: 0;
  }

  .file-item {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 8px;
    font-size: 12.5px;
  }

  .file-path {
    font-family: 'Fira Code', monospace;
    font-size: 12px;
    font-weight: 600;
    color: #0f766e;
    display: block;
    margin-bottom: 4px;
  }

  .file-desc {
    color: #334155;
    margin-bottom: 4px;
  }

  .line-points {
    background: #ffffff;
    border: 1px dashed #cbd5e1;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 11.5px;
    color: #475569;
    margin-top: 4px;
  }

  .line-points strong {
    color: #0284c7;
    font-family: 'Fira Code', monospace;
  }

  .note-pill {
    background: #fef3c7;
    border-left: 3px solid #d97706;
    padding: 6px 10px;
    font-size: 12px;
    color: #92400e;
    border-radius: 0 4px 4px 0;
    margin-top: 6px;
  }

  .page-break {
    page-break-before: always;
  }

  .footer {
    text-align: center;
    font-size: 11px;
    color: #94a3b8;
    margin-top: 24px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
  }
</style>
</head>
<body>

  <div class="header-container">
    <div class="badge-topic">ระบบ Portfolio ออนไลน์สำหรับนักศึกษาวิศวกรรมคอมพิวเตอร์</div>
    <h1>คู่มือการตรวจและเปิดดูโค้ดตามขอบเขตโครงงานภาคเรียนที่ 1</h1>
    <div class="subtitle">ระบบเว็บแอปพลิเคชัน Next.js (App Router) + MongoDB &middot; เอกสารสรุปตำแหน่งไฟล์โค้ดและคำอธิบายโดยละเอียด</div>
  </div>

  <div class="intro-box">
    <strong>💡 ทำความเข้าใจ Next.js App Router เบื้องต้นใน 1 นาที:</strong><br>
    &bull; <strong><code>app/.../page.tsx</code></strong> คือ <u>หน้าจอเว็บไซต์ (UI)</u> ที่ผู้ใช้งานมองเห็นและมีปฏิสัมพันธ์ได้<br>
    &bull; <strong><code>app/api/.../route.ts</code></strong> คือ <u>ระบบหลังบ้าน (Backend API)</u> ประมวลผลและเชื่อมต่อฐานข้อมูล MongoDB<br>
    &bull; <strong><code>components/...</code></strong> คือ <u>ชิ้นส่วนหน้าจอสำเร็จรูป</u> เช่น กล่องเครื่องมือ Editor, ตัวเรนเดอร์พรีวิว, แดชบอร์ดพาเนล<br>
    &bull; <strong><code>lib/...</code></strong> คือ <u>ระบบแกนกลางส่วนกลาง</u> เช่น สคริปต์เชื่อมฐานข้อมูล (mongodb.ts), ระบบล็อกอินและถอดรหัส (auth.ts)
  </div>

  <h3 style="font-family: 'Prompt', sans-serif; font-size: 15px; margin-bottom: 8px; color: #1e293b;">📋 ตารางสรุปภาพรวมขอบเขตงานและตำแหน่งไฟล์ (Quick-Reference)</h3>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="width: 7%;">ข้อ</th>
          <th style="width: 33%;">ขอบเขตงาน</th>
          <th style="width: 15%;">ประเภท</th>
          <th style="width: 45%;">ไฟล์หลักที่ต้องเปิดแสดง</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1</strong></td>
          <td>ปัญหาและรวบรวมความต้องการของผู้ใช้งาน</td>
          <td><span class="tag tag-doc">เอกสาร SRS</span></td>
          <td><code>SRS-Portfolio-System.md</code> (หัวข้อ 1.1 - 1.3)</td>
        </tr>
        <tr>
          <td><strong>2</strong></td>
          <td>สำรวจและวิเคราะห์ความต้องการของนักศึกษา</td>
          <td><span class="tag tag-doc">เอกสาร SRS</span></td>
          <td><code>SRS-Portfolio-System.md</code> (หัวข้อ 3)</td>
        </tr>
        <tr>
          <td><strong>3</strong></td>
          <td>จัดทำเอกสารความต้องการระบบ (SRS)</td>
          <td><span class="tag tag-doc">เอกสาร SRS</span></td>
          <td><code>SRS-Portfolio-System.docx</code> / <code>.md</code></td>
        </tr>
        <tr>
          <td><strong>4</strong></td>
          <td>วิเคราะห์และออกแบบระบบ</td>
          <td><span class="tag tag-arch">สถาปัตยกรรม</span></td>
          <td><code>portfolio-erd.png</code>, <code>SRS-Portfolio-System.md</code> (หัวข้อ 2)</td>
        </tr>
        <tr>
          <td><strong>5</strong></td>
          <td><strong>ออกแบบฐานข้อมูล</strong></td>
          <td><span class="tag tag-code">โค้ดฐานข้อมูล</span></td>
          <td><code>lib/types.ts</code>, <code>lib/mongodb.ts</code>, <code>scripts/seed.mjs</code></td>
        </tr>
        <tr>
          <td><strong>6</strong></td>
          <td><strong>ออกแบบส่วนติดต่อผู้ใช้งาน (UI/UX)</strong></td>
          <td><span class="tag tag-code">โค้ดดีไซน์ & UI</span></td>
          <td><code>app/globals.css</code>, <code>components/ResumeRenderer.tsx</code>, <code>StudentShell.tsx</code></td>
        </tr>
        <tr>
          <td><strong>7</strong></td>
          <td><strong>พัฒนาระบบยืนยันตัวตนและกำหนดสิทธิ์</strong></td>
          <td><span class="tag tag-code">โค้ดระบบความปลอดภัย</span></td>
          <td><code>app/login/page.tsx</code>, <code>lib/auth.ts</code>, <code>app/api/auth/login/route.ts</code></td>
        </tr>
        <tr>
          <td><strong>8</strong></td>
          <td><strong>พัฒนาระบบจัดการข้อมูลส่วนตัว การศึกษา ทักษะ</strong></td>
          <td><span class="tag tag-code">โค้ดฟังก์ชันหลัก</span></td>
          <td><code>components/StudentEditor.tsx</code>, <code>lib/portfolio.ts</code>, <code>app/api/user/profile/</code></td>
        </tr>
        <tr>
          <td><strong>9</strong></td>
          <td><strong>พัฒนาระบบ Dashboard เบื้องต้น</strong></td>
          <td><span class="tag tag-code">โค้ดแดชบอร์ด</span></td>
          <td><code>app/student/page.tsx</code>, <code>app/admin/page.tsx</code>, <code>components/AdminPanel.tsx</code></td>
        </tr>
        <tr>
          <td><strong>10</strong></td>
          <td>ทดสอบระบบในระยะที่ 1 และสรุปผล</td>
          <td><span class="tag tag-test">การทดสอบ</span></td>
          <td><code>scripts/seed.mjs</code>, <code>capture_real_screenshots.mjs</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <h2 style="font-family: 'Prompt', sans-serif; font-size: 17px; margin-bottom: 14px; color: #0f172a; border-left: 4px solid #0f766e; padding-left: 10px;">รายละเอียดเจาะลึกรายข้อและจุดที่ต้องเปิดให้ตรวจ</h2>

  <!-- ข้อ 1-4 -->
  <div class="section-card">
    <div class="section-card-header">
      <div class="section-title"><span class="num">ข้อ 1 - 4</span> หมวดการวิเคราะห์ สเปกระบบ และการออกแบบสถาปัตยกรรม</div>
      <span class="tag tag-doc">วิศวกรรมซอฟต์แวร์</span>
    </div>
    <p style="font-size: 12.5px; color: #334155; margin-bottom: 8px;">
      ข้อ 1, 2, 3 และ 4 เป็นกระบวนการวางแผนและจัดทำเอกสารข้อกำหนด ไม่ได้เป็นไฟล์โค้ดของหน้าเว็บโดยตรง แต่มีผลลัพธ์จัดทำไว้สมบูรณ์ในโปรเจกต์:
    </p>
    <ul class="file-list">
      <li class="file-item">
        <span class="file-path">📄 SRS-Portfolio-System.docx และ SRS-Portfolio-System.md</span>
        <div class="file-desc">
          &bull; <strong>ข้อ 1:</strong> ดูหัวข้อ 1.1 - 1.3 สรุปปัญหาการขาดแคลนแพลตฟอร์มเรซูเม่เฉพาะทาง และการรวบรวมความต้องการ<br>
          &bull; <strong>ข้อ 2:</strong> ดูหัวข้อ 3 สรุปความต้องการของนักศึกษา เช่น หมวดทักษะคอมพิวเตอร์ โปรเจกต์ ลิงก์ GitHub<br>
          &bull; <strong>ข้อ 3:</strong> ตัวเอกสาร SRS ฉบับสมบูรณ์ (43 KB) ครอบคลุมฟังก์ชัน ความปลอดภัย และประสิทธิภาพ<br>
          &bull; <strong>ข้อ 4:</strong> ดูหัวข้อ 2 วิเคราะห์สถาปัตยกรรมระบบ Web Application เชื่อมต่อ MongoDB
        </div>
      </li>
      <li class="file-item">
        <span class="file-path">🖼️ portfolio-erd.png</span>
        <div class="file-desc">
          &bull; <strong>ข้อ 4:</strong> แผนภาพความสัมพันธ์เชิงข้อมูล (ER-Diagram) แสดงโครงสร้างความสัมพันธ์ระหว่าง Users, Portfolios และ Sessions
        </div>
      </li>
    </ul>
  </div>

  <!-- ข้อ 5 -->
  <div class="section-card">
    <div class="section-card-header">
      <div class="section-title"><span class="num">ข้อ 5</span> ออกแบบฐานข้อมูล (Database Design & Modeling)</div>
      <span class="tag tag-code">โค้ดจริง</span>
    </div>
    <ul class="file-list">
      <li class="file-item">
        <span class="file-path">📁 lib/types.ts</span>
        <div class="file-desc">ประกาศโครงสร้างข้อมูล (TypeScript Schema Definition) ที่ใช้บันทึกใน MongoDB</div>
        <div class="line-points">
          &bull; <strong>บรรทัด 48 – 61 (UserDoc):</strong> โครงสร้างตารางผู้ใช้ (studentId, firstName, lastName, email, passwordHash, role, department, year, status)<br>
          &bull; <strong>บรรทัด 63 – 80 (PortfolioSection):</strong> โครงสร้างบล็อกข้อมูลในเรซูเม่ (type: profile, education, skills, projects, content, settings)<br>
          &bull; <strong>บรรทัด 91 – 104 (PortfolioDoc):</strong> โครงสร้างตาราง Portfolio หลัก (userId, title, slug, status, theme, templateId, styleSettings)
        </div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 lib/mongodb.ts</span>
        <div class="file-desc">การเชื่อมต่อ MongoDB และการจัดทำดัชนีฐานข้อมูล (Indexing)</div>
        <div class="line-points">
          &bull; <strong>บรรทัด 19 – 43 (getMongoClient & getDb):</strong> การเปิดท่อเชื่อมต่อฐานข้อมูลแบบแคช (Singleton Pattern) ป้องกัน Connection ล้น<br>
          &bull; <strong>บรรทัด 50 – 62 (ensureIndexes):</strong> คำสั่งสร้าง Index เพื่อให้ค้นหาได้ไวระดับมิลลิวินาที และบังคับ Unique ป้องกันอีเมล/รหัสนักศึกษา/slug ซ้ำ
        </div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 scripts/seed.mjs</span>
        <div class="file-desc">สคริปต์จำลองชุดข้อมูลเริ่มต้น (Seeding) สร้างผู้ใช้แอดมิน นักศึกษา และเรซูเม่ตัวอย่างลงฐานข้อมูล</div>
      </li>
    </ul>
  </div>

  <!-- ข้อ 6 -->
  <div class="section-card">
    <div class="section-card-header">
      <div class="section-title"><span class="num">ข้อ 6</span> ออกแบบส่วนติดต่อผู้ใช้งาน (UI/UX Design & Implementation)</div>
      <span class="tag tag-code">โค้ดจริง</span>
    </div>
    <ul class="file-list">
      <li class="file-item">
        <span class="file-path">📁 app/globals.css</span>
        <div class="file-desc">ระบบ Design System ควบคุมโทนสี, สไตล์ Glassmorphism, เงา, ปรับหน้าจอ Responsive และแอนิเมชัน</div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 components/StudentShell.tsx & components/AdminShell.tsx</span>
        <div class="file-desc">โครงสร้างหน้าต่าง (Layout Shells) แถบเมนูด้านบนและด้านข้าง ออกแบบแยกตามบริบทของนักศึกษาและแอดมิน</div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 components/ResumeRenderer.tsx</span>
        <div class="file-desc">คอมโพเนนต์แสดงผลเรซูเม่แบบ Live Interactive Preview จัดสัดส่วนกระดาษ A4 สวยงามตามโมเดลจริง</div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 components/TemplateGallery.tsx</span>
        <div class="file-desc">หน้าต่าง Gallery สวยงามให้เลือกรูปแบบ Template สำเร็จรูป (Professional, Modern, Creative, Minimal ฯลฯ)</div>
      </li>
    </ul>
  </div>

  <div class="page-break"></div>

  <!-- ข้อ 7 -->
  <div class="section-card">
    <div class="section-card-header">
      <div class="section-title"><span class="num">ข้อ 7</span> พัฒนาระบบยืนยันตัวตนและกำหนดสิทธิ์ผู้ใช้งาน (Authentication & RBAC)</div>
      <span class="tag tag-code">โค้ดจริง</span>
    </div>
    <ul class="file-list">
      <li class="file-item">
        <span class="file-path">📁 app/login/page.tsx</span>
        <div class="file-desc">หน้าจอเข้าสู่ระบบ (Login UI) รองรับกรอกอีเมลสถาบัน (@kmitl.ac.th) หรือรหัสนักศึกษา</div>
        <div class="line-points">
          &bull; <strong>บรรทัด 14 – 41 (submit):</strong> ตรวจสอบรูปแบบอีเมลสถาบันและส่งคำขอไปยัง API<br>
          &bull; <strong>บรรทัด 57 – 90:</strong> ส่วนเรนเดอร์แบบฟอร์มล็อกอิน
        </div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 lib/auth.ts</span>
        <div class="file-desc">หัวใจของระบบความปลอดภัยและการจัดการสิทธิ์ผู้ใช้งาน</div>
        <div class="line-points">
          &bull; <strong>บรรทัด 70 – 74 (hashPassword):</strong> เข้ารหัสผ่านด้วย Scrypt + Salt 16 ไบต์ ป้องกันรหัสผ่านรั่วไหล<br>
          &bull; <strong>บรรทัด 82 – 87 (verifyPassword):</strong> ตรวจสอบความถูกต้องของรหัสผ่านแบบ Timing Attack Safe<br>
          &bull; <strong>บรรทัด 95 – 102 (createSessionToken) & 129 – 137 (setSessionCookie):</strong> ออก Session Token พร้อมประทับตรารับรอง HMAC-SHA256 และส่งผ่าน HttpOnly Cookie<br>
          &bull; <strong>บรรทัด 195 – 204 (requireApiUser):</strong> ป้อมยามตรวจสิทธิ์ (Role Guard) กั้นไม่ให้นักศึกษาเข้าถึงฟังก์ชันของแอดมิน
        </div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 app/api/auth/login/route.ts</span>
        <div class="file-desc">API รับคำขอล็อกอิน ตรวจสอบข้อมูลใน MongoDB และส่งเซสชันคุกกี้กลับไป</div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 app/dashboard/page.tsx</span>
        <div class="file-desc">ตัวคัดกรองเส้นทางตามบทบาท (Role Redirection): ตรวจสอบว่าถ้าเป็น Admin นำทางไป <code>/admin</code> ถ้าเป็น Student นำทางไป <code>/student</code></div>
      </li>
    </ul>
  </div>

  <!-- ข้อ 8 -->
  <div class="section-card">
    <div class="section-card-header">
      <div class="section-title"><span class="num">ข้อ 8</span> พัฒนาระบบจัดการข้อมูลส่วนตัว ประวัติการศึกษา และทักษะ</div>
      <span class="tag tag-code">โค้ดจริง</span>
    </div>
    <ul class="file-list">
      <li class="file-item">
        <span class="file-path">📁 components/StudentEditor.tsx</span>
        <div class="file-desc">หน้าสตูดิโอแก้ไขเรซูเม่ รองรับการจัดการบล็อกข้อมูลอย่างสมบูรณ์</div>
        <div class="line-points">
          &bull; <strong>บรรทัด 96 – 160 (blockTemplates):</strong> นิยามบล็อกแต่ละหมวดหมู่ ได้แก่ <strong>profile</strong> (ข้อมูลพื้นฐาน), <strong>education</strong> (ประวัติการศึกษา), <strong>skills</strong> (ทักษะเฉพาะทาง), <strong>projects</strong> (ผลงาน), <strong>experience</strong> (ประสบการณ์), <strong>contact</strong> (ช่องทางติดต่อ)<br>
          &bull; มีฟังก์ชันเพิ่ม/ลบ/แก้ไขข้อความ สลับการแสดงผล และปรับแต่งสไตล์
        </div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 components/StudentAccountManager.tsx</span>
        <div class="file-desc">หน้าฟอร์มแก้ไขข้อมูลส่วนตัวของนักศึกษา (ชื่อ, นามสกุล, ภาควิชา, ชั้นปี) และแบบฟอร์มเปลี่ยนรหัสผ่าน</div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 lib/portfolio.ts</span>
        <div class="file-desc">
          &bull; <strong>บรรทัด 448 – 476 (getDefaultContent):</strong> ฟังก์ชันเติมเนื้อหาตั้งต้นสำหรับ Profile, Education, Skills อัตโนมัติ<br>
          &bull; <strong>บรรทัด 546 – 570 (getOrCreatePortfolio):</strong> ฟังก์ชันดึงหรือสร้างแฟ้มผลงานเริ่มต้นสำหรับนักศึกษาใหม่
        </div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 app/api/user/profile/route.ts</span>
        <div class="file-desc">API รับคำขอ GET (ดึงข้อมูลส่วนตัว) และ PUT (อัปเดตชื่อ-สกุล แผนก ชั้นปี ลงฐานข้อมูล)</div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 app/api/portfolio/me/route.ts</span>
        <div class="file-desc">API บันทึกข้อมูลบล็อกเรซูเม่ทั้งหมด (เนื้อหา, สไตล์, เทมเพลต) ลงใน MongoDB</div>
      </li>
    </ul>
  </div>

  <!-- ข้อ 9 -->
  <div class="section-card">
    <div class="section-card-header">
      <div class="section-title"><span class="num">ข้อ 9</span> พัฒนาระบบ Dashboard เบื้องต้น</div>
      <span class="tag tag-code">โค้ดจริง</span>
    </div>
    <ul class="file-list">
      <li class="file-item">
        <span class="file-path">📁 app/student/page.tsx (Student Dashboard)</span>
        <div class="file-desc">หน้าแดชบอร์ดสำหรับนักศึกษา สรุปสถานะและข้อมูลสำคัญ</div>
        <div class="line-points">
          &bull; <strong>บรรทัด 40 – 100 (stu-stats-row):</strong> การ์ดสถิติ 4 ตัว: 1. ชื่อ Resume &middot; 2. จำนวน Elements ทั้งหมด &middot; 3. เปอร์เซ็นต์ความสมบูรณ์ของข้อมูล (Completion %) &middot; 4. สถานะ Draft / Published พร้อมลิงก์สาธารณะ (<code>/r/[slug]</code>)<br>
          &bull; ปุ่มทางลัดเข้าสู่หน้า Studio Editor และหน้าจัดการบัญชี
        </div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 app/admin/page.tsx & components/AdminPanel.tsx (Admin Dashboard)</span>
        <div class="file-desc">หน้าแดชบอร์ดศูนย์กลางสำหรับผู้ดูแลระบบ</div>
        <div class="line-points">
          &bull; <strong>AdminPanel.tsx บรรทัด 83 – 88 (stats):</strong> การ์ดสถิติภาพรวม: จำนวนนักศึกษาทั้งหมด, จำนวนคนที่เผยแพร่แล้ว, จำนวนที่ยังเป็นแบบร่าง<br>
          &bull; ระบบค้นหาและตัวกรองนักศึกษาตามสถานะ<br>
          &bull; ระบบจัดการบัญชีนักศึกษา: เพิ่มนักศึกษาใหม่, แก้ไขข้อมูล, รีเซ็ตรหัสผ่าน, และปุ่มเปิดดูตัวอย่างผลงานนักศึกษาแต่ละคน
        </div>
      </li>
    </ul>
  </div>

  <!-- ข้อ 10 -->
  <div class="section-card">
    <div class="section-card-header">
      <div class="section-title"><span class="num">ข้อ 10</span> ทดสอบระบบในระยะที่ 1 และสรุปผล</div>
      <span class="tag tag-test">การทดสอบ</span>
    </div>
    <p style="font-size: 12.5px; color: #334155; margin-bottom: 8px;">
      ข้อนี้คือกระบวนการทดสอบความถูกต้องของระบบตามฟังก์ชันที่ระบุไว้ในขอบเขตเทอม 1 โดยมีสคริปต์สนับสนุน:
    </p>
    <ul class="file-list">
      <li class="file-item">
        <span class="file-path">📁 scripts/seed.mjs</span>
        <div class="file-desc">สคริปต์ทดสอบการเชื่อมต่อ MongoDB และการกระจายข้อมูลจำลองสำหรับนำมาทดสอบระบบ</div>
      </li>
      <li class="file-item">
        <span class="file-path">📁 capture_real_screenshots.mjs</span>
        <div class="file-desc">สคริปต์รันเบราว์เซอร์อัตโนมัติเพื่อบันทึกภาพหน้าจอผลลัพธ์การทำงานจริงของแต่ละหน้าสำหรับใช้ทำรายงานสรุปผล</div>
      </li>
    </ul>
  </div>

  <div class="footer">
    จัดทำขึ้นสำหรับโครงการระบบ Portfolio ออนไลน์ &middot; ภาคเรียนที่ 1 &middot; วันที่ 15 กันยายน 2026
  </div>

</body>
</html>
"""

html_path = "/Users/surachartlimrattanaphun/Desktop/PFS/Term1_Scope_Code_Guide.html"
pdf_path = "/Users/surachartlimrattanaphun/Desktop/PFS/Term1_Scope_Code_Guide.pdf"
thai_pdf_path = "/Users/surachartlimrattanaphun/Desktop/PFS/คู่มือเปิดโค้ด_ขอบเขตเทอม1.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML written to {html_path}")

cmd = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--headless",
    "--disable-gpu",
    f"--print-to-pdf={pdf_path}",
    "--no-pdf-header-footer",
    f"file://{html_path}"
]

print("Running Chrome headless to generate PDF...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Chrome returncode:", res.returncode)

if os.path.exists(pdf_path):
    print(f"PDF generated successfully: {pdf_path}, size: {os.path.getsize(pdf_path)} bytes")
    # Also copy to Thai name for convenience
    import shutil
    shutil.copyfile(pdf_path, thai_pdf_path)
    print(f"Copied to {thai_pdf_path}")
else:
    print("Error: PDF file not found. stderr:", res.stderr)
