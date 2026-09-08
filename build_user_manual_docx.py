import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
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
    # Left border thick, others none
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
        bg_color = "F0FDF4"      # Light green
        border_color = "16A34A"  # Green
        icon = "💡 ข้อแนะนำพิเศษ (Pro-Tip): "
    elif style == "important":
        bg_color = "FEF2F2"      # Light red
        border_color = "DC2626"  # Red
        icon = "⚠️ ข้อควรระวังสำคัญ (Important): "
    else: # note
        bg_color = "EFF6FF"      # Light blue
        border_color = "2563EB"  # Blue
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
    run_icon.font.name = "TH Sarabun New" if "TH Sarabun New" else "Arial"
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
            r.font.size = Pt(18)
            r.bold = True
            r.font.color.rgb = RGBColor(30, 58, 138) # Navy Blue
    elif level == 2:
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        for r in h.runs:
            r.font.size = Pt(15)
            r.bold = True
            r.font.color.rgb = RGBColor(3, 105, 161) # Sky Blue Dark
    elif level == 3:
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(3)
        for r in h.runs:
            r.font.size = Pt(13)
            r.bold = True
            r.font.color.rgb = RGBColor(51, 65, 85) # Slate
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
        r_pre.font.size = Pt(12)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    if text:
        r_txt = p.add_run(text)
        r_txt.font.name = "TH Sarabun New"
        r_txt.font.size = Pt(12)
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
        r_pre.font.size = Pt(12)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    if text:
        r_txt = p.add_run(text)
        r_txt.font.name = "TH Sarabun New"
        r_txt.font.size = Pt(12)
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
    
    # 6.2 inches fits nicely inside standard margins
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
    print("Creating Document...")
    doc = docx.Document()
    
    # Set Margins (0.75 inch for a clean, spacious look)
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.75)
        s.bottom_margin = Inches(0.75)
        s.left_margin = Inches(0.85)
        s.right_margin = Inches(0.85)
        
        # Add Header & Footer
        header = s.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("PFS - Portfolio & Resume System | คู่มือการใช้งานสำหรับผู้ใช้ทั่วไป")
        hrun.font.name = "TH Sarabun New"
        hrun.font.size = Pt(9)
        hrun.font.color.rgb = RGBColor(148, 163, 184)
        
        footer = s.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("ภาควิชาวิศวกรรมคอมพิวเตอร์ — ระบบแฟ้มสะสมผลงานดิจิทัล (หน้าแสดงเอกสาร)")
        frun.font.name = "TH Sarabun New"
        frun.font.size = Pt(9)
        frun.font.color.rgb = RGBColor(148, 163, 184)

    # -------------------------------------------------------------
    # COVER / TITLE BANNER
    # -------------------------------------------------------------
    tbl_title = doc.add_table(rows=1, cols=1)
    tbl_title.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_title.autofit = False
    c_title = tbl_title.cell(0, 0)
    c_title.width = Inches(6.8)
    set_cell_background(c_title, "0F172A") # Slate 900
    set_cell_margins(c_title, top=280, bottom=260, left=320, right=320)
    
    p_badge = c_title.paragraphs[0]
    p_badge.paragraph_format.space_after = Pt(4)
    r_badge = p_badge.add_run("OFFICIAL USER MANUAL & GUIDE")
    r_badge.font.name = "Arial"
    r_badge.font.size = Pt(9.5)
    r_badge.bold = True
    r_badge.font.color.rgb = RGBColor(56, 189, 248) # Sky blue
    
    p_main = c_title.add_paragraph()
    p_main.paragraph_format.space_after = Pt(4)
    r_main = p_main.add_run("คู่มือการใช้งานระบบแฟ้มสะสมผลงานออนไลน์\n(PFS - Portfolio & Resume System)")
    r_main.font.name = "TH Sarabun New"
    r_main.font.size = Pt(22)
    r_main.bold = True
    r_main.font.color.rgb = RGBColor(255, 255, 255)
    
    p_sub = c_title.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(0)
    r_sub = p_sub.add_run("คู่มือฉบับเข้าใจง่ายทีละขั้นตอน พร้อมภาพถ่ายหน้าจอระบบจริง (Real Screenshots)\nสำหรับนักศึกษา, อาจารย์ที่ปรึกษา, ฝ่ายทะเบียน และผู้ใช้งานทั่วไป")
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
        "คือ เว็บไซต์ที่ช่วยให้นักศึกษาสามารถจัดทำ เรซูเม่ (Resume) และ แฟ้มสะสมผลงาน (Portfolio) รูปแบบดิจิทัลได้อย่างสวยงาม รวดเร็ว และเป็นมืออาชีพ ผ่านหน้าจอเว็บเบราว์เซอร์ โดยไม่ต้องมีความรู้ด้านการเขียนโค้ด ไม่ต้องติดตั้งโปรแกรมลงในคอมพิวเตอร์ และไม่ต้องเสียเวลาจัดหน้าใน Word หรือ Photoshop ให้ยุ่งยาก",
        bold_prefix="ระบบ PFS (Portfolio System) "
    )
    
    add_paragraph_styled(
        doc,
        "เมื่อนักศึกษากรอกข้อมูลและตกแต่งเสร็จเรียบร้อย ระบบจะออก ลิงก์ผลงานส่วนบุคคล (Public URL เช่น https://portfolio.pfs.local/r/somchai-portfolio) ให้นักศึกษาสามารถคัดลอกนำไปส่งให้อาจารย์ที่ปรึกษาตรวจ หรือแนบในอีเมลสมัครงานกับบริษัทชั้นนำได้ทันที"
    )
    
    add_heading_styled(doc, "👥 ใครใช้งานระบบนี้บ้าง? (3 บทบาทหลัก)", level=2)
    
    role_tbl = doc.add_table(rows=4, cols=3)
    role_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(role_tbl)
    
    headers = ["บทบาทผู้ใช้งาน", "ใครคือผู้ใช้?", "หน้าที่และการทำงานในระบบ"]
    for j, h_text in enumerate(headers):
        c = role_tbl.cell(0, j)
        set_cell_background(c, "1E3A8A") # Dark blue
        set_cell_margins(c, 120, 120, 160, 160)
        p = c.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.bold = True
        r.font.name = "TH Sarabun New"
        r.font.size = Pt(11.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    roles_data = [
        ("🎓 นักศึกษา (Student)", "นักศึกษาทุกคนในสาขาวิชา", "• เข้าสู่ระบบด้วยรหัสนักศึกษา\n• เลือกเทมเพลตเรซูเม่สวยงามในคลิกเดียว\n• กรอกประวัติ ทักษะ และผลงานโครงงาน\n• ปรับแต่งสี ขนาดการ์ด และรูปแบบฟอนต์\n• บันทึกแบบร่าง และกดเผยแพร่เพื่อรับลิงก์แชร์"),
        ("🛡️ อาจารย์ / ผู้ดูแล (Admin)", "อาจารย์ที่ปรึกษา, ฝ่ายทะเบียน", "• ดูสถิติรวมของนักศึกษาทั้งรุ่น\n• เปิดตรวจผลงานของนักศึกษาเป็นรายคน\n• ฟังก์ชันพิเศษ: ตรวจงานแบบร่างที่ยังไม่เสร็จได้\n• เพิ่มรายชื่อนักศึกษาใหม่เข้าระบบ\n• กดรีเซ็ตรหัสผ่านให้นักศึกษาที่ลืมรหัส"),
        ("🌐 ผู้เข้าชม / บริษัท (Visitor)", "บริษัทรับสมัครงาน, กรรมการ, เพื่อน", "• เปิดชมหน้าเว็บผลงานของนักศึกษาผ่านลิงก์\n• เปิดดูได้ทันทีโดยไม่ต้องลงทะเบียนหรือล็อกอิน\n• รองรับทั้งคอมพิวเตอร์ แท็บเล็ต และสมาร์ตโฟน")
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
    # SECTION 1: การเข้าสู่ระบบ (LOGIN)
    # -------------------------------------------------------------
    add_heading_styled(doc, "🚀 บทที่ 1: การเข้าสู่ระบบครั้งแรก (Login)", level=1)
    
    add_paragraph_styled(
        doc,
        "ทุกครั้งที่ต้องการเริ่มใช้งานระบบ ให้เปิดโปรแกรมท่องเว็บ (Google Chrome, Microsoft Edge, หรือ Safari) แล้วเข้าไปที่หน้าเว็บของระบบ จากนั้นจะพบกับหน้าต่างเข้าสู่ระบบดังภาพด้านล่าง:"
    )
    
    add_screenshot_box(
        doc,
        f"{REAL_IMG_DIR}/01-real-login.png",
        "ภาพที่ 1: หน้าต่างเข้าสู่ระบบจริง (PFS Secure Login Screen)"
    )
    
    add_heading_styled(doc, "📌 คำอธิบายจุดสำคัญในการเข้าสู่ระบบ:", level=2)
    
    add_bullet_styled(
        doc,
        "สำหรับ นักศึกษา ให้พิมพ์ รหัสนักศึกษา 8 หลัก (เช่น 65010001) หรืออีเมลที่ลงทะเบียนไว้ / สำหรับ อาจารย์และผู้ดูแล ให้พิมพ์อีเมลประจำตำแหน่ง (เช่น admin@pfs.local)",
        bold_prefix="[1] ช่องระบุตัวตน (Username / Email): "
    )
    add_bullet_styled(
        doc,
        "พิมพ์รหัสผ่านส่วนตัวของท่าน (สำหรับการเข้าใช้งานครั้งแรก ระบบอาจตั้งรหัสผ่านเริ่มต้นเป็นรหัสนักศึกษา)",
        bold_prefix="[2] ช่องรหัสผ่าน (Password): "
    )
    add_bullet_styled(
        doc,
        "เมื่อกรอกข้อมูลครบถ้วนแล้ว ให้คลิกปุ่มสีน้ำเงินนี้เพื่อเข้าสู่ระบบ",
        bold_prefix="[3] ปุ่มเข้าสู่ระบบ (Sign In): "
    )
    add_bullet_styled(
        doc,
        "ระบบได้รับการออกแบบให้แยกหน้าจอให้อัตโนมัติ หากล็อกอินด้วยบัญชีนักศึกษาจะพาไปหน้าแดชบอร์ดนักศึกษาทันที ส่วนอาจารย์จะพาไปที่ศูนย์ควบคุมผู้ดูแล",
        bold_prefix="[4] การนำทางอัตโนมัติ (Role-based Redirection): "
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
        "ภาพที่ 2: หน้าแดชบอร์ดส่วนตัวของนักศึกษา (Student Dashboard)"
    )
    
    add_heading_styled(doc, "📌 4 จุดสำคัญบนหน้าแดชบอร์ดที่ต้องทราบ:", level=3)
    
    add_bullet_styled(
        doc,
        "คลิกปุ่มสีน้ำเงินนี้เพื่อเปิดสตูดิโอสำหรับพิมพ์ข้อมูล ใส่รูปภาพ และจัดหน้าเรซูเม่",
        bold_prefix="1. ปุ่ม \"เข้าสู่สตูดิโอออกแบบ (Edit Canvas)\": "
    )
    add_bullet_styled(
        doc,
        "แสดงว่าผลงานของท่านอยู่ในสถานะ 'เผยแพร่แล้ว (Published)' หรือ 'แบบร่าง (Draft)' พร้อมแถบแสดงเปอร์เซ็นต์ความสมบูรณ์ของเนื้อหา ช่วยเตือนว่าใส่ข้อมูลครบทุกหมวดหรือยัง",
        bold_prefix="2. การ์ดสรุปสถานะผลงาน: "
    )
    add_bullet_styled(
        doc,
        "แสดง URL ประจำตัวของท่าน พร้อมปุ่ม 'คัดลอกลิงก์' สีเขียว เพียงคลิกเดียวก็สามารถนำลิงก์ไปส่งให้อาจารย์ทางแชต หรือแนบในอีเมลสมัครงานได้ทันที",
        bold_prefix="3. กล่องลิงก์แชร์ผลงานสาธารณะ (Public URL): "
    )
    add_bullet_styled(
        doc,
        "มีเมนูสำหรับตรวจสอบและแก้ไขชื่อ-นามสกุล อีเมล และเมนูสำหรับเปลี่ยนรหัสผ่านใหม่",
        bold_prefix="4. เมนูจัดการบัญชีผู้ใช้งาน: "
    )

    add_paragraph_styled(doc, "")

    # 2.2 Studio Canvas Editor
    add_heading_styled(doc, "2.2 สตูดิโอออกแบบผลงาน (Studio Grid Canvas Editor)", level=2)
    
    add_paragraph_styled(
        doc,
        "เมื่อคลิกปุ่ม 'เข้าสู่สตูดิโอออกแบบ' ท่านจะพบกับหน้าจอออกแบบและจัดหน้าเรซูเม่ ซึ่งออกแบบมาให้ใช้งานง่ายเหมือนการจัดวางบล็อกเลโก้ โดยแบ่งพื้นที่ออกเป็น 3 โซนหลัก:"
    )
    
    add_screenshot_box(
        doc,
        f"{REAL_IMG_DIR}/03-real-studio-editor.png",
        "ภาพที่ 3: สตูดิโอออกแบบ Portfolio แบบกริด (Studio Grid Canvas Editor)"
    )
    
    add_heading_styled(doc, "📌 โครงสร้าง 3 โซนทำงานในสตูดิโอ:", level=3)
    
    add_bullet_styled(
        doc,
        "รวบรวมหมวดหมู่ข้อมูลที่จำเป็นสำหรับเรซูเม่ไว้ครบครัน เช่น ข้อมูลส่วนตัว (Profile), แนะนำตัว (About Me), ทักษะคอมพิวเตอร์ (Skills), โครงงานเด่น (Projects), ประสบการณ์ (Experience), รางวัล (Certificates) เพียงคลิกที่บล็อกที่ต้องการ การ์ดนั้นจะถูกวางลงบนหน้าเว็บทันที",
        bold_prefix="[1] คลังบล็อกเนื้อหา (Blocks Library - ฝั่งซ้าย): "
    )
    add_bullet_styled(
        doc,
        "แสดงผลงานจริงตามตำแหน่งที่จะแสดงให้คนภายนอกเห็น ท่านสามารถคลิกเลือกการ์ดใดการ์ดหนึ่งเพื่อแก้ไขเนื้อหาหรือจัดตำแหน่งได้อย่างอิสระ",
        bold_prefix="[2] ผืนผ้าใบจัดวาง (Canvas - โซนตรงกลาง): "
    )
    add_bullet_styled(
        doc,
        "เมื่อคลิกที่การ์ดใดๆ หน้าต่างด้านขวาจะเปิดขึ้นมาเพื่อให้ท่าน: พิมพ์ข้อความ, เลือกเปลี่ยนฟอนต์ตัวอักษร, ปรับขนาดความกว้างของการ์ด (เต็มหน้าจอ หรือ ครึ่งหน้าจอวางคู่กัน), หรือกดปุ่มถังขยะสีแดงเพื่อลบการ์ดที่ไม่ต้องการออก",
        bold_prefix="[3] แผงปรับแต่งรายละเอียด (Property Inspector - ฝั่งขวา): "
    )
    add_bullet_styled(
        doc,
        "ด้านบนสุดมีเมนู 'เลือกเทมเพลตสำเร็จรูป' ให้เปลี่ยนสไตล์เรซูเม่ได้ในคลิกเดียว พร้อมปุ่ม 'บันทึกฉบับร่าง' (สีส้ม) และปุ่ม 'เผยแพร่' (สีเขียว)",
        bold_prefix="[4] แถบคำสั่งด้านบน (Command Bar): "
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
        text="หลังจากแต่งหน้าตาเรซูเม่เสร็จแล้ว หากนักศึกษาคลิกเฉพาะปุ่ม 'บันทึกฉบับร่าง' แต่ลืมคลิกปุ่ม 'เผยแพร่ (Publish)' สีเขียว อาจารย์หรือบริษัทที่ได้รับลิงก์จะไม่สามารถเปิดดูผลงานได้ ดังนั้นเมื่อทำงานเสร็จทุกครั้ง ต้องมั่นใจว่าได้กดปุ่มเผยแพร่แล้วนะครับ",
        style="important"
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 3: อาจารย์และผู้ดูแลระบบ (ADMIN GUIDE)
    # -------------------------------------------------------------
    add_heading_styled(doc, "🛡️ บทที่ 3: คู่มือสำหรับ \"อาจารย์และผู้ดูแลระบบ\" (Admin Guide)", level=1)
    
    add_paragraph_styled(
        doc,
        "สำหรับอาจารย์ที่ปรึกษา หัวหน้าสาขาวิชา หรือเจ้าหน้าที่ดูแลระบบ หน้าต่างศูนย์ควบคุมผู้ดูแลระบบ (Admin Dashboard) คือศูนย์กลางในการติดตามความคืบหน้า ตรวจผลงาน และบริหารจัดการผู้ใช้งานทั้งหลักสูตร:"
    )
    
    add_screenshot_box(
        doc,
        f"{REAL_IMG_DIR}/04-real-admin-dashboard.png",
        "ภาพที่ 4: หน้าศูนย์ควบคุมผู้ดูแลระบบและตรวจงาน (Admin Dashboard)"
    )
    
    add_heading_styled(doc, "📌 4 ฟังก์ชันหลักในการบริหารและตรวจงาน:", level=2)
    
    add_bullet_styled(
        doc,
        "แสดงจำนวนนักศึกษาทั้งหมดในระบบ, จำนวนคนที่เผยแพร่ผลงานแล้ว (Published), จำนวนคนที่อยู่ระหว่างทำ (Draft), และคนที่ยังไม่เริ่มทำ ช่วยให้อาจารย์ทราบภาพรวมความคืบหน้าของรุ่นได้ในทันที",
        bold_prefix="1. แถบสรุปสถิติภาพรวม (Overview Metrics): "
    )
    add_bullet_styled(
        doc,
        "อาจารย์สามารถพิมพ์รหัสนักศึกษา หรือชื่อ-นามสกุล เพื่อค้นหานักศึกษาที่ต้องการได้อย่างรวดเร็ว พร้อมตัวกรองเลือกดูเฉพาะคนที่ยังส่งงานไม่เรียบร้อย",
        bold_prefix="2. ช่องค้นหาและตัวกรองสถานะ (Search & Filter): "
    )
    add_bullet_styled(
        doc,
        "ใช้เมื่อมีนักศึกษาลงทะเบียนเพิ่มในเทอม เพียงคลิกปุ่มสีม่วงนี้ แล้วกรอกรหัสนักศึกษา ชื่อ และอีเมล ระบบจะเปิดบัญชีเริ่มต้นให้ทันที",
        bold_prefix="3. ปุ่มเพิ่มนักศึกษาใหม่ (+ Add Student): "
    )
    add_bullet_styled(
        doc,
        "ในแต่ละแถวของนักศึกษา จะมีปุ่มสั่งการ 4 รูปแบบ:\n"
        "   • ปุ่ม 'เปิดดู >' (สีน้ำเงิน): คลิกเพื่อเปิดดูเรซูเม่หน้าจริงแบบที่คนภายนอกเห็น\n"
        "   • ปุ่ม 'ตรวจแบบร่าง 🔍' (สีส้ม): ฟังก์ชันพิเศษสำหรับอาจารย์ สามารถคลิกเข้าไปตรวจดูความคืบหน้าของนักศึกษาที่ยังทำไม่เสร็จได้ แม้ว่านักศึกษาจะยังไม่ได้กดเผยแพร่ก็ตาม\n"
        "   • ปุ่ม 'แก้ไข': ปรับปรุงข้อมูลส่วนตัว เช่น เปลี่ยนชื่อ หรือแก้ไขอีเมล\n"
        "   • ปุ่ม 'รีเซ็ต': ใช้ตั้งรหัสผ่านใหม่ให้นักศึกษาในกรณีที่นักศึกษาลืมรหัสผ่าน",
        bold_prefix="4. ปุ่มปฏิบัติการในตาราง (Action Buttons): "
    )

    add_paragraph_styled(doc, "")

    # -------------------------------------------------------------
    # SECTION 4: ผู้เข้าชมภายนอกและนายจ้าง (VISITOR GUIDE)
    # -------------------------------------------------------------
    add_heading_styled(doc, "🌐 บทที่ 4: สำหรับ \"ผู้เข้าชมภายนอกและนายจ้าง\" (Visitor & Employer)", level=1)
    
    add_paragraph_styled(
        doc,
        "บุคคลภายนอก เช่น กรรมการประเมินหลักสูตร, ฝ่ายบุคคล (HR), หรือผู้บริหารบริษัทไอที สามารถเปิดรับชมผลงานของนักศึกษาได้ 2 รูปแบบ:"
    )
    
    add_screenshot_box(
        doc,
        f"{REAL_IMG_DIR}/05-real-public-dashboard.png",
        "ภาพที่ 5: หน้าทำเนียบผลงานนักศึกษาสาธารณะ (Public Portfolio Showcase)"
    )
    
    add_bullet_styled(
        doc,
        "เปิดชมจากลิงก์เฉพาะของนักศึกษาที่แนบมาในใบสมัครงาน (เช่น /r/somchai-portfolio) ซึ่งจะเปิดตรงเข้าสู่หน้าเรซูเม่ของนักศึกษาคนนั้นทันที",
        bold_prefix="รูปแบบที่ 1: เข้าชมผ่านลิงก์ตรง (Direct Portfolio Link) — "
    )
    add_bullet_styled(
        doc,
        "เข้าชมที่หน้าทำเนียบรวม (/dashboard) เพื่อค้นหาและเลือกชมผลงานของนักศึกษาทุกคนในสาขาที่เปิดเผยแพร่สาธารณะ สามารถค้นหาตามชื่อ หรือทักษะที่สนใจได้",
        bold_prefix="รูปแบบที่ 2: เข้าชมผ่านทำเนียบผลงานรวม (Public Showcase) — "
    )
    add_bullet_styled(
        doc,
        "ระบบจัดหน้าตาแบบ Responsive Layout ทำให้อ่านง่าย ชัดเจน ทั้งบนคอมพิวเตอร์ แท็บเล็ต และสมาร์ตโฟน โดยไม่ต้องลงแอปพลิเคชันเพิ่มเติม",
        bold_prefix="รูปแบบที่ 3: ความพร้อมในการเปิดบนทุกอุปกรณ์ — "
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
