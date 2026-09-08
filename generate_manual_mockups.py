import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path("deliverables/manual-assets")
OUT_DIR.mkdir(parents=True, exist_ok=True)

SUKHUMVIT = "/System/Library/Fonts/Supplemental/SukhumvitSet.ttc"
THONBURI = "/System/Library/Fonts/Supplemental/Thonburi.ttc"

def get_font(size, bold=False):
    try:
        idx = 5 if bold else 2
        return ImageFont.truetype(SUKHUMVIT, size, index=idx)
    except Exception:
        try:
            return ImageFont.truetype(THONBURI, size)
        except Exception:
            return ImageFont.load_default()

def draw_header_banner(draw, title, subtitle, w, tag="USER MANUAL VISUAL GUIDE"):
    draw.rectangle([(0, 0), (w, 95)], fill="#0F172A")
    draw.rectangle([(0, 91), (w, 95)], fill="#3B82F6")
    
    draw.rounded_rectangle([(40, 14), (360, 36)], radius=6, fill="#1E293B", outline="#334155", width=1)
    draw.text((50, 16), tag, font=get_font(12, True), fill="#60A5FA")
    
    draw.text((40, 42), title, font=get_font(24, True), fill="#FFFFFF")
    draw.text((40, 68), subtitle, font=get_font(14, False), fill="#94A3B8")

def draw_badge(draw, x, y, num_str, color="#2563EB", outline="#FFFFFF"):
    r = 15
    # Outer pulse ring
    draw.ellipse([(x - r - 3, y - r - 3), (x + r + 3, y + r + 3)], fill=None, outline=color, width=2)
    # Inner solid circle
    draw.ellipse([(x - r, y - r), (x + r, y + r)], fill=color, outline=outline, width=2)
    f_num = get_font(14, True)
    bb = draw.textbbox((0, 0), num_str, font=f_num)
    draw.text((x - (bb[2]-bb[0])/2, y - (bb[3]-bb[1])/2 - 1), num_str, font=f_num, fill="#FFFFFF")

def draw_footer_legend(draw, items, w, h=1100):
    # items = [ (num, title, desc, color, bg, border), ... ]
    y1 = 945
    y2 = h - 25
    total = len(items)
    pad = 30
    gap = 15
    card_w = (w - pad * 2 - (total - 1) * gap) // total
    
    f_num = get_font(13, True)
    f_title = get_font(14, True)
    f_desc = get_font(12, False)

    for i, (num_str, title, desc, color, bg, border) in enumerate(items):
        cx1 = pad + i * (card_w + gap)
        cx2 = cx1 + card_w
        draw.rounded_rectangle([(cx1, y1), (cx2, y2)], radius=10, fill=bg, outline=border, width=2)
        
        # Badge
        bx = cx1 + 22
        by = y1 + 25
        draw.ellipse([(bx - 12, by - 12), (bx + 12, by + 12)], fill=color)
        bb = draw.textbbox((0, 0), num_str, font=f_num)
        draw.text((bx - (bb[2]-bb[0])/2, by - (bb[3]-bb[1])/2 - 1), num_str, font=f_num, fill="#FFFFFF")
        
        # Title
        draw.text((cx1 + 42, y1 + 15), title, font=f_title, fill="#0F172A")
        # Desc
        draw.text((cx1 + 15, y1 + 48), desc, font=f_desc, fill="#475569")

