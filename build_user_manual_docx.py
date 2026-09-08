import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

DOCX_OUT = "deliverables/USER_MANUAL.docx"
REAL_IMG_DIR = "deliverables/manual-assets/real"

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=140, bottom=140, left=200, right=200):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_callout_border(cell, color_hex="2563EB", border_size="36"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="none"/>\n'
        f'  <w:left w:val="single" w:sz="{border_size}" w:space="0" w:color="{color_hex}"/>\n'
        f'  <w:bottom w:val="none"/>\n'
        f'  <w:right w:val="none"/>\n'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

def set_table_borders(table, border_color="CBD5E1"):
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>\n'
        f'  <w:bottom w:val="single" w:sz="8" w:space="0" w:color="{border_color}"/>\n'
        f'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>\n'
        f'  <w:insideV w:val="none"/>\n'
        f'  <w:left w:val="none"/>\n'
        f'  <w:right w:val="none"/>\n'
        f'</w:tblBorders>'
    )
    tblPr.append(tblBorders)

def add_callout(doc, title, text, style="tip"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    
    if style == "tip":
        bg_color = "F0FDF4"
        border_color = "16A34A"
        icon = "💡 ข้อแนะนำพิเศษ (Pro-Tip): "
    elif style == "important":
        bg_color = "FEF2F2"
        border_color = "DC2626"
        icon = "⚠️ ข้อควรระวังสำคัญ (Important): "
    else:
        bg_color = "EFF6FF"
        border_color = "2563EB"
        icon = "📌 ข้อมูลเพิ่มเติม (Note): "
        
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=160, bottom=160, left=240, right=200)
    set_callout_border(cell, color_hex=border_color, border_size="24")
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    run_icon = p.add_run(icon)
    run_icon.bold = True
    run_icon.font.size = Pt(10.5)
    run_icon.font.name = "TH Sarabun New"
    if style == "tip":
        run_icon.font.color.rgb = RGBColor(22, 163, 74)
    elif style == "important":
        run_icon.font.color.rgb = RGBColor(220, 38, 38)
    else:
        run_icon.font.color.rgb = RGBColor(37, 99, 235)
        
    run_text = p.add_run(text)
    run_text.font.size = Pt(10.5)
    run_text.font.name = "TH Sarabun New"
    run_text.font.color.rgb = RGBColor(30, 41, 59)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)

