import { ObjectId } from "mongodb";

import { getDb } from "@/lib/mongodb";
import type {
  GridPlacement,
  PortfolioDoc,
  PortfolioSection,
  PortfolioSectionFrame,
  PortfolioSectionSettings,
  PortfolioStyleSettings,
  SerializedPortfolio,
  TemplateId,
  UserDoc
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Style settings                                                     */
/* ------------------------------------------------------------------ */

export const defaultStyleSettings: PortfolioStyleSettings = {
  primaryColor: "#0f766e",
  fontFamily: "Inter",
  fontSize: 16,
  layout: "clean"
};

export const documentSize = {
  width: 794,
  height: 1123
};

/* ------------------------------------------------------------------ */
/*  Template definitions                                               */
/* ------------------------------------------------------------------ */

type TemplateSectionDef = {
  type: PortfolioSection["type"];
  title: string;
  gridPlacement: GridPlacement;
  columns?: 1 | 2;
  accentColor?: string;
  backgroundColor?: string;
  settings?: Partial<PortfolioSectionSettings>;
};

export type TemplateDefinition = {
  id: TemplateId;
  name: string;
  description: string;
  gridColumns: number;
  gridRows: number;
  sections: TemplateSectionDef[];
  previewGradient: string;
  accentColor: string;
};

export const templateDefinitions: TemplateDefinition[] = [
  {
    id: "professional",
    name: "Professional",
    description: "เรียบหรู เหมาะกับการสมัครงาน",
    gridColumns: 12,
    gridRows: 8,
    accentColor: "#0f766e",
    previewGradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    sections: [
      { type: "profile", title: "ข้อมูลพื้นฐาน", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 1, rowEnd: 3 }, columns: 2, accentColor: "#0f766e", backgroundColor: "#ecfdf5" },
      { type: "about", title: "แนะนำตัว", gridPlacement: { colStart: 1, colEnd: 7, rowStart: 3, rowEnd: 5 }, accentColor: "#2563eb", backgroundColor: "#eff6ff" },
      { type: "skills", title: "ทักษะ", gridPlacement: { colStart: 7, colEnd: 13, rowStart: 3, rowEnd: 5 }, columns: 2, accentColor: "#0891b2", backgroundColor: "#ecfeff" },
      { type: "projects", title: "โปรเจกต์", gridPlacement: { colStart: 1, colEnd: 7, rowStart: 5, rowEnd: 7 }, accentColor: "#ea580c", backgroundColor: "#fff7ed" },
      { type: "experience", title: "ประสบการณ์", gridPlacement: { colStart: 7, colEnd: 13, rowStart: 5, rowEnd: 7 }, accentColor: "#be123c", backgroundColor: "#fff1f2" },
      { type: "contact", title: "ช่องทางติดต่อ", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 7, rowEnd: 9 }, columns: 2, accentColor: "#475569", backgroundColor: "#f8fafc" }
    ]
  },
  {
    id: "modern",
    name: "Modern",
    description: "ทันสมัย สีสันสะดุดตา",
    gridColumns: 12,
    gridRows: 8,
    accentColor: "#7c3aed",
    previewGradient: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
    sections: [
      { type: "profile", title: "ข้อมูลพื้นฐาน", gridPlacement: { colStart: 1, colEnd: 5, rowStart: 1, rowEnd: 4 }, accentColor: "#7c3aed", backgroundColor: "#f5f3ff" },
      { type: "about", title: "แนะนำตัว", gridPlacement: { colStart: 5, colEnd: 13, rowStart: 1, rowEnd: 3 }, accentColor: "#2563eb", backgroundColor: "#eff6ff" },
      { type: "skills", title: "ทักษะ", gridPlacement: { colStart: 5, colEnd: 13, rowStart: 3, rowEnd: 4 }, columns: 2, accentColor: "#0891b2", backgroundColor: "#ecfeff" },
      { type: "projects", title: "โปรเจกต์", gridPlacement: { colStart: 1, colEnd: 7, rowStart: 4, rowEnd: 6 }, accentColor: "#ea580c", backgroundColor: "#fff7ed" },
      { type: "experience", title: "ประสบการณ์", gridPlacement: { colStart: 7, colEnd: 13, rowStart: 4, rowEnd: 6 }, accentColor: "#be123c", backgroundColor: "#fff1f2" },
      { type: "education", title: "การศึกษา", gridPlacement: { colStart: 1, colEnd: 7, rowStart: 6, rowEnd: 8 }, accentColor: "#7c3aed", backgroundColor: "#f5f3ff" },
      { type: "contact", title: "ช่องทางติดต่อ", gridPlacement: { colStart: 7, colEnd: 13, rowStart: 6, rowEnd: 8 }, accentColor: "#475569", backgroundColor: "#f8fafc" }
    ]
  },
  {
    id: "creative",
    name: "Creative",
    description: "สร้างสรรค์ โดดเด่นไม่ซ้ำใคร",
    gridColumns: 12,
    gridRows: 9,
    accentColor: "#ea580c",
    previewGradient: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    sections: [
      { type: "profile", title: "ข้อมูลพื้นฐาน", gridPlacement: { colStart: 1, colEnd: 8, rowStart: 1, rowEnd: 3 }, columns: 2, accentColor: "#ea580c", backgroundColor: "#fff7ed" },
      { type: "skills", title: "ทักษะ", gridPlacement: { colStart: 8, colEnd: 13, rowStart: 1, rowEnd: 3 }, accentColor: "#0891b2", backgroundColor: "#ecfeff" },
      { type: "about", title: "แนะนำตัว", gridPlacement: { colStart: 1, colEnd: 5, rowStart: 3, rowEnd: 5 }, accentColor: "#2563eb", backgroundColor: "#eff6ff" },
      { type: "projects", title: "โปรเจกต์", gridPlacement: { colStart: 5, colEnd: 13, rowStart: 3, rowEnd: 6 }, accentColor: "#ea580c", backgroundColor: "#fff7ed" },
      { type: "experience", title: "ประสบการณ์", gridPlacement: { colStart: 1, colEnd: 5, rowStart: 5, rowEnd: 7 }, accentColor: "#be123c", backgroundColor: "#fff1f2" },
      { type: "certificates", title: "Certificate", gridPlacement: { colStart: 5, colEnd: 13, rowStart: 6, rowEnd: 8 }, accentColor: "#ca8a04", backgroundColor: "#fefce8" },
      { type: "education", title: "การศึกษา", gridPlacement: { colStart: 1, colEnd: 5, rowStart: 7, rowEnd: 9 }, accentColor: "#7c3aed", backgroundColor: "#f5f3ff" },
      { type: "contact", title: "ช่องทางติดต่อ", gridPlacement: { colStart: 5, colEnd: 13, rowStart: 8, rowEnd: 10 }, columns: 2, accentColor: "#475569", backgroundColor: "#f8fafc" }
    ]
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "เรียบง่าย สะอาดตา",
    gridColumns: 12,
    gridRows: 10,
    accentColor: "#475569",
    previewGradient: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    sections: [
      { type: "profile", title: "ข้อมูลพื้นฐาน", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 1, rowEnd: 3 }, columns: 2, accentColor: "#475569", backgroundColor: "#f8fafc", settings: { radius: "none", shadow: "none" } },
      { type: "about", title: "แนะนำตัว", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 3, rowEnd: 5 }, accentColor: "#475569", backgroundColor: "#ffffff", settings: { radius: "none", shadow: "none" } },
      { type: "skills", title: "ทักษะ", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 5, rowEnd: 6 }, accentColor: "#475569", backgroundColor: "#ffffff", settings: { radius: "none", shadow: "none" } },
      { type: "projects", title: "โปรเจกต์", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 6, rowEnd: 8 }, accentColor: "#475569", backgroundColor: "#ffffff", settings: { radius: "none", shadow: "none" } },
      { type: "experience", title: "ประสบการณ์", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 8, rowEnd: 10 }, accentColor: "#475569", backgroundColor: "#ffffff", settings: { radius: "none", shadow: "none" } },
      { type: "contact", title: "ช่องทางติดต่อ", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 10, rowEnd: 11 }, accentColor: "#475569", backgroundColor: "#f8fafc", settings: { radius: "none", shadow: "none" } }
    ]
  },
  {
    id: "academic",
    name: "Academic",
    description: "สไตล์วิชาการ เน้นข้อมูล",
    gridColumns: 12,
    gridRows: 9,
    accentColor: "#2563eb",
    previewGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    sections: [
      { type: "profile", title: "ข้อมูลพื้นฐาน", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 1, rowEnd: 2 }, columns: 2, accentColor: "#2563eb", backgroundColor: "#eff6ff" },
      { type: "education", title: "การศึกษา", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 2, rowEnd: 4 }, accentColor: "#7c3aed", backgroundColor: "#f5f3ff" },
      { type: "about", title: "แนะนำตัว", gridPlacement: { colStart: 1, colEnd: 7, rowStart: 4, rowEnd: 6 }, accentColor: "#2563eb", backgroundColor: "#eff6ff" },
      { type: "skills", title: "ทักษะ", gridPlacement: { colStart: 7, colEnd: 13, rowStart: 4, rowEnd: 6 }, columns: 2, accentColor: "#0891b2", backgroundColor: "#ecfeff" },
      { type: "projects", title: "โปรเจกต์", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 6, rowEnd: 8 }, accentColor: "#ea580c", backgroundColor: "#fff7ed" },
      { type: "certificates", title: "Certificate", gridPlacement: { colStart: 1, colEnd: 7, rowStart: 8, rowEnd: 10 }, accentColor: "#ca8a04", backgroundColor: "#fefce8" },
      { type: "contact", title: "ช่องทางติดต่อ", gridPlacement: { colStart: 7, colEnd: 13, rowStart: 8, rowEnd: 10 }, accentColor: "#475569", backgroundColor: "#f8fafc" }
    ]
  },
  {
    id: "compact",
    name: "Compact",
    description: "กระชับ ใส่ข้อมูลได้เยอะ",
    gridColumns: 12,
    gridRows: 8,
    accentColor: "#0f766e",
    previewGradient: "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%)",
    sections: [
      { type: "profile", title: "ข้อมูลพื้นฐาน", gridPlacement: { colStart: 1, colEnd: 5, rowStart: 1, rowEnd: 5 }, accentColor: "#0f766e", backgroundColor: "#ecfdf5", settings: { padding: "compact" } },
      { type: "about", title: "แนะนำตัว", gridPlacement: { colStart: 5, colEnd: 13, rowStart: 1, rowEnd: 2 }, accentColor: "#2563eb", backgroundColor: "#eff6ff", settings: { padding: "compact" } },
      { type: "skills", title: "ทักษะ", gridPlacement: { colStart: 5, colEnd: 9, rowStart: 2, rowEnd: 3 }, accentColor: "#0891b2", backgroundColor: "#ecfeff", settings: { padding: "compact" } },
      { type: "education", title: "การศึกษา", gridPlacement: { colStart: 9, colEnd: 13, rowStart: 2, rowEnd: 3 }, accentColor: "#7c3aed", backgroundColor: "#f5f3ff", settings: { padding: "compact" } },
      { type: "projects", title: "โปรเจกต์", gridPlacement: { colStart: 5, colEnd: 13, rowStart: 3, rowEnd: 5 }, accentColor: "#ea580c", backgroundColor: "#fff7ed", settings: { padding: "compact" } },
      { type: "experience", title: "ประสบการณ์", gridPlacement: { colStart: 1, colEnd: 7, rowStart: 5, rowEnd: 7 }, accentColor: "#be123c", backgroundColor: "#fff1f2", settings: { padding: "compact" } },
      { type: "certificates", title: "Certificate", gridPlacement: { colStart: 7, colEnd: 13, rowStart: 5, rowEnd: 7 }, accentColor: "#ca8a04", backgroundColor: "#fefce8", settings: { padding: "compact" } },
      { type: "contact", title: "ช่องทางติดต่อ", gridPlacement: { colStart: 1, colEnd: 13, rowStart: 7, rowEnd: 9 }, columns: 2, accentColor: "#475569", backgroundColor: "#f8fafc", settings: { padding: "compact" } }
    ]
  }
];