# ------------------------------------------------------------------------------
# 1. Login Screen Mockup
# ------------------------------------------------------------------------------
def create_login_mockup():
    W, H = 1600, 1080
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header_banner(draw, "1. หน้าจอการเข้าสู่ระบบ (Login Screen)", "วิธีเข้าใช้งาน: กรอกรหัสนักศึกษา/อีเมล และรหัสผ่านเพื่อเข้าสู่ระบบ", W)

    bx1, by1, bx2, by2 = 340, 115, 1260, 915
    draw.rounded_rectangle([(bx1, by1), (bx2, by2)], radius=16, fill="#FFFFFF", outline="#CBD5E1", width=2)
    # Browser bar
    draw.rounded_rectangle([(bx1, by1), (bx2, by1 + 42)], radius=16, fill="#F1F5F9")
    draw.rectangle([(bx1, by1 + 22), (bx2, by1 + 42)], fill="#F1F5F9")
    draw.line([(bx1, by1 + 42), (bx2, by1 + 42)], fill="#CBD5E1", width=1)
    draw.ellipse([(bx1 + 16, by1 + 15), (bx1 + 26, by1 + 25)], fill="#EF4444")
    draw.ellipse([(bx1 + 34, by1 + 15), (bx1 + 44, by1 + 25)], fill="#F59E0B")
    draw.ellipse([(bx1 + 52, by1 + 15), (bx1 + 62, by1 + 25)], fill="#10B981")
    draw.rounded_rectangle([(bx1 + 90, by1 + 9), (bx2 - 30, by1 + 33)], radius=6, fill="#FFFFFF", outline="#E2E8F0", width=1)
    draw.text((bx1 + 110, by1 + 13), "https://portfolio.pfs.local/login", font=get_font(13), fill="#64748B")

    # Login Box
    lx1, ly1, lx2, ly2 = 500, 200, 1100, 850
    draw.rounded_rectangle([(lx1, ly1), (lx2, ly2)], radius=14, fill="#FFFFFF", outline="#E2E8F0", width=2)
    
    # Logo
    draw.rounded_rectangle([(760, 240), (840, 320)], radius=16, fill="#2563EB")
    draw.text((782, 258), "PFS", font=get_font(24, True), fill="#FFFFFF")
    
    draw.text((700, 340), "เข้าสู่ระบบ Portfolio", font=get_font(24, True), fill="#0F172A")
    draw.text((630, 375), "ระบบแฟ้มสะสมผลงานออนไลน์ สาขาวิศวกรรมคอมพิวเตอร์", font=get_font(14), fill="#64748B")

    # Field 1
    draw.text((560, 425), "รหัสนักศึกษา หรือ อีเมล (Email / Student ID)", font=get_font(14, True), fill="#334155")
    draw.rounded_rectangle([(560, 455), (1040, 510)], radius=8, fill="#F8FAFC", outline="#CBD5E1", width=1)
    draw.text((580, 472), "65010001 หรือ student@pfs.local", font=get_font(15), fill="#94A3B8")
    draw_badge(draw, 1065, 482, "1", color="#2563EB")

    # Field 2
    draw.text((560, 535), "รหัสผ่าน (Password)", font=get_font(14, True), fill="#334155")
    draw.rounded_rectangle([(560, 565), (1040, 620)], radius=8, fill="#F8FAFC", outline="#CBD5E1", width=1)
    draw.text((580, 582), "••••••••••••", font=get_font(16), fill="#94A3B8")
    draw_badge(draw, 1065, 592, "2", color="#2563EB")

    # Button
    draw.rounded_rectangle([(560, 655), (1040, 715)], radius=8, fill="#2563EB")
    draw.text((740, 672), "เข้าสู่ระบบ (Sign In)", font=get_font(17, True), fill="#FFFFFF")
    draw_badge(draw, 1065, 685, "3", color="#10B981")

    # Hint box
    draw.rounded_rectangle([(560, 745), (1040, 810)], radius=8, fill="#EFF6FF", outline="#BFDBFE", width=1)
    draw.text((580, 757), "คำแนะนำ: นักศึกษาใช้รหัสนักศึกษาในการเข้าสู่ระบบครั้งแรก", font=get_font(13, True), fill="#1E40AF")
    draw.text((580, 778), "อาจารย์และผู้ดูแลระบบใช้อีเมลประจำตำแหน่ง (admin@pfs.local)", font=get_font(12, False), fill="#3B82F6")
    draw_badge(draw, 1065, 777, "4", color="#7C3AED")

    legend = [
        ("1", "ช่องระบุตัวตน", "พิมพ์รหัสนักศึกษา 8 หลัก หรืออีเมลที่ลงทะเบียน", "#2563EB", "#EFF6FF", "#BFDBFE"),
        ("2", "ช่องรหัสผ่าน", "กรอกรหัสผ่าน (เริ่มต้นมักเป็นรหัสนักศึกษา)", "#2563EB", "#EFF6FF", "#BFDBFE"),
        ("3", "ปุ่มเข้าสู่ระบบ", "คลิกเพื่อยืนยัน ระบบจะจำแนกสิทธิ์อัตโนมัติ", "#10B981", "#ECFDF5", "#A7F3D0"),
        ("4", "การแยกหน้าอัตโนมัติ", "นักศึกษาจะไปที่ /student ส่วนอาจารย์ไป /admin", "#7C3AED", "#FAF5FF", "#E9D5FF"),
    ]
    draw_footer_legend(draw, legend, W, H)

    img.save(OUT_DIR / "01-login-screen.png", "PNG", dpi=(150, 150))
    print("Saved 01-login-screen.png")

