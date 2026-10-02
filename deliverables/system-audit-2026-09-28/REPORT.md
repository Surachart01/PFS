# ผลตรวจระบบ Resume Studio

วันที่ตรวจ: 28 กันยายน 2026

## ข้อสรุป

**ยังไม่พร้อมเปิดใช้งานจริงกับนักศึกษาจำนวนมาก** ระบบเข้าสู่ระบบ แยกสิทธิ์ บันทึกข้อมูล และเผยแพร่ Resume ทำงานได้ในเส้นทางที่ทดสอบ แต่พบข้อผิดพลาดที่ทำให้เนื้อหาหาย รวมถึงตัวเลือกในหน้าตกแต่งที่ไม่แสดงผลจริง และประเด็นความปลอดภัยที่ต้องจัดการก่อนเปิดระบบ

เมื่อเทียบกับ requirement ในบทสนทนาที่ต้องการลากวางอย่างอิสระแบบ Figma ระบบปัจจุบันยังเป็นตัวจัดเนื้อหาตามเทมเพลต การลาก Asset เพิ่มบล็อกได้ แต่ยังไม่วางตามตำแหน่งเมาส์หรือย้าย/ย่อขยายบล็อกบนกระดาษอย่างอิสระ

การตรวจครั้งนี้เป็นการ review และทดสอบ ไม่ได้แก้โค้ดการทำงานของระบบ ข้อมูลทดสอบทั้งหมดแยกในฐานข้อมูลชั่วคราว ไม่แก้ข้อมูลนักศึกษาจริง หลังตรวจได้ลบบัญชี/ฐานข้อมูลทดสอบและหยุด container ทดสอบแล้ว คงเหลือเฉพาะรายงาน ผลทดสอบ และภาพประกอบใน workspace

## หลักฐานการทดสอบ

| รายการ | ผล |
|---|---|
| Production build ในเครื่อง | ผ่าน รวม TypeScript |
| Docker Compose build | ผ่าน |
| เริ่มแอปจาก image ที่ build ใหม่ | ผ่าน บน localhost:3002 และฐานข้อมูลแยก |
| ตรวจ API และ browser รวม | 48 assertions: ผ่าน 34, ไม่ผ่าน 14 |
| ชุด smoke test เดิม | ผ่าน 6/6 แต่ไม่ได้เรียก implementation จริง |
| Browser | Chrome ผ่าน Playwright, desktop 1440x1000 และ mobile 390x844 |
| ข้อผิดพลาด JavaScript ระหว่างเส้นทางหลักที่ทดสอบ | ไม่พบ |
| Dependency audit | 4 packages ถูกแจ้ง: critical 1, high 2, moderate 1 |

จำนวน assertions ที่ไม่ผ่านไม่เท่ากับจำนวนสาเหตุ เช่น สี รูปภาพ และแนวข้อความเกิดจาก renderer ไม่อ่านข้อมูลบล็อกชุดเดียวกัน ผลละเอียดอยู่ใน [results.json](./results.json)

## ประเด็นที่ต้องแก้

ใช้ P1 สำหรับประเด็นที่ควรแก้ก่อนใช้งานจริง และ P2 สำหรับข้อผิดพลาดสำคัญที่มีทางหลีกเลี่ยงหรือกระทบเฉพาะบางเส้นทาง ไม่พบเหตุให้ระบุ P0 จากการทดสอบครั้งนี้

### F01 [P1] สลับเทมเพลตแล้วบล็อกประเภทซ้ำถูกลบทิ้ง

- ตำแหน่ง: `lib/portfolio.ts:387`, `lib/portfolio.ts:424`
- วิธีทดสอบ: บันทึกบล็อก about สองรายการซึ่งมี id และเนื้อหาต่างกัน แล้วเลือกเทมเพลต Modern
- ผลจริง: บล็อก about รายการที่สองหายจาก response และข้อมูลที่บันทึก จำนวนรวมอาจเท่าเดิมเพราะเทมเพลตสร้างบล็อกประเภทอื่นเพิ่ม จึงห้ามตรวจเพียงจำนวนบล็อก
- สาเหตุ: เลือก existing ด้วย `find` ตาม type และตัด remaining section หากมี type ซ้ำ
- ผลกระทบ: เนื้อหาที่นักศึกษาเขียนไว้สูญหายหลังการเปลี่ยนรูปแบบ
- แนวทางแก้: จับคู่ตาม id ของบล็อกที่ใช้ไปแล้ว และเก็บบล็อกที่เหลือทั้งหมด รวมถึงประเภทซ้ำ เพิ่ม regression test ว่า id และเนื้อหาทุกชิ้นยังอยู่หลังสลับเทมเพลต