/**
 * ฟังก์ชัน 3.1: ดึงนิยามและโครงสร้างเทมเพลต (Get Template Definition)
 * หน้าที่: ดึงข้อมูลพิมพ์เขียวการจัดวางของการ์ดตามสไตล์ที่เลือก (Professional, Modern, Creative, Minimal, Academic, Compact)
 * พารามิเตอร์: id - รหัสเทมเพลตที่เลือก
 * คืนค่า: TemplateDefinition ออบเจกต์โครงสร้างเทมเพลต
 */
export function getTemplateDefinition(id: TemplateId): TemplateDefinition {
  return templateDefinitions.find((t) => t.id === id) || templateDefinitions[0];
}

/* ------------------------------------------------------------------ */
/*  Section defaults & styles                                          */
/* ------------------------------------------------------------------ */

const sectionStyles: Record<PortfolioSection["type"], { accentColor: string; backgroundColor: string; columns?: 1 | 2 }> = {
  profile: { accentColor: "#0f766e", backgroundColor: "#ecfdf5", columns: 2 },
  about: { accentColor: "#2563eb", backgroundColor: "#eff6ff" },
  education: { accentColor: "#7c3aed", backgroundColor: "#f5f3ff" },
  skills: { accentColor: "#0891b2", backgroundColor: "#ecfeff", columns: 2 },
  projects: { accentColor: "#ea580c", backgroundColor: "#fff7ed" },
  experience: { accentColor: "#be123c", backgroundColor: "#fff1f2" },
  certificates: { accentColor: "#ca8a04", backgroundColor: "#fefce8" },
  contact: { accentColor: "#475569", backgroundColor: "#f8fafc", columns: 2 },
  custom: { accentColor: "#171a21", backgroundColor: "#f4f6f8" }
};