# ------------------------------------------------------------------------------
# 2. Student Dashboard Mockup
# ------------------------------------------------------------------------------
def create_student_dashboard_mockup():
    W, H = 1600, 1080
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header_banner(draw, "2. หน้าแดชบอร์ดนักศึกษา (Student Dashboard)", "ศูนย์กลางสำหรับตรวจสอบสถานะผลงาน ลิงก์แชร์ และแก้ไขข้อมูลส่วนตัว", W)

    bx1, by1, bx2, by2 = 120, 115, 1480, 915
    draw.rounded_rectangle([(bx1, by1), (bx2, by2)], radius=16, fill="#FFFFFF", outline="#E2E8F0", width=2)
    
    # Top bar
    draw.rectangle([(bx1, by1), (bx2, by1 + 65)], fill="#FFFFFF")
    draw.line([(bx1, by1 + 65), (bx2, by1 + 65)], fill="#E2E8F0", width=2)
    draw.text((bx1 + 30, by1 + 20), "PFS Student Hub", font=get_font(20, True), fill="#1E293B")
    
    # User Profile Pill
    draw.rounded_rectangle([(bx2 - 320, by1 + 15), (bx2 - 30, by1 + 50)], radius=20, fill="#F1F5F9")
    draw.ellipse([(bx2 - 315, by1 + 17), (bx2 - 287, by1 + 45)], fill="#3B82F6")
    draw.text((bx2 - 275, by1 + 22), "สมชาย สายคอม (65010001)", font=get_font(13, True), fill="#334155")

    # Welcome Banner
    draw.rounded_rectangle([(bx1 + 30, by1 + 85), (bx2 - 30, by1 + 215)], radius=14, fill="#1E293B")
    draw.text((bx1 + 50, by1 + 110), "ยินดีต้อนรับ, สมชาย", font=get_font(26, True), fill="#FFFFFF")
    draw.text((bx1 + 50, by1 + 148), "Resume: Somchai Portfolio · อัปเดตล่าสุด 8 ก.ย. 2026", font=get_font(14), fill="#94A3B8")
    
    # Edit Button
    draw.rounded_rectangle([(bx2 - 330, by1 + 115), (bx2 - 50, by1 + 175)], radius=10, fill="#2563EB")
    draw.text((bx2 - 305, by1 + 132), "เข้าสู่สตูดิโอออกแบบ (Edit Canvas)", font=get_font(14, True), fill="#FFFFFF")
    draw_badge(draw, bx2 - 40, by1 + 115, "1", color="#2563EB")

    # Stats Row
    cards = [
        ("สถานะปัจจุบัน", "เผยแพร่แล้ว (Published)", "#10B981", "#ECFDF5", "#064E3B"),
        ("ความสมบูรณ์เนื้อหา", "85% (ครบ 5 หมวด)", "#3B82F6", "#EFF6FF", "#1E3A8A"),
        ("จำนวนบล็อกในผลงาน", "7 บล็อกจัดวาง", "#8B5CF6", "#FAF5FF", "#581C87"),
        ("การเข้าชมสาธารณะ", "เปิดดูได้ทันที", "#F59E0B", "#FEF3C7", "#78350F"),
    ]
    cw = (bx2 - bx1 - 60 - 45) // 4
    for i, (title, val, border, bg, tc) in enumerate(cards):
        cx1 = bx1 + 30 + i * (cw + 15)
        cx2 = cx1 + cw
        draw.rounded_rectangle([(cx1, by1 + 235), (cx2, by1 + 340)], radius=12, fill=bg, outline=border, width=2)
        draw.text((cx1 + 18, by1 + 252), title, font=get_font(13, False), fill="#64748B")
        draw.text((cx1 + 18, by1 + 282), val, font=get_font(17, True), fill=tc)
    draw_badge(draw, bx1 + 30 + cw - 10, by1 + 235, "2", color="#10B981")

    # Share Box
    sx1, sy1, sx2, sy2 = bx1 + 30, by1 + 360, bx2 - 30, by1 + 480
    draw.rounded_rectangle([(sx1, sy1), (sx2, sy2)], radius=14, fill="#F8FAFC", outline="#CBD5E1", width=2)
    draw.text((sx1 + 25, sy1 + 18), "ลิงก์สำหรับแชร์ผลงานของคุณสู่สาธารณะ (Public URL)", font=get_font(17, True), fill="#0F172A")
    draw.text((sx1 + 25, sy1 + 46), "คัดลอกลิงก์นี้ส่งให้อาจารย์ตรวจผลงาน หรือแนบในอีเมลสมัครงานได้ทันที", font=get_font(13), fill="#64748B")
    
    draw.rounded_rectangle([(sx1 + 25, sy1 + 72), (sx2 - 190, sy1 + 112)], radius=8, fill="#FFFFFF", outline="#CBD5E1", width=1)
    draw.text((sx1 + 45, sy1 + 84), "https://portfolio.pfs.local/r/somchai-portfolio", font=get_font(15, True), fill="#2563EB")
    
    draw.rounded_rectangle([(sx2 - 170, sy1 + 72), (sx2 - 25, sy1 + 112)], radius=8, fill="#10B981")
    draw.text((sx2 - 148, sy1 + 84), "คัดลอกลิงก์ (Copy)", font=get_font(14, True), fill="#FFFFFF")
    draw_badge(draw, sx2 - 20, sy1 + 72, "3", color="#059669")

    # Profile & Password Management
    px1, py1, px2, py2 = bx1 + 30, by1 + 505, bx2 - 30, by1 + 775
    draw.rounded_rectangle([(px1, py1), (px2, py2)], radius=14, fill="#FFFFFF", outline="#E2E8F0", width=2)
    draw.text((px1 + 25, py1 + 20), "จัดการข้อมูลส่วนตัวและรหัสผ่าน (Account Settings)", font=get_font(17, True), fill="#0F172A")
    
    sub_w = (px2 - px1 - 60) // 2
    # Sub 1: Profile
    draw.rounded_rectangle([(px1 + 25, py1 + 55), (px1 + 25 + sub_w, py1 + 245)], radius=10, fill="#F8FAFC", outline="#E2E8F0", width=1)
    draw.text((px1 + 40, py1 + 70), "ข้อมูลประจำตัว", font=get_font(15, True), fill="#334155")
    draw.text((px1 + 40, py1 + 105), "ชื่อ-นามสกุล: สมชาย สายคอม | รหัสนักศึกษา: 65010001", font=get_font(13), fill="#475569")
    draw.text((px1 + 40, py1 + 135), "สาขาวิชา: วิศวกรรมคอมพิวเตอร์ (ปี 4)", font=get_font(13), fill="#475569")
    draw.text((px1 + 40, py1 + 165), "อีเมล: somchai@pfs.local", font=get_font(13), fill="#475569")
    draw.rounded_rectangle([(px1 + 40, py1 + 195), (px1 + 200, py1 + 232)], radius=6, fill="#2563EB")
    draw.text((px1 + 60, py1 + 205), "แก้ไขข้อมูลส่วนตัว", font=get_font(12, True), fill="#FFFFFF")

    # Sub 2: Security
    draw.rounded_rectangle([(px1 + 35 + sub_w, py1 + 55), (px2 - 25, py1 + 245)], radius=10, fill="#F8FAFC", outline="#E2E8F0", width=1)
    draw.text((px1 + 50 + sub_w, py1 + 70), "ความปลอดภัยของบัญชี", font=get_font(15, True), fill="#334155")
    draw.text((px1 + 50 + sub_w, py1 + 105), "เพื่อความปลอดภัย แนะนำให้เปลี่ยนรหัสผ่านเริ่มต้นทันที", font=get_font(13), fill="#64748B")
    draw.text((px1 + 50 + sub_w, py1 + 135), "ระบบเข้ารหัสด้วยอัลกอริทึม scrypt ปลอดภัยตามมาตรฐานสากล", font=get_font(13), fill="#64748B")
    draw.rounded_rectangle([(px1 + 50 + sub_w, py1 + 195), (px1 + 200 + sub_w, py1 + 232)], radius=6, fill="#475569")
    draw.text((px1 + 70 + sub_w, py1 + 205), "เปลี่ยนรหัสผ่าน", font=get_font(12, True), fill="#FFFFFF")
    draw_badge(draw, px2 - 20, py1 + 55, "4", color="#475569")

    legend = [
        ("1", "ปุ่มเข้าสู่สตูดิโอ", "คลิกเพื่อไปหน้าออกแบบและจัดเรียงเนื้อหา Portfolio", "#2563EB", "#EFF6FF", "#BFDBFE"),
        ("2", "การ์ดสรุปสถานะ", "แสดงว่าผลงานเป็น Draft หรือ Published และความครบถ้วน", "#10B981", "#ECFDF5", "#A7F3D0"),
        ("3", "กล่องคัดลอกลิงก์แชร์", "กด Copy ส่งให้อาจารย์ตรวจ หรือแนบสมัครงานได้ทันที", "#059669", "#ECFDF5", "#A7F3D0"),
        ("4", "จัดการข้อมูลและรหัส", "แก้ไขชื่อ อีเมล หรือตั้งรหัสผ่านใหม่ได้ด้วยตนเอง", "#475569", "#F1F5F9", "#CBD5E1"),
    ]
    draw_footer_legend(draw, legend, W, H)

    img.save(OUT_DIR / "02-student-dashboard.png", "PNG", dpi=(150, 150))
    print("Saved 02-student-dashboard.png")

