import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

DIR = Path(__file__).parent / "diagrams"
DIR.mkdir(parents=True, exist_ok=True)

FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

def get_font(size, bold=False):
    path = FONT_BOLD if bold and Path(FONT_BOLD).exists() else FONT_REG
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def draw_header(draw, title, subtitle, w):
    draw.rectangle([(0, 0), (w, 100)], fill="#1E293B")
    draw.text((40, 20), title, font=get_font(32, True), fill="#FFFFFF")
    draw.text((40, 62), subtitle, font=get_font(18), fill="#94A3B8")

def draw_pill(draw, xy, text, bg="#EEF2FF", border="#6366F1", text_color="#312E81", font_size=18, radius=12):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle([(x1, y1), (x2, y2)], radius=radius, fill=bg, outline=border, width=2)
    f = get_font(font_size, True)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((x1 + (x2 - x1 - tw) / 2, y1 + (y2 - y1 - th) / 2 - 2), text, font=f, fill=text_color)

def draw_actor(draw, x, y, name, color="#4F46E5"):
    # Head
    draw.ellipse([(x - 20, y - 50), (x + 20, y - 10)], outline=color, width=3, fill="#F8FAFC")
    # Body
    draw.line([(x, y - 10), (x, y + 35)], fill=color, width=3)
    # Arms
    draw.line([(x - 30, y + 10), (x + 30, y + 10)], fill=color, width=3)
    # Legs
    draw.line([(x, y + 35), (x - 25, y + 75)], fill=color, width=3)
    draw.line([(x, y + 35), (x + 25, y + 75)], fill=color, width=3)
    # Label
    f = get_font(18, True)
    bbox = draw.textbbox((0, 0), name, font=f)
    tw = bbox[2] - bbox[0]
    draw.text((x - tw / 2, y + 85), name, font=f, fill="#1E293B")