const sectionFrameSizes: Record<PortfolioSection["type"], { width: number; height: number }> = {
  profile: { width: 360, height: 176 },
  about: { width: 320, height: 160 },
  education: { width: 330, height: 150 },
  skills: { width: 330, height: 170 },
  projects: { width: 360, height: 190 },
  experience: { width: 360, height: 190 },
  certificates: { width: 330, height: 150 },
  contact: { width: 320, height: 150 },
  custom: { width: 320, height: 160 }
};

const settingOptions = {
  alignment: ["left", "center", "right"],
  padding: ["compact", "comfortable", "spacious"],
  radius: ["none", "soft", "rounded"],
  shadow: ["none", "soft", "elevated"],
  width: ["full", "contained"],
  imagePosition: ["left", "top", "right"],
  itemStyle: ["chips", "list", "cards", "bars", "pills", "timeline"],
  borderStyle: ["subtle", "accent-left", "gradient-top", "glowing", "none"],
  cardVariant: ["solid", "glass", "gradient", "outline"]
} as const;

/**
 * ฟังก์ชัน 3.2: ตรวจสอบและคัดกรองค่าการตั้งค่า (Pick Setting - Whitelist Validator)
 * หน้าที่: ตรวจสอบว่าค่าที่ส่งเข้ามาตรงกับรายการตัวเลือกที่อนุญาตหรือไม่ หากไม่ตรงให้คืนค่าเริ่มต้น (fallback) เพื่อป้องกันค่าแปลกปลอม
 * พารามิเตอร์: value - ค่าที่ได้รับ, options - รายการตัวเลือกที่ถูกต้อง, fallback - ค่าเริ่มต้น
 * คืนค่า: ค่าการตั้งค่าที่ปลอดภัย
 */
