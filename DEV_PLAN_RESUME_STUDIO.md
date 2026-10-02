# Development Plan: Resume Canvas Studio

สำหรับ GPT6-sol / reasoning medium
สถานะ: แผนพัฒนา ยังไม่ได้ลงมือแก้ระบบตามแผนนี้
วันที่: 28 กันยายน 2026

## 1. เป้าหมายและขอบเขต

พัฒนาระบบเดิมให้เป็นโปรเจ็กจบที่เดโมได้โดดเด่น: นักศึกษาสร้าง Resume บนกระดาษด้วยการลากวาง ปรับแต่งแต่ละบล็อกได้จริง เห็นผลทันที บันทึกแล้วเปิดกลับมาเหมือนเดิม และแชร์ผลงานให้อาจารย์ตรวจได้

ความรู้สึกเป้าหมาย: เครื่องมือออกแบบที่เรียบง่าย ใช้งานคล่อง คล้าย Figma ในการเลือก ย้าย ย่อขยาย และจัดเลเยอร์ แต่มีขอบเขตเฉพาะ Resume

**ขอบเขตที่ผู้ใช้ยืนยันล่าสุด:** เป็นโปรเจ็กจบ เน้นการทำงานและประสบการณ์เดโม ไม่ใช่งาน production hardening

- ใช้ Next.js, React, MongoDB และ Docker Compose ที่มีอยู่
- ไม่เปลี่ยนการติดตั้ง MongoDB, credentials, network, collections หรือระบบ login/roles
- ไม่ทำ SEO, cloud deployment, backup, session redesign หรือ dependency security upgrade เป็นงานแทรก
- แก้ API/TypeScript เฉพาะที่จำเป็นต่อการบันทึกการออกแบบและป้องกันข้อมูลหายได้ ใช้เอกสาร Resume เดิม เพิ่ม optional fields ได้โดยไม่ทำ bulk migration ฐานข้อมูลจริง
- คงหน้า Student/Admin และเส้นทางเดิม โดยให้การแสดง Resume ใช้องค์ประกอบร่วมกัน
- โฟกัส A4 แนวตั้งหนึ่งหน้าในรอบหลัก ข้อมูลต้องไม่ถูกตัดหายเพื่อให้ลงหนึ่งหน้า
- Desktop เป็นพื้นที่ออกแบบหลัก; มือถือดู Resume ได้ครบ และแก้เนื้อหา/Properties ผ่านแผงที่เปิดปิดได้ ไม่ต้องจำลอง Figma เต็มรูปแบบบนมือถือ

## 2. สิ่งที่ต้องโชว์ให้ได้

| ความสามารถ | สิ่งที่กรรมการเห็น |
|---|---|
| วางลงบนกระดาษ | ลากข้อความ รูปภาพ หรือหมวดประวัติไปยังตำแหน่งที่ปล่อยเมาส์จริง |
| ย้ายและย่อขยาย | เลือกบล็อกแล้วมีกรอบและจุดจับ ย้าย/ปรับขนาดได้ทันที |
| Properties ที่มีผลจริง | เปลี่ยนสี ฟอนต์ ขนาด แนวข้อความ และรูปเฉพาะบล็อก โดยบล็อกอื่นไม่เปลี่ยน |
| จัดหน้าอย่างแม่นยำ | Zoom, Fit, snap grid, เส้นช่วยจัดแนว และตำแหน่ง X/Y/W/H |
| Layers และ Undo | เลือก ซ่อน ล็อก คัดลอก ลบ จัดหน้า/หลัง และย้อนกลับได้ |
| เทมเพลตใช้ได้จริง | เลือกรูปแบบเริ่มต้นที่แตกต่างกันชัดเจน ข้อมูลเดิมยังอยู่ครบ |
| ผลลัพธ์ตรงกัน | หน้าออกแบบ Preview หน้าแชร์ Admin Preview และ PDF ใช้ layout เดียวกัน |

ความสามารถหลักทั้งหมดต้องทำงานจริง ห้ามเพิ่มปุ่มตกแต่งหรือปุ่มที่กดแล้วไม่มีผลเพื่อให้หน้าดูครบ

## 3. อ่านโค้ดก่อนเริ่ม

Workspace: `/Users/surachartlimrattanaphun/Desktop/PFS`