# ------------------------------------------------------------------------------
# 3. Studio Editor Mockup
# ------------------------------------------------------------------------------
def create_studio_editor_mockup():
    W, H = 1600, 1080
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header_banner(draw, "3. สตูดิโอออกแบบ Portfolio (Studio Grid Canvas)", "โครงสร้าง 3 โซน: คลังบล็อก (ซ้าย), พื้นที่จัดวางการ์ด (กลาง), และแผงตั้งค่า (ขวา)", W)

    bx1, by1, bx2, by2 = 50, 115, 1550, 915
    draw.rounded_rectangle([(bx1, by1), (bx2, by2)], radius=14, fill="#FFFFFF", outline="#CBD5E1", width=2)
    
    # Top Bar
    draw.rectangle([(bx1, by1), (bx2, by1 + 60)], fill="#1E293B")
    draw.text((bx1 + 20, by1 + 18), "Studio Editor : Somchai Resume", font=get_font(17, True), fill="#FFFFFF")
    
    # Template dropdown
    draw.rounded_rectangle([(bx1 + 340, by1 + 12), (bx1 + 520, by1 + 48)], radius=6, fill="#334155")
    draw.text((bx1 + 355, by1 + 20), "เทมเพลต: Professional v", font=get_font(12, True), fill="#E2E8F0")

    # Action Buttons
    draw.rounded_rectangle([(bx2 - 370, by1 + 12), (bx2 - 255, by1 + 48)], radius=6, fill="#D97706")
    draw.text((bx2 - 355, by1 + 20), "บันทึกฉบับร่าง", font=get_font(12, True), fill="#FFFFFF")

    draw.rounded_rectangle([(bx2 - 240, by1 + 12), (bx2 - 130, by1 + 48)], radius=6, fill="#10B981")
    draw.text((bx2 - 225, by1 + 20), "เผยแพร่ (Publish)", font=get_font(12, True), fill="#FFFFFF")

    draw.rounded_rectangle([(bx2 - 115, by1 + 12), (bx2 - 25, by1 + 48)], radius=6, fill="#475569")
    draw.text((bx2 - 100, by1 + 20), "ดูหน้าจริง >", font=get_font(12, True), fill="#FFFFFF")
    draw_badge(draw, bx2 - 125, by1 + 12, "4", color="#10B981")

    # 3 Column Layout
    # Column 1: Asset Library
    ax1, ay1, ax2, ay2 = bx1, by1 + 60, bx1 + 280, by2
    draw.rectangle([(ax1, ay1), (ax2, ay2)], fill="#F8FAFC")
    draw.line([(ax2, ay1), (ax2, ay2)], fill="#E2E8F0", width=2)
    draw.text((ax1 + 15, ay1 + 15), "[ คลังบล็อกเนื้อหา ]", font=get_font(14, True), fill="#0F172A")
    draw.text((ax1 + 15, ay1 + 38), "คลิกเพื่อเพิ่มการ์ดลง Canvas", font=get_font(11), fill="#64748B")
    draw_badge(draw, ax2 - 20, ay1 + 20, "1", color="#2563EB")

    blocks = [
        ("ข้อมูลส่วนตัว (Profile)", "รูปภาพ, ชื่อ, ข้อมูลติดต่อ"),
        ("แนะนำตัว (About Me)", "ประวัติและเป้าหมายการทำงาน"),
        ("ทักษะความเชี่ยวชาญ (Skills)", "ภาษาและเครื่องมือที่ใช้"),
        ("ผลงานเด่น (Projects)", "ชิ้นงานเด่น ลิงก์ GitHub"),
        ("ประสบการณ์ (Experience)", "ฝึกงาน กิจกรรม การแข่งขัน"),
        ("ประกาศนียบัตร (Certificates)", "ใบรับรองและรางวัล"),
        ("ช่องทางติดต่อ (Contact)", "อีเมล เบอร์โทร โซเชียล"),
    ]
    for i, (b_title, b_sub) in enumerate(blocks):
        by_top = ay1 + 65 + i * 80
        draw.rounded_rectangle([(ax1 + 12, by_top), (ax2 - 12, by_top + 68)], radius=8, fill="#FFFFFF", outline="#CBD5E1", width=1)
        draw.text((ax1 + 20, by_top + 12), b_title, font=get_font(12, True), fill="#1E293B")
        draw.text((ax1 + 20, by_top + 36), b_sub, font=get_font(10), fill="#64748B")

    # Column 2: 12-Column Canvas
    cx1, cy1, cx2, cy2 = bx1 + 280, by1 + 60, bx2 - 340, by2
    draw.rectangle([(cx1, cy1), (cx2, cy2)], fill="#F1F5F9")
    
    px1, py1, px2, py2 = cx1 + 30, cy1 + 20, cx2 - 30, by2 - 20
    draw.rounded_rectangle([(px1, py1), (px2, py2)], radius=12, fill="#FFFFFF", outline="#CBD5E1", width=2)
    draw_badge(draw, px2 - 25, py1 + 25, "2", color="#3B82F6")

    # Canvas Cards
    # Card 1: Profile (12 col)
    draw.rounded_rectangle([(px1 + 15, py1 + 15), (px2 - 15, py1 + 140)], radius=10, fill="#F8FAFC", outline="#3B82F6", width=2)
    draw.ellipse([(px1 + 30, py1 + 35), (px1 + 115, py1 + 120)], fill="#DBEAFE", outline="#3B82F6", width=1)
    draw.text((px1 + 52, py1 + 68), "PHOTO", font=get_font(11, True), fill="#2563EB")
    draw.text((px1 + 135, py1 + 35), "นายสมชาย สายคอม (Somchai Saikom)", font=get_font(18, True), fill="#0F172A")
    draw.text((px1 + 135, py1 + 65), "Computer Engineering | King Mongkut's University", font=get_font(13), fill="#475569")
    draw.text((px1 + 135, py1 + 92), "Email: somchai@pfs.local · GitHub: github.com/somchai", font=get_font(12), fill="#64748B")

    # Card 2: About (6 col)
    half_w = (px2 - px1 - 40) // 2
    draw.rounded_rectangle([(px1 + 15, py1 + 155), (px1 + 15 + half_w, py1 + 315)], radius=10, fill="#FFFFFF", outline="#E2E8F0", width=1)
    draw.text((px1 + 25, py1 + 170), "แนะนำตัว (About Me)", font=get_font(14, True), fill="#1E293B")
    draw.text((px1 + 25, py1 + 202), "นักศึกษาชั้นปีที่ 4 มีความหลงใหลในด้าน", font=get_font(12), fill="#64748B")
    draw.text((px1 + 25, py1 + 227), "Web Development และ Cloud Architecture", font=get_font(12), fill="#64748B")
    draw.text((px1 + 25, py1 + 252), "มุ่งมั่นพัฒนาซอฟต์แวร์คุณภาพสูง", font=get_font(12), fill="#64748B")

    # Card 3: Skills (6 col)
    draw.rounded_rectangle([(px1 + 25 + half_w, py1 + 155), (px2 - 15, py1 + 315)], radius=10, fill="#FFFFFF", outline="#E2E8F0", width=1)
    draw.text((px1 + 35 + half_w, py1 + 170), "ทักษะ (Technical Skills)", font=get_font(14, True), fill="#1E293B")
    skills = ["Next.js", "TypeScript", "Node.js", "MongoDB", "Docker", "TailwindCSS"]
    for j, sk in enumerate(skills):
        sx = px1 + 35 + half_w + (j % 2) * 140
        sy = py1 + 205 + (j // 2) * 32
        draw.rounded_rectangle([(sx, sy), (sx + 125, sy + 26)], radius=6, fill="#EFF6FF", outline="#BFDBFE", width=1)
        draw.text((sx + 12, sy + 5), sk, font=get_font(11, True), fill="#1E40AF")

    # Card 4: Projects (12 col)
    draw.rounded_rectangle([(px1 + 15, py1 + 330), (px2 - 15, py1 + 500)], radius=10, fill="#FFFFFF", outline="#E2E8F0", width=1)
    draw.text((px1 + 25, py1 + 345), "ผลงานเด่น (Featured Projects)", font=get_font(14, True), fill="#1E293B")
    draw.text((px1 + 25, py1 + 375), "• Smart Attendance System - ระบบเช็กชื่อด้วย QR Code (Next.js, MongoDB)", font=get_font(12, True), fill="#334155")
    draw.text((px1 + 38, py1 + 400), "มีผู้ใช้งานจริงกว่า 300 คนในภาควิชา มีความเสถียรและรายงานผลเรียลไทม์", font=get_font(11), fill="#64748B")
    draw.text((px1 + 25, py1 + 430), "• Portfolio & Resume Builder - ระบบสร้างเว็บเรซูเม่แบบ Drag & Drop บน Grid", font=get_font(12, True), fill="#334155")
    draw.text((px1 + 38, py1 + 455), "ระบบที่ท่านกำลังใช้งานอยู่นี้ ออกแบบด้วย 12-Column Grid ยืดหยุ่นทุกอุปกรณ์", font=get_font(11), fill="#64748B")

    # Column 3: Property Inspector
    ix1, iy1, ix2, iy2 = bx2 - 340, by1 + 60, bx2, by2
    draw.rectangle([(ix1, iy1), (ix2, iy2)], fill="#F8FAFC")
    draw.line([(ix1, iy1), (ix1, iy2)], fill="#E2E8F0", width=2)
    draw.text((ix1 + 15, iy1 + 15), "[ แผงตั้งค่า (Inspector) ]", font=get_font(14, True), fill="#0F172A")
    draw.text((ix1 + 15, iy1 + 38), "ปรับแต่งการ์ดที่กำลังเลือกอยู่", font=get_font(11), fill="#64748B")
    draw_badge(draw, ix2 - 25, iy1 + 22, "3", color="#7C3AED")

    draw.text((ix1 + 15, iy1 + 75), "หัวข้อการ์ด (Section Title)", font=get_font(12, True), fill="#334155")
    draw.rounded_rectangle([(ix1 + 15, iy1 + 98), (ix2 - 15, iy1 + 135)], radius=6, fill="#FFFFFF", outline="#CBD5E1", width=1)
    draw.text((ix1 + 25, iy1 + 108), "Profile", font=get_font(12), fill="#0F172A")

    draw.text((ix1 + 15, iy1 + 155), "ขนาดบนตาราง (Col Span)", font=get_font(12, True), fill="#334155")
    draw.rounded_rectangle([(ix1 + 15, iy1 + 178), (ix2 - 15, iy1 + 215)], radius=6, fill="#FFFFFF", outline="#CBD5E1", width=1)
    draw.text((ix1 + 25, iy1 + 188), "เต็มความกว้าง (12 คอลัมน์)", font=get_font(12), fill="#2563EB")

    draw.text((ix1 + 15, iy1 + 235), "ฟอนต์ตัวอักษร (Font Family)", font=get_font(12, True), fill="#334155")
    draw.rounded_rectangle([(ix1 + 15, iy1 + 258), (ix2 - 15, iy1 + 295)], radius=6, fill="#FFFFFF", outline="#CBD5E1", width=1)
    draw.text((ix1 + 25, iy1 + 268), "Prompt (Modern Thai)", font=get_font(12), fill="#0F172A")

    draw.text((ix1 + 15, iy1 + 315), "โทนสีหลัก (Primary Color)", font=get_font(12, True), fill="#334155")
    palette = ["#2563EB", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0F172A"]
    for k, clr in enumerate(palette):
        cx = ix1 + 20 + k * 45
        draw.ellipse([(cx, iy1 + 342), (cx + 28, iy1 + 370)], fill=clr)

    draw.rounded_rectangle([(ix1 + 15, iy1 + 400), (ix2 - 15, iy1 + 445)], radius=8, fill="#EF4444")
    draw.text((ix1 + 75, iy1 + 414), "ลบการ์ดนี้ออกจาก Canvas", font=get_font(12, True), fill="#FFFFFF")

    legend = [
        ("1", "คลังบล็อกเนื้อหา", "คลิกเพื่อเพิ่มการ์ดใหม่ เช่น ข้อมูลส่วนตัว ทักษะ ผลงาน", "#2563EB", "#EFF6FF", "#BFDBFE"),
        ("2", "ผืนผ้าใบจัดวาง (Canvas)", "คลิกเลือกการ์ดเพื่อแก้ไขเนื้อหาหรือจัดตำแหน่ง", "#3B82F6", "#EFF6FF", "#BFDBFE"),
        ("3", "แผงปรับแต่งรายละเอียด", "ปรับแต่งชื่อการ์ด ขนาดตาราง สีสัน และแบบอักษร", "#7C3AED", "#FAF5FF", "#E9D5FF"),
        ("4", "แถบคำสั่งและเผยแพร่", "กด Save Draft บันทึกไว้ หรือ Publish เปิดเป็นลิงก์จริง", "#10B981", "#ECFDF5", "#A7F3D0"),
    ]
    draw_footer_legend(draw, legend, W, H)

    img.save(OUT_DIR / "03-studio-editor.png", "PNG", dpi=(150, 150))
    print("Saved 03-studio-editor.png")

# ------------------------------------------------------------------------------
# 4. Admin Dashboard Mockup
# ------------------------------------------------------------------------------
def create_admin_dashboard_mockup():
    W, H = 1600, 1080
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header_banner(draw, "4. หน้าศูนย์ควบคุมผู้ดูแลระบบ (Admin Dashboard)", "สำหรับอาจารย์และผู้ดูแล: ดูภาพรวม ค้นหา ตรวจผลงาน และจัดการบัญชีนักศึกษา", W)

    bx1, by1, bx2, by2 = 80, 115, 1520, 915
    draw.rounded_rectangle([(bx1, by1), (bx2, by2)], radius=16, fill="#FFFFFF", outline="#E2E8F0", width=2)
    
    # Top bar
    draw.rectangle([(bx1, by1), (bx2, by1 + 65)], fill="#FFFFFF")
    draw.line([(bx1, by1 + 65), (bx2, by1 + 65)], fill="#E2E8F0", width=2)
    draw.text((bx1 + 30, by1 + 20), "PFS Administrator Control Center", font=get_font(20, True), fill="#581C87")
    
    draw.rounded_rectangle([(bx2 - 240, by1 + 15), (bx2 - 30, by1 + 50)], radius=20, fill="#FAF5FF")
    draw.text((bx2 - 210, by1 + 22), "อาจารย์ผู้ดูแล (Admin)", font=get_font(13, True), fill="#6B21A8")

    # Stat Summary Row
    stats = [
        ("นักศึกษาทั้งหมดในระบบ", "48 คน", "#7C3AED", "#FAF5FF", "#581C87"),
        ("ส่งงานและเผยแพร่แล้ว", "36 คน (75%)", "#10B981", "#ECFDF5", "#064E3B"),
        ("กำลังจัดทำแบบร่าง (Draft)", "10 คน (21%)", "#F59E0B", "#FEF3C7", "#78350F"),
        ("ยังไม่ได้เริ่มสร้าง", "2 คน (4%)", "#EF4444", "#FEE2E2", "#991B1B"),
    ]
    sw = (bx2 - bx1 - 60 - 45) // 4
    for i, (stitle, sval, sborder, sbg, stc) in enumerate(stats):
        sx1 = bx1 + 30 + i * (sw + 15)
        sx2 = sx1 + sw
        draw.rounded_rectangle([(sx1, by1 + 85), (sx2, by1 + 180)], radius=12, fill=sbg, outline=sborder, width=2)
        draw.text((sx1 + 18, by1 + 102), stitle, font=get_font(13, False), fill="#64748B")
        draw.text((sx1 + 18, by1 + 132), sval, font=get_font(19, True), fill=stc)
    draw_badge(draw, bx1 + 30 + sw - 10, by1 + 85, "1", color="#7C3AED")

    # Search & Filter Toolbar
    tx1, ty1, tx2, ty2 = bx1 + 30, by1 + 198, bx2 - 30, by1 + 258
    draw.rounded_rectangle([(tx1, ty1), (tx2, ty2)], radius=10, fill="#F8FAFC", outline="#E2E8F0", width=1)
    
    draw.rounded_rectangle([(tx1 + 15, ty1 + 10), (tx1 + 450, ty2 - 10)], radius=6, fill="#FFFFFF", outline="#CBD5E1", width=1)
    draw.text((tx1 + 30, ty1 + 18), "ค้นหาด้วยชื่อ, รหัสนักศึกษา, อีเมล...", font=get_font(13), fill="#94A3B8")
    draw_badge(draw, tx1 + 465, ty1 + 20, "2", color="#2563EB")

    draw.rounded_rectangle([(tx1 + 490, ty1 + 10), (tx1 + 660, ty2 - 10)], radius=6, fill="#FFFFFF", outline="#CBD5E1", width=1)
    draw.text((tx1 + 505, ty1 + 18), "สถานะ: ทั้งหมด v", font=get_font(13), fill="#334155")

    draw.rounded_rectangle([(tx2 - 190, ty1 + 10), (tx2 - 15, ty2 - 10)], radius=6, fill="#7C3AED")
    draw.text((tx2 - 165, ty1 + 18), "+ เพิ่มนักศึกษาใหม่", font=get_font(13, True), fill="#FFFFFF")
    draw_badge(draw, tx2 - 10, ty1 + 10, "3", color="#059669")

    # Table
    tbl_x1, tbl_y1, tbl_x2, tbl_y2 = bx1 + 30, by1 + 275, bx2 - 30, by2 - 25
    draw.rounded_rectangle([(tbl_x1, tbl_y1), (tbl_x2, tbl_y2)], radius=12, fill="#FFFFFF", outline="#CBD5E1", width=2)
    
    # Table Header
    draw.rectangle([(tbl_x1, tbl_y1), (tbl_x2, tbl_y1 + 45)], fill="#F1F5F9")
    draw.line([(tbl_x1, tbl_y1 + 45), (tbl_x2, tbl_y1 + 45)], fill="#CBD5E1", width=1)
    
    headers = [
        ("รหัสนักศึกษา", tbl_x1 + 30),
        ("ชื่อ - นามสกุล", tbl_x1 + 180),
        ("สาขาวิชา / ชั้นปี", tbl_x1 + 400),
        ("สถานะบัญชี", tbl_x1 + 600),
        ("สถานะ Portfolio", tbl_x1 + 750),
        ("เครื่องมือตรวจและจัดการ (Actions)", tbl_x1 + 950),
    ]
    for htitle, hx in headers:
        draw.text((hx, tbl_y1 + 14), htitle, font=get_font(13, True), fill="#475569")

    rows = [
        ("65010001", "สมชาย สายคอม", "CPE / ปี 4", "Active", "Published", True),
        ("65010002", "กานดา วิศวกรหญิง", "CPE / ปี 4", "Active", "Published", True),
        ("65010003", "ประเสริฐ โค้ดไว", "CPE / ปี 4", "Active", "Draft (แบบร่าง)", False),
        ("65010004", "วิชัย เน็ตเวิร์ก", "CPE / ปี 4", "Inactive", "Draft (แบบร่าง)", False),
        ("65010005", "อารียา ดาต้าเบส", "CPE / ปี 4", "Active", "ยังไม่เริ่ม", False),
    ]
    for r_idx, (sid, name, dept, ustatus, pstatus, is_pub) in enumerate(rows):
        ry = tbl_y1 + 45 + r_idx * 68
        draw.line([(tbl_x1, ry + 68), (tbl_x2, ry + 68)], fill="#F1F5F9", width=1)
        
        draw.text((tbl_x1 + 30, ry + 22), sid, font=get_font(13, True), fill="#1E293B")
        draw.text((tbl_x1 + 180, ry + 22), name, font=get_font(13, True), fill="#0F172A")
        draw.text((tbl_x1 + 400, ry + 22), dept, font=get_font(12), fill="#64748B")
        
        # User status
        u_bg = "#ECFDF5" if ustatus == "Active" else "#FEE2E2"
        u_tc = "#065F46" if ustatus == "Active" else "#991B1B"
        draw.rounded_rectangle([(tbl_x1 + 600, ry + 16), (tbl_x1 + 680, ry + 46)], radius=12, fill=u_bg)
        draw.text((tbl_x1 + 618, ry + 21), ustatus, font=get_font(12, True), fill=u_tc)

        # Portfolio status
        if is_pub:
            p_bg, p_tc = "#EFF6FF", "#1E40AF"
        elif "Draft" in pstatus:
            p_bg, p_tc = "#FEF3C7", "#92400E"
        else:
            p_bg, p_tc = "#F1F5F9", "#64748B"
        draw.rounded_rectangle([(tbl_x1 + 750, ry + 16), (tbl_x1 + 890, ry + 46)], radius=12, fill=p_bg)
        draw.text((tbl_x1 + 765, ry + 21), pstatus, font=get_font(12, True), fill=p_tc)

        # Action Buttons
        ax = tbl_x1 + 950
        if is_pub:
            draw.rounded_rectangle([(ax, ry + 16), (ax + 75, ry + 46)], radius=6, fill="#2563EB")
            draw.text((ax + 15, ry + 21), "เปิดดู >", font=get_font(12, True), fill="#FFFFFF")
        else:
            draw.rounded_rectangle([(ax, ry + 16), (ax + 105, ry + 46)], radius=6, fill="#D97706")
            draw.text((ax + 12, ry + 21), "ตรวจแบบร่าง", font=get_font(12, True), fill="#FFFFFF")
            
        draw.rounded_rectangle([(ax + 120, ry + 16), (ax + 175, ry + 46)], radius=6, fill="#F1F5F9", outline="#CBD5E1", width=1)
        draw.text((ax + 130, ry + 21), "แก้ไข", font=get_font(12), fill="#334155")

        draw.rounded_rectangle([(ax + 185, ry + 16), (ax + 245, ry + 46)], radius=6, fill="#F1F5F9", outline="#CBD5E1", width=1)
        draw.text((ax + 195, ry + 21), "รีเซ็ต", font=get_font(12), fill="#334155")

    draw_badge(draw, tbl_x1 + 1220, tbl_y1 + 80, "4", color="#D97706")

    legend = [
        ("1", "สรุปสถิติภาพรวม", "อาจารย์ตรวจเช็กได้ทันทีว่าเหลือกี่คนที่ยังไม่ส่งงาน", "#7C3AED", "#FAF5FF", "#E9D5FF"),
        ("2", "ระบบค้นหาและกรอง", "พิมพ์รหัสเพื่อค้นหานักศึกษาคนใดคนหนึ่งได้อย่างรวดเร็ว", "#2563EB", "#EFF6FF", "#BFDBFE"),
        ("3", "ปุ่มเพิ่มนักศึกษาใหม่", "คลิกเพื่อลงทะเบียนบัญชีนักศึกษาใหม่เข้าสู่ระบบ", "#059669", "#ECFDF5", "#A7F3D0"),
        ("4", "ปุ่มตรวจงานและจัดการ", "คลิก 'ตรวจแบบร่าง' หรือ 'เปิดดู' เพื่อดูผลงานนักศึกษา", "#D97706", "#FEF3C7", "#FDE68A"),
    ]
    draw_footer_legend(draw, legend, W, H)

    img.save(OUT_DIR / "04-admin-dashboard.png", "PNG", dpi=(150, 150))
    print("Saved 04-admin-dashboard.png")

if __name__ == "__main__":
    create_login_mockup()
    create_student_dashboard_mockup()
    create_studio_editor_mockup()
    create_admin_dashboard_mockup()
    print("All mockups generated cleanly!")