function pickSetting<T extends readonly string[]>(value: unknown, options: T, fallback: T[number]): T[number] {
  return typeof value === "string" && (options as readonly string[]).includes(value) ? (value as T[number]) : fallback;
}

/**
 * ฟังก์ชัน 3.3: จำกัดขอบเขตตัวเลขให้อยู่ในช่วงที่ปลอดภัย (Clamp Number)
 * หน้าที่: แปลงค่าเป็นตัวเลขและล็อกค่าไม่ให้ต่ำกว่า min หรือเกินกว่า max เพื่อป้องกันการกำหนดขนาดหรือพิกัดผิดพลาด
 * พารามิเตอร์: value - ค่าที่ส่งมา, fallback - ค่าสำรอง, min - ค่าน้อยสุด, max - ค่ามากสุด
 * คืนค่า: number ตัวเลขจำนวนเต็มที่ปลอดภัย
 */
function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.max(min, Math.min(max, Math.round(numberValue)));
}

/**
 * ฟังก์ชัน 3.4: สร้างการตั้งค่าเริ่มต้นสำหรับแต่ละบล็อกเนื้อหา (Default Section Settings)
 * หน้าที่: กำหนดค่ารูปแบบเริ่มต้น เช่น การแสดงหัวข้อ (showTitle), การจัดชิดซ้าย (alignment), ความโค้งมน (radius), และเงา (shadow)
 * พารามิเตอร์: section - บล็อกเนื้อหา
 * คืนค่า: Required<PortfolioSectionSettings> ออบเจกต์การตั้งค่าเริ่มต้นแบบครบถ้วน
 */
function defaultSectionSettings(section: PortfolioSection): Required<PortfolioSectionSettings> {
  return {
    showTitle: true,
    alignment: "left",
    padding: "comfortable",
    radius: "soft",
    shadow: "soft",
    width: "full",
    imagePosition: "left",
    itemStyle: section.type === "skills" ? "chips" : "cards",
    borderStyle: "accent-left",
    cardVariant: "solid",
    column: section.settings?.column || (["skills", "certificates"].includes(section.type) ? "right" : "left")
  };
}

/**
 * ฟังก์ชัน 3.5: กำหนดกรอบพิกัดและขนาดเริ่มต้นของการ์ด (Default Section Frame)
 * หน้าที่: คำนวณพิกัด X, Y และความกว้าง-ความสูงเริ่มต้นสำหรับการจัดวางบน Canvas แบบ Freeform
 * พารามิเตอร์: section - บล็อกเนื้อหา
 * คืนค่า: Required<PortfolioSectionFrame> พิกัดและขนาดของการ์ด
 */