| ไฟล์ | สิ่งที่ต้องเข้าใจ |
|---|---|
| `components/StudentEditor.tsx` | state, save/publish/unpublish, Asset library และ Properties ปัจจุบัน |
| `components/ResumeRenderer.tsx` | renderer ที่ editor/public/admin ใช้จริง แต่ไม่อ่าน Properties หลายค่า |
| `components/PortfolioRenderer.tsx` | renderer เก่า ห้ามเข้าใจว่าแก้ไฟล์นี้แล้วหน้าปัจจุบันจะเปลี่ยน |
| `components/TemplateGallery.tsx` | gallery และ template IDs เดิม |
| `lib/types.ts` | มี section.frame, settings, columns, gridPlacement อยู่แล้ว |
| `lib/portfolio.ts` | default document, serialize, sanitize และ applyTemplate |
| `app/api/portfolio/me/route.ts` | allowed settings และเส้นทางบันทึก |
| `app/api/portfolio/me/publish/route.ts` | เปลี่ยนสถานะเผยแพร่ |
| `app/api/portfolio/me/unpublish/route.ts` | เปลี่ยนสถานะปิดเผยแพร่ |
| `app/p/[slug]/page.tsx`, `app/r/[slug]/page.tsx` | หน้า Resume สาธารณะ |
| `app/admin/preview/[userId]/page.tsx` | หน้าอาจารย์ตรวจผลงาน |
| `app/globals.css` | CSS เดิมมีหลายรุ่นซ้อนกัน ต้องจำกัด selector ของ editor ใหม่ |
| `deliverables/system-audit-2026-09-28/REPORT.md` | หลักฐานปัญหาที่ต้องแก้ เน้น F01-F04, F09-F14 |

`frame` ที่เห็นใน response ไม่ได้แปลว่าข้อมูลเดิมใช้ free-position อยู่จริง เพราะ serializer เติมค่า frame อัตโนมัติอยู่แล้ว ต้องตรวจต้นทางและใช้ version marker ให้ชัดเจน

## 4. การตัดสินใจทางเทคนิค

### 4.1 Document และ Renderer เดียวกัน

- ใช้พิกัดเอกสารมาตรฐาน `794 x 1123` ตาม `documentSize` เดิม หน่วยเป็น document px
- เก็บตำแหน่งจริงใน `section.frame`: x, y, width, height, zIndex, locked
- การ zoom เปลี่ยนเฉพาะการแสดงผล ไม่แก้ค่าพิกัดที่บันทึก
- เพิ่ม optional `layoutVersion: 1` ระดับ Portfolio เพื่อบอกเอกสารรูปแบบใหม่ Update type, API, serializer และ adapter ให้ครบ
- เอกสารที่ไม่มี version ให้แปลงผ่าน adapter แบบ deterministic จาก layout/template/order เดิม โดยคง id, content, visibility และค่าที่ผู้ใช้ตั้งไว้ ไม่เขียนข้อมูลจริงระหว่างการอ่าน
- เมื่อผู้ใช้บันทึกจึงเก็บ version และ frame ใหม่ลง document เดิม
- หลังแปลงแล้ว renderer ใช้ frame เป็นแหล่งตำแหน่งเดียว ไม่สลับระหว่าง template, gridPlacement และ frame ตามหน้าที่เปิด
- ให้ `ResumeRenderer` เป็นจุดเข้า renderer กลาง และแยก `ResumeSection` สำหรับ body/items/image/styles; editor ครอบด้วย selection/resize controls ส่วน public/admin/print ไม่มี controls
- อย่านำอาการเก่าที่ข้อความติดต่อหรือรูปหายไปใส่ adapter ต้องรักษาข้อมูลที่บันทึกไว้ แม้ renderer เดิมเคยไม่แสดง

### 4.2 ขอบเขตบล็อกและ Properties