def add_heading_styled(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    for r in h.runs:
        r.font.name = "TH Sarabun New"
    if level == 1:
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(6)
        for r in h.runs:
            r.font.size = Pt(17)
            r.bold = True
            r.font.color.rgb = RGBColor(30, 58, 138)
    elif level == 2:
        h.paragraph_format.space_before = Pt(13)
        h.paragraph_format.space_after = Pt(4)
        for r in h.runs:
            r.font.size = Pt(14)
            r.bold = True
            r.font.color.rgb = RGBColor(3, 105, 161)
    elif level == 3:
        h.paragraph_format.space_before = Pt(9)
        h.paragraph_format.space_after = Pt(3)
        for r in h.runs:
            r.font.size = Pt(12.5)
            r.bold = True
            r.font.color.rgb = RGBColor(51, 65, 85)
    return h

def add_paragraph_styled(doc, text="", bold_prefix=None, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "TH Sarabun New"
        r_pre.font.size = Pt(11.5)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    if text:
        r_txt = p.add_run(text)
        r_txt.font.name = "TH Sarabun New"
        r_txt.font.size = Pt(11.5)
        r_txt.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_bullet_styled(doc, text="", bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "TH Sarabun New"
        r_pre.font.size = Pt(11.5)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    if text:
        r_txt = p.add_run(text)
        r_txt.font.name = "TH Sarabun New"
        r_txt.font.size = Pt(11.5)
        r_txt.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_screenshot_box(doc, img_path, caption):
    if not os.path.exists(img_path):
        print(f"Warning: image {img_path} not found")
        return
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(8)
    p_img.paragraph_format.space_after = Pt(2)
    
    run = p_img.add_run()
    run.add_picture(img_path, width=Inches(6.3))
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(10)
    
    r_cap = p_cap.add_run(f"📷 {caption} (ภาพถ่ายหน้าจอระบบจริง)")
    r_cap.font.name = "TH Sarabun New"
    r_cap.font.size = Pt(10)
    r_cap.italic = True
    r_cap.font.color.rgb = RGBColor(100, 116, 139)

def build_docx():
    print("Creating Document with complete function-by-function instructions...")
    doc = docx.Document()
    
    # Margins
    for s in doc.sections:
        s.top_margin = Inches(0.75)
        s.bottom_margin = Inches(0.75)
        s.left_margin = Inches(0.85)
        s.right_margin = Inches(0.85)
        
        # Header & Footer
        hp = s.header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("PFS - Portfolio & Resume System | คู่มือการใช้งานฟังก์ชันระบบอย่างละเอียด")
        hrun.font.name = "TH Sarabun New"
        hrun.font.size = Pt(9)
        hrun.font.color.rgb = RGBColor(148, 163, 184)
        
        fp = s.footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("ภาควิชาวิศวกรรมคอมพิวเตอร์ — ระบบแฟ้มสะสมผลงานดิจิทัล (เอกสารคู่มือการใช้งาน)")
        frun.font.name = "TH Sarabun New"
        frun.font.size = Pt(9)
        frun.font.color.rgb = RGBColor(148, 163, 184)

    # -------------------------------------------------------------
    # COVER BANNER
    # -------------------------------------------------------------
    tbl_title = doc.add_table(rows=1, cols=1)
    tbl_title.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_title.autofit = False
    c_title = tbl_title.cell(0, 0)
    c_title.width = Inches(6.8)
    set_cell_background(c_title, "0F172A")
    set_cell_margins(c_title, top=280, bottom=260, left=320, right=320)
    
    p_badge = c_title.paragraphs[0]
    p_badge.paragraph_format.space_after = Pt(4)
    r_badge = p_badge.add_run("OFFICIAL USER MANUAL & FUNCTION GUIDE")
    r_badge.font.name = "Arial"
    r_badge.font.size = Pt(9.5)
    r_badge.bold = True
    r_badge.font.color.rgb = RGBColor(56, 189, 248)
    
    p_main = c_title.add_paragraph()
    p_main.paragraph_format.space_after = Pt(4)
    r_main = p_main.add_run("คู่มือการใช้งานระบบแฟ้มสะสมผลงานออนไลน์\nและคำอธิบายฟังก์ชันการทำงานทีละขั้นตอน")
    r_main.font.name = "TH Sarabun New"
    r_main.font.size = Pt(22)
    r_main.bold = True
    r_main.font.color.rgb = RGBColor(255, 255, 255)
    
    p_sub = c_title.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(0)
    r_sub = p_sub.add_run("PFS - Portfolio & Resume System for Computer Engineering Students\nครอบคลุมทุกบทบาท: นักศึกษา, อาจารย์ที่ปรึกษา, กรรมการตรวจงาน และนายจ้าง")
    r_sub.font.name = "TH Sarabun New"
    r_sub.font.size = Pt(11.5)
    r_sub.font.color.rgb = RGBColor(203, 213, 225)
    
    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(8)
    p_space.paragraph_format.space_after = Pt(4)

    # Info summary table
    info_tbl = doc.add_table(rows=4, cols=2)
    info_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(info_tbl)
    
    items = [
        ("โครงการ / ระบบ:", "ระบบสร้างแฟ้มสะสมผลงานและเรซูเม่ออนไลน์ (Portfolio System: PFS)"),
        ("กลุ่มเป้าหมายผู้ใช้งาน:", "นักศึกษาทุกคนในสาขา, อาจารย์ผู้ประเมิน, เจ้าหน้าที่, บริษัทและนายจ้าง"),
        ("ระดับความยากในการใช้:", "⭐⭐⭐⭐⭐ ง่ายมาก (เหมาะสำหรับผู้ที่ไม่มีพื้นฐานด้านคอมพิวเตอร์/เขียนเว็บ)"),
        ("ภาพประกอบในเล่ม:", "ภาพถ่ายหน้าจอจริง 100% จากระบบที่เปิดให้บริการ (Real High-Resolution Captures)")
    ]
    
    for i, (k, v) in enumerate(items):
        cell_k = info_tbl.cell(i, 0)
        cell_v = info_tbl.cell(i, 1)
        cell_k.width = Inches(2.2)
        cell_v.width = Inches(4.6)
        set_cell_background(cell_k, "F8FAFC")
        set_cell_margins(cell_k, 100, 100, 150, 150)
        set_cell_margins(cell_v, 100, 100, 150, 150)
        
        pk = cell_k.paragraphs[0]
        pk.paragraph_format.space_after = Pt(0)
        rk = pk.add_run(k)
        rk.bold = True
        rk.font.name = "TH Sarabun New"
        rk.font.size = Pt(11)
        rk.font.color.rgb = RGBColor(30, 41, 59)
        
        pv = cell_v.paragraphs[0]
        pv.paragraph_format.space_after = Pt(0)
        rv = pv.add_run(v)
        rv.font.name = "TH Sarabun New"
        rv.font.size = Pt(11)
        rv.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 0: บทนำและภาพรวม
    # -------------------------------------------------------------
    add_heading_styled(doc, "🌟 บทนำ: ระบบนี้คืออะไร และช่วยอะไรได้บ้าง?", level=1)
    
    add_paragraph_styled(
        doc,
        "คือ เว็บแอปพลิเคชันที่ช่วยให้นักศึกษาสามารถจัดทำ เรซูเม่ (Resume) และ แฟ้มสะสมผลงาน (Portfolio) ดิจิทัลได้อย่างสวยงาม รวดเร็ว และเป็นมืออาชีพ ผ่านหน้าต่างเว็บเบราว์เซอร์ โดยไม่ต้องมีความรู้ด้านการเขียนโค้ด ไม่ต้องติดตั้งโปรแกรมลงในคอมพิวเตอร์ และไม่ต้องจัดหน้า Word หรือ Photoshop ให้เสียเวลา",
        bold_prefix="ระบบ PFS (Portfolio System) "
    )
    add_paragraph_styled(
        doc,
        "เมื่อตกแต่งเสร็จ ระบบจะออก 'ลิงก์ผลงานส่วนบุคคล' (Public URL) ให้นำไปส่งอาจารย์ตรวจ หรือแนบในใบสมัครงานกับบริษัทได้ทันที พร้อมระบบ Responsive ที่ปรับขนาดให้อ่านง่ายบนมือถือและแท็บเล็ตอัตโนมัติ"
    )
    
    add_heading_styled(doc, "👥 ภาพรวมผู้ใช้งาน 3 บทบาทหลัก", level=2)
    
    role_tbl = doc.add_table(rows=4, cols=3)
    role_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(role_tbl)
    
    headers = ["บทบาทผู้ใช้งาน", "ใครคือผู้ใช้?", "หน้าที่และการทำงานในระบบ"]
    for j, h_text in enumerate(headers):
        c = role_tbl.cell(0, j)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 120, 120, 160, 160)
        p = c.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.bold = True
        r.font.name = "TH Sarabun New"
        r.font.size = Pt(11.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    roles_data = [
        ("🎓 นักศึกษา (Student)", "นักศึกษาทุกคนในสาขาวิชา", "• ล็อกอินด้วยรหัสนักศึกษา\n• เลือกเทมเพลตเรซูเม่ 6 สไตล์ในคลิกเดียว\n• ใส่บล็อกข้อมูล ทักษะ และผลงานโครงงาน\n• ปรับแต่งฟอนต์ สีสัน และขนาดการ์ด\n• บันทึกแบบร่าง และกดเผยแพร่เพื่อแชร์ลิงก์"),
        ("🛡️ อาจารย์ / ผู้ดูแล (Admin)", "อาจารย์ที่ปรึกษา, ฝ่ายทะเบียน", "• ดูสถิติรวมของนักศึกษาทั้งรุ่น\n• เปิดตรวจผลงานของนักศึกษาเป็นรายคน\n• ฟังก์ชันพิเศษ: ตรวจงานแบบร่างที่ยังไม่เสร็จได้\n• เพิ่มรายชื่อนักศึกษาใหม่เข้าระบบ\n• รีเซ็ตรหัสผ่านให้นักศึกษาที่ลืมรหัส"),
        ("🌐 ผู้เข้าชม / บริษัท (Visitor)", "บริษัทรับสมัครงาน, กรรมการ, เพื่อน", "• เปิดชมหน้าเว็บผลงานของนักศึกษาผ่านลิงก์\n• เปิดดูได้ทันทีโดยไม่ต้องลงทะเบียน\n• พิมพ์หรือบันทึกเป็น PDF มาตรฐาน A4")
    ]
    
    for i, row in enumerate(roles_data):
        for j, val in enumerate(row):
            c = role_tbl.cell(i + 1, j)
            if j == 0:
                c.width = Inches(1.8)
                set_cell_background(c, "F1F5F9")
            elif j == 1:
                c.width = Inches(1.8)
            else:
                c.width = Inches(3.2)
            set_cell_margins(c, 100, 100, 140, 140)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "TH Sarabun New"
            r.font.size = Pt(11)
            r.font.color.rgb = RGBColor(30, 41, 59)
            if j == 0:
                r.bold = True

    add_paragraph_styled(doc, "")

    # -------------------------------------------------------------
    # SECTION 1: เข้าสู่ระบบ
    # -------------------------------------------------------------
    add_heading_styled(doc, "🚀 บทที่ 1: การเข้าสู่ระบบและการระบุตัวตน (Authentication)", level=1)
    
    add_paragraph_styled(
        doc,
        "ทุกครั้งที่ต้องการเริ่มใช้งานระบบ ให้เปิดโปรแกรมท่องเว็บ (Google Chrome, Microsoft Edge, หรือ Safari) แล้วเข้าไปที่หน้าเว็บของระบบ /login จากนั้นจะพบกับหน้าต่างเข้าสู่ระบบดังภาพจริงด้านล่าง:"
    )
    
    add_screenshot_box(
        doc,
        f"{REAL_IMG_DIR}/01-real-login.png",
        "ภาพที่ 1: หน้าต่างเข้าสู่ระบบจริง (PFS Secure Login Screen)"
    )
    
    add_heading_styled(doc, "📌 ฟังก์ชัน 1.1: วิธีการเข้าสู่ระบบทีละขั้นตอน (Step-by-Step Login)", level=2)
    add_bullet_styled(
        doc,
        "สำหรับ นักศึกษา ให้พิมพ์ รหัสนักศึกษา 8-13 หลัก (เช่น 65010001) หรืออีเมลที่ลงทะเบียนไว้ / สำหรับ อาจารย์และผู้ดูแล ให้พิมพ์อีเมลประจำตำแหน่ง เช่น admin@pfs.local",
        bold_prefix="ขั้นตอนที่ 1 — ช่องระบุตัวตน (Identifier): "
    )
    add_bullet_styled(
        doc,
        "กรอกรหัสผ่านส่วนตัวของท่านในช่องนี้",
        bold_prefix="ขั้นตอนที่ 2 — ช่องรหัสผ่าน (Password): "
    )
    add_bullet_styled(
        doc,
        "คลิกปุ่มสีน้ำเงินนี้เพื่อยืนยันตัวตน",
        bold_prefix="ขั้นตอนที่ 3 — ปุ่มเข้าสู่ระบบ (Sign In): "
    )
    
    add_heading_styled(doc, "📌 ฟังก์ชัน 1.2: การนำทางและแยกสิทธิ์อัตโนมัติ (Role-based Routing)", level=2)
    add_paragraph_styled(
        doc,
        "เมื่อเข้าสู่ระบบสำเร็จ ระบบจะแยกหน้าจอให้อัตโนมัติ โดยนักศึกษาจะถูกพาไปยังหน้าแดชบอร์ดนักศึกษา (/student) ส่วนอาจารย์จะถูกพาไปยังศูนย์ควบคุมผู้ดูแล (/admin) ทันทีโดยไม่ต้องเลือกเมนูเอง"
    )
    
    add_callout(
        doc,
        title="ข้อแนะนำเรื่องความปลอดภัย",
        text="หลังจากเข้าสู่ระบบสำเร็จในครั้งแรก แนะนำให้นักศึกษาเข้าไปที่เมนู 'เปลี่ยนรหัสผ่าน' ทันที เพื่อตั้งรหัสผ่านใหม่ที่เป็นความลับเฉพาะตัวท่าน ป้องกันไม่ให้ผู้อื่นเข้าถึงข้อมูลได้",
        style="tip"
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 2: นักศึกษา (STUDENT GUIDE)
    # -------------------------------------------------------------
    add_heading_styled(doc, "🎓 บทที่ 2: คู่มือสำหรับ \"นักศึกษา\" (Student Guide)", level=1)
    
    add_heading_styled(doc, "2.1 หน้าแดชบอร์ดของฉัน (Student Dashboard)", level=2)
    add_paragraph_styled(
        doc,
        "เมื่อเข้าสู่ระบบด้วยบัญชีนักศึกษา จะพบกับหน้าศูนย์รวมข้อมูลส่วนตัว ซึ่งจะรายงานสถานะผลงาน ลิงก์สำหรับแชร์ และปุ่มคำสั่งสำคัญทั้งหมด:"
    )
    
    add_screenshot_box(
        doc,
        f"{REAL_IMG_DIR}/02-real-student-dashboard.png",
        "ภาพที่ 2: หน้าแดชบอร์ดส่วนตัวของนักศึกษาจริง (Student Dashboard)"
    )
    
    add_heading_styled(doc, "📌 อธิบายการใช้งานฟังก์ชันบนหน้าแดชบอร์ด:", level=3)
    
    add_bullet_styled(
        doc,
        "การ์ดสรุปจะรายงานว่าเรซูโม่อยู่ในสถานะ 'เผยแพร่แล้ว (Published)' สีเขียว หรือ 'แบบร่าง (Draft)' สีส้ม พร้อมแถบเปอร์เซ็นต์ความสมบูรณ์เนื้อหา (% Completion) ที่ช่วยบอกว่าเราใส่ข้อมูลครบทุกหมวดหรือยัง",
        bold_prefix="• ฟังก์ชัน 2.1.1 — ตรวจสอบสถานะและความสมบูรณ์: "
    )
    add_bullet_styled(
        doc,
        "กล่องสีน้ำเงินจะแสดง URL ผลงานของท่าน เพียงคลิกปุ่มสีเขียว 'คัดลอกลิงก์ (Copy)' ระบบจะก๊อบปี้ลิงก์ลงคลิปบอร์ดทันที สามารถนำไปวางส่งอาจารย์ทางแชต หรือแนบในอีเมลสมัครงานได้ทันที และกดปุ่ม 'เปิดดูหน้าจริง (View Live)' เพื่อตรวจสอบหน้าตาที่คนภายนอกเห็น",
        bold_prefix="• ฟังก์ชัน 2.1.2 — การคัดลอกลิงก์ผลงานไปส่ง (Quick Copy Link): "
    )
    add_bullet_styled(
        doc,
        "คลิกปุ่ม 'แก้ไขโปรไฟล์' เพื่อแก้ไขชื่อภาษาไทย/อังกฤษ แผนกวิชา หรือระดับชั้นปี แล้วกดปุ่มบันทึก",
        bold_prefix="• ฟังก์ชัน 2.1.3 — การแก้ไขข้อมูลส่วนตัว (Profile Management): "
    )
    add_bullet_styled(
        doc,
        "คลิกปุ่ม 'เปลี่ยนรหัสผ่าน' กรอกรหัสเดิม และรหัสใหม่ที่ต้องการ 2 ครั้ง แล้วกดยืนยันเพื่อเปลี่ยนรหัสผ่านทันที",
        bold_prefix="• ฟังก์ชัน 2.1.4 — การเปลี่ยนรหัสผ่าน (Change Password): "
    )

    add_paragraph_styled(doc, "")

    # 2.2 Studio Canvas Editor
    add_heading_styled(doc, "2.2 สตูดิโอออกแบบผลงานแบบกริด (Studio Grid Canvas Editor)", level=2)
    add_paragraph_styled(
        doc,
        "เมื่อคลิกปุ่ม 'เข้าสู่สตูดิโอออกแบบ (Edit Canvas)' จากหน้าแดชบอร์ด จะเข้าสู่หน้าจอออกแบบผลงาน ซึ่งออกแบบมาให้จัดวางบล็อกเนื้อหาได้อย่างอิสระ:"
    )
    
    add_screenshot_box(
        doc,
        f"{REAL_IMG_DIR}/03-real-studio-editor.png",
        "ภาพที่ 3: สตูดิโอออกแบบ Portfolio แบบกริดจริง (Studio Grid Canvas Editor)"
    )
    
    add_heading_styled(doc, "📌 อธิบายการใช้งานแต่ละฟังก์ชันในสตูดิโอ:", level=3)
    
    add_bullet_styled(
        doc,
        "คลิกปุ่ม 'เลือกเทมเพลต' บนแถบคำสั่งด้านบน สามารถเปลี่ยนดีไซน์ได้ 6 สไตล์ในคลิกเดียว เช่น Professional (เน้นทางการ น่าเชื่อถือ), Modern Minimal (เรียบหรู คมชัด), Creative (สีสันสดใส มีพลัง) หรือ Tech Engineer (ฟอนต์สไตล์นักพัฒนา)",
        bold_prefix="• ฟังก์ชัน 2.2.1 — การเลือกเทมเพลตสำเร็จรูป (Template Gallery): "
    )
    add_bullet_styled(
        doc,
        "แผงด้านซ้ายรวบรวมบล็อกข้อมูลที่จำเป็นไว้ครบถ้วน เช่น Profile (ข้อมูลติดต่อ), About Me (แนะนำตัว), Education (การศึกษา), Skills (ทักษะโปรแกรม), Projects (โครงงานเด่น), Experience (ประสบการณ์ฝึกงาน), Certificates (เกียรติบัตร) เพียงคลิกที่บล็อกที่ต้องการ การ์ดนั้นจะเพิ่มลงบน Canvas ตรงกลางทันที",
        bold_prefix="• ฟังก์ชัน 2.2.2 — การเพิ่มบล็อกหมวดหมู่เนื้อหา (Blocks Library): "
    )
    add_bullet_styled(
        doc,
        "คลิกที่การ์ดแล้วเลือกขนาดในแผงขวา: เลือก 'เต็มหน้าจอ (12 ช่อง)' สำหรับหัวข้อหลัก หรือ 'ครึ่งหน้าจอ (6 ช่อง)' เพื่อวางการ์ดประกบคู่กัน พร้อมปุ่มลูกศรขึ้น-ลงเพื่อสลับตำแหน่ง และปุ่มดวงตาเพื่อซ่อนหัวข้อชั่วคราว",
        bold_prefix="• ฟังก์ชัน 2.2.3 — การจัดผังตารางและปรับขนาดการ์ด (Grid Layout & Sizing): "
    )
    add_bullet_styled(
        doc,
        "เมื่อคลิกเลือกการ์ดใดๆ บนผืนผ้าใบ แผงด้านขวาในแท็บ 'เนื้อหา (Content)' จะเปิดขึ้นมาให้พิมพ์ชื่อหัวข้อ, บรรยายรายละเอียด, เพิ่มรายการทักษะ หรือลิสต์ผลงานโครงงานพร้อมแนบลิงก์ GitHub ได้ไม่จำกัด",
        bold_prefix="• ฟังก์ชัน 2.2.4 — การพิมพ์และแก้ไขเนื้อหา (Content Inspector): "
    )
    add_bullet_styled(
        doc,
        "ในแท็บ 'ดีไซน์ (Design)' แผงขวามือ สามารถเลือกเปลี่ยนสีธีมการ์ดจากจานสี และเลือกลายตัวอักษรยอดนิยม เช่น Prompt, Kanit, Inter, Fira Code รวมถึงจัดตำแหน่งข้อความชิดซ้าย/กึ่งกลาง/ชิดขวา",
        bold_prefix="• ฟังก์ชัน 2.2.5 — การปรับแต่งสีสันและฟอนต์ (Design & Styling): "
    )
    add_bullet_styled(
        doc,
        "หากไม่ต้องการแสดงหมวดหมู่นั้น ให้คลิกปุ่มถังขยะสีแดงที่แผงขวาเพื่อลบการ์ดออกจากหน้าเว็บ",
        bold_prefix="• ฟังก์ชัน 2.2.6 — การลบบล็อกที่ไม่ต้องการ (Delete Block): "
    )

    add_paragraph_styled(doc, "")

    # 2.3 Save Draft vs Publish
    add_heading_styled(doc, "2.3 ความแตกต่างระหว่าง \"บันทึกแบบร่าง\" กับ \"เผยแพร่\"", level=2)
    
    draft_tbl = doc.add_table(rows=4, cols=4)
    draft_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(draft_tbl)
    
    d_heads = ["สถานะงาน", "ปุ่มที่ต้องคลิก", "คนภายนอกเปิดดูได้ไหม?", "เหมาะสำหรับช่วงเวลาไหน?"]
    for j, h_text in enumerate(d_heads):
        c = draft_tbl.cell(0, j)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 120, 120, 150, 150)
        p = c.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.bold = True
        r.font.name = "TH Sarabun New"
        r.font.size = Pt(11.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    draft_rows = [
        ("แบบร่าง (Draft)", "ปุ่มสีส้ม\n\"บันทึกฉบับร่าง\"", "❌ ยังดูไม่ได้\n(ขึ้นว่ากำลังจัดทำ)", "ช่วงที่กำลังพิมพ์งาน ยังทำไม่เสร็จ หรืออยากทดลองเปลี่ยนดีไซน์เป็นการส่วนตัว"),
        ("เผยแพร่แล้ว (Published)", "ปุ่มสีเขียว\n\"เผยแพร่ (Publish)\"", "✅ เปิดดูได้ทันที\nผ่านลิงก์สาธารณะ", "เมื่อใส่ข้อมูลและตรวจทานความถูกต้องเรียบร้อยแล้ว พร้อมส่งให้อาจารย์หรือบริษัท"),
        ("ปิดการเผยแพร่ (Unpublish)", "ปุ่มสีเทา\n\"ปิดการเผยแพร่\"", "❌ ปิดการเข้าชม\n(กลับเป็นแบบร่าง)", "เมื่อต้องการปิดไม่ให้ผู้อื่นเข้าชมผลงานชั่วคราวเพื่อปรับปรุงเนื้อหาชุดใหญ่")
    ]
    
    for i, row in enumerate(draft_rows):
        for j, val in enumerate(row):
            c = draft_tbl.cell(i + 1, j)
            if j == 0:
                c.width = Inches(1.8)
                set_cell_background(c, "F8FAFC")
            elif j == 1:
                c.width = Inches(1.5)
            elif j == 2:
                c.width = Inches(1.6)
            else:
                c.width = Inches(2.0)
            set_cell_margins(c, 100, 100, 130, 130)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "TH Sarabun New"
            r.font.size = Pt(11)
            r.font.color.rgb = RGBColor(30, 41, 59)
            if j == 0:
                r.bold = True
                
    add_paragraph_styled(doc, "")
    
    add_callout(
        doc,
        title="จุดที่นักศึกษามักผิดพลาดบ่อยที่สุด",
        text="หลังจากแต่งหน้าตาเรซูเม่เสร็จแล้ว หากนักศึกษาคลิกเฉพาะปุ่ม 'บันทึกฉบับร่าง' แต่ลืมคลิกปุ่ม 'เผยแพร่ (Publish)' สีเขียว อาจารย์หรือบริษัทที่ได้รับลิงก์จะไม่สามารถเปิดดูผลงานได้ ดังนั้นเมื่อแต่งเสร็จทุกครั้ง ต้องมั่นใจว่าได้กดปุ่มเผยแพร่แล้วนะครับ",
        style="important"
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 3: อาจารย์และผู้ดูแลระบบ (ADMIN GUIDE)
    # -------------------------------------------------------------
    add_heading_styled(doc, "🛡️ บทที่ 3: คู่มือสำหรับ \"อาจารย์และผู้ดูแลระบบ\" (Admin Guide)", level=1)
    add_paragraph_styled(
        doc,
        "สำหรับอาจารย์ที่ปรึกษา หัวหน้าสาขาวิชา หรือเจ้าหน้าที่ดูแลระบบ หน้าต่างศูนย์ควบคุมผู้ดูแลระบบ (/admin) คือศูนย์กลางในการติดตามความคืบหน้า ตรวจผลงาน และบริหารจัดการผู้ใช้งานทั้งหลักสูตร:"
    )
    
    add_screenshot_box(
        doc,
        f"{REAL_IMG_DIR}/04-real-admin-dashboard.png",
        "ภาพที่ 4: หน้าศูนย์ควบคุมผู้ดูแลระบบและตรวจงานจริง (Admin Dashboard)"
    )
    
    add_heading_styled(doc, "📌 ฟังก์ชันการทำงานของผู้ดูแลระบบทีละขั้นตอน:", level=2)
    
    add_bullet_styled(
        doc,
        "ดูตัวเลขสรุปผลได้ทันที: มีนักศึกษาทั้งหมดกี่คน, ส่งงานแล้วกี่คน (Published), อยู่ระหว่างทำกี่คน (Draft), และยังไม่เริ่มทำกี่คน ช่วยให้อาจารย์วางแผนติดตามงานได้ทันท่วงที",
        bold_prefix="• ฟังก์ชัน 3.1 — การตรวจดูสถิติภาพรวมทั้งรุ่น (Overview Metrics): "
    )
    add_bullet_styled(
        doc,
        "พิมพ์ชื่อ, รหัสนักศึกษา หรืออีเมลในช่องค้นหา ตารางจะกรองรายชื่อให้ทันทีแบบเรียลไทม์ พร้อมแท็บคัดกรองเลือกดูเฉพาะคนที่ยังไม่ส่งงาน",
        bold_prefix="• ฟังก์ชัน 3.2 — ระบบค้นหาและตัวกรอง (Search & Filter): "
    )
    add_bullet_styled(
        doc,
        "คลิกปุ่ม 'เปิดดู >' (สีน้ำเงิน) ในแถวของนักศึกษาที่เผยแพร่ผลงานแล้ว เพื่อเปิดดูเรซูเม่หน้าจริงแบบที่คนภายนอกเห็นและประเมินให้คะแนน",
        bold_prefix="• ฟังก์ชัน 3.3 — การเปิดตรวจผลงานที่เผยแพร่แล้ว (View Live Portfolio): "
    )
    add_bullet_styled(
        doc,
        "สำหรับนักศึกษาที่ยังทำไม่เสร็จ (สถานะขึ้นแบบร่าง) อาจารย์สามารถคลิกปุ่ม 'ตรวจแบบร่าง 🔍' (สีส้ม) เพื่อเข้าไปดูความคืบหน้าของงานได้ แม้ว่านักศึกษาจะยังไม่ได้กดเผยแพร่ก็ตาม ช่วยให้อาจารย์ให้คำแนะนำก่อนส่งจริงได้",
        bold_prefix="• ฟังก์ชัน 3.4 — ฟังก์ชันพิเศษ: การเปิดตรวจแบบร่าง (Draft Review 🔍): "
    )
    add_bullet_styled(
        doc,
        "คลิกปุ่มสีม่วง '+ Add Student' แล้วกรอกรหัสนักศึกษา, ชื่อ-นามสกุล, อีเมล, รหัสผ่านเริ่มต้น, และชั้นปี ระบบจะเปิดบัญชีให้ทันที",
        bold_prefix="• ฟังก์ชัน 3.5 — การเพิ่มบัญชีนักศึกษาใหม่ (+ Add Student): "
    )
    add_bullet_styled(
        doc,
        "กรณีนักศึกษาลืมรหัสผ่าน เพียงค้นหาชื่อนักศึกษาแล้วคลิกปุ่ม 'รีเซ็ต' (ไอคอนรูปกุญแจ 🔑) ระบบจะตั้งรหัสผ่านใหม่ให้นักศึกษาได้ทันทีในเวลาไม่เกิน 5 วินาที",
        bold_prefix="• ฟังก์ชัน 3.6 — การรีเซ็ตรหัสผ่านให้นักศึกษา (Reset Password): "
    )
    add_bullet_styled(
        doc,
        "คลิกปุ่ม 'แก้ไข' เพื่อปรับปรุงข้อมูลส่วนตัว หรือคลิกปุ่ม 'เปิด/ปิดบัญชี' (ไอคอน Power) เพื่อเปลี่ยนสถานะเป็น Inactive (ระงับชั่วคราว) หรือ Active (เปิดใช้งาน)",
        bold_prefix="• ฟังก์ชัน 3.7 — การแก้ไขข้อมูลและจัดการสถานะบัญชี (Edit & Status Toggle): "
    )

    add_paragraph_styled(doc, "")

    # -------------------------------------------------------------
    # SECTION 4: ผู้เข้าชมภายนอกและนายจ้าง (VISITOR GUIDE)
    # -------------------------------------------------------------
    add_heading_styled(doc, "🌐 บทที่ 4: สำหรับ \"ผู้เข้าชมภายนอกและนายจ้าง\" (Visitor & Employer)", level=1)
    add_paragraph_styled(
        doc,
        "บุคคลภายนอก เช่น กรรมการประเมินหลักสูตร, ฝ่ายบุคคล (HR), หรือผู้บริหารบริษัทไอที สามารถเปิดรับชมผลงานของนักศึกษาได้ง่ายๆ ดังนี้:"
    )
    
    add_screenshot_box(
        doc,
        f"{REAL_IMG_DIR}/05-real-public-dashboard.png",
        "ภาพที่ 5: หน้าแสดงเรซูเม่และแฟ้มผลงานสาธารณะจริง (Public Portfolio Showcase)"
    )
    
    add_bullet_styled(
        doc,
        "คลิกเปิดจากลิงก์เฉพาะของนักศึกษาที่แนบมา (เช่น /r/65010001) ซึ่งจะเปิดตรงเข้าสู่หน้าเรซูเม่ของนักศึกษาคนนั้นทันทีโดยไม่ต้องเข้าสู่ระบบ",
        bold_prefix="• ฟังก์ชัน 4.1 — เปิดชมผ่านลิงก์โดยตรง (Direct URL): "
    )
    add_bullet_styled(
        doc,
        "เข้าหน้าเว็บ /dashboard เพื่อเลือกชมทำเนียบ Portfolio ของนักศึกษาทั้งหมดที่เปิดเผยแพร่สาธารณะ สามารถค้นหาตามชื่อ หรือทักษะที่สนใจได้",
        bold_prefix="• ฟังก์ชัน 4.2 — เปิดชมทำเนียบผลงานรวม (Public Showcase): "
    )
    add_bullet_styled(
        doc,
        "เมื่อเปิดหน้าเรซูเม่ ให้กดปุ่ม Ctrl + P (Windows) หรือ Cmd + P (Mac) แล้วเลือกปลายทางเป็น 'Save as PDF' ระบบมี CSS Print Stylesheet ช่วยจัดขอบกระดาษ A4 ให้อัตโนมัติ สามารถเซฟเป็นไฟล์ PDF เก็บไว้นำเสนอกรรมการได้ทันที",
        bold_prefix="• ฟังก์ชัน 4.3 — การพิมพ์หรือบันทึกเป็น PDF (Print to PDF): "
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 5: คำถามที่พบบ่อย (FAQ)
    # -------------------------------------------------------------
    add_heading_styled(doc, "❓ บทที่ 5: คำถามที่พบบ่อยและการแก้ปัญหา (FAQ)", level=1)
    
    faqs = [
        ("Q1: นักศึกษาส่งลิงก์ให้อาจารย์แล้ว แต่อาจารย์เปิดแล้วพบว่าไม่มีข้อมูล หรือขึ้นว่าไม่พบหน้าเว็บ?",
         "สาเหตุ: นักศึกษาอาจจะกดเพียงแค่ปุ่ม 'บันทึกฉบับร่าง (Save Draft)' แต่ยังไม่ได้คลิกปุ่ม 'เผยแพร่ (Publish)'\n"
         "วิธีแก้: ให้นักศึกษาเปิดหน้า /student/editor อีกครั้ง แล้วคลิกปุ่มสีเขียว 'เผยแพร่ (Publish)' ด้านบนขวา 1 ครั้ง จากนั้นคัดลอกลิงก์ส่งให้อาจารย์ใหม่อีกครั้ง"),
        
        ("Q2: นักศึกษาลืมรหัสผ่านเข้าสู่ระบบ ต้องทำอย่างไร?",
         "วิธีแก้: ให้นักศึกษาแจ้งรหัสนักศึกษาแก่อาจารย์ที่ปรึกษาหรือผู้ดูแลระบบ อาจารย์สามารถเข้าไปที่หน้า /admin ค้นหารหัสนักศึกษา แล้วคลิกปุ่ม 'รีเซ็ต' ระบบจะตั้งรหัสผ่านใหม่ให้นักศึกษาได้ทันทีในเวลาไม่เกิน 5 วินาที"),
        
        ("Q3: แก้ไขข้อมูลหรือเพิ่มผลงานใหม่แล้ว ผู้ที่เปิดลิงก์อยู่จะเห็นข้อมูลอัปเดตทันทีเลยหรือไม่?",
         "คำตอบ: ทันทีที่นักศึกษาคลิกปุ่ม 'เผยแพร่ (Publish)' ข้อมูลจะถูกอัปเดตขึ้นเซิร์ฟเวอร์ทันที ผู้ที่เปิดหน้าเว็บผลงานอยู่เพียงแค่กดปุ่ม Refresh (F5) บนเบราว์เซอร์ ก็จะเห็นข้อมูลเวอร์ชันใหม่ทันที"),
        
        ("Q4: หากกำลังตกแต่งเรซูแม่อยู่แล้วเผลอปิดหน้าต่างเบราว์เซอร์ หรือไฟดับ ข้อมูลที่ทำไว้จะสูญหายหรือไม่?",
         "คำตอบ: ตราบใดที่ท่านได้เคยกดปุ่ม 'บันทึกฉบับร่าง (Save Draft)' ข้อมูลทั้งหมดจะถูกจัดเก็บไว้อย่างปลอดภัยบนฐานข้อมูลของระบบ เมื่อท่านเปิดระบบเข้ามาใหม่ ข้อมูลและรูปแบบที่จัดไว้จะกลับมาครบถ้วนอย่างแน่นอน"),
        
        ("Q5: หน้าจอแจ้งเตือนว่า 'บัญชีของท่านถูกระงับการใช้งาน (Inactive)' เกิดจากอะไร?",
         "คำตอบ: บัญชีของท่านอาจถูกตั้งสถานะพักการใช้งานจากผู้ดูแลระบบ ให้ติดต่ออาจารย์ผู้ดูแลระบบเพื่อเปิดสถานะบัญชีกลับมาเป็น 'Active' อีกครั้ง")
    ]
    
    for q, a in faqs:
        add_heading_styled(doc, q, level=2)
        add_paragraph_styled(doc, a)
        add_paragraph_styled(doc, "")

    # -------------------------------------------------------------
    # SECTION 6: การสนับสนุนและข้อมูลติดต่อ
    # -------------------------------------------------------------
    add_heading_styled(doc, "📞 บทที่ 6: ช่องทางการติดต่อและสนับสนุนระบบ", level=1)
    
    contact_tbl = doc.add_table(rows=3, cols=2)
    contact_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(contact_tbl)
    
    contact_info = [
        ("หน่วยงานผู้พัฒนาและดูแล:", "ภาควิชาวิศวกรรมคอมพิวเตอร์"),
        ("อีเมลผู้ดูแลระบบ (Admin Support):", "admin@pfs.local"),
        ("สถานะระบบ (System Deployment):", "พร้อมใช้งานเต็มรูปแบบ (Production Ready)")
    ]
    
    for i, (k, v) in enumerate(contact_info):
        c0 = contact_tbl.cell(i, 0)
        c1 = contact_tbl.cell(i, 1)
        c0.width = Inches(2.5)
        c1.width = Inches(4.3)
        set_cell_background(c0, "F8FAFC")
        set_cell_margins(c0, 100, 100, 140, 140)
        set_cell_margins(c1, 100, 100, 140, 140)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(k)
        r0.bold = True
        r0.font.name = "TH Sarabun New"
        r0.font.size = Pt(11)
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(v)
        r1.font.name = "TH Sarabun New"
        r1.font.size = Pt(11)
        
    print(f"Saving Word document to {DOCX_OUT}...")
    doc.save(DOCX_OUT)
    print("Document successfully created!")

if __name__ == "__main__":
    build_docx()