function defaultSectionFrame(section: PortfolioSection): Required<PortfolioSectionFrame> {
  const size = sectionFrameSizes[section.type] || sectionFrameSizes.custom;
  const orderIndex = Math.max(0, (section.order || 1) - 1);
  const column = orderIndex % 2;
  const row = Math.floor(orderIndex / 2);
  const x = 56 + column * 374;
  const y = 72 + row * 188;

  return {
    x: Math.min(x, documentSize.width - size.width - 24),
    y: Math.min(y, documentSize.height - size.height - 24),
    width: size.width,
    height: size.height,
    zIndex: section.order || 1,
    locked: false
  };
}

/**
 * ฟังก์ชัน 3.6: ทำความสะอาดและตรวจความปลอดภัยของการตั้งค่า (Sanitize Section Settings)
 * หน้าที่: ตรวจสอบการตั้งค่าสไตล์การ์ดทั้งหมดผ่าน pickSetting เพื่อป้องกันการส่งค่าสไตล์ที่ไม่ถูกต้องหรือไม่ปลอดภัย
 * พารามิเตอร์: section - บล็อกเนื้อหาที่ต้องการตรวจสอบ
 * คืนค่า: PortfolioSectionSettings การตั้งค่าที่ผ่านการตรวจสอบแล้ว
 */
function sanitizeSectionSettings(section: PortfolioSection): PortfolioSectionSettings {
  const settings = section.settings || {};
  const defaults = defaultSectionSettings(section);
  return {
    showTitle: settings.showTitle !== false,
    alignment: pickSetting(settings.alignment, settingOptions.alignment, defaults.alignment),
    padding: pickSetting(settings.padding, settingOptions.padding, defaults.padding),
    radius: pickSetting(settings.radius, settingOptions.radius, defaults.radius),
    shadow: pickSetting(settings.shadow, settingOptions.shadow, defaults.shadow),
    width: pickSetting(settings.width, settingOptions.width, defaults.width),
    imagePosition: pickSetting(settings.imagePosition, settingOptions.imagePosition, defaults.imagePosition),
    itemStyle: pickSetting(settings.itemStyle, settingOptions.itemStyle, defaults.itemStyle),
    borderStyle: pickSetting(settings.borderStyle, settingOptions.borderStyle, defaults.borderStyle),
    cardVariant: pickSetting(settings.cardVariant, settingOptions.cardVariant, defaults.cardVariant),
    column: settings.column === "right" || settings.column === "left" ? settings.column : defaults.column
  };
}

/**
 * ฟังก์ชัน 3.7: ตรวจสอบและจำกัดพิกัดกรอบการ์ด (Sanitize Section Frame)
 * หน้าที่: ตรวจสอบพิกัด X, Y, Width, Height ให้อยู่ภายในขอบเขตกระดาษ/หน้าจอ ไม่ล้นออกนอกจอ
 * พารามิเตอร์: section - บล็อกเนื้อหา
 * คืนค่า: PortfolioSectionFrame พิกัดที่ปลอดภัย
 */
function sanitizeSectionFrame(section: PortfolioSection): PortfolioSectionFrame {
  const defaults = defaultSectionFrame(section);
  const frame = section.frame || {};
  const width = clampNumber(frame.width, defaults.width, 140, documentSize.width);
  const height = clampNumber(frame.height, defaults.height, 80, documentSize.height);
  return {
    x: clampNumber(frame.x, defaults.x, 0, documentSize.width - width),
    y: clampNumber(frame.y, defaults.y, 0, documentSize.height - height),
    width,
    height,
    zIndex: clampNumber(frame.zIndex, defaults.zIndex, 1, 999),
    locked: frame.locked === true
  };
}

/**
 * ฟังก์ชัน 3.8: ตรวจสอบตำแหน่งคอลัมน์บนระบบกริด 12 ช่อง (Sanitize Grid Placement)
 * หน้าที่: บังคับให้ Column Start/End อยู่ระหว่าง 1 ถึง 13 และ Row ไม่เกิน 20 เพื่อให้เรซูเม่เรียงตัวเป็นระเบียบ
 * พารามิเตอร์: gp - พิกัดตาราง { colStart, colEnd, rowStart, rowEnd }
 * คืนค่า: GridPlacement พิกัดตารางที่ถูกต้อง
 */
function sanitizeGridPlacement(gp: GridPlacement | undefined): GridPlacement | undefined {
  if (!gp) return undefined;
  return {
    colStart: clampNumber(gp.colStart, 1, 1, 13),
    colEnd: clampNumber(gp.colEnd, 13, 2, 13),
    rowStart: clampNumber(gp.rowStart, 1, 1, 20),
    rowEnd: clampNumber(gp.rowEnd, 2, 2, 20)
  };
}