- รักษาบล็อกเดิมทั้งหมด: profile, about, education, skills, projects, experience, certificates, contact, custom
- เพิ่ม Asset ข้อความและรูปภาพอิสระ โดยใช้ custom section ร่วมกับ optional `settings.contentMode: section | text | image` เพื่อไม่ต้องเพิ่มโมเดลข้อมูลอีกชุด
- text mode ไม่มีหัวข้อ/placeholder ของ section หากผู้ใช้ไม่ได้เลือกให้แสดง; image mode แสดงภาพอย่างเดียวพร้อมคำอธิบายภาพใน Properties
- ภายในบล็อกใช้ `columns: 1 | 2` สำหรับเนื้อหา/รายการ และ `imagePosition` สำหรับภาพกับข้อความ ให้แต่ละ field มีหน้าที่แน่นอน
- คอลัมน์ระดับหน้าคือการวาง frame เช่น 30/70 หรือ 50/50 จาก preset ไม่ใช่ nested drag-and-drop container
- Typography ของบล็อกเพิ่ม optional fields ใน settings เท่าที่ต้องใช้: fontFamily, fontSize, fontWeight, textColor, lineHeight; ถ้าไม่ได้กำหนดให้สืบทอดจาก document
- สี accent/background ที่มีอยู่ยังเป็นค่ารายบล็อก เปลี่ยนสีหลักของ document ต้องไม่เขียนทับสีที่ผู้ใช้ตั้งเอง
- รวม font list, defaults, numeric bounds และ style options เป็นค่ากลางที่ frontend/backend ใช้ร่วมกัน
- รูปใช้วิธีอัปโหลดเดิม เพิ่ม fit แบบ cover/contain และลบรูปได้ ไม่เพิ่มบริการ storage ใหม่
- ตรวจขนาดภาพให้สอดคล้องหลังแปลง base64; ห้ามตัด data URL ด้วย slice จนภาพเสีย หากเกินขนาดต้องแจ้งให้ผู้ใช้ทราบก่อนบันทึก

### 4.3 Drag, Resize และ State