### F02 [P1] ปิดเผยแพร่ทำให้การแก้ไขที่ยังไม่บันทึกหาย

- ตำแหน่ง: `components/StudentEditor.tsx:681`, โดยเฉพาะ `setPortfolio(data.portfolio)` ที่บรรทัด 688
- วิธีทดสอบ: เปิด Resume ที่เผยแพร่แล้ว เพิ่มบล็อกและกรอกข้อความใหม่โดยยังไม่บันทึก จากนั้นกดปิดเผยแพร่
- ผลจริง: บล็อกใหม่และข้อความหายไปจาก editor เพราะ state ถูกแทนที่ด้วยข้อมูลฉบับที่อยู่ในฐานข้อมูล
- แนวทางแก้: เปลี่ยนเฉพาะสถานะการเผยแพร่ใน state ปัจจุบัน หรือบันทึกการแก้ไขให้สำเร็จก่อนเปลี่ยนสถานะ พร้อมจัดการคำขอที่ล้มเหลว

### F03 [P1] สี รูปภาพ และการจัดรูปแบบรายบล็อกไม่แสดงผล

- ตำแหน่ง: `components/StudentEditor.tsx:1007`, `components/StudentEditor.tsx:1187`, `components/StudentEditor.tsx:1213`, `components/ResumeRenderer.tsx:179`, `components/ResumeRenderer.tsx:244`, `components/ResumeRenderer.tsx:333`
- วิธีทดสอบ: กำหนด about ให้ใช้สีแดง พื้นเหลือง จัดข้อความชิดขวา และแนบภาพ แล้วบันทึกและเปิด editor
- ผลจริง: ค่าถูกเก็บในฐานข้อมูล แต่หัวข้อยังใช้สีหลักของทั้ง Resume, ข้อความยังจัดแนวเดิม และไม่พบ `<img>` ในบล็อก about
- สาเหตุ: หน้าปัจจุบันใช้ `ResumeRenderer` ซึ่งอ่าน global accent และ layout ของเทมเพลต ไม่อ่าน per-section style/image หลายค่า ส่วน `renderElement` เดิมที่อ่านค่าเหล่านั้นไม่ได้ถูกใช้ใน canvas
- ผลกระทบ: ผู้ใช้เห็นเครื่องมือปรับแต่ง แต่ผลลัพธ์ไม่เปลี่ยนตาม และหน้าเผยแพร่มีข้อจำกัดเดียวกัน
- แนวทางแก้: ให้ renderer ที่ใช้จริงรองรับสี พื้นหลัง imageUrl alignment และ itemStyle ของแต่ละบล็อก และใช้ renderer ร่วมกันใน editor/admin/public

### F04 [P1] ข้อความติดต่อหายจากเทมเพลต Modern/Creative และ Minimal

- ตำแหน่ง: `components/ResumeRenderer.tsx:393`, `components/ResumeRenderer.tsx:505`
- วิธีทดสอบ: เก็บข้อมูลติดต่อไว้ใน `contact.content.body` ซึ่งเป็นรูปแบบที่ระบบสร้างให้เริ่มต้น แล้วใช้ Modern
- ผลจริง: ไม่พบข้อความติดต่อใน DOM ของ Resume สาธารณะ เทมเพลตอ่านเฉพาะ `items(contact)` ส่วน body ไม่ถูกแสดง
- ผลกระทบ: อีเมล เบอร์โทร หรือ URL ที่กรอกเป็นข้อความในส่วนติดต่อไม่ปรากฏให้ผู้รับ Resume เห็น
- แนวทางแก้: รองรับทั้ง body และ items อย่างสอดคล้องกันทุกเทมเพลต และทดสอบด้วยข้อมูลเริ่มต้นของระบบ

### F05 [P1] ค่าเริ่มต้นและไฟล์ที่ติดตามใน Git มีข้อมูลสำหรับเข้าระบบ