/**
 * ฟังก์ชัน 3.9: เสริมสไตล์มาตรฐานให้กับบล็อกเนื้อหา (With Section Style)
 * หน้าที่: ผสานค่าสีประจำหมวดหมู่, การตั้งค่าความโค้งมน, และพิกัดกริด เพื่อให้บล็อกมีความสมบูรณ์พร้อมแสดงผล
 * พารามิเตอร์: section - บล็อกเนื้อหา
 * คืนค่า: PortfolioSection บล็อกเนื้อหาที่ผสานสไตล์ครบถ้วน
 */
function withSectionStyle(section: PortfolioSection): PortfolioSection {
  const style = sectionStyles[section.type] || sectionStyles.custom;
  return {
    ...section,
    columns: section.columns || style.columns || 1,
    accentColor: section.accentColor || style.accentColor,
    backgroundColor: section.backgroundColor || style.backgroundColor,
    settings: {
      ...defaultSectionSettings(section),
      ...sanitizeSectionSettings(section)
    },
    frame: {
      ...defaultSectionFrame(section),
      ...sanitizeSectionFrame(section)
    },
    gridPlacement: sanitizeGridPlacement(section.gridPlacement)
  };
}

/* ------------------------------------------------------------------ */
/*  Apply template to sections                                         */
/* ------------------------------------------------------------------ */

/**
 * ฟังก์ชัน 3.10: สลับโครงสร้างเทมเพลตเรซูเม่ (Apply Template Layout)
 * หน้าที่: ปรับเปลี่ยนโครงสร้างการจัดวางหน้าตาตามเทมเพลตที่เลือก โดยรักษาข้อมูลเนื้อหาเดิมที่นักศึกษาเคยกรอกไว้ ไม่ให้สูญหาย
 * พารามิเตอร์: templateId - รหัสเทมเพลตใหม่, existingSections - บล็อกเดิมที่มีอยู่, user - ข้อมูลนักศึกษา
 * คืนค่า: PortfolioSection[] อาเรย์ของบล็อกเนื้อหาที่จัดวางตามเทมเพลตใหม่เรียบร้อยแล้ว
 */
export function applyTemplate(templateId: TemplateId, existingSections: PortfolioSection[], user?: UserDoc): PortfolioSection[] {
  const template = getTemplateDefinition(templateId);
  const result: PortfolioSection[] = [];

  for (const def of template.sections) {
    const existing = existingSections.find((s) => s.type === def.type);
    if (existing) {
      result.push(withSectionStyle({
        ...existing,
        order: result.length + 1,
        gridPlacement: def.gridPlacement,
        columns: def.columns || existing.columns,
        accentColor: def.accentColor || existing.accentColor,
        backgroundColor: def.backgroundColor || existing.backgroundColor,
        settings: {
          ...existing.settings,
          ...def.settings
        }
      }));
    } else {
      const defaultContent = getDefaultContent(def.type, user);
      result.push(withSectionStyle({
        id: crypto.randomUUID(),
        type: def.type,
        title: def.title,
        visible: true,
        order: result.length + 1,
        columns: def.columns || 1,
        accentColor: def.accentColor,
        backgroundColor: def.backgroundColor,
        settings: {
          ...defaultSectionSettings({ type: def.type } as PortfolioSection),
          ...def.settings
        },
        gridPlacement: def.gridPlacement,
        content: defaultContent
      }));
    }
  }

  // Include remaining sections not in the template
  for (const section of existingSections) {
    if (!result.find((s) => s.type === section.type || s.id === section.id)) {
      const lastRow = Math.max(...result.map((s) => s.gridPlacement?.rowEnd || 2), 2);
      result.push(withSectionStyle({
        ...section,
        order: result.length + 1,
        gridPlacement: {
          colStart: 1,
          colEnd: 13,
          rowStart: lastRow,
          rowEnd: lastRow + 2
        }
      }));
    }
  }

  return result;
}

/**
 * ฟังก์ชัน 3.11: สร้างเนื้อหาเริ่มต้นตามประเภทหมวดหมู่ (Get Default Section Content)
 * หน้าที่: เติมข้อมูลตั้งต้น เช่น ชื่อ-สกุล อีเมล ในบล็อก Profile หรือตัวอย่างทักษะและโปรเจกต์เมื่อผู้ใช้กดเพิ่มบล็อกใหม่
 * พารามิเตอร์: type - ชนิดของหมวดหมู่ เช่น profile, skills, projects, user - ข้อมูลนักศึกษา
 * คืนค่า: ออบเจกต์เนื้อหา { body, items }
 */