- ใช้ `react-rnd` สำหรับ drag/resize ภายใน document ตรวจเวอร์ชันที่เข้ากับ React ใน repo และ lock dependency ให้แน่นอนก่อนใช้
- ไลบรารีมี controlled position/size, bounds, grid และ scale สำหรับพื้นที่ที่ zoom: [เอกสารต้นทาง](https://github.com/bokuweb/react-rnd)
- เลือกไลบรารีเดียวสำหรับ drag/resize ไม่ซ้อนหลาย engine; Asset drag จาก sidebar ใช้ของเดิมได้ และมี click-to-add เป็นทางเลือก
- แปลง pointer เป็นพิกัด document ด้วย bounding rect และ scale จริง ห้ามหัก scroll offset ซ้ำ
- ใช้ reducer/hook กลางสำหรับ document mutations และ history แยกจาก selection, zoom และ hover state
- History สูงสุดประมาณ 50 actions; drag หนึ่งครั้งหรือ resize หนึ่งครั้งเป็นหนึ่ง action; ข้อความให้รวมเป็นกลุ่มตามช่วงพิมพ์
- ไม่สร้าง snapshot รูป base64 ซ้ำด้วย JSON stringify/parse ทุก pointer move ใช้ immutable updates ที่แชร์ข้อมูลไม่เปลี่ยน
- จัดคำสั่ง save เป็นคิวเดียว และแยก revision ฝั่ง client สำหรับป้องกัน response เก่าแทนค่าที่เพิ่งแก้

โครงสร้างแนะนำ ไม่ต้องสร้างไฟล์ว่างล่วงหน้า:

```text
components/StudentEditor.tsx       ตัวประกอบหน้าหลัก
components/ResumeRenderer.tsx      renderer ร่วม
components/editor/EditorToolbar.tsx
components/editor/AssetPanel.tsx
components/editor/LayersPanel.tsx
components/editor/DocumentCanvas.tsx
components/editor/SelectionFrame.tsx
components/editor/PropertiesPanel.tsx
components/resume/ResumeSection.tsx
hooks/useResumeEditor.ts
hooks/useResumeSave.ts
lib/resume-document.ts            geometry, adapter, validation แบบ pure
lib/resume-options.ts             fonts, defaults, bounds
```

สร้าง abstraction เมื่อมีหน้าที่จริง และอย่าแยกไฟล์เพิ่มนอกขอบเขตโดยไม่มีเหตุผล

## 5. แผนพัฒนาทีละ Phase

ทำตามลำดับด้านล่าง ไม่เริ่มการตกแต่งรอบสุดท้ายก่อน flow บันทึกและ renderer ทำงานครบ

### Phase 0: Baseline

งาน: อ่านไฟล์หลัก ตรวจ working tree เปิดหน้าเดิมและจดเส้นทาง API ใช้ข้อมูลทดสอบที่สร้างขึ้นเอง ไม่เขียนทับ Resume จริง สรุปสภาพโค้ดสั้น ๆ ก่อนเริ่ม

เสร็จเมื่อ: ระบุได้ว่าเส้นทาง editor/public/admin ใช้ renderer ใด และมีวิธีรันแอปสำหรับทดสอบ ใช้ Docker Compose เดิม ไม่จัดระบบฐานข้อมูลใหม่

### Phase 1: แก้ข้อมูลหายและทำให้บันทึกเชื่อถือได้

งาน:
- แก้ applyTemplate ให้รักษาบล็อกประเภทซ้ำทุก id และทุก content; จับคู่บล็อกที่ใช้แล้วด้วย id
- แก้ unpublish ให้ปรับสถานะอย่างเดียวโดยไม่แทน draft ที่กำลังแก้
- ทำ save/publish/unpublish มี loading/error/finally ครบ และป้องกันคำขอซ้อนที่ทำให้ข้อมูลย้อนหลัง
- คืนปุ่มลบบล็อกที่ใช้ได้จริงในหน้าปัจจุบัน และทำ duplicate ไม่ใช้ id ซ้ำ
- ใช้ font options ร่วมกัน ไม่ให้ฟอนต์ที่ UI เลือกได้ถูกเปลี่ยนกลับหลังบันทึก
- ตรวจ input ก่อน sanitize เช่น sections มี null, id ซ้ำ และค่าตัวเลขไม่เป็น finite; ตอบ 400/422 แทน 500 โดยไม่แก้ฐานข้อมูลเมื่อข้อมูลผิด

เกณฑ์ผ่าน:
- about/custom ประเภทซ้ำอย่างละสองรายการยังอยู่ครบหลังสลับ template และ reload
- เพิ่มบล็อกแล้ว unpublish ไม่ทำให้บล็อกหรือข้อความที่ยังไม่บันทึกหาย
- ทดสอบ save แบบ response ช้าแล้วพิมพ์เพิ่มระหว่างรอ ข้อความล่าสุดยังอยู่
- เพิ่ม/คัดลอก/ลบ/บันทึก/เปิดใหม่ได้ถูกต้อง

### Phase 2: เอกสารกลางและ Renderer กลาง

งาน:
- วาง data contract, layoutVersion, adapter และ settings defaults ตามข้อ 4
- ทำ renderer ที่แสดง body/items/image/title/visibility และ style ของทุกบล็อก
- เชื่อม editor, public, admin preview กับ renderer เดียวกัน
- แสดง contact.body และ contact.items ครบ ไม่ซ่อนข้อมูลเพราะเลือกเทมเพลตต่างกัน
- เตรียมการตรวจ content overflow; แสดงสัญญาณที่ editor และให้ผู้ใช้ขยายบล็อกหรือปรับข้อความ ไม่ตัดเนื้อหาเงียบ ๆ
- สร้าง history reducer พื้นฐานสำหรับคำสั่งเพิ่ม/แก้ไข/ย้าย/ลบ โดยยังไม่จำเป็นต้องมี UI history ครบ

เกณฑ์ผ่าน:
- ปรับสีแดงและพื้นเหลืองให้บล็อก A แล้วบล็อก B ไม่เปลี่ยน
- ภาพใน projects/custom/contact แสดงจริงหลัง save/reload ไม่ใช่เฉพาะภาพโปรไฟล์
- Preview และ public ให้ตำแหน่ง/ขนาด/รูปแบบเดียวกันเมื่อใช้ข้อมูลเดียวกัน
- เอกสารเดิมที่ไม่มี layoutVersion เปิดได้ และการอ่านไม่ได้เขียนข้อมูลเปลี่ยนใน DB

### Phase 3: Canvas แบบลากวางอิสระ

งาน:
- กระดาษ A4 กลางพื้นที่ทำงาน มี selection outline และ resize handles
- ลาก Asset ลงตำแหน่งเมาส์, ลากย้ายบล็อก, ปรับขนาดได้ พร้อม click-to-add
- คุมขอบเขตกระดาษและขนาดขั้นต่ำ; มี input X/Y/W/H สำหรับตำแหน่งละเอียด
- Zoom 50/75/100/125/150% และ Fit to viewport; Fit คำนวณจากพื้นที่จริงด้วย ResizeObserver
- Snap grid 8px เปิด/ปิดได้ และเส้นช่วยแนวกลาง/ขอบของหน้ากระดาษและบล็อกใกล้เคียง
- แยกการเลือกข้อความ/แก้ input ออกจากการลาก ให้ drag handle ชัดเจน
- พื้นที่ scroll/pan ไม่ดึงบล็อกตามโดยไม่ตั้งใจ

เกณฑ์ผ่าน:
- ปล่อยที่ตำแหน่งเดียวกันใน document ที่ zoom 50%, 100%, 150% ได้ x/y ต่างกันไม่เกิน 1 document px เมื่อปิด snap
- เปิด snap แล้วค่าตรง grid; resize และ bounds ทำงานเหมือนกันทุก zoom
- ตำแหน่ง/ขนาดที่บันทึกไม่เปลี่ยนหลัง reload และหน้า public วางตรงกัน
- ไม่พบการตัดเนื้อหาเพราะ canvas wrapper; Fit เห็นกระดาษครบและ zoom แล้วยังเลื่อนได้

### Phase 4: Properties, Layers และ Undo/Redo

งาน:
- Properties จัดกลุ่ม Content, Typography, Appearance, Layout โดยแสดงเฉพาะที่เหมาะกับชนิดบล็อก
- Font family/size/weight/line height/text color/alignment, accent/background, padding, radius, shadow ต้องมีผลทันที
- รูปอัปโหลด/เปลี่ยน/ลบ/cover/contain และรูปแบบภาพกับข้อความใช้งานได้
- รูปแบบรายการ list/chips/cards/timeline ทำงานจริง; bars/pills เดิมให้รองรับหรือ map อย่างชัดเจนใน adapter ไม่แสดงเปอร์เซ็นต์ทักษะที่ระบบแต่งขึ้นเอง
- Layers เลือกบล็อก ซ่อน/แสดง ล็อก/ปลดล็อก เปลี่ยนชื่อ จัดลำดับซ้อน คัดลอก ลบ
- Toolbar มี Undo/Redo; shortcuts Ctrl/Cmd+Z, Shift+Z, D, Delete และลูกศร 1px / Shift+ลูกศร 10px
- Shortcut ไม่ทำงานทับการพิมพ์ใน input, textarea, contenteditable หรือ dialog
- ล็อกแล้วเลือกผ่าน Layers ได้ แต่ย้าย/resize/ลบไม่ได้จนปลดล็อก

เกณฑ์ผ่าน:
- Undo แล้ว Redo คืนทั้งเนื้อหา รูป สี geometry และ id ได้ถูกต้อง ไม่เปลี่ยนสถานะ publish ตาม history
- ลากหนึ่งครั้ง Undo หนึ่งครั้งกลับตำแหน่งเดิม ไม่ต้องกดหลายร้อยครั้ง
- Hidden ไม่ปรากฏใน public/print; ยังเลือกและเปิดคืนจาก Layers ได้
- ลำดับ Layers และ zIndex สัมพันธ์กัน และบล็อกซ้อนกันยังเลือกผ่าน Layers ได้

### Phase 5: เทมเพลตที่น่าใช้และไม่ทำลายงาน

งาน:
- ทำ 3 เทมเพลตหลักให้ต่างกันจริง: Professional 30/70, Modern 50/50 และ Minimal หนึ่งคอลัมน์
- คง template IDs เดิมให้เปิดข้อมูลเก่าได้ ส่วน ID ที่ยังไม่มีรูปแบบใหม่เฉพาะให้แปลงเป็น preset หลักที่ประกาศชัดเจน ไม่แสดงเป็นเทมเพลตใหม่ซ้ำกันหกชื่อ
- Gallery มีตัวอย่างที่สร้างจาก renderer จริงและเนื้อหาตัวอย่างสมมติ
- การเลือก template เป็น action ใน draft ที่ Undo ได้ ไม่มีการ save/publish เงียบ ๆ
- ให้เลือกผลของการเปลี่ยนเป็น Layout only หรือ Layout + theme โดยรักษาข้อมูล รูป id และ visibility ทุกครั้ง
- Layout only รักษาสไตล์รายบล็อก ส่วน Layout + theme เปลี่ยนเฉพาะสไตล์ตามเจตนาที่ผู้ใช้เลือก
- บล็อกเพิ่มเติมต้องจัดวางให้เห็นได้ ไม่ทิ้งหรือซ่อน ถ้าพื้นที่ไม่พอให้แจ้งและคง layout เดิมทั้งชุด แทนการ apply บางส่วน

เกณฑ์ผ่าน:
- เดโมสาม template ได้ต่างกันชัดเจนด้วยเนื้อหาชุดเดียว
- บล็อกประเภทซ้ำ รูปภาพ และข้อความติดต่อครบทุก template
- ใช้ template แล้ว Undo กลับ layout ก่อนหน้าได้ครบ
- เนื้อหายาวไม่ถูกตัดให้สั้นลงเพื่อให้ fit template

### Phase 6: Autosave, Preview, Publish และ PDF

งาน:
- Autosave หลังหยุดแก้ประมาณ 1 วินาที พร้อมสถานะ ยังไม่บันทึก / กำลังบันทึก / บันทึกแล้ว / บันทึกไม่สำเร็จ
- ไม่ยิง save ทุก pointer move ให้เริ่มหลังจบ drag/resize หรือชุดการพิมพ์
- คิว save ครั้งละหนึ่งคำขอ ส่ง snapshot ที่มี revision; ถ้ามีการแก้ใหม่ระหว่างรอให้เก็บไว้และส่งรอบต่อไป ห้าม response เก่าทับ draft
- save ล้มเหลวต้องคงข้อมูลใน memory และแสดง Retry; เตือนก่อนออกจากหน้าหากมีข้อมูลที่ยังไม่บันทึก ไม่เพิ่มระบบ offline sync เต็มรูปแบบ
- ปุ่มบันทึกเอง flush queue; publish ต้องรอ snapshot ล่าสุดบันทึกสำเร็จก่อนเสมอ
- ระหว่าง publish/unpublish ป้องกันการกดซ้ำ แต่ไม่ทิ้งการแก้ไขใหม่หลัง snapshot
- Preview เปิดมุมมองอ่านอย่างเดียวจาก draft ปัจจุบัน ไม่ต้อง publish เพื่อดู
- หน้าแชร์ใช้ renderer เดียวกัน มี Copy link พร้อมผลสำเร็จ/ล้มเหลวจริง
- คง semantics เดิม: เมื่อสถานะ published การบันทึกที่สำเร็จเปลี่ยนหน้า public ด้วย เพราะระบบมี document เดียว ไม่เพิ่ม published snapshot หรือ workflow approval ใหม่
- Export PDF รอบหลักใช้ browser print / Save as PDF, กระดาษ A4 210x297mm, ซ่อน toolbar/grid/selection และรอ fonts/images พร้อมก่อนเปิด print
- ชื่อปุ่มต้องสื่อว่าเปิดหน้าพิมพ์เพื่อบันทึก PDF ไม่อ้างว่า download PDF อัตโนมัติ
- ห้ามบล็อกการบันทึก draft เพราะ content overflow; แสดงรายการบล็อกที่ล้นและนำทางไปแก้ ก่อน export ให้ผู้ใช้จัดให้ลงหน้าครบ

เกณฑ์ผ่าน:
- หน่วง response แล้วแก้เพิ่ม 3 ครั้ง ข้อมูลสุดท้ายใน DB ตรงกับ editor
- จำลอง save ล้มเหลวแล้ว Retry ข้อมูลครบ Publish ไม่แสดงสำเร็จหาก save ไม่สำเร็จ
- ปิดเผยแพร่ขณะที่มี draft changes แล้ว draft ยังอยู่ และ URL public ปิดจริง
- Reload หลังสถานะบันทึกแล้วได้ข้อมูลเดิมครบ
- PDF จากข้อมูลตัวอย่างที่ fit หนึ่งหน้าได้หนึ่งหน้า ไม่มีแถบเครื่องมือ ตัวอักษรไทยและรูปครบ ไม่ได้เป็น screenshot ของทั้งหน้าจอ

### Phase 7: เก็บ UI, ทดสอบจริง และเตรียมเดโม

งาน:
- จัด workspace เรียบง่าย: toolbar ด้านบน, Assets/Layers ซ้าย, document กลาง, Properties ขวา
- ใช้สีพื้นขาว/เทาและ accent พอเหมาะ ลดหัวข้อใหญ่และพื้นที่อธิบายใน editor ให้ความสำคัญกับกระดาษ
- ใช้ lucide-react เดิมสำหรับเครื่องมือ มี tooltip, accessible labels, focus และสถานะ disabled ที่ชัดเจน
- Mobile ใช้ drawer/sheet ของ Assets/Properties และ fit document ไม่วางสามพาเนลยาวต่อกันจนต้องเลื่อนหาของ
- ภาพ/ตัวอย่างต้องเป็นเนื้อหา Resume ที่ดูได้จริง ใช้ภาพของผู้ใช้หรือภาพตัวอย่างที่อยู่ใน repo ไม่ใส่ illustration ที่ไม่เกี่ยวข้องในพื้นที่ทำงาน
- ตรวจและแก้ CSS เฉพาะ surface ที่แตะ ไม่ล้าง globals.css ทั้งไฟล์โดยไม่มีแผน
- ตรวจ browser ที่ 1440x900, 1280x800 และ 390x844 ทั้ง editor และ public
- เพิ่ม regression tests ที่เรียกฟังก์ชันจริง/API จริง ไม่คัดลอก implementation มาทดสอบในไฟล์ test
- ตรวจ build และ Docker Compose build/run ด้วย config เดิม; ถ้าต้องใช้ server เพิ่มเลือกพอร์ตว่างและแจ้ง URL
- Update README เฉพาะ flow/ปุ่มที่มีจริง และทำ demo script สั้น ๆ

เกณฑ์ผ่าน: Acceptance checklist ด้านล่างผ่านทั้งหมด ไม่มีหน้าจอค้าง ไม่มีข้อมูลหายระหว่าง flow เดโม และไม่มีปุ่มที่ยังไม่ทำงานแต่ดูเหมือนพร้อมใช้งาน

## 6. Acceptance Checklist

ทุกข้อเริ่มเป็นยังไม่ทดสอบ ผู้พัฒนาต้องเปลี่ยนสถานะพร้อมหลักฐานทีละข้อ

- [ ] A01 Login Student/Admin และแยกสิทธิ์เดิมยังทำงาน
- [ ] A02 เปิด Resume เดิมโดยไม่ทำเนื้อหาหายและไม่เขียน DB ระหว่างอ่าน
- [ ] A03 Drag Asset ลงตำแหน่งปล่อยเมาส์จริง
- [ ] A04 ย้าย/resize/bounds ถูกต้องที่ zoom 50%, 100%, 150%
- [ ] A05 สี รูป ฟอนต์ แนวข้อความแยกรายบล็อก ไม่กระทบบล็อกอื่น
- [ ] A06 รูปภาพไม่เสียหลัง save/reload รวมภาพใกล้ขนาดสูงสุดที่ UI ยอมรับ
- [ ] A07 จัดคอลัมน์ 1/2 และ presets ระดับหน้าทำงานตามหน้าที่ที่ระบุ
- [ ] A08 เพิ่ม/คัดลอก/ลบ/ซ่อน/ล็อก/จัดหน้า-หลังทำงาน และ id ไม่ซ้ำ
- [ ] A09 Undo/Redo คืนข้อมูลครบ และ shortcuts ไม่รบกวนการพิมพ์
- [ ] A10 เปลี่ยน template แล้วยังมีทุก id/content/image รวมประเภทซ้ำ
- [ ] A11 Template ไม่ save/publish เอง และ Undo กลับได้
- [ ] A12 Save/Autosave แบบ response ช้าไม่ทับข้อมูลล่าสุด
- [ ] A13 Save ล้มเหลวคง draft, Retry ได้ และไม่แจ้งสำเร็จผิด ๆ
- [ ] A14 Unpublish ไม่ทิ้งการแก้ไข และ public URL ปิดจริง
- [ ] A15 Preview/Public/Admin แสดงตำแหน่งและข้อมูลจาก document เดียวกัน
- [ ] A16 ข้อความติดต่อและรูปของทุกบล็อกครบทุก template
- [ ] A17 Fit/Zoom/mobile ไม่มีเนื้อหาถูก wrapper ตัดโดยไม่มีทางเข้าถึง
- [ ] A18 มีคำเตือน content overflow โดยไม่ตัดข้อมูลทิ้ง
- [ ] A19 PDF ตัวอย่าง A4 หนึ่งหน้า ภาษาไทย/รูปครบ ไม่มี editor controls
- [ ] A20 Build, Docker และ flow เดโม end-to-end ผ่าน

ใช้บัญชี/Resume ทดสอบที่แยกจากข้อมูลของผู้ใช้ เก็บผลและภาพใน `deliverables/resume-studio-dev/` ห้ามลบข้อมูลจริงเพื่อทำให้ test ผ่าน

## 7. บทเดโมประมาณ 4 นาที

1. เข้าสู่ระบบนักศึกษา เปิด Resume และเลือก Professional
2. ลากข้อความและรูปลงบนกระดาษ ย้ายและปรับขนาดให้เห็นการทำงานทันที
3. เปลี่ยนสีเพียงบล็อกเดียว และจัดข้อความเป็นสองคอลัมน์
4. จัดแนวด้วยเส้นช่วย ลองคัดลอก/ลบแล้ว Undo ให้เห็นว่ากู้กลับได้
5. เปลี่ยนเป็น Modern ให้เห็นว่าเนื้อหาและภาพครบ จากนั้น Undo กลับ
6. รอข้อความบันทึกแล้ว เปิด Preview เผยแพร่และเปิดลิงก์ในหน้าต่างที่ไม่ได้ login
7. เปิดหน้าพิมพ์บันทึก PDF ให้เห็น Resume หนึ่งหน้าที่ตรงกับการออกแบบ
8. เข้าฝั่ง Admin เปิดตรวจงานนักศึกษาคนเดิม

ใช้ข้อมูลตัวอย่างสมมติที่เตรียมไว้สำหรับเดโม การเติมข้อมูลตัวอย่างต้องไม่เขียนทับงานที่มีอยู่โดยไม่มีการกระทำชัดเจนจากผู้ใช้

## 8. งานเสริมหลังแกนหลักผ่าน

ไม่ใช้รายการนี้แทนการแก้ flow หลัก: หลายหน้า, multi-select/group, crop ภาพแบบละเอียด, text rich editor, AI ช่วยเขียน Resume, real-time collaboration, timeline history ถาวร, export PDF แบบดาวน์โหลดอัตโนมัติ

ความว้าวในรอบนี้มาจากการควบคุมบนกระดาษที่ตอบสนองจริง ความตรงกันของผลลัพธ์ และเดโมที่ไม่มีสะดุด

## 9. คำสั่งส่งต่อ GPT6-sol medium

คุณกำลังพัฒนาโปรเจ็กจบ Resume Canvas Studio ใน workspace `/Users/surachartlimrattanaphun/Desktop/PFS` ให้อ่าน `DEV_PLAN_RESUME_STUDIO.md` และรายงาน `deliverables/system-audit-2026-09-28/REPORT.md` ก่อนลงมือ แล้วพัฒนาตาม Phase 0-7 ของแผน

ให้ยึดเป้าหมายการทำงานและความโดดเด่นของเดโม ไม่ทำ database infrastructure, authentication redesign, security hardening, SEO หรือ deployment แทรก คงข้อมูลจริงและโค้ดที่ไม่เกี่ยวข้องไว้ ใช้ระบบเดิมและแก้ persistence เฉพาะที่ต้องรองรับการออกแบบ

เริ่มจากแก้ข้อมูลหาย วาง document/renderer กลาง แล้วทำ canvas, Properties, history, templates, save/publish/PDF ตามลำดับ ทุกปุ่มและทุก Property ต้องมีผลจริงใน editor และผลลัพธ์ที่เผยแพร่ ทดสอบผ่านเกณฑ์ของแต่ละ Phase ก่อนขยายงาน

ทำงานเป็นชุดย่อยที่ตรวจได้ หลังแต่ละ Phase อัปเดต `deliverables/resume-studio-dev/PROGRESS.md` ด้วยไฟล์ที่เปลี่ยน วิธีทดสอบ ผลจริง งานค้าง และ Phase ถัดไป อย่าประกาศว่าทดสอบผ่านหากไม่ได้รันหรือดูผลจริง หากทำต่อข้ามบริบทให้อ่าน progress แล้วทำต่อจากจุดเดิม

ไม่ต้องกลับมาเสนอแผนใหม่หรือถามเรื่องที่แผนตัดสินไว้แล้ว สามารถทำต่อ Phase ถัดไปได้เมื่อเกณฑ์ก่อนหน้าผ่าน หากผู้ใช้ระบุให้ทำเฉพาะ Phase ใด ให้ทำเฉพาะ Phase นั้นพร้อม dependencies ที่จำเป็น และรายงานข้อจำกัดตรง ๆ

เมื่อจบ ส่ง URL สำหรับลองระบบ ภาพหน้าจอหลัก ผล Acceptance Checklist และ flow เดโมที่ทำงานจริง ห้ามปิดงานด้วยเพียง UI mockup หรือ build ผ่านโดยไม่ทดสอบ interaction