- ตำแหน่ง: `app/login/page.tsx:9`, `docker-compose.yml:11`, `lib/auth.ts:17`, `.gitignore`, `capture_real_screenshots.mjs:11`
- หลักฐาน: หน้า login เติมบัญชีและรหัสผ่านแอดมินเริ่มต้นให้ทันที; Compose กำหนดรหัสผ่านและ signing secret แบบค่าคงที่; `git ls-files` แสดงว่า `.env.local` ถูกติดตามใน Git และไฟล์นี้มี AUTH_SECRET/ADMIN_PASSWORD ที่ไม่ว่าง นอกจากนี้สคริปต์ภาพหน้าจอมี signing secret ฝังอยู่
- ผลกระทบ: การติดตั้งตามค่าเดิมอาจเปิดให้ผู้เข้าถึงเว็บล็อกอินเป็นแอดมินได้ ผู้มีสำเนา repository อาจได้ค่าลับที่นำไปใช้ต่อหากยังใช้งานค่าเดิม
- แนวทางแก้: เอารหัสผ่านที่เติมอัตโนมัติออก, บังคับกำหนด secret/password จาก environment, ปฏิเสธค่า default ใน production, เลิกติดตามไฟล์ลับและเปลี่ยนค่าที่เคยใช้จริง การลบจากไฟล์ล่าสุดอย่างเดียวไม่ลบข้อมูลใน Git history
- ไม่แสดงค่าลับจริงในรายงานนี้ และไม่ได้ทดสอบเข้าถึงระบบภายนอก

### F06 [P1] MongoDB เปิดพอร์ตทุก interface โดยไม่มี authentication

- ตำแหน่ง: `docker-compose.yml:19`, `docker-compose.yml:24`
- หลักฐาน: MongoDB ไม่มีการตั้งค่าบัญชีฐานข้อมูล และสถานะ container แสดง `0.0.0.0:27017` / `[::]:27017`; แอปต่อฐานข้อมูลโดยไม่ส่ง credentials
- ผลกระทบ: เครื่องอื่นที่เข้าถึงพอร์ตนี้ได้ตามเครือข่าย/ไฟร์วอลล์จะสามารถติดต่อฐานข้อมูลได้ ไม่ควรนำ Compose ชุดนี้ไปเปิดบนเซิร์ฟเวอร์สาธารณะโดยตรง
- แนวทางแก้: ให้ MongoDB อยู่ในเครือข่ายภายใน Compose และไม่ publish พอร์ต หรือ bind localhost สำหรับงานพัฒนา พร้อมตั้ง authentication สำหรับการใช้งานจริง

### F07 [P1] เซสชันเดิมยังใช้ได้หลังเปลี่ยนรหัสผ่านหรือ logout

- ตำแหน่ง: `lib/auth.ts:95`, `lib/auth.ts:179`, `app/api/auth/change-password/route.ts:44`, `app/api/auth/logout/route.ts:11`
- วิธีทดสอบ: เก็บ cookie ก่อนเปลี่ยนรหัสผ่าน แล้วนำ cookie เดิมเรียก API อีกครั้ง อีกกรณีเก็บ cookie ไว้ก่อน logout และนำกลับมาใช้
- ผลจริง: ทั้งสองกรณียังเรียก API ได้ HTTP 200 แม้รหัสผ่านเดิมใช้ login ไม่ได้แล้ว
- สาเหตุ: cookie ถูกเซ็นและมีอายุ 7 วัน แต่ไม่มีการตรวจ session record หรือ session version ที่เพิกถอนได้ การมี index ของ sessions ไม่ได้ทำให้ session ถูกตรวจจริง
- แนวทางแก้: จัดเก็บ session ที่ revoke ได้ หรือใช้ session version/token version ที่ตรวจทุกคำขอ และเพิ่ม version เมื่อเปลี่ยน/รีเซ็ตรหัสผ่าน Logout ต้องเพิกถอน session ปัจจุบัน
- ขอบเขต: ผู้ที่ถือ cookie เดิมเท่านั้นได้รับผลกระทบนี้ ไม่ใช่การข้าม login โดยผู้ที่ไม่มี token การปิดบัญชีเป็น inactive ป้องกัน token เก่าได้และทดสอบผ่าน

### F08 [P1] มี dependency ที่เครื่องมือตรวจแจ้งช่องโหว่