function getDefaultContent(type: PortfolioSection["type"], user?: UserDoc) {
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "ชื่อ-นามสกุล";
  const email = user?.email || "student@kmitl.ac.th";
  const dept = user?.department || "Computer Engineering";
  const yearStr = user?.year ? ` | Year ${user.year}` : "";

  switch (type) {
    case "profile":
      return { body: `${fullName}\n${dept}${yearStr}\n${email}` };
    case "about":
      return { body: "เขียนแนะนำตัว ความสนใจด้านวิศวกรรมคอมพิวเตอร์ และเป้าหมายในการทำงานของคุณ" };
    case "education":
      return { body: "B.Eng. Computer Engineering\nเพิ่มชื่อมหาวิทยาลัยและปีการศึกษา" };
    case "skills":
      return { items: ["Next.js", "MongoDB", "Node.js", "TypeScript"] };
    case "projects":
      return { items: ["Smart Attendance System - ระบบเช็กชื่อด้วย QR Code"] };
    case "experience":
      return { items: ["Internship / Competition / Activity - อธิบายบทบาทและผลลัพธ์"] };
    case "certificates":
      return { items: ["Certificate name - Organization"] };
    case "contact":
      return { body: `Email: ${email}\nGitHub: github.com/username\nLinkedIn: linkedin.com/in/username` };
    case "custom":
      return { body: "เพิ่มเนื้อหาที่ต้องการแสดงใน Resume" };
    default:
      return { body: "" };
  }
}

/* ------------------------------------------------------------------ */
/*  Default sections                                                   */
/* ------------------------------------------------------------------ */

/**
 * ฟังก์ชัน 3.12: สร้างชุดบล็อกเริ่มต้นสำหรับนักศึกษาใหม่ (Default Sections Generator)
 * หน้าที่: เรียกใช้ applyTemplate ร่วมกับเทมเพลตเริ่มต้น เพื่อสร้างหมวดหมู่พื้นฐานให้นักศึกษาเมื่อเริ่มสร้างเรซูเม่ครั้งแรก
 * พารามิเตอร์: user - ข้อมูลนักศึกษา, templateId - รหัสเทมเพลตเริ่มต้น
 * คืนค่า: PortfolioSection[] ชุดบล็อกเนื้อหาเริ่มต้น
 */
export function defaultSections(user: UserDoc, templateId: TemplateId = "professional"): PortfolioSection[] {
  return applyTemplate(templateId, [], user);
}

/* ------------------------------------------------------------------ */
/*  Slug generation                                                    */
/* ------------------------------------------------------------------ */

/**
 * ฟังก์ชัน 3.13: แปลงข้อความเป็นชื่อลิงก์ URL สากล (Slugify)
 * หน้าที่: แปลงตัวอักษรเป็นพิมพ์เล็ก ตัดอักขระพิเศษออก แล้วแทนที่ช่องว่างด้วยเครื่องหมายขีดกลาง (-) เช่น "somchai-portfolio"
 * พารามิเตอร์: input - ข้อความต้นฉบับ
 * คืนค่า: string ข้อความ slug ที่ใช้กับเว็บได้ปลอดภัย
 */
function slugify(input: string) {
  const normalized = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || `resume-${Date.now()}`;
}

/**
 * ฟังก์ชัน 3.14: การันตีชื่อลิงก์ไม่ซ้ำกันในระบบ (Generate Unique Slug)
 * หน้าที่: ตรวจสอบในฐานข้อมูลว่าชื่อ slug นี้มีคนใช้หรือยัง หากมีแล้วจะเติมเลขต่อท้าย เช่น -2, -3 ไปเรื่อยๆ จนกว่าจะไม่ซ้ำ
 * พารามิเตอร์: seed - ข้อความตั้งต้น (เช่น รหัสนักศึกษา), ignorePortfolioId - ID ผลงานเดิม (กรณีแก้ไขงานเดิม)
 * คืนค่า: Promise<string> ชื่อ slug ที่รับประกันว่าไม่ซ้ำใครแน่นอน
 */
export async function uniqueSlug(seed: string, ignorePortfolioId?: ObjectId) {
  const db = await getDb();
  const base = slugify(seed);
  let slug = base;
  let index = 2;

  while (
    await db.collection<PortfolioDoc>("portfolios").findOne({
      slug,
      ...(ignorePortfolioId ? { _id: { $ne: ignorePortfolioId } } : {})
    })
  ) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}

/* ------------------------------------------------------------------ */
/*  Portfolio CRUD                                                     */
/* ------------------------------------------------------------------ */

/**
 * ฟังก์ชัน 3.15: เปิดแฟ้มผลงาน หรือสร้างแฟ้มใหม่หากยังไม่มี (Get or Create Portfolio)
 * หน้าที่: ค้นหาแฟ้มผลงานของนักศึกษาจาก userId หากพบจะส่งคืนทันที หากเป็นผู้ใช้ใหม่จะสร้างแฟ้มผลงานเริ่มต้นให้แบบอัตโนมัติ
 * พารามิเตอร์: userId - ID ของนักศึกษา
 * คืนค่า: Promise<PortfolioDoc> เอกสารแฟ้มผลงานจากฐานข้อมูล
 */