def generate_use_case_diagram():
    W, H = 1600, 1100
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Use Case Diagram - Online Portfolio System (PFS)", "Actors: Student, Admin, Public Visitor | System Boundary: PFS Web App", W)

    # System boundary box
    draw.rounded_rectangle([(340, 130), (1240, 1040)], radius=20, fill="#FFFFFF", outline="#CBD5E1", width=3)
    draw.rectangle([(340, 130), (1240, 180)], fill="#F1F5F9")
    draw.text((360, 142), "SYSTEM BOUNDARY : PFS Portfolio Web Application", font=get_font(20, True), fill="#475569")

    # Actors
    draw_actor(draw, 170, 420, "Student\n(นักศึกษา)", "#2563EB")
    draw_actor(draw, 1410, 420, "Admin\n(ผู้ดูแลระบบ)", "#7C3AED")
    draw_actor(draw, 170, 850, "Public Visitor\n(ผู้เข้าชมทั่วไป)", "#059669")

    # Student Use Cases
    student_cases = [
        ("UC-01: เข้าสู่ระบบ (Login)", (450, 210, 750, 260)),
        ("UC-02: ออกจากระบบ (Logout)", (830, 210, 1130, 260)),
        ("UC-03: เปลี่ยนรหัสผ่าน (Change Password)", (450, 290, 780, 340)),
        ("UC-04: แก้ไขข้อมูลส่วนตัว (Edit Profile)", (450, 370, 780, 420)),
        ("UC-05: ดูแดชบอร์ดนักศึกษา (Student Dashboard)", (450, 450, 800, 500)),
        ("UC-06: เลือกเทมเพลต (Select Template)", (450, 530, 780, 580)),
        ("UC-07: จัดวางบล็อกบน 12-Col Grid Canvas", (450, 610, 820, 660)),
        ("UC-08: ปรับแต่งธีม/ฟอนต์/สไตล์การ์ด", (450, 690, 780, 740)),
        ("UC-09: บันทึกข้อมูลฉบับร่าง (Save Draft)", (450, 770, 780, 820)),
        ("UC-10: เผยแพร่ผลงาน (Publish Portfolio)", (450, 850, 800, 900)),
        ("UC-11: ปิดการเผยแพร่ (Unpublish)", (450, 930, 780, 980)),
    ]

    # Admin Use Cases
    admin_cases = [
        ("UC-12: ดูภาพรวมและสถิติ (Admin Dashboard)", (800, 370, 1180, 420)),
        ("UC-13: เพิ่มนักศึกษาใหม่ (Add Student)", (820, 450, 1160, 500)),
        ("UC-14: แก้ไขข้อมูลนักศึกษา (Edit Student)", (820, 530, 1160, 580)),
        ("UC-15: ระงับ/เปิดใช้บัญชี (Toggle Status)", (820, 610, 1160, 660)),
        ("UC-16: รีเซ็ตรหัสผ่านนักศึกษา (Reset Pass)", (820, 690, 1170, 740)),
        ("UC-17: ลบบัญชีนักศึกษา (Delete Student)", (820, 770, 1160, 820)),
        ("UC-18: ค้นหา/กรองนักศึกษา (Search/Filter)", (820, 850, 1180, 900)),
        ("UC-19: ตรวจสอบและดู Portfolio นักศึกษา", (800, 930, 1190, 980)),
    ]

    # Draw Student use cases & lines
    for title, box in student_cases:
        draw_pill(draw, box, title, bg="#EFF6FF", border="#3B82F6", text_color="#1E3A8A", font_size=15, radius=20)
        draw.line([(170, 420), (box[0], (box[1] + box[3]) // 2)], fill="#93C5FD", width=2)

    # Draw Admin use cases & lines
    for title, box in admin_cases:
        draw_pill(draw, box, title, bg="#FAF5FF", border="#A855F7", text_color="#581C87", font_size=15, radius=20)
        draw.line([(1410, 420), (box[2], (box[1] + box[3]) // 2)], fill="#D8B4FE", width=2)

    # Login / Logout shared with Admin
    draw.line([(1410, 420), (750, 235)], fill="#D8B4FE", width=2)
    draw.line([(1410, 420), (830, 235)], fill="#D8B4FE", width=2)

    # Public Visitor Use case
    pub_box = (450, 1000, 780, 1035)
    # re-draw on bottom
    draw_pill(draw, (450, 990, 820, 1030), "UC-20: เปิดดูหน้า Portfolio สาธารณะ (/r/slug)", bg="#ECFDF5", border="#10B981", text_color="#064E3B", font_size=14, radius=18)
    draw.line([(170, 850), (450, 1010)], fill="#6EE7B7", width=2)

    img.save(DIR / "use-case-diagram.png", "PNG")
    print("Saved use-case-diagram.png")

def generate_context_diagram():
    W, H = 1500, 900
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Context Diagram (DFD Level 0) - Portfolio System (PFS)", "High-Level System Boundary and Data Flows with External Entities", W)

    # Central System Bubble
    cx, cy, cr = 750, 480, 150
    draw.ellipse([(cx - cr, cy - cr), (cx + cr, cy + cr)], fill="#1E293B", outline="#3B82F6", width=6)
    f_num = get_font(26, True)
    f_sys = get_font(24, True)
    f_sub = get_font(18)
    draw.text((cx - 30, cy - 60), "0.0", font=f_num, fill="#60A5FA")
    draw.text((cx - 110, cy - 20), "ระบบจัดการ Portfolio", font=f_sys, fill="#FFFFFF")
    draw.text((cx - 100, cy + 15), "ออนไลน์ (PFS Web)", font=f_sys, fill="#FFFFFF")
    draw.text((cx - 85, cy + 50), "Next.js + MongoDB", font=f_sub, fill="#94A3B8")

    # Entity 1: Student (Top Left)
    draw.rounded_rectangle([(100, 160), (380, 260)], radius=12, fill="#EFF6FF", outline="#2563EB", width=3)
    draw.text((130, 185), "🎓 External Entity:", font=get_font(16), fill="#1E40AF")
    draw.text((130, 210), "Student (นักศึกษา)", font=get_font(22, True), fill="#1E3A8A")

    # Student Flows
    # In
    draw.line([(380, 190), (620, 390)], fill="#2563EB", width=2)
    draw.text((410, 245), "• ข้อมูล Login, ข้อมูลส่วนตัว", font=get_font(14, True), fill="#1E40AF")
    draw.text((410, 265), "• โครงสร้าง Grid, บล็อกผลงาน", font=get_font(14, True), fill="#1E40AF")
    draw.text((410, 285), "• คำสั่ง Save / Publish", font=get_font(14, True), fill="#1E40AF")
    # Out
    draw.line([(600, 420), (360, 260)], fill="#059669", width=2)
    draw.text((370, 340), "• Session Token, ข้อมูล Dashboard", font=get_font(14, True), fill="#065F46")
    draw.text((370, 360), "• ลิงก์สาธารณะ /r/[slug]", font=get_font(14, True), fill="#065F46")

    # Entity 2: Admin (Top Right)
    draw.rounded_rectangle([(1120, 160), (1400, 260)], radius=12, fill="#FAF5FF", outline="#7C3AED", width=3)
    draw.text((1150, 185), "🛡️ External Entity:", font=get_font(16), fill="#6B21A8")
    draw.text((1150, 210), "Admin (ผู้ดูแลระบบ)", font=get_font(22, True), fill="#581C87")

    # Admin Flows
    # In
    draw.line([(1120, 200), (880, 390)], fill="#7C3AED", width=2)
    draw.text((950, 245), "• ข้อมูลบัญชีนักศึกษา (เพิ่ม/แก้ไข/ลบ)", font=get_font(14, True), fill="#6B21A8")
    draw.text((950, 265), "• คำสั่งสลับ Active/Inactive, รีเซ็ตรหัส", font=get_font(14, True), fill="#6B21A8")
    # Out
    draw.line([(900, 420), (1140, 260)], fill="#059669", width=2)
    draw.text((960, 340), "• สถิติภาพรวมระบบ", font=get_font(14, True), fill="#065F46")
    draw.text((960, 360), "• รายชื่อ & ตัวอย่าง Portfolio ทุกสถานะ", font=get_font(14, True), fill="#065F46")

    # Entity 3: Public Visitor (Bottom)
    draw.rounded_rectangle([(610, 750), (890, 850)], radius=12, fill="#ECFDF5", outline="#059669", width=3)
    draw.text((640, 775), "👥 External Entity:", font=get_font(16), fill="#047857")
    draw.text((640, 800), "Public Visitor / Employer", font=get_font(20, True), fill="#064E3B")

    # Visitor Flows
    # In
    draw.line([(730, 750), (730, 630)], fill="#059669", width=2)
    draw.text((540, 680), "คำขอเปิดชม URL Slug ->", font=get_font(14, True), fill="#065F46")
    # Out
    draw.line([(770, 630), (770, 750)], fill="#2563EB", width=2)
    draw.text((780, 680), "-> หน้าเว็บ Resume/Portfolio", font=get_font(14, True), fill="#1E40AF")

    img.save(DIR / "context-diagram.png", "PNG")
    print("Saved context-diagram.png")

def generate_sitemap():
    W, H = 1400, 850
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Sitemap & Navigation Hierarchy - PFS Web Application", "Three-Tier Role-Based Navigation Architecture (Public, Student, Admin)", W)

    # Root Box
    draw_pill(draw, (550, 130, 850, 190), "🌐 PFS Root (/) : Landing & Redirect", bg="#0F172A", border="#334155", text_color="#F8FAFC", font_size=18, radius=12)

    # 3 Zones
    # Public Zone
    draw.line([(700, 190), (700, 230)], fill="#64748B", width=2)
    draw.line([(250, 230), (1150, 230)], fill="#64748B", width=2)
    draw.line([(250, 230), (250, 270)], fill="#64748B", width=2)
    draw.line([(700, 230), (700, 270)], fill="#64748B", width=2)
    draw.line([(1150, 230), (1150, 270)], fill="#64748B", width=2)

    draw_pill(draw, (120, 270, 380, 330), "Public Zone (บุคคลทั่วไป)", bg="#ECFDF5", border="#059669", text_color="#064E3B", font_size=18, radius=10)
    draw_pill(draw, (560, 270, 840, 330), "Student Zone (นักศึกษา)", bg="#EFF6FF", border="#2563EB", text_color="#1E3A8A", font_size=18, radius=10)
    draw_pill(draw, (1010, 270, 1290, 330), "Admin Zone (ผู้ดูแลระบบ)", bg="#FAF5FF", border="#7C3AED", text_color="#581C87", font_size=18, radius=10)

    # Public pages
    pub_pages = [
        ("/login : เข้าสู่ระบบ", 370),
        ("/dashboard : ทำเนียบสาธารณะ", 440),
        ("/r/[slug] : แสดงผลงานจริง", 510),
        ("/p/[slug] : Alias URL", 580),
    ]
    draw.line([(250, 330), (250, 600)], fill="#A7F3D0", width=2)
    for title, y in pub_pages:
        draw.line([(250, y + 20), (280, y + 20)], fill="#A7F3D0", width=2)
        draw_pill(draw, (280, y, 480, y + 40), title, bg="#FFFFFF", border="#CBD5E1", text_color="#334155", font_size=14, radius=8)

    # Student pages
    draw.line([(700, 330), (700, 400)], fill="#BFDBFE", width=2)
    draw_pill(draw, (570, 400, 830, 450), "/student (Dashboard)", bg="#DBEAFE", border="#3B82F6", text_color="#1E3A8A", font_size=16, radius=8)
    
    # Sub Student
    stu_pages = [
        ("• ข้อมูลส่วนตัว / เปลี่ยนรหัสผ่าน", 480),
        ("• สถิติความครบถ้วน %", 530),
        ("• ลิงก์แชร์ /r/[slug]", 580),
    ]
    draw.line([(700, 450), (700, 600)], fill="#BFDBFE", width=2)
    for title, y in stu_pages:
        draw.line([(700, y + 15), (730, y + 15)], fill="#BFDBFE", width=2)
        draw_pill(draw, (730, y, 940, y + 35), title, bg="#FFFFFF", border="#E2E8F0", text_color="#475569", font_size=13, radius=6)

    # Editor
    draw.line([(700, 600), (700, 650)], fill="#BFDBFE", width=2)
    draw_pill(draw, (560, 650, 840, 700), "/student/editor (Studio Grid)", bg="#3B82F6", border="#1D4ED8", text_color="#FFFFFF", font_size=16, radius=8)
    editor_subs = [
        ("• 12-Col Grid Canvas", 720),
        ("• 6 Preset Templates", 755),
        ("• Inspector / Publish", 790),
    ]
    for title, y in editor_subs:
        draw_pill(draw, (570, y, 830, y + 28), title, bg="#EFF6FF", border="#BFDBFE", text_color="#1E40AF", font_size=12, radius=4)

    # Admin pages
    draw.line([(1150, 330), (1150, 400)], fill="#E9D5FF", width=2)
    draw_pill(draw, (1010, 400, 1290, 450), "/admin (Dashboard)", bg="#F3E8FF", border="#9333EA", text_color="#581C87", font_size=16, radius=8)
    admin_features = [
        ("• สถิติภาพรวม & ตารางรายชื่อ", 480),
        ("• เพิ่ม / แก้ไข / ลบ นักศึกษา", 530),
        ("• สลับสถานะ Active / Inactive", 580),
        ("• รีเซ็ตรหัสผ่านนักศึกษา", 630),
        ("/admin/preview/[id] : ตรวจแบบร่าง", 690),
    ]
    draw.line([(1150, 450), (1150, 710)], fill="#E9D5FF", width=2)
    for title, y in admin_features:
        draw.line([(1150, y + 15), (1180, y + 15)], fill="#E9D5FF", width=2)
        draw_pill(draw, (1180, y, 1380, y + 35), title, bg="#FFFFFF", border="#E2E8F0", text_color="#475569", font_size=13, radius=6)

    img.save(DIR / "sitemap-diagram.png", "PNG")
    print("Saved sitemap-diagram.png")

def generate_workflows():
    # 1. Login Workflow
    W, H = 1200, 800
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Workflow: Login & Authentication Flow", "Secure scrypt verification, Role Routing & Inactive Account Prevention", W)

    steps = [
        ("Start: ผู้ใช้เข้าหน้า /login", 500, 140, "#1E293B", "#FFFFFF"),
        ("กรอก รหัสนักศึกษา/อีเมล และ รหัสผ่าน", 500, 220, "#EFF6FF", "#1E3A8A"),
        ("ตรวจสอบใน DB: ค้นหาผู้ใช้ & verify scrypt hash", 500, 300, "#FEF3C7", "#92400E"),
    ]
    for title, x, y, bg, tc in steps:
        draw_pill(draw, (x - 220, y, x + 220, y + 50), title, bg=bg, border="#CBD5E1", text_color=tc, font_size=16, radius=10)
        draw.line([(x, y + 50), (x, y + 80)], fill="#64748B", width=2)

    # Decision 1: Password match?
    draw_pill(draw, (350, 380, 650, 430), "รหัสผ่านถูกต้อง หรือไม่?", bg="#FEF08A", border="#EAB308", text_color="#713F12", font_size=16, radius=10)
    # No -> Error
    draw.line([(350, 405), (180, 405)], fill="#EF4444", width=2)
    draw.line([(180, 405), (180, 460)], fill="#EF4444", width=2)
    draw_pill(draw, (80, 460, 280, 510), "แจ้งเตือน: รหัสผ่านไม่ถูกต้อง", bg="#FEE2E2", border="#EF4444", text_color="#991B1B", font_size=14, radius=8)

    # Yes -> Check status
    draw.line([(500, 430), (500, 490)], fill="#10B981", width=2)
    draw_pill(draw, (350, 490, 650, 540), "สถานะบัญชี active หรือไม่?", bg="#FEF08A", border="#EAB308", text_color="#713F12", font_size=16, radius=10)

    # No -> Inactive
    draw.line([(650, 515), (820, 515)], fill="#EF4444", width=2)
    draw.line([(820, 515), (820, 570)], fill="#EF4444", width=2)
    draw_pill(draw, (710, 570, 930, 620), "แจ้งเตือน: บัญชีถูกปิดใช้งาน", bg="#FEE2E2", border="#EF4444", text_color="#991B1B", font_size=14, radius=8)

    # Yes -> Create Token & Route
    draw.line([(500, 540), (500, 600)], fill="#10B981", width=2)
    draw_pill(draw, (320, 600, 680, 650), "สร้าง Session Token (HMAC Signed Cookie)", bg="#D1FAE5", border="#10B981", text_color="#065F46", font_size=15, radius=8)

    draw.line([(400, 650), (400, 710)], fill="#2563EB", width=2)
    draw_pill(draw, (270, 710, 480, 760), "Student: ไป /student", bg="#DBEAFE", border="#2563EB", text_color="#1E3A8A", font_size=15, radius=8)

    draw.line([(600, 650), (600, 710)], fill="#7C3AED", width=2)
    draw_pill(draw, (520, 710, 730, 760), "Admin: ไป /admin", bg="#F3E8FF", border="#7C3AED", text_color="#581C87", font_size=15, radius=8)

    img.save(DIR / "workflow-login-auth.png", "PNG")
    print("Saved workflow-login-auth.png")

    # 2. Portfolio Builder Workflow
    W, H = 1300, 850
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Workflow: Student Portfolio Builder & Publishing", "Canvas Editing, 12-Column Grid Rearrangement, Save Draft & Public Sharing", W)

    builder_steps = [
        ("1. นักศึกษาเปิด /student/editor", 150, 150),
        ("2. เลือก Template หรือเพิ่ม Block", 150, 240),
        ("3. คลิกเลือก Card บน 12-Col Grid", 150, 330),
        ("4. ปรับ Col/Row, เนื้อหา และสไตล์", 150, 420),
        ("5. ตัดสินใจบันทึก / เผยแพร่", 150, 510),
    ]
    for t, x, y in builder_steps:
        draw_pill(draw, (x, y, x + 350, y + 50), t, bg="#EFF6FF", border="#3B82F6", text_color="#1E3A8A", font_size=16, radius=10)
        if y < 510:
            draw.line([(x + 175, y + 50), (x + 175, y + 90)], fill="#93C5FD", width=2)

    # 3 Paths from Step 5
    draw.line([(500, 535), (650, 535)], fill="#64748B", width=2)
    draw.line([(650, 350), (650, 720)], fill="#64748B", width=2)

    # Path A: Save Draft
    draw.line([(650, 350), (720, 350)], fill="#F59E0B", width=2)
    draw_pill(draw, (720, 320, 1150, 380), "กด บันทึก: ส่ง PUT /api/portfolio/me (สถานะ Draft)", bg="#FEF3C7", border="#F59E0B", text_color="#92400E", font_size=15, radius=8)

    # Path B: Publish
    draw.line([(650, 535), (720, 535)], fill="#10B981", width=2)
    draw_pill(draw, (720, 505, 1150, 565), "กด Publish: ส่ง POST /api/portfolio/me/publish (สถานะ Published)", bg="#D1FAE5", border="#10B981", text_color="#065F46", font_size=15, radius=8)
    draw.line([(935, 565), (935, 610)], fill="#10B981", width=2)
    draw_pill(draw, (750, 610, 1120, 660), "สร้างลิงก์สาธารณะ /r/[slug] ให้บุคคลภายนอกเข้าชม", bg="#ECFDF5", border="#059669", text_color="#064E3B", font_size=15, radius=8)

    # Path C: Unpublish
    draw.line([(650, 720), (720, 720)], fill="#6B7280", width=2)
    draw_pill(draw, (720, 695, 1150, 745), "กด ปิดเผยแพร่: ส่ง POST unpublish (สถานะกลับเป็น Draft)", bg="#F3F4F6", border="#9CA3AF", text_color="#374151", font_size=15, radius=8)

    img.save(DIR / "workflow-portfolio-builder.png", "PNG")
    print("Saved workflow-portfolio-builder.png")

    # 3. Admin Workflow
    W, H = 1200, 850
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Workflow: Admin Student & Account Management", "Full Account Lifecycle Management, Security Controls & Portfolio Review", W)

    draw_pill(draw, (400, 140, 800, 190), "Admin เข้าหน้า /admin (ดึงรายชื่อและสถานะ)", bg="#FAF5FF", border="#7C3AED", text_color="#581C87", font_size=16, radius=10)
    draw.line([(600, 190), (600, 250)], fill="#A855F7", width=2)
    draw_pill(draw, (420, 250, 780, 300), "ตารางรายชื่อนักศึกษา (ค้นหา / จัดเรียง)", bg="#F3E8FF", border="#9333EA", text_color="#6B21A8", font_size=16, radius=8)

    admin_actions = [
        ("1. เพิ่มนักศึกษาใหม่ -> ตรวจสอบข้อมูลซ้ำ -> บันทึกลง DB (status=active)", 370),
        ("2. แก้ไขข้อมูลนักศึกษา -> เปิดฟอร์มแก้ไขชื่อ/อีเมล/ชั้นปี -> PUT /api/students/:id", 450),
        ("3. สลับสถานะบัญชี -> คลิกปุ่ม Active <-> Inactive -> PATCH status", 530),
        ("4. รีเซ็ตรหัสผ่าน -> สั่งตั้งรหัสผ่านใหม่ (เช่น เท่ากับรหัสนักศึกษา)", 610),
        ("5. ลบบัญชีนักศึกษา -> กดยืนยันเพื่อลบข้อมูล User + Portfolio", 690),
        ("6. ตรวจสอบผลงาน -> คลิกตรวจงานเพื่อดูแบบร่างหรือหน้าเผยแพร่จริง", 770),
    ]
    draw.line([(600, 300), (600, 790)], fill="#CBD5E1", width=2)
    for t, y in admin_actions:
        draw.line([(600, y + 20), (650, y + 20)], fill="#A855F7", width=2)
        draw_pill(draw, (650, y, 1160, y + 40), t, bg="#FFFFFF", border="#E2E8F0", text_color="#334155", font_size=13, radius=6)

    img.save(DIR / "workflow-admin-management.png", "PNG")
    print("Saved workflow-admin-management.png")

if __name__ == "__main__":
    generate_use_case_diagram()
    generate_context_diagram()
    generate_sitemap()
    generate_workflows()
    print("All diagrams generated successfully!")