- ตำแหน่ง: `package.json:16`, `package.json:26`, `package-lock.json`
- ผล `npm audit --omit=dev`: next (critical), sharp (high), nanoid (high), postcss (moderate)
- เวอร์ชัน Next.js ที่ build จริงคือ 16.2.11 ประกาศจากผู้ดูแลระบุการแก้ช่องโหว่การประมวลผล AVIF ใน 16.3.3: [Next.js security advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4)
- แนวทางแก้: อัปเดต dependency และ lockfile ไปเวอร์ชันที่แก้แล้ว รวมถึงตรวจ overrides ของ sharp/postcss จากนั้น build และตรวจ regression อีกครั้ง
- ขอบเขต: นี่เป็นผลตรวจเวอร์ชัน ไม่ใช่หลักฐานว่าโจมตีแอปนี้สำเร็จ ประกาศ RCE บางรายการในผล audit ใช้กับ Windows และไม่ตรงกับ Linux Docker ที่ทดสอบ ส่วน AVIF ต้องเข้าเงื่อนไข image optimization; ยังไม่ได้ทดลอง exploit หรือยืนยันเส้นทางโจมตี

### F09 [P1, Requirement Gap] การลากวางยังไม่ใช่ canvas แบบ Figma

- ตำแหน่ง: `components/StudentEditor.tsx:523`, `components/StudentEditor.tsx:997`, `components/ResumeRenderer.tsx:75`
- ผลตรวจ: drag asset ลง document เพิ่มบล็อกได้ แต่ handler ไม่อ่านพิกัดจุดปล่อย และสร้างบล็อกต่อท้าย ขณะ render จะจัดตาม template/column/order ไม่มีการ drag move หรือ resize บล็อกบน canvas ที่ใช้อยู่จริง
- ผลกระทบ: ยังไม่ตรงกับ requirement ในบทสนทนาที่ต้องการหยิบบล็อกวางตำแหน่งอิสระบน document
- แนวทางแก้: กำหนดรูปแบบหลักเป็น free-position canvas พร้อมตำแหน่ง ขนาด และลำดับชั้นที่บันทึกได้ ให้หน้าเผยแพร่อ่าน layout ชุดเดียวกัน ถ้าขอบเขตล่าสุดเปลี่ยนเป็น template editor ต้องปรับ requirement และชื่อ UI ให้ตรงก่อนประเมินว่าผ่าน

### F10 [P2] ไม่มีปุ่มลบบล็อกในหน้า editor ที่ใช้งานจริง

- ตำแหน่ง: `components/StudentEditor.tsx:561`, `components/StudentEditor.tsx:888`, `components/StudentEditor.tsx:1148`
- หลักฐาน: มีฟังก์ชัน removeSection แต่ไม่ได้เชื่อมกับปุ่มใน JSX ที่ render จริง Properties มีเฉพาะปุ่มคัดลอก และ Active Elements ไม่มีปุ่มลบ
- ผลกระทบ: เพิ่มบล็อกผิดแล้วนำออกไม่ได้จากหน้าเว็บ ต้องซ่อนแทนหรือแก้ข้อมูลผ่านช่องทางอื่น
- แนวทางแก้: เพิ่ม action ลบบล็อกที่เลือกพร้อม undo หรือวิธีกู้คืนอย่างเหมาะสม และทดสอบเพิ่ม-ลบ-บันทึก-เปิดใหม่

### F11 [P2] ฟอนต์ Playfair Display ถูกเปลี่ยนกลับเมื่อบันทึก

- ตำแหน่ง: `components/StudentEditor.tsx:69`, `app/api/portfolio/me/route.ts:11`, `app/api/portfolio/me/route.ts:50`
- หลักฐาน: มีตัวเลือกนี้ในหน้าเว็บ แต่ไม่มีใน allowedFonts; เมื่อทดสอบบันทึก ค่าตอบกลับกลายเป็น Inter
- แนวทางแก้: ใช้รายการฟอนต์กลางร่วมกันระหว่าง UI/API และทดสอบทุกตัวเลือกที่ผู้ใช้เลือกได้

### F12 [P2] Canvas ตัดเนื้อหาภายในทั้ง desktop และ mobile

- ตำแหน่ง: `app/globals.css:816`, `app/globals.css:4720`, `app/globals.css:4840`
- หลักฐานด้วยข้อมูลชื่อไทยทั่วไป: desktop canvas กว้าง 582px แต่เนื้อหาภายในกว้าง 601px; mobile canvas กว้าง 212px แต่เนื้อหาภายในกว้าง 281px โดย layout ใช้ `overflow: hidden`
- ผลกระทบ: ผู้ใช้เห็น Resume ไม่ครบ แม้หน้ารวมจะไม่มี horizontal scrollbar รูปและข้อความอาจถูกตัดใน canvas
- แนวทางแก้: ใช้ขนาดกระดาษคงที่แล้ว fit/zoom ตามพื้นที่ หรือทำ layout ที่ย่อได้จริง ตรวจทั้งความกว้างหน้าและ overflow ภายใน component
- หน้า public ที่ทดสอบด้วยข้อมูลทั่วไปทั้ง professional/modern/minimal ไม่ล้นความกว้าง 390px แต่ไม่ใช่การรับรองทุกข้อความยาวหรือทุกอุปกรณ์
- ภาพ: [desktop](./canvas-1440.png), [mobile](./canvas-390.png)

