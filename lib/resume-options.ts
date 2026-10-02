import type { PortfolioSection, TemplateId } from "@/lib/types";

export const documentSize = { width: 794, height: 1123 } as const;
export const documentPadding = 42;
export const gridSize = 8;
export const imageDataLimit = 1_600_000;

export const fontOptions = [
  "Inter", "Noto Sans Thai", "Prompt", "Kanit", "Sarabun",
  "Chakra Petch", "Fira Code", "Outfit", "Playfair Display"
] as const;

export const primaryTemplates: { id: TemplateId; name: string; description: string }[] = [
  { id: "professional", name: "Professional", description: "ส่วนหัวชัดเจน พร้อมเนื้อหาสองคอลัมน์" },
  { id: "modern", name: "Modern", description: "สมดุลสองฝั่ง เน้นภาพและผลงาน" },
  { id: "minimal", name: "Minimal", description: "เรียบง่าย อ่านข้อมูลได้ต่อเนื่อง" }
];

export const assetTypes: { type: PortfolioSection["type"]; title: string; hint: string }[] = [
  { type: "profile", title: "ข้อมูลส่วนตัว", hint: "ชื่อ บทบาท และรูปโปรไฟล์" },
  { type: "about", title: "แนะนำตัว", hint: "ข้อความแนะนำตัว" },
  { type: "education", title: "การศึกษา", hint: "หลักสูตรและมหาวิทยาลัย" },
  { type: "skills", title: "ทักษะ", hint: "ภาษาและเครื่องมือ" },
  { type: "projects", title: "ผลงาน", hint: "โปรเจกต์ที่อยากนำเสนอ" },
  { type: "experience", title: "ประสบการณ์", hint: "ฝึกงานหรือกิจกรรม" },
  { type: "certificates", title: "ใบรับรอง", hint: "คอร์สและประกาศนียบัตร" },
  { type: "contact", title: "ติดต่อ", hint: "อีเมลและช่องทางอื่น" },
  { type: "custom", title: "ข้อความ", hint: "ข้อความอิสระ" }
];
