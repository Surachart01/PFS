import math
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

DIR = Path(__file__).parent / "diagrams"
DIR.mkdir(parents=True, exist_ok=True)

# Apple Sukhumvit Set for crisp Thai & English rendering
SUKHUMVIT = "/System/Library/Fonts/Supplemental/SukhumvitSet.ttc"
THONBURI = "/System/Library/Fonts/Supplemental/Thonburi.ttc"

def get_font(size, bold=False):
    # Sukhumvit Set: index 2 = Text/Regular, index 5 = Bold, index 4 = SemiBold
    try:
        idx = 5 if bold else 2
        return ImageFont.truetype(SUKHUMVIT, size, index=idx)
    except Exception:
        try:
            return ImageFont.truetype(THONBURI, size)
        except Exception:
            return ImageFont.load_default()

def draw_header(draw, title, subtitle, w, category="SYSTEM ANALYSIS & DESIGN SPECIFICATION"):
    # Modern dark navy banner
    draw.rectangle([(0, 0), (w, 110)], fill="#0F172A")
    draw.rectangle([(0, 106), (w, 110)], fill="#3B82F6")
    
    # Category tag
    draw.rounded_rectangle([(40, 16), (360, 40)], radius=6, fill="#1E293B", outline="#334155", width=1)
    draw.text((50, 19), category, font=get_font(12, True), fill="#60A5FA")
    
    # Title & Subtitle
    draw.text((40, 45), title, font=get_font(28, True), fill="#FFFFFF")
    draw.text((40, 80), subtitle, font=get_font(16), fill="#94A3B8")

def draw_arrow(draw, start, end, fill="#64748B", width=2, arrow_len=12, arrow_width=6):
    x1, y1 = start
    x2, y2 = end
    draw.line([(x1, y1), (x2, y2)], fill=fill, width=width)
    
    dx = x2 - x1
    dy = y2 - y1
    angle = math.atan2(dy, dx)
    
    # Points for arrowhead triangle
    sin_a = math.sin(angle)
    cos_a = math.cos(angle)
    
    tip_x = x2
    tip_y = y2
    
    p1_x = tip_x - arrow_len * cos_a + arrow_width * sin_a
    p1_y = tip_y - arrow_len * sin_a - arrow_width * cos_a
    
    p2_x = tip_x - arrow_len * cos_a - arrow_width * sin_a
    p2_y = tip_y - arrow_len * sin_a + arrow_width * cos_a
    
    draw.polygon([(tip_x, tip_y), (p1_x, p1_y), (p2_x, p2_y)], fill=fill)

def draw_pill(draw, xy, text, bg="#EEF2FF", border="#6366F1", text_color="#312E81", font_size=16, radius=10, bold=True):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle([(x1, y1), (x2, y2)], radius=radius, fill=bg, outline=border, width=2)
    f = get_font(font_size, bold)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((x1 + (x2 - x1 - tw) / 2, y1 + (y2 - y1 - th) / 2 - 2), text, font=f, fill=text_color)

def draw_actor(draw, x, y, name_en, name_th, color="#2563EB", bg="#EFF6FF"):
    # Circle base for head
    draw.ellipse([(x - 22, y - 55), (x + 22, y - 11)], outline=color, width=3, fill=bg)
    # Body
    draw.line([(x, y - 11), (x, y + 38)], fill=color, width=3)
    # Arms
    draw.line([(x - 32, y + 10), (x + 32, y + 10)], fill=color, width=3)
    # Legs
    draw.line([(x, y + 38), (x - 26, y + 78)], fill=color, width=3)
    draw.line([(x, y + 38), (x + 26, y + 78)], fill=color, width=3)
    # Text box
    f_en = get_font(18, True)
    f_th = get_font(15, False)
    
    b_en = draw.textbbox((0, 0), name_en, font=f_en)
    tw_en = b_en[2] - b_en[0]
    b_th = draw.textbbox((0, 0), name_th, font=f_th)
    tw_th = b_th[2] - b_th[0]
    
    draw.text((x - tw_en / 2, y + 88), name_en, font=f_en, fill="#0F172A")
    draw.text((x - tw_th / 2, y + 112), name_th, font=f_th, fill="#475569")