export async function getOrCreatePortfolio(userId: string) {
  const db = await getDb();
  const objectUserId = new ObjectId(userId);
  const existing = await db.collection<PortfolioDoc>("portfolios").findOne({ userId: objectUserId });
  if (existing) return existing;

  const user = await db.collection<UserDoc>("users").findOne({ _id: objectUserId });
  if (!user) throw new Error("User not found");

  const now = new Date();
  const title = `${user.firstName} ${user.lastName} Resume`.trim();
  const slug = await uniqueSlug(user.studentId || title);
  const templateId: TemplateId = "professional";
  const portfolio: Omit<PortfolioDoc, "_id"> = {
    userId: objectUserId,
    title,
    slug,
    status: "draft",
    theme: "modern",
    templateId,
    styleSettings: defaultStyleSettings,
    sections: defaultSections(user, templateId),
    publishedAt: null,
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection<Omit<PortfolioDoc, "_id">>("portfolios").insertOne(portfolio);
  return { _id: result.insertedId, ...portfolio };
}

/**
 * ฟังก์ชัน 3.16: แปลงเอกสารจากฐานข้อมูลเป็น JSON สำหรับส่งให้หน้าเว็บ (Serialize Portfolio)
 * หน้าที่: แปลง ObjectId เป็นสตริง, แปลงวันที่ Date เป็น ISO String, และจัดเรียงบล็อกตามลำดับ order เพื่อให้เบราว์เซอร์นำไปแสดงผลได้ทันที
 * พารามิเตอร์: portfolio - เอกสารเรซูเม่จาก MongoDB
 * คืนค่า: SerializedPortfolio ออบเจกต์เรซูเม่รูปแบบ JSON ที่ปลอดภัย
 */
export function serializePortfolio(portfolio: PortfolioDoc): SerializedPortfolio {
  return {
    id: portfolio._id.toString(),
    userId: portfolio.userId.toString(),
    title: portfolio.title,
    slug: portfolio.slug,
    status: portfolio.status,
    theme: portfolio.theme,
    templateId: portfolio.templateId || "professional",
    styleSettings: portfolio.styleSettings,
    sections: [...portfolio.sections].map(withSectionStyle).sort((a, b) => a.order - b.order),
    publishedAt: portfolio.publishedAt ? portfolio.publishedAt.toISOString() : null,
    createdAt: portfolio.createdAt.toISOString(),
    updatedAt: portfolio.updatedAt.toISOString()
  };
}

/**
 * ฟังก์ชัน 3.17: ตรวจสอบและคลีนข้อมูลบล็อกทั้งหมดก่อนบันทึกลงฐานข้อมูล (Sanitize Sections)
 * หน้าที่: ควบคุมความยาวหัวข้อไม่เกิน 80 ตัวอักษร, ข้อความบรรยายไม่เกิน 4,000 ตัวอักษร และจำกัดจำนวนรายการ เพื่อความปลอดภัยของระบบ
 * พารามิเตอร์: sections - รายการบล็อกเนื้อหาทั้งหมดที่ผู้ใช้ส่งมา
 * คืนค่า: PortfolioSection[] ข้อมูลบล็อกที่ผ่านการทำความสะอาดเรียบร้อยแล้ว
 */
export function sanitizeSections(sections: PortfolioSection[]): PortfolioSection[] {
  return sections.map((section, index) => ({
    id: section.id || crypto.randomUUID(),
    type: section.type,
    title: String(section.title || "Untitled").slice(0, 80),
    visible: Boolean(section.visible),
    order: index + 1,
    columns: section.columns === 2 ? 2 : 1,
    accentColor: /^#[0-9a-fA-F]{6}$/.test(String(section.accentColor || "")) ? String(section.accentColor) : undefined,
    backgroundColor: /^#[0-9a-fA-F]{6}$/.test(String(section.backgroundColor || "")) ? String(section.backgroundColor) : undefined,
    settings: sanitizeSectionSettings(section),
    frame: sanitizeSectionFrame(section),
    gridPlacement: sanitizeGridPlacement(section.gridPlacement),
    content: {
      body: String(section.content?.body || "").slice(0, 4000),
      imageUrl: String(section.content?.imageUrl || "").slice(0, 1200000),
      items: Array.isArray(section.content?.items)
        ? section.content.items.map((item) => String(item).trim().slice(0, 240)).filter(Boolean).slice(0, 20)
        : []
    }
  }));
}