### F13 [P2] API รับข้อมูล section ผิดรูปแบบแล้วตอบ 500

- ตำแหน่ง: `lib/portfolio.ts:606`, `app/api/portfolio/me/route.ts:62`
- วิธีทดสอบ: ส่ง `sections: [null]` จากผู้ใช้ที่ login แล้ว
- ผลจริง: HTTP 500 เพราะ sanitizer อ่าน property ของ null แทนที่จะปฏิเสธข้อมูลด้วย 400/422
- แนวทางแก้: ตรวจ schema ก่อน sanitize รวมถึง type, id ที่ไม่ซ้ำ, จำนวนบล็อก, ขนาดข้อมูลรวม และขอบเขตค่าตัวเลข ตอบ validation error ที่หน้าเว็บนำไปแสดงได้

### F14 [P2] ใช้คีย์บอร์ดและ screen reader เลือก/แก้บล็อกได้ไม่ครบ

- ตำแหน่ง: `components/StudentEditor.tsx:1025`, `components/StudentEditor.tsx:1167`, `components/ResumeRenderer.tsx:99`
- หลักฐาน: พบ form controls ที่ไม่มี associated label 8 ช่องในสถานะที่ทดสอบ และส่วน resume ที่คลิกเลือกได้ 8 ส่วนเป็น div ที่ไม่มี tabindex/keyboard handler; property tabs ไม่มี role/state ของแต่ละ tab
- ผลกระทบ: ผู้ใช้ screen reader ไม่ทราบชื่อบางช่อง และผู้ใช้คีย์บอร์ดเลือกบล็อกที่ต้องการแก้โดยตรงไม่ได้ครบ
- มาตรฐานเกี่ยวข้อง: WCAG 1.3.1, 2.1.1, 4.1.2; การตรวจนี้ไม่ใช่การรับรอง WCAG ทั้งระบบ
- แนวทางแก้: ผูก label กับ id ใช้ button/semantics ที่เหมาะสม พร้อม focus state, aria-selected/pressed และ keyboard interactions

## ภาพรวมคุณภาพ UI

ประเมินตาม Impeccable แบบตรวจโค้ดและ browser ในขอบเขตนี้เท่านั้น คะแนนนี้ไม่ใช่เปอร์เซ็นต์ความสำเร็จของระบบหรือผล benchmark

| มิติ | คะแนน / 4 | เหตุผล |
|---|---:|---|
| Accessibility | 1 | ช่องกรอกไม่มี label เชื่อมกันและบล็อกที่เลือกด้วยเมาส์ไม่รองรับคีย์บอร์ด |
| Performance | 2 | build ผ่าน แต่มีภาพ base64 ฝังในเอกสารและ renderer เป็น client component; ไม่ได้ load-test |
| Responsive | 1 | Canvas ตัดเนื้อหาบน desktop/mobile แม้ public ตัวอย่างปรับตามจอได้ |
| Theming | 2 | มี CSS tokens แต่สีและรูปแบบรายบล็อกไม่ถูกนำไปใช้ใน renderer จริง |
| Implementation Integrity | 1 | มี controls ที่ไม่ทำงานจริงและฟังก์ชัน renderer/delete เก่าที่ไม่ได้เชื่อมกับหน้าปัจจุบัน |
| รวม | 7/20 | ต้องแก้การทำงานหลักก่อนเก็บรายละเอียดความสวยงาม |

Detector แจ้ง 12 จุด ส่วนใหญ่เป็น style heuristics เช่น Inter, สีขอบการ์ด และพื้นหลัง grid ซึ่งไม่ถือเป็น defect โดยตัวมันเองในเครื่องมือออกแบบนี้ ไม่ใช้รายการเหล่านั้นเป็นเหตุให้เปลี่ยนดีไซน์ทั้งระบบ พบ width/min-height transitions แต่ไม่ได้วัดว่าเกิดปัญหาเฟรมตก จึงไม่รายงานเป็นบั๊กที่ยืนยันแล้ว

## ส่วนที่ทดสอบผ่าน