# ==============================================================================
# 1. USE CASE DIAGRAM
# ==============================================================================
def generate_use_case_diagram():
    W, H = 1750, 1150
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Use Case Diagram - Online Portfolio System (PFS)", 
                "Actors: Student, Admin, Public Visitor | System Boundary: PFS Web Application", W,
                "SYSTEM ANALYSIS: USE CASE SPECIFICATION")

    # System boundary box
    draw.rounded_rectangle([(320, 140), (1430, 1100)], radius=20, fill="#FFFFFF", outline="#CBD5E1", width=3)
    # Header bar in boundary box
    draw.rectangle([(320, 140), (1430, 190)], fill="#F1F5F9")
    draw.text((345, 153), "SYSTEM BOUNDARY : PFS Portfolio Web Application (Next.js + MongoDB)", font=get_font(18, True), fill="#334155")

    # Actors
    draw_actor(draw, 160, 430, "Student", "(นักศึกษา)", color="#2563EB", bg="#EFF6FF")
    draw_actor(draw, 1590, 430, "Admin", "(ผู้ดูแลระบบ)", color="#7C3AED", bg="#FAF5FF")
    draw_actor(draw, 160, 880, "Public Visitor", "(ผู้เข้าชมทั่วไป)", color="#059669", bg="#ECFDF5")

    # Shared Login / Logout cases (Centered at top)
    shared_cases = [
        ("UC-01: เข้าสู่ระบบ (Login)", (700, 210, 1050, 260)),
        ("UC-02: ออกจากระบบ (Logout)", (700, 280, 1050, 330)),
    ]
    for title, box in shared_cases:
        draw_pill(draw, box, title, bg="#FEF3C7", border="#F59E0B", text_color="#78350F", font_size=15, radius=18)
        # Connect to student
        draw.line([(160, 430), (box[0], (box[1] + box[3]) // 2)], fill="#93C5FD", width=2)
        # Connect to admin
        draw.line([(1590, 430), (box[2], (box[1] + box[3]) // 2)], fill="#D8B4FE", width=2)

    # Student Use Cases
    student_cases = [
        ("UC-03: เปลี่ยนรหัสผ่าน (Change Password)", (400, 370, 780, 420)),
        ("UC-04: แก้ไขข้อมูลส่วนตัว (Edit Profile)", (400, 440, 780, 490)),
        ("UC-05: ดูแดชบอร์ดสรุปภาพรวม (Student Dashboard)", (400, 510, 810, 560)),
        ("UC-06: เลือกเทมเพลตสำเร็จรูป (Select Template)", (400, 580, 800, 630)),
        ("UC-07: ปรับแต่งและจัดวาง 12-Col Grid Canvas", (400, 650, 820, 700)),
        ("UC-08: ปรับแต่งธีม ฟอนต์ และสไตล์การ์ด", (400, 720, 790, 770)),
        ("UC-09: บันทึกข้อมูลฉบับร่าง (Save Draft)", (400, 790, 780, 840)),
        ("UC-10: เผยแพร่ผลงานสู่สาธารณะ (Publish)", (400, 860, 800, 910)),
        ("UC-11: ปิดการเผยแพร่ผลงาน (Unpublish)", (400, 930, 790, 980)),
    ]
    for title, box in student_cases:
        draw_pill(draw, box, title, bg="#EFF6FF", border="#3B82F6", text_color="#1E3A8A", font_size=14, radius=18)
        draw.line([(160, 430), (box[0], (box[1] + box[3]) // 2)], fill="#93C5FD", width=2)

    # Admin Use Cases
    admin_cases = [
        ("UC-12: ดูแดชบอร์ดและสถิติระบบ (Admin Dashboard)", (970, 370, 1380, 420)),
        ("UC-13: เพิ่มบัญชีนักศึกษาใหม่ (Add Student)", (1000, 440, 1380, 490)),
        ("UC-14: แก้ไขข้อมูลนักศึกษา (Edit Student)", (1000, 510, 1380, 560)),
        ("UC-15: ระงับ/เปิดใช้บัญชี (Toggle Status)", (1000, 580, 1380, 630)),
        ("UC-16: รีเซ็ตรหัสผ่านนักศึกษา (Reset Password)", (980, 650, 1380, 700)),
        ("UC-17: ลบบัญชีนักศึกษา (Delete Student)", (1000, 720, 1380, 770)),
        ("UC-18: ค้นหาและจัดเรียงรายชื่อ (Search/Filter)", (980, 790, 1380, 840)),
        ("UC-19: ตรวจสอบและดูตัวอย่าง Portfolio นักศึกษา", (960, 860, 1380, 910)),
    ]
    for title, box in admin_cases:
        draw_pill(draw, box, title, bg="#FAF5FF", border="#A855F7", text_color="#581C87", font_size=14, radius=18)
        draw.line([(1590, 430), (box[2], (box[1] + box[3]) // 2)], fill="#D8B4FE", width=2)

    # Public Visitor Use case
    pub_box = (400, 1020, 840, 1070)
    draw_pill(draw, pub_box, "UC-20: เปิดดูหน้า Portfolio สาธารณะ (/r/[slug])", bg="#ECFDF5", border="#10B981", text_color="#064E3B", font_size=14, radius=18)
    draw.line([(160, 880), (pub_box[0], (pub_box[1] + pub_box[3]) // 2)], fill="#6EE7B7", width=2)

    img.save(DIR / "use-case-diagram.png", "PNG", dpi=(150, 150))
    print("Saved use-case-diagram.png")

# ==============================================================================
# 2. CONTEXT DIAGRAM (DFD LEVEL 0)
# ==============================================================================
def generate_context_diagram():
    W, H = 1600, 980
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Context Diagram (DFD Level 0) - Portfolio System (PFS)", 
                "High-Level System Boundary & Data Flows with External Entities", W,
                "SYSTEM ANALYSIS: DATA FLOW ARCHITECTURE")

    # Central System Process Circle
    cx, cy, cr = 800, 520, 165
    draw.ellipse([(cx - cr, cy - cr), (cx + cr, cy + cr)], fill="#1E293B", outline="#3B82F6", width=6)
    
    # Texts in center bubble
    f_num = get_font(30, True)
    f_sys1 = get_font(23, True)
    f_sys2 = get_font(21, True)
    f_sub = get_font(16, False)
    
    draw.text((cx - 30, cy - 75), "0.0", font=f_num, fill="#60A5FA")
    draw.text((cx - 110, cy - 25), "ระบบจัดการ Portfolio", font=f_sys1, fill="#FFFFFF")
    draw.text((cx - 100, cy + 15), "ออนไลน์ (PFS Web)", font=f_sys2, fill="#FFFFFF")
    draw.text((cx - 85, cy + 55), "Next.js + MongoDB", font=f_sub, fill="#94A3B8")

    # Entity 1: Student (Top Left)
    draw.rounded_rectangle([(80, 160), (420, 265)], radius=14, fill="#EFF6FF", outline="#2563EB", width=3)
    draw.rectangle([(80, 160), (420, 195)], fill="#DBEAFE")
    draw.text((105, 168), "[ External Entity 1 ]", font=get_font(13, True), fill="#1E40AF")
    draw.text((105, 205), "Student (นักศึกษา)", font=get_font(24, True), fill="#1E3A8A")
    draw.text((105, 235), "ผู้ใช้หลักที่สร้างและออกแบบผลงาน", font=get_font(14, False), fill="#3B82F6")

    # Student Inputs (Inflow to 0.0)
    draw_arrow(draw, (420, 200), (670, 420), fill="#2563EB", width=2)
    # Label box for Student Inputs
    draw.rounded_rectangle([(440, 230), (710, 315)], radius=8, fill="#FFFFFF", outline="#BFDBFE", width=1)
    draw.text((450, 237), "1. ข้อมูลเข้าสู่ระบบ (ID, Password)", font=get_font(13, True), fill="#1E40AF")
    draw.text((450, 257), "2. ข้อมูลส่วนตัว & รหัสผ่านใหม่", font=get_font(13, False), fill="#1E40AF")
    draw.text((450, 277), "3. บล็อกผลงาน & โครงสร้าง Grid", font=get_font(13, False), fill="#1E40AF")
    draw.text((450, 297), "4. คำสั่ง Template, บันทึก & Publish", font=get_font(13, False), fill="#1E40AF")

    # Student Outputs (Outflow from 0.0)
    draw_arrow(draw, (650, 470), (400, 265), fill="#059669", width=2)
    # Label box for Student Outputs
    draw.rounded_rectangle([(370, 355), (660, 425)], radius=8, fill="#FFFFFF", outline="#A7F3D0", width=1)
    draw.text((380, 362), "a. Session Token & สิทธิ์การเข้าใช้งาน", font=get_font(13, True), fill="#065F46")
    draw.text((380, 382), "b. ข้อมูล Dashboard & สถิติความครบถ้วน %", font=get_font(13, False), fill="#065F46")
    draw.text((380, 402), "c. URL ลิงก์สาธารณะแชร์ผลงาน (/r/[slug])", font=get_font(13, False), fill="#065F46")

    # Entity 2: Admin (Top Right)
    draw.rounded_rectangle([(1180, 160), (1520, 265)], radius=14, fill="#FAF5FF", outline="#7C3AED", width=3)
    draw.rectangle([(1180, 160), (1520, 195)], fill="#F3E8FF")
    draw.text((1205, 168), "[ External Entity 2 ]", font=get_font(13, True), fill="#6B21A8")
    draw.text((1205, 205), "Admin (ผู้ดูแลระบบ)", font=get_font(24, True), fill="#581C87")
    draw.text((1205, 235), "ฝ่ายทะเบียน / อาจารย์ผู้ดูแลระบบ", font=get_font(14, False), fill="#9333EA")

    # Admin Inputs (Inflow to 0.0)
    draw_arrow(draw, (1180, 200), (930, 420), fill="#7C3AED", width=2)
    draw.rounded_rectangle([(890, 230), (1170, 315)], radius=8, fill="#FFFFFF", outline="#E9D5FF", width=1)
    draw.text((900, 237), "1. ข้อมูลเข้าสู่ระบบผู้ดูแลระบบ", font=get_font(13, True), fill="#6B21A8")
    draw.text((900, 257), "2. ข้อมูลนักศึกษา (เพิ่ม / แก้ไข / ลบ)", font=get_font(13, False), fill="#6B21A8")
    draw.text((900, 277), "3. คำสั่งสลับ Active/Inactive, รีเซ็ตรหัส", font=get_font(13, False), fill="#6B21A8")
    draw.text((900, 297), "4. คำค้นหา & ตัวกรองรายชื่อนักศึกษา", font=get_font(13, False), fill="#6B21A8")

    # Admin Outputs (Outflow from 0.0)
    draw_arrow(draw, (950, 470), (1200, 265), fill="#059669", width=2)
    draw.rounded_rectangle([(940, 355), (1240, 425)], radius=8, fill="#FFFFFF", outline="#A7F3D0", width=1)
    draw.text((950, 362), "a. สถิติภาพรวมระบบ (จำนวนนักศึกษา, ผลงาน)", font=get_font(13, True), fill="#065F46")
    draw.text((950, 382), "b. รายชื่อและสถานะบัญชีนักศึกษาทั้งหมด", font=get_font(13, False), fill="#065F46")
    draw.text((950, 402), "c. ตัวอย่างผลงาน Portfolio (Draft & Published)", font=get_font(13, False), fill="#065F46")

    # Entity 3: Public Visitor (Bottom Center)
    draw.rounded_rectangle([(600, 810), (1000, 925)], radius=14, fill="#ECFDF5", outline="#059669", width=3)
    draw.rectangle([(600, 810), (1000, 845)], fill="#D1FAE5")
    draw.text((625, 818), "[ External Entity 3 ]", font=get_font(13, True), fill="#047857")
    draw.text((625, 855), "Public Visitor / Employer", font=get_font(23, True), fill="#064E3B")
    draw.text((625, 888), "บุคคลภายนอก นายจ้าง อาจารย์ หรือผู้ประเมินผลงาน", font=get_font(14, False), fill="#059669")

    # Visitor Flows
    # Inflow (URL request)
    draw_arrow(draw, (730, 810), (730, 685), fill="#059669", width=2)
    draw.rounded_rectangle([(470, 730), (715, 780)], radius=6, fill="#FFFFFF", outline="#A7F3D0", width=1)
    draw.text((480, 742), "1. คำขอเปิดชมผลงาน (/r/[slug]) ->", font=get_font(13, True), fill="#065F46")

    # Outflow (Rendered Portfolio)
    draw_arrow(draw, (870, 685), (870, 810), fill="#2563EB", width=2)
    draw.rounded_rectangle([(885, 730), (1130, 780)], radius=6, fill="#FFFFFF", outline="#BFDBFE", width=1)
    draw.text((895, 742), "-> a. หน้าเว็บ Portfolio และ Resume", font=get_font(13, True), fill="#1E40AF")

    img.save(DIR / "context-diagram.png", "PNG", dpi=(150, 150))
    print("Saved context-diagram.png")

# ==============================================================================
# 3. SITEMAP & NAVIGATION ARCHITECTURE
# ==============================================================================
def generate_sitemap():
    W, H = 1800, 950
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Sitemap & Navigation Hierarchy - PFS Web Application", 
                "Three-Tier Role-Based Navigation Architecture: Public, Student, and Admin Zones", W,
                "SYSTEM ANALYSIS: INFORMATION ARCHITECTURE")

    # Root Box
    draw_pill(draw, (700, 140, 1100, 200), "PFS Root (/) : Landing & Role Auto-Redirect", bg="#0F172A", border="#334155", text_color="#F8FAFC", font_size=17, radius=12)

    # Trunk Lines
    draw.line([(900, 200), (900, 240)], fill="#64748B", width=3)
    draw.line([(300, 240), (1500, 240)], fill="#64748B", width=3)
    draw_arrow(draw, (300, 240), (300, 280), fill="#059669", width=2)
    draw_arrow(draw, (900, 240), (900, 280), fill="#2563EB", width=2)
    draw_arrow(draw, (1500, 240), (1500, 280), fill="#7C3AED", width=2)

    # 3 Zone Pillars
    draw_pill(draw, (140, 280, 460, 340), "Public Zone (บุคคลทั่วไป)", bg="#ECFDF5", border="#059669", text_color="#064E3B", font_size=18, radius=12)
    draw_pill(draw, (730, 280, 1070, 340), "Student Zone (นักศึกษา)", bg="#EFF6FF", border="#2563EB", text_color="#1E3A8A", font_size=18, radius=12)
    draw_pill(draw, (1320, 280, 1680, 340), "Admin Zone (ผู้ดูแลระบบ)", bg="#FAF5FF", border="#7C3AED", text_color="#581C87", font_size=18, radius=12)

    # Public Pages
    pub_pages = [
        ("/login", "หน้าเข้าสู่ระบบ (Student / Admin)", 390),
        ("/dashboard", "ทำเนียบ Portfolio สาธารณะที่เผยแพร่แล้ว", 465),
        ("/r/[slug]", "หน้านำเสนอ Portfolio ฉบับสมบูรณ์", 540),
        ("/p/[slug]", "Rewrite Alias เพื่อความสะดวกลิงก์ย่อ", 615),
    ]
    draw.line([(300, 340), (300, 635)], fill="#A7F3D0", width=2)
    for path, desc, y in pub_pages:
        draw_arrow(draw, (300, y + 22), (330, y + 22), fill="#059669", width=2)
        draw.rounded_rectangle([(330, y), (560, y + 45)], radius=8, fill="#FFFFFF", outline="#CBD5E1", width=1)
        draw.text((345, y + 5), path, font=get_font(15, True), fill="#0F172A")
        draw.text((345, y + 25), desc, font=get_font(11, False), fill="#64748B")

    # Student Pages
    draw_arrow(draw, (900, 340), (900, 390), fill="#2563EB", width=2)
    draw.rounded_rectangle([(740, 390), (1060, 450)], radius=10, fill="#DBEAFE", outline="#3B82F6", width=2)
    draw.text((760, 400), "/student (Student Dashboard)", font=get_font(16, True), fill="#1E3A8A")
    draw.text((760, 425), "หน้าแดชบอร์ดหลักสำหรับนักศึกษา", font=get_font(12, False), fill="#2563EB")

    # Student Sub-features
    stu_features = [
        ("ข้อมูลส่วนตัว & เปลี่ยนรหัสผ่าน", 480),
        ("สถิติความสมบูรณ์ผลงาน (%)", 530),
        ("สร้าง & คัดลอกลิงก์แชร์ /r/[slug]", 580),
    ]
    draw.line([(900, 450), (900, 600)], fill="#BFDBFE", width=2)
    for desc, y in stu_features:
        draw_arrow(draw, (900, y + 17), (930, y + 17), fill="#3B82F6", width=2)
        draw.rounded_rectangle([(930, y), (1160, y + 35)], radius=6, fill="#FFFFFF", outline="#E2E8F0", width=1)
        draw.text((940, y + 8), desc, font=get_font(12, True), fill="#334155")

    # Student Editor
    draw_arrow(draw, (900, 600), (900, 650), fill="#2563EB", width=2)
    draw.rounded_rectangle([(720, 650), (1080, 715)], radius=10, fill="#2563EB", outline="#1D4ED8", width=2)
    draw.text((745, 662), "/student/editor (Studio Grid Canvas)", font=get_font(16, True), fill="#FFFFFF")
    draw.text((745, 688), "เครื่องมือออกแบบ Interactive 12 คอลัมน์", font=get_font(12, False), fill="#DBEAFE")

    editor_features = [
        ("• 12-Column Responsive Grid Canvas", 735),
        ("• 6 Preset Templates (Professional, Modern, Minimal, ฯลฯ)", 770),
        ("• Assets Library & Property Inspector (ปรับสี, ฟอนต์, ขนาด)", 805),
        ("• ปุ่ม Save Draft, Publish สู่สาธารณะ และ Unpublish", 840),
    ]
    for desc, y in editor_features:
        draw.rounded_rectangle([(740, y), (1060, y + 28)], radius=6, fill="#EFF6FF", outline="#BFDBFE", width=1)
        draw.text((750, y + 5), desc, font=get_font(11, True), fill="#1E40AF")

    # Admin Pages
    draw_arrow(draw, (1500, 340), (1500, 390), fill="#7C3AED", width=2)
    draw.rounded_rectangle([(1340, 390), (1660, 450)], radius=10, fill="#F3E8FF", outline="#9333EA", width=2)
    draw.text((1360, 400), "/admin (Admin Dashboard)", font=get_font(16, True), fill="#581C87")
    draw.text((1360, 425), "ศูนย์ควบคุมระบบสำหรับผู้ดูแล", font=get_font(12, False), fill="#7C3AED")

    admin_features = [
        ("• ดูสรุปสถิติผู้ใช้งาน & สถานะ Portfolio รวม", 480),
        ("• ค้นหาและกรองนักศึกษา (ชื่อ, รหัส, สถานะ)", 530),
        ("• เพิ่มบัญชีนักศึกษาใหม่ (Add Student)", 580),
        ("• แก้ไขข้อมูลนักศึกษา (Edit Student Info)", 630),
        ("• สลับสถานะบัญชี Active <-> Inactive", 680),
        ("• รีเซ็ตรหัสผ่านนักศึกษา (Reset Password)", 730),
        ("• ลบบัญชีนักศึกษาและ Portfolio ที่เกี่ยวข้อง", 780),
        ("/admin/preview/[userId] : ตรวจแบบร่าง Portfolio", 835),
    ]
    draw.line([(1500, 450), (1500, 850)], fill="#E9D5FF", width=2)
    for desc, y in admin_features:
        is_preview = desc.startswith("/")
        bg = "#F5F3FF" if is_preview else "#FFFFFF"
        border = "#C084FC" if is_preview else "#E2E8F0"
        tc = "#581C87" if is_preview else "#334155"
        draw_arrow(draw, (1500, y + 17), (1530, y + 17), fill="#9333EA", width=2)
        draw.rounded_rectangle([(1530, y), (1770, y + 36)], radius=6, fill=bg, outline=border, width=1)
        draw.text((1540, y + 8), desc, font=get_font(12, True), fill=tc)

    img.save(DIR / "sitemap-diagram.png", "PNG", dpi=(150, 150))
    print("Saved sitemap-diagram.png")

# ==============================================================================
# 4. WORKFLOWS
# ==============================================================================
def generate_workflows():
    # --------------------------------------------------------------------------
    # Flow 1: Login & Role Authentication
    # --------------------------------------------------------------------------
    W, H = 1350, 880
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Workflow: Login & Role Authentication Flow", 
                "กระบวนการเข้าสู่ระบบ การยืนยันตัวตนด้วย scrypt และการแยกสิทธิ์ตามบทบาท", W,
                "WORK PROCESS SPECIFICATION: AUTHENTICATION")

    steps = [
        ("เริ่ม: ผู้ใช้งานเข้าหน้า /login", 600, 140, "#0F172A", "#FFFFFF", 16),
        ("กรอก รหัสนักศึกษา/อีเมล และ รหัสผ่าน", 600, 220, "#EFF6FF", "#1E3A8A", 15),
        ("ส่งคำขอ POST /api/auth/login เพื่อตรวจสอบใน MongoDB", 600, 300, "#FEF3C7", "#78350F", 15),
    ]
    for title, x, y, bg, tc, sz in steps:
        draw_pill(draw, (x - 240, y, x + 240, y + 50), title, bg=bg, border="#CBD5E1", text_color=tc, font_size=sz, radius=10)
        draw_arrow(draw, (x, y + 50), (x, y + 80), fill="#64748B", width=2)

    # Decision 1: Password match?
    draw_pill(draw, (440, 380, 760, 435), "รหัสผ่านถูกต้องตาม scrypt verify?", bg="#FEF08A", border="#EAB308", text_color="#713F12", font_size=15, radius=10)
    # No -> Error
    draw_arrow(draw, (440, 407), (250, 407), fill="#EF4444", width=2)
    draw_arrow(draw, (250, 407), (250, 465), fill="#EF4444", width=2)
    draw.text((320, 387), "ไม่ใช่ (No)", font=get_font(13, True), fill="#DC2626")
    draw_pill(draw, (110, 465, 390, 520), "แจ้งเตือน: รหัสผ่านไม่ถูกต้อง (HTTP 401)", bg="#FEE2E2", border="#EF4444", text_color="#991B1B", font_size=14, radius=8)

    # Yes -> Check status
    draw_arrow(draw, (600, 435), (600, 495), fill="#10B981", width=2)
    draw.text((615, 455), "ใช่ (Yes)", font=get_font(13, True), fill="#059669")
    draw_pill(draw, (440, 495, 760, 550), "สถานะบัญชีเป็น Active หรือไม่?", bg="#FEF08A", border="#EAB308", text_color="#713F12", font_size=15, radius=10)

    # No -> Inactive
    draw_arrow(draw, (760, 522), (950, 522), fill="#EF4444", width=2)
    draw_arrow(draw, (950, 522), (950, 575), fill="#EF4444", width=2)
    draw.text((830, 502), "ไม่ใช่ (No)", font=get_font(13, True), fill="#DC2626")
    draw_pill(draw, (810, 575, 1100, 630), "แจ้งเตือน: บัญชีถูกระงับ (HTTP 403)", bg="#FEE2E2", border="#EF4444", text_color="#991B1B", font_size=14, radius=8)

    # Yes -> Create Token & Route
    draw_arrow(draw, (600, 550), (600, 615), fill="#10B981", width=2)
    draw.text((615, 575), "ใช่ (Yes)", font=get_font(13, True), fill="#059669")
    draw_pill(draw, (380, 615, 820, 670), "สร้าง Cookie Session Token (HMAC-SHA256 ลงนามความปลอดภัย)", bg="#D1FAE5", border="#10B981", text_color="#065F46", font_size=14, radius=10)

    # Decision 3: Role Routing
    draw_arrow(draw, (500, 670), (400, 740), fill="#2563EB", width=2)
    draw.text((370, 700), "Role: Student", font=get_font(13, True), fill="#1E40AF")
    draw_pill(draw, (220, 740, 580, 800), "นำทางไปยัง /student (Student Dashboard)", bg="#DBEAFE", border="#2563EB", text_color="#1E3A8A", font_size=15, radius=10)

    draw_arrow(draw, (700, 670), (800, 740), fill="#7C3AED", width=2)
    draw.text((790, 700), "Role: Admin", font=get_font(13, True), fill="#6B21A8")
    draw_pill(draw, (650, 740, 990, 800), "นำทางไปยัง /admin (Admin Dashboard)", bg="#F3E8FF", border="#7C3AED", text_color="#581C87", font_size=15, radius=10)

    img.save(DIR / "workflow-login-auth.png", "PNG", dpi=(150, 150))
    print("Saved workflow-login-auth.png")

    # --------------------------------------------------------------------------
    # Flow 2: Portfolio Builder Workflow
    # --------------------------------------------------------------------------
    W, H = 1450, 920
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Workflow: Student Portfolio Builder & Publishing", 
                "กระบวนการออกแบบบน 12-Column Grid Canvas จนถึงการบันทึกและเผยแพร่ผลงาน", W,
                "WORK PROCESS SPECIFICATION: PORTFOLIO BUILDER")

    builder_steps = [
        ("1. นักศึกษาเปิดหน้าจอ Studio Grid Canvas (/student/editor)", 120, 150),
        ("2. โหลดข้อมูลแบบร่างเดิม หรือสร้างตั้งต้นตามเทมเพลตที่เลือก", 120, 240),
        ("3. เลือกจัดวางบล็อกเนื้อหา (Profile, Skills, Projects, Experience)", 120, 330),
        ("4. คลิกเลือกการ์ดบน 12-Col Grid เพื่อปรับขนาด ตำแหน่ง และสีสัน", 120, 420),
        ("5. นักศึกษาเลือกกระทำกับผลงาน (Action Decisions)", 120, 510),
    ]
    for t, x, y in builder_steps:
        draw_pill(draw, (x, y, x + 440, y + 55), t, bg="#EFF6FF", border="#3B82F6", text_color="#1E3A8A", font_size=14, radius=10)
        if y < 510:
            draw_arrow(draw, (x + 220, y + 55), (x + 220, y + 95), fill="#93C5FD", width=2)

    # 3 Paths from Step 5
    draw.line([(560, 537), (700, 537)], fill="#64748B", width=2)
    draw.line([(700, 340), (700, 740)], fill="#64748B", width=2)

    # Path A: Save Draft
    draw_arrow(draw, (700, 340), (760, 340), fill="#F59E0B", width=2)
    draw_pill(draw, (760, 310, 1340, 375), "กด 'บันทึกฉบับร่าง' : ส่ง PUT /api/portfolio/me (สถานะ Draft)", bg="#FEF3C7", border="#F59E0B", text_color="#78350F", font_size=14, radius=10)
    draw.text((780, 385), "• ข้อมูลตำแหน่ง Grid และเนื้อหาถูกบันทึกลง MongoDB โดยยังไม่เปิดเป็นสาธารณะ", font=get_font(13, False), fill="#92400E")

    # Path B: Publish
    draw_arrow(draw, (700, 537), (760, 537), fill="#10B981", width=2)
    draw_pill(draw, (760, 505, 1340, 570), "กด 'Publish เผยแพร่' : ส่ง POST /api/portfolio/me/publish (สถานะ Published)", bg="#D1FAE5", border="#10B981", text_color="#065F46", font_size=14, radius=10)
    draw_arrow(draw, (1050, 570), (1050, 615), fill="#10B981", width=2)
    draw_pill(draw, (790, 615, 1310, 675), "สร้าง URL สาธารณะ (/r/[slug]) พร้อมเปิดให้บุคคลภายนอกและนายจ้างเข้าชมได้ทันที", bg="#ECFDF5", border="#059669", text_color="#064E3B", font_size=14, radius=10)

    # Path C: Unpublish
    draw_arrow(draw, (700, 740), (760, 740), fill="#64748B", width=2)
    draw_pill(draw, (760, 710, 1340, 775), "กด 'ปิดการเผยแพร่' : ส่ง POST /api/portfolio/me/unpublish (สถานะกลับเป็น Draft)", bg="#F1F5F9", border="#94A3B8", text_color="#334155", font_size=14, radius=10)
    draw.text((780, 785), "• บุคคลภายนอกจะไม่สามารถเข้าชมหน้านี้ได้จนกว่านักศึกษาจะสั่งเผยแพร่อีกครั้ง", font=get_font(13, False), fill="#64748B")

    img.save(DIR / "workflow-portfolio-builder.png", "PNG", dpi=(150, 150))
    print("Saved workflow-portfolio-builder.png")

    # --------------------------------------------------------------------------
    # Flow 3: Admin Management Workflow
    # --------------------------------------------------------------------------
    W, H = 1450, 920
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Workflow: Admin Student & Account Management", 
                "กระบวนการจัดการบัญชีนักศึกษา การควบคุมสิทธิ์ และการตรวจสอบผลงาน Portfolio", W,
                "WORK PROCESS SPECIFICATION: ADMIN MANAGEMENT")

    draw_pill(draw, (480, 140, 960, 195), "Admin เข้าสู่ระบบและเปิดหน้า /admin (ดึงข้อมูลนักศึกษาและสถานะ)", bg="#FAF5FF", border="#7C3AED", text_color="#581C87", font_size=15, radius=10)
    draw_arrow(draw, (720, 195), (720, 245), fill="#A855F7", width=2)
    draw_pill(draw, (500, 245, 940, 300), "ตารางรายชื่อนักศึกษา (ระบบค้นหา, ตัวกรองสาขา/ชั้นปี และสรุปสถิติ)", bg="#F3E8FF", border="#9333EA", text_color="#6B21A8", font_size=14, radius=8)

    admin_actions = [
        ("1. เพิ่มนักศึกษาใหม่ (Add Student)", "กรอกข้อมูล -> ตรวจสอบรหัส/อีเมลไม่ซ้ำ -> แฮชรหัสผ่าน -> บันทึก users (status=active)", 370),
        ("2. แก้ไขข้อมูลนักศึกษา (Edit Student)", "เปิดฟอร์มแก้ไขชื่อ นามสกุล สาขาวิชา ชั้นปี -> ส่ง PUT อัปเดตข้อมูลในฐานข้อมูล", 455),
        ("3. สลับสถานะบัญชี (Toggle Active/Inactive)", "คลิกปุ่มสลับสถานะ -> หากเป็น Inactive นักศึกษาจะไม่สามารถล็อกอินเข้าสู่ระบบได้", 540),
        ("4. รีเซ็ตรหัสผ่าน (Reset Password)", "ตั้งรหัสผ่านใหม่ให้นักศึกษา -> แฮชด้วย scrypt ทันทีเพื่อความปลอดภัยสูงสุด", 625),
        ("5. ลบบัญชีนักศึกษา (Delete Student)", "ยืนยันการลบข้อมูลถาวร -> ลบข้อมูลในคอลเลกชัน users และ portfolios ที่เชื่อมโยง", 710),
        ("6. ตรวจสอบผลงาน (Review Portfolio)", "คลิกตรวจงาน -> เข้าดูหน้าเผยแพร่จริง หรือเปิดดูแบบร่างผ่าน /admin/preview/[userId]", 795),
    ]
    draw.line([(720, 300), (720, 820)], fill="#CBD5E1", width=2)
    for title, desc, y in admin_actions:
        draw_arrow(draw, (720, y + 25), (770, y + 25), fill="#9333EA", width=2)
        draw.rounded_rectangle([(770, y), (1380, y + 55)], radius=8, fill="#FFFFFF", outline="#E2E8F0", width=1)
        draw.text((790, y + 6), title, font=get_font(14, True), fill="#581C87")
        draw.text((790, y + 28), desc, font=get_font(12, False), fill="#64748B")

    img.save(DIR / "workflow-admin-management.png", "PNG", dpi=(150, 150))
    print("Saved workflow-admin-management.png")

if __name__ == "__main__":
    generate_use_case_diagram()
    generate_context_diagram()
    generate_sitemap()
    generate_workflows()
    print("All diagrams generated successfully!")