- เข้าสู่ระบบด้วยบัญชี admin และรหัสนักศึกษา รวมถึง redirect ใน browser
- ปฏิเสธรหัสผ่านผิดและผู้ไม่ login ที่เรียก API ส่วนตัว
- นักศึกษาไม่มีสิทธิ์อ่านรายชื่อทั้งหมด แก้บัญชีอื่น หรือเปิดหน้า admin preview
- แอดมินสร้าง/ลบนักศึกษา เปิด dashboard และดู Resume ฉบับร่างได้
- บันทึกและโหลด Resume กลับมาได้ และข้อมูลนักศึกษาอีกคนไม่เปลี่ยนตาม
- Draft ไม่เปิดต่อสาธารณะ, publish เปิด URL ได้, unpublish ปิด URL ได้
- เปลี่ยนรหัสผ่านแล้วรหัสผ่านเก่า login ไม่ได้ รหัสผ่านใหม่ login ได้
- ปิดบัญชี inactive แล้ว login และใช้ cookie เดิมไม่ได้
- ลบนักศึกษาแล้ว Resume ถูกลบและ URL เดิมเปิดไม่ได้
- ลาก Asset ลง document เพื่อเพิ่มบล็อกได้

## ขอบเขตและช่องว่าง

- ไม่ได้ทดสอบโหลดพร้อมกันจำนวนมาก, backup/restore, HTTPS/reverse proxy, Safari/Firefox หรือ deployment ภายนอก
- การทดสอบนี้ใช้บัญชีชั่วคราวและฐานข้อมูล `pfs_audit_20260928` โดย override ค่าติดต่อฐานข้อมูลและบัญชี admin; ไม่ได้ลองรหัสผ่านกับบัญชีจริง
- Test harness ชั่วคราวเรียก HTTP API และ browser ของ image จริง ส่วน smoke test ที่มีอยู่เดิมคัดลอกตรรกะขึ้นมาทดสอบภายในไฟล์ จึงยังจับปัญหาใน app จริงไม่ได้ ควรเปลี่ยนเป็น integration/regression tests สำหรับ F01-F04, F07 และ F11
- README ยังอธิบายปุ่มลบ การตั้งค่า grid และแท็บ Layout/Advanced ที่หน้า editor ปัจจุบันไม่มี จึงยังใช้เป็นคู่มือรุ่นปัจจุบันได้ไม่ครบ
- การลากวางอิสระแบบ Figma อ้างอิง requirement ในบทสนทนา หากมี requirement รุ่นใหม่ที่ต่างออกไป ต้องใช้รุ่นนั้นเป็นเกณฑ์ตัดสิน F09
- ไม่ได้ตรวจหรือเพิ่ม SEO ตามขอบเขตที่ผู้ใช้แจ้งไว้

## ลำดับการแก้ที่แนะนำ

1. ป้องกันข้อมูลหายเมื่อเปลี่ยน template/unpublish และทำ renderer ให้แสดงข้อมูลจริงครบทุกส่วน
2. จัดการ secret/default admin, การเปิดฐานข้อมูล, session revocation และ dependency ที่ถูกแจ้งช่องโหว่ก่อนเปิดให้ผู้ใช้จริง
3. ทำความสามารถลากวางให้ตรง requirement และคืนปุ่มลบ/การตั้งค่าที่ใช้งานได้จริง
4. แก้ canvas clipping, font allowlist, validation และการใช้คีย์บอร์ด จากนั้นเพิ่ม regression tests

สำหรับงาน UI สามารถใช้ `$impeccable harden` แก้ state/validation และการเข้าถึง, `$impeccable adapt` แก้พื้นที่ canvas, ปิดท้ายด้วย `$impeccable polish` หลังแก้พฤติกรรมหลักแล้ว จะดำเนินการทีละส่วนหรือรวมกันก็ได้ และใช้ `$impeccable audit` ตรวจซ้ำหลังแก้

## ไฟล์ประกอบ

- [ผล assertions](./results.json)
- [Editor desktop พร้อมค่าทดสอบ](./editor-desktop.png)
- [Properties](./editor-properties.png)
- [Canvas desktop ข้อมูลทั่วไป](./canvas-1440.png)
- [Canvas mobile ข้อมูลทั่วไป](./canvas-390.png)
- [Public mobile Professional](./public-mobile-professional.png)
- [Public mobile Modern](./public-mobile-modern.png)
- [Public mobile Minimal](./public-mobile-minimal.png)
- [Admin dashboard](./admin-desktop.png)
