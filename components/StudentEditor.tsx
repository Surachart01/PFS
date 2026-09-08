"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Award,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Columns2,
  Code2,
  Copy,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  GripVertical,
  Image as ImageIcon,
  Layers,
  Layout,
  Link as LinkIcon,
  Mail,
  Palette,
  Save,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  Type,
  UserRound,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CSSProperties, DragEvent } from "react";

import { ResumeRenderer } from "@/components/ResumeRenderer";
import { TemplateGallery } from "@/components/TemplateGallery";
import type { GridPlacement, PortfolioSection, PortfolioSectionSettings, SerializedPortfolio, TemplateId } from "@/lib/types";

type DragPayload = { source: "library"; type: PortfolioSection["type"] };
type InspectorTab = "content" | "design";
type CompleteSectionSettings = Required<PortfolioSectionSettings>;

const sectionIcons: Record<PortfolioSection["type"], LucideIcon> = {
  profile: UserRound,
  about: FileText,
  education: GraduationCap,
  skills: Code2,
  projects: BriefcaseBusiness,
  experience: BriefcaseBusiness,
  certificates: Award,
  contact: Mail,
  custom: Sparkles
};

const colorSwatches = [
  "#0f766e", "#2563eb", "#7c3aed", "#ea580c", "#be123c",
  "#0891b2", "#ca8a04", "#475569", "#171a21", "#059669",
  "#d97706", "#dc2626", "#4f46e5", "#0284c7"
];

const fontFamilies = [
  { label: "Inter (Modern Clean)", value: "Inter" },
  { label: "Prompt (Thai Modern)", value: "Prompt" },
  { label: "Kanit (Thai Sleek)", value: "Kanit" },
  { label: "Playfair Display (Serif Luxury)", value: "Playfair Display" },
  { label: "Fira Code (Tech Mono)", value: "Fira Code" },
  { label: "Outfit (Creative Geometric)", value: "Outfit" }
];

const bgThemes = [
  { label: "Default Light", value: "default" },
  { label: "Dark Slate Mode", value: "dark-slate" },
  { label: "Glassmorphism", value: "glassmorphism" },
  { label: "Mesh Gradient", value: "mesh-gradient" },
  { label: "Sunset Glow", value: "sunset" },
  { label: "Nordic Clean", value: "nordic" }
];

type BlockTemplate = {
  type: PortfolioSection["type"];
  title: string;
  description: string;
  category: "student" | "content";
  icon: LucideIcon;
  accentColor: string;
  backgroundColor: string;
  columns?: 1 | 2;
  body?: string;
  items?: string[];
};

const blockTemplates: BlockTemplate[] = [
  {
    type: "profile",
    title: "ข้อมูลพื้นฐาน",
    description: "ชื่อ สาขา ชั้นปี และอีเมล",
    category: "student",
    icon: UserRound,
    accentColor: "#0f766e",
    backgroundColor: "#ecfdf5",
    columns: 2,
    body: "ชื่อ-นามสกุล\nComputer Engineering | Year 4\nemail@example.com"
  },
  {
    type: "education",
    title: "การศึกษา",
    description: "มหาวิทยาลัย หลักสูตร และปีการศึกษา",
    category: "student",
    icon: GraduationCap,
    accentColor: "#7c3aed",
    backgroundColor: "#f5f3ff",
    body: "B.Eng. Computer Engineering\nเพิ่มชื่อมหาวิทยาลัยและปีการศึกษา"
  },
  {
    type: "contact",
    title: "ช่องทางติดต่อ",
    description: "อีเมล GitHub LinkedIn หรือเบอร์โทร",
    category: "student",
    icon: Mail,
    accentColor: "#475569",
    backgroundColor: "#f8fafc",
    columns: 2,
    body: "Email: email@example.com\nGitHub: github.com/username\nLinkedIn: linkedin.com/in/username"
  },
  {
    type: "about",
    title: "แนะนำตัว",
    description: "เล่าเป้าหมาย ความสนใจ และตัวตน",
    category: "content",
    icon: FileText,
    accentColor: "#2563eb",
    backgroundColor: "#eff6ff",
    body: "เขียนแนะนำตัว ความสนใจด้านวิศวกรรมคอมพิวเตอร์ และเป้าหมายในการทำงานของคุณ"
  },
  {
    type: "skills",
    title: "ทักษะ",
    description: "ภาษา เครื่องมือ และเทคโนโลยี",
    category: "content",
    icon: Code2,
    accentColor: "#0891b2",
    backgroundColor: "#ecfeff",
    columns: 2,
    items: ["Next.js", "MongoDB", "Node.js", "TypeScript"]
  },
  {
    type: "projects",
    title: "โปรเจกต์",
    description: "ผลงานเด่นพร้อมรายละเอียดสั้น ๆ",
    category: "content",
    icon: BriefcaseBusiness,
    accentColor: "#ea580c",
    backgroundColor: "#fff7ed",
    items: ["Smart Attendance System - ระบบเช็กชื่อด้วย QR Code"]
  },
  {
    type: "experience",
    title: "ประสบการณ์",
    description: "ฝึกงาน กิจกรรม หรือการแข่งขัน",
    category: "content",
    icon: BriefcaseBusiness,
    accentColor: "#be123c",
    backgroundColor: "#fff1f2",
    items: ["Internship / Competition / Activity - อธิบายบทบาทและผลลัพธ์"]
  },
  {
    type: "certificates",
    title: "Certificate",
    description: "ใบรับรองหรือคอร์สที่เรียนจบ",
    category: "content",
    icon: Award,
    accentColor: "#ca8a04",
    backgroundColor: "#fefce8",
    items: ["Certificate name - Organization"]
  },
  {
    type: "custom",
    title: "ข้อความอิสระ",
    description: "บล็อกว่างสำหรับเนื้อหาอื่น ๆ",
    category: "content",
    icon: Type,
    accentColor: "#171a21",
    backgroundColor: "#f4f6f8",
    body: "เพิ่มเนื้อหาที่ต้องการแสดงใน Resume"
  }
];

function reorderSections(sections: PortfolioSection[]) {
  return sections.map((section, index) => ({ ...section, order: index + 1 }));
}

function defaultSettingsForType(type: PortfolioSection["type"]): CompleteSectionSettings {
  return {
    showTitle: true,
    alignment: "left",
    padding: "comfortable",
    radius: "soft",
    shadow: "soft",
    width: "full",
    imagePosition: "left",
    itemStyle: type === "skills" ? "chips" : "cards",
    borderStyle: "accent-left",
    cardVariant: "solid",
    column: ["skills", "certificates"].includes(type) ? "right" : "left"
  };
}

function getSectionSettings(section: PortfolioSection): CompleteSectionSettings {
  return {
    ...defaultSettingsForType(section.type),
    ...section.settings,
    showTitle: section.settings?.showTitle !== false
  };
}

function templateByType(type: PortfolioSection["type"]) {
  return blockTemplates.find((template) => template.type === type) || blockTemplates[blockTemplates.length - 1];
}

function templateToSection(template: BlockTemplate, order: number, gridPlacement?: GridPlacement): PortfolioSection {
  return {
    id: crypto.randomUUID(),
    type: template.type,
    title: template.title,
    visible: true,
    order,
    columns: template.columns || 1,
    accentColor: template.accentColor,
    backgroundColor: template.backgroundColor,
    settings: defaultSettingsForType(template.type),
    gridPlacement: gridPlacement || {
      colStart: 1,
      colEnd: 13,
      rowStart: order * 2 - 1,
      rowEnd: order * 2 + 1
    },
    content: {
      body: template.body || "",
      items: template.items ? [...template.items] : []
    }
  };
}

function renderSectionItems(items: string[], itemStyle: string, accent: string) {
  if (items.length === 0) return null;

  if (itemStyle === "bars") {
    return (
      <div className="document-item-bars">
        {items.map((item, i) => {
          const percent = 80 + ((i * 7) % 20);
          return (
            <div className="item-bar-row" key={item}>
              <div className="item-bar-label">
                <span>{item}</span>
                <small>{percent}%</small>
              </div>
              <div className="item-bar-track">
                <div className="item-bar-fill" style={{ width: `${percent}%`, backgroundColor: accent }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (itemStyle === "timeline") {
    return (
      <div className="document-item-timeline">
        {items.map((item) => (
          <div className="timeline-node" key={item}>
            <div className="timeline-dot" style={{ backgroundColor: accent }} />
            <div className="timeline-content">{item}</div>
          </div>
        ))}
      </div>
    );
  }

  if (itemStyle === "pills") {
    return (
      <div className="document-mini-items items-pills-wrap">
        {items.map((item) => (
          <span className="pill-item" key={item} style={{ borderColor: `color-mix(in srgb, ${accent} 40%, transparent)` }}>
            ✦ {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="document-mini-items">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

export function StudentEditor({ initialPortfolio }: { initialPortfolio: SerializedPortfolio }) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [documentDropActive, setDocumentDropActive] = useState(false);
  const [selectedId, setSelectedId] = useState(initialPortfolio.sections[0]?.id || null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("content");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sortedSections = useMemo(() => {
    const list = [...portfolio.sections].sort((a, b) => a.order - b.order);
    const profileIdx = list.findIndex((s) => s.type === "profile");
    if (profileIdx > 0) {
      const [prof] = list.splice(profileIdx, 1);
      list.unshift(prof);
    }
    return list;
  }, [portfolio.sections]);

  /**
   * ฟังก์ชัน 5.1.1: เลื่อนตำแหน่งการ์ดขึ้นหรือลง (Move Section Up/Down)
   * หน้าที่: สลับลำดับการแสดงผลของการ์ดในคอลัมน์ โดย Profile จะถูกล็อกไว้ด้านบนเสมอ
   */
  function moveSection(index: number, direction: "up" | "down") {
    if (index === 0 || sortedSections[index]?.type === "profile") return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex <= 0 || targetIndex >= sortedSections.length) return;

    const newSections = [...sortedSections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);
    setSections(newSections, moved.id);
    setMessage(`ย้าย ${moved.title} เรียบร้อยแล้ว`);
  }

  function handleSidebarDragStart(e: DragEvent, index: number) {
    if (index === 0 || sortedSections[index]?.type === "profile") {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setDraggedIndex(index);
  }

  function handleSidebarDrop(e: DragEvent, targetIndex: number) {
    e.preventDefault();
    const sourceRaw = e.dataTransfer.getData("text/plain");
    const sourceIndex = sourceRaw !== "" ? Number(sourceRaw) : draggedIndex;
    setDraggedIndex(null);
    if (
      sourceIndex === null ||
      sourceIndex === undefined ||
      isNaN(sourceIndex) ||
      sourceIndex === 0 ||
      sourceIndex === targetIndex
    ) {
      return;
    }

    const effectiveTargetIndex = Math.max(1, targetIndex);
    const targetSec = sortedSections[effectiveTargetIndex];
    const targetCol = targetSec?.settings?.column || (["skills", "certificates"].includes(targetSec?.type || "") ? "right" : "left");

    const moved = sortedSections[sourceIndex];
    if (!moved) return;

    const updatedMoved = {
      ...moved,
      settings: {
        ...getSectionSettings(moved),
        column: targetCol
      }
    };

    const newSections = [...sortedSections];
    newSections.splice(sourceIndex, 1);
    newSections.splice(effectiveTargetIndex, 0, updatedMoved);
    setSections(newSections, updatedMoved.id);
    setMessage(`ย้าย ${moved.title} ไปคอลัมน์${targetCol === "left" ? "ซ้าย" : "ขวา"} เรียบร้อยแล้ว`);
  }
  const selectedSection = sortedSections.find((section) => section.id === selectedId) || null;
  const selectedTemplate = selectedSection ? templateByType(selectedSection.type) : null;
  const selectedItemsText = (selectedSection?.content.items || []).join("\n");
  const selectedSettings = selectedSection ? getSectionSettings(selectedSection) : null;
  const studentBlocks = blockTemplates.filter((template) => template.category === "student");
  const contentBlocks = blockTemplates.filter((template) => template.category === "content");

  const maxGridRow = useMemo(() => {
    return sortedSections.reduce((max, s) => Math.max(max, s.gridPlacement?.rowEnd || 2), 2);
  }, [sortedSections]);

  function setSections(sections: PortfolioSection[], nextSelectedId?: string | null) {
    setPortfolio((current) => ({ ...current, sections: reorderSections(sections) }));
    if (nextSelectedId !== undefined) setSelectedId(nextSelectedId);
  }

  function updateSection(id: string, patch: Partial<PortfolioSection>) {
    setPortfolio((current) => ({
      ...current,
      sections: current.sections.map((section) => (section.id === id ? { ...section, ...patch } : section))
    }));
  }

  function updateSectionSettings(id: string, patch: Partial<CompleteSectionSettings>) {
    setPortfolio((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === id
          ? {
              ...section,
              settings: {
                ...getSectionSettings(section),
                ...patch
              }
            }
          : section
      )
    }));
  }

  function updateGridPlacement(id: string, patch: Partial<GridPlacement>) {
    setPortfolio((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === id
          ? {
              ...section,
              gridPlacement: {
                colStart: section.gridPlacement?.colStart || 1,
                colEnd: section.gridPlacement?.colEnd || 13,
                rowStart: section.gridPlacement?.rowStart || 1,
                rowEnd: section.gridPlacement?.rowEnd || 3,
                ...patch
              }
            }
          : section
      )
    }));
  }

  function updateContent(id: string, body: string, itemsText: string) {
    setPortfolio((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === id
          ? {
              ...section,
              content: {
                ...section.content,
                body,
                items: itemsText.split("\n")
              }
            }
          : section
      )
    }));
  }

  function updateSectionContent(id: string, patch: Partial<PortfolioSection["content"]>) {
    setPortfolio((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === id
          ? {
              ...section,
              content: {
                ...section.content,
                ...patch
              }
            }
          : section
      )
    }));
  }

  function uploadImage(file: File, sectionId: string) {
    if (!file.type.startsWith("image/")) {
      setMessage("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 900 * 1024) {
      setMessage("รูปภาพใหญ่เกินไป กรุณาใช้ไฟล์ไม่เกิน 900KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = typeof reader.result === "string" ? reader.result : "";
      updateSectionContent(sectionId, { imageUrl });
      setMessage("เพิ่มรูปภาพใน element แล้ว");
    };
    reader.onerror = () => setMessage("อ่านไฟล์รูปภาพไม่สำเร็จ");
    reader.readAsDataURL(file);
  }

  function startLibraryDrag(event: DragEvent<HTMLButtonElement>, type: PortfolioSection["type"]) {
    const payload: DragPayload = { source: "library", type };
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-pfs-block", JSON.stringify(payload));
    setDragPayload(payload);
  }

  function readPayload(event: DragEvent) {
    if (dragPayload) return dragPayload;
    const raw = event.dataTransfer.getData("application/x-pfs-block");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DragPayload;
    } catch {
      return null;
    }
  }

  function dropOnDocument(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDocumentDropActive(false);
    const payload = readPayload(event);
    setDragPayload(null);
    if (!payload) return;

    const template = templateByType(payload.type);
    const section = templateToSection(template, sortedSections.length + 1, {
      colStart: 1,
      colEnd: 13,
      rowStart: maxGridRow,
      rowEnd: maxGridRow + 2
    });
    setSections([...sortedSections, section], section.id);
    setMessage(`เพิ่ม ${template.title} ลงบน document แล้ว`);
  }

  /**
   * ฟังก์ชัน 5.1.2: เพิ่มบล็อกหมวดหมู่ใหม่ลงบนหน้าจอ (Add Block to Canvas)
   * หน้าที่: สร้างการ์ดใหม่ตามประเภทที่เลือก (เช่น ทักษะ, โปรเจกต์) แล้ววางต่อท้ายตารางบน Canvas
   */
  function addBlock(type: PortfolioSection["type"]) {
    const template = templateByType(type);
    const section = templateToSection(template, sortedSections.length + 1, {
      colStart: 1,
      colEnd: 13,
      rowStart: maxGridRow,
      rowEnd: maxGridRow + 2
    });
    setSections([...sortedSections, section], section.id);
    setMessage(`เพิ่ม ${template.title} ลงบน document แล้ว`);
  }

  /**
   * ฟังก์ชัน 5.1.3: ลบการ์ดที่ไม่ต้องการออกจากเรซูเม่ (Remove Section)
   * หน้าที่: นำการ์ดออกจากรายการและปรับการเลือกการ์ดถัดไปอัตโนมัติ
   */
  function removeSection(id: string, title?: string) {
    const nextSections = sortedSections.filter((section) => section.id !== id);
    const currentIndex = sortedSections.findIndex((section) => section.id === id);
    const nextSelected = selectedId === id ? nextSections[currentIndex]?.id || nextSections[currentIndex - 1]?.id || null : selectedId;
    setSections(nextSections, nextSelected);
    setMessage(`ลบ ${title || "element"} เรียบร้อยแล้ว`);
  }

  function duplicateSection(section: PortfolioSection) {
    const gp = section.gridPlacement;
    const copy: PortfolioSection = {
      ...section,
      id: crypto.randomUUID(),
      title: `${section.title} Copy`,
      settings: { ...getSectionSettings(section) },
      gridPlacement: {
        colStart: gp?.colStart || 1,
        colEnd: gp?.colEnd || 13,
        rowStart: maxGridRow,
        rowEnd: maxGridRow + (gp ? gp.rowEnd - gp.rowStart : 2)
      },
      content: {
        ...section.content,
        items: section.content.items ? [...section.content.items] : []
      }
    };
    setSections([...sortedSections, copy], copy.id);
    setMessage(`คัดลอก ${section.title} เรียบร้อยแล้ว`);
  }

  function handleTemplateSelect(templateId: TemplateId) {
    applyTemplateClient(templateId);
    setShowTemplateGallery(false);
  }

  /**
   * ฟังก์ชัน 5.1.4: สลับเทมเพลตเรซูเม่ในคลิกเดียว (Apply Template Client)
   * หน้าที่: ส่งรหัสเทมเพลตไปยังเซิร์ฟเวอร์เพื่อคำนวณตำแหน่งกริดใหม่โดยรักษาเนื้อหาเดิมของนักศึกษาไว้
   */
  async function applyTemplateClient(templateId: TemplateId) {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/portfolio/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...portfolio,
          templateId,
          applyTemplate: true
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.message || "ใช้ template ไม่สำเร็จ");
        return;
      }
      setPortfolio(data.portfolio);
      setSelectedId(data.portfolio.sections[0]?.id || null);
      setMessage(`เปลี่ยน template เป็น ${templateId} เรียบร้อยแล้ว`);
      router.refresh();
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อเพื่อเปลี่ยน template ได้");
    } finally {
      setSaving(false);
    }
  }

  /**
   * ฟังก์ชัน 5.1.5: บันทึกข้อมูลแบบร่าง (Save Draft Client)
   * หน้าที่: ส่งข้อมูลการแก้ไขและสไตล์ทั้งหมดไปบันทึกลงฐานข้อมูล MongoDB ผ่าน API PUT /api/portfolio/me
   */
  async function save(): Promise<boolean> {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/portfolio/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolio)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.message || "บันทึกไม่สำเร็จ");
        return false;
      }
      setPortfolio(data.portfolio);
      setMessage("บันทึกเรียบร้อยแล้ว");
      router.refresh();
      return true;
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อเพื่อบันทึกข้อมูลได้");
      return false;
    } finally {
      setSaving(false);
    }
  }

  /**
   * ฟังก์ชัน 5.1.6: เผยแพร่ผลงานสู่สาธารณะ (Publish Portfolio Client)
   * หน้าที่: บันทึกข้อมูลล่าสุด แล้วส่งคำสั่งเปิดสถานะเป็น published ให้คนภายนอกเปิดดูผ่านลิงก์ได้ทันที
   */
  async function publish() {
    const saved = await save();
    if (!saved) return;
    const response = await fetch("/api/portfolio/me/publish", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.message || "เผยแพร่ไม่สำเร็จ");
      return;
    }
    setPortfolio(data.portfolio);
    setMessage("เผยแพร่ Resume เรียบร้อยแล้ว");
    router.refresh();
  }

  /**
   * ฟังก์ชัน 5.1.7: ปิดการแสดงผลงานสาธารณะชั่วคราว (Unpublish Portfolio Client)
   * หน้าที่: ปรับสถานะกลับเป็น draft เพื่อซ่อนผลงานไม่ให้คนภายนอกเข้าดู
   */
  async function unpublish() {
    const response = await fetch("/api/portfolio/me/unpublish", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.message || "ปิดเผยแพร่ไม่สำเร็จ");
      return;
    }
    setPortfolio(data.portfolio);
    setMessage("ปิดเผยแพร่แล้ว");
    router.refresh();
  }

  function renderInspectorTab(tab: InspectorTab, label: string, Icon: LucideIcon) {
    return (
      <button className={inspectorTab === tab ? "active" : ""} onClick={() => setInspectorTab(tab)} type="button">
        <Icon size={15} />
        {label}
      </button>
    );
  }

  function renderSegmentButton(active: boolean, onClick: () => void, label: string, Icon?: LucideIcon) {
    const IconComponent = Icon;
    return (
      <button className={active ? "active" : ""} onClick={onClick} type="button">
        {IconComponent ? <IconComponent size={15} /> : null}
        {label}
      </button>
    );
  }

  function renderLibraryGroup(title: string, blocks: BlockTemplate[]) {
    return (
      <div className="library-group">
        <h3>{title}</h3>
        <div className="block-library">
          {blocks.map((template) => {
            const Icon = template.icon;
            return (
              <button
                className="library-card"
                draggable
                key={template.type}
                onClick={() => addBlock(template.type)}
                onDragEnd={() => {
                  setDragPayload(null);
                  setDocumentDropActive(false);
                }}
                onDragStart={(event) => startLibraryDrag(event, template.type)}
                type="button"
              >
                <Icon size={20} />
                <span>
                  <strong>{template.title}</strong>
                  <small>{template.description}</small>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderElement(section: PortfolioSection) {
    const template = templateByType(section.type);
    const Icon = template.icon;
    const settings = getSectionSettings(section);
    const items = section.content.items || [];
    const accentColor = section.accentColor || template.accentColor;
    const backgroundColor = section.backgroundColor || template.backgroundColor;
    const hasMedia = Boolean(section.content.imageUrl);
    const gp = section.gridPlacement;
    const isSelected = selectedId === section.id;

    const elementStyle = {
      "--block-accent": accentColor,
      "--block-bg": backgroundColor,
      gridColumn: gp ? `${gp.colStart} / ${gp.colEnd}` : "1 / 13",
      gridRow: gp ? `${gp.rowStart} / ${gp.rowEnd}` : "auto"
    } as CSSProperties;

    return (
      <article
        className={`grid-document-element editor-element ${isSelected ? "selected" : ""} ${!section.visible ? "muted-block" : ""} columns-${section.columns || 1} align-${settings.alignment} pad-${settings.padding} radius-${settings.radius} shadow-${settings.shadow} image-${settings.imagePosition} items-${settings.itemStyle} border-${settings.borderStyle} variant-${settings.cardVariant}`}
        key={section.id}
        onClick={() => setSelectedId(section.id)}
        style={elementStyle}
      >
        <div className="element-frame-label">
          <div className="label-title-group">
            <Icon size={13} />
            <span>{section.title}</span>
            {gp ? <small>{gp.colEnd - gp.colStart} col × {gp.rowEnd - gp.rowStart} row</small> : null}
          </div>
        </div>

        {isSelected ? (
          <div className="card-floating-toolbar">
            <button
              className="floating-btn"
              onClick={(e) => {
                e.stopPropagation();
                duplicateSection(section);
              }}
              title="คัดลอก Element"
              type="button"
            >
              <Copy size={14} />
              คัดลอก
            </button>
            <button
              className="floating-btn"
              onClick={(e) => {
                e.stopPropagation();
                updateSection(section.id, { visible: !section.visible });
              }}
              title={section.visible ? "ซ่อน Element" : "แสดง Element"}
              type="button"
            >
              {section.visible ? <EyeOff size={14} /> : <Eye size={14} />}
              {section.visible ? "ซ่อน" : "แสดง"}
            </button>
          </div>
        ) : null}

        <div className="document-element-inner">
          <div className={`document-element-layout ${hasMedia ? "has-media" : "no-media"}`}>
            {section.content.imageUrl ? (
              <div className="document-element-image">
                <img alt={`${section.title} image`} src={section.content.imageUrl} />
              </div>
            ) : null}
            <div className="document-element-copy">
              {settings.showTitle ? <h2>{section.title}</h2> : null}
              {section.content.body ? <div className="portfolio-body">{section.content.body}</div> : null}
              {renderSectionItems(items, settings.itemStyle, accentColor)}
              {!section.content.body && items.length === 0 ? <p className="muted">Empty element</p> : null}
            </div>
          </div>
        </div>
      </article>
    );
  }

  const bgTheme = portfolio.styleSettings.backgroundTheme || "default";

  return (
    <div className="grid">
      <section className="panel builder-command-panel">
        <div className="panel-body toolbar builder-command">
          <div className="builder-command-copy">
            <span className="eyebrow">Resume Studio Pro</span>
            <h1>Grid Builder & Layout Studio</h1>
            <p className="muted">{portfolio.title}</p>
          </div>
          <div className="btn-row builder-actions">
            <button className="btn btn-sparkle" onClick={() => setShowTemplateGallery(!showTemplateGallery)} type="button">
              <Sparkles size={18} />
              {showTemplateGallery ? "ปิด Gallery" : "เลือก Template Gallery"}
            </button>
            {portfolio.status === "published" ? (
              <a className="btn" href={`/r/${portfolio.slug}`} target="_blank">
                <Eye size={18} />
                ดู Resume
              </a>
            ) : null}
            <button className="btn" disabled={saving} onClick={save} type="button">
              <Save size={18} />
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button className="btn btn-primary" onClick={publish} type="button">
              <Send size={18} />
              Publish
            </button>
            {portfolio.status === "published" ? (
              <button className="btn btn-danger" onClick={unpublish} type="button">
                ปิดเผยแพร่
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {message ? <div className="alert">{message}</div> : null}

      {showTemplateGallery ? (
        <section className="panel">
          <div className="panel-body">
            <TemplateGallery currentTemplate={portfolio.templateId} onSelect={handleTemplateSelect} />
          </div>
        </section>
      ) : null}

      <div className="editor-layout builder-layout figma-layout">
        <aside className="panel builder-sidebar">
          <div className="panel-body">
            <div className="builder-sidebar-title">
              <Layers size={20} />
              <div>
                <h2>Active Elements ({sortedSections.length})</h2>
                <p className="muted">ลากสลับลำดับ หรือใช้ปุ่ม ▲ ▼</p>
              </div>
            </div>

            {sortedSections.length > 0 ? (
              <div className="active-elements-manager">
                {sortedSections.map((section, index) => {
                  const Icon = sectionIcons[section.type] || Sparkles;
                  const isSelected = selectedId === section.id;
                  const isDragging = draggedIndex === index;
                  const isPinned = section.type === "profile" || index === 0;

                  return (
                    <div
                      className={`active-element-row ${isSelected ? "selected" : ""} ${!section.visible ? "hidden-element" : ""} ${isDragging ? "dragging" : ""} ${isPinned ? "pinned-element-row" : ""}`}
                      draggable={!isPinned}
                      key={section.id}
                      onClick={() => setSelectedId(section.id)}
                      onDragEnd={() => setDraggedIndex(null)}
                      onDragOver={(e) => {
                        if (!isPinned) {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }
                      }}
                      onDragStart={(e) => handleSidebarDragStart(e, index)}
                      onDrop={(e) => !isPinned && handleSidebarDrop(e, index)}
                    >
                      <div className="active-element-name">
                        {isPinned ? (
                          <span className="pinned-badge" title="ส่วนนี้ถูกปักหมุดไว้ที่ด้านบนสุดของเรซูเม่">📌</span>
                        ) : (
                          <GripVertical className="drag-handle" size={14} style={{ color: "#94a3b8", cursor: "grab" }} />
                        )}
                        <Icon size={14} style={{ color: section.accentColor || "var(--accent)" }} />
                        <span>{section.title}</span>
                      </div>
                      {!isPinned ? (
                        <div className="active-element-reorder-actions">
                          {(() => {
                            const currentSide = section.settings?.column || (["skills", "certificates"].includes(section.type) ? "right" : "left");
                            return (
                              <button
                                className="reorder-btn col-side-toggle-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextSide = currentSide === "left" ? "right" : "left";
                                  updateSectionSettings(section.id, { column: nextSide });
                                }}
                                title={`คลิกเพื่อย้ายไปฝั่ง${currentSide === "left" ? "ขวา" : "ซ้าย"}`}
                                type="button"
                              >
                                {currentSide === "left" ? "ซ้าย" : "ขวา"}
                              </button>
                            );
                          })()}
                          <button
                            aria-label="ย้ายขึ้น"
                            className="reorder-btn"
                            disabled={index <= 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(index, "up");
                            }}
                            title="ย้ายขึ้น"
                            type="button"
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            aria-label="ย้ายลง"
                            className="reorder-btn"
                            disabled={index === sortedSections.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(index, "down");
                            }}
                            title="ย้ายลง"
                            type="button"
                          >
                            <ChevronDown size={13} />
                          </button>
                        </div>
                      ) : (
                        <span className="pinned-label">ส่วนหัวหลัก</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="inspector-divider" style={{ margin: "16px 0" }} />

            <div className="builder-sidebar-title">
              <Palette size={20} />
              <div>
                <h2>Assets</h2>
                <p className="muted">ลากลง document หรือคลิกเพิ่ม</p>
              </div>
            </div>
            {renderLibraryGroup("Student", studentBlocks)}
            {renderLibraryGroup("Content", contentBlocks)}
          </div>
        </aside>

        <section className="panel document-canvas-panel">
          <div className="document-panel-body">
            <div className="document-toolbar">
              <div>
                <h2>✨ Resume Canvas</h2>
                <p className="muted">แสดงผลเรซูเม่จริงแบบเรียลไทม์ • คลิกส่วนใดบนเรซูเม่เพื่อเลือกและแก้ไขข้อมูลทางขวามือ</p>
              </div>
            </div>

            <div className="document-stage">
              <div className="live-resume-editor-wrap">
                <ResumeRenderer
                  onSelectSection={(id) => setSelectedId(id)}
                  sections={portfolio.sections}
                  selectedSectionId={selectedId}
                  styleSettings={portfolio.styleSettings}
                  templateId={portfolio.templateId}
                  title={portfolio.title}
                />
              </div>
            </div>
          </div>
        </section>

        <aside className="panel builder-inspector">
          <div className="panel-body">
            <h2>Design & Properties</h2>
            <div className="form">
              <div className="field">
                <label>ชื่อ-นามสกุล / หัวข้อหลัก</label>
                <input className="input" onChange={(event) => setPortfolio({ ...portfolio, title: event.target.value })} value={portfolio.title} />
              </div>

              {/* Dedicated Profile Photo Card */}
              <div className="field profile-photo-upload-field">
                <label>📷 รูปถ่ายโปรไฟล์ (1 รูปสำหรับเรซูเม่)</label>
                <div className="profile-photo-tool-box">
                  <div className="profile-photo-circle-preview">
                    {sortedSections.find((s) => s.type === "profile")?.content.imageUrl ? (
                      <img
                        alt="profile photo"
                        src={sortedSections.find((s) => s.type === "profile")?.content.imageUrl}
                      />
                    ) : (
                      <span>{portfolio.title.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="profile-photo-actions">
                    <label className="upload-box profile-upload-btn">
                      <ImageIcon size={15} />
                      {sortedSections.find((s) => s.type === "profile")?.content.imageUrl ? "เปลี่ยนรูปถ่าย" : "เลือกรูปถ่ายโปรไฟล์"}
                      <input
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          const profSec = sortedSections.find((s) => s.type === "profile");
                          if (file && profSec) {
                            uploadImage(file, profSec.id);
                          }
                        }}
                        type="file"
                      />
                    </label>
                    {sortedSections.find((s) => s.type === "profile")?.content.imageUrl ? (
                      <button
                        className="btn btn-danger-soft"
                        onClick={() => {
                          const profSec = sortedSections.find((s) => s.type === "profile");
                          if (profSec) {
                            updateSectionContent(profSec.id, { imageUrl: "" });
                          }
                        }}
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                        type="button"
                      >
                        <X size={13} />
                        ลบรูปถ่าย
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="field">
                  <label>สีหลักประจำธีม</label>
                  <input
                    className="input color-input"
                    onChange={(event) =>
                      setPortfolio({
                        ...portfolio,
                        styleSettings: { ...portfolio.styleSettings, primaryColor: event.target.value }
                      })
                    }
                    type="color"
                    value={portfolio.styleSettings.primaryColor || "#b83919"}
                  />
                </div>
                <div className="field">
                  <label>แบบอักษร (Font)</label>
                  <select
                    className="select"
                    onChange={(event) =>
                      setPortfolio({
                        ...portfolio,
                        styleSettings: { ...portfolio.styleSettings, fontFamily: event.target.value }
                      })
                    }
                    value={portfolio.styleSettings.fontFamily || "Inter"}
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="inspector-divider" />

            {selectedSection && selectedSettings ? (
              <div className="form inspector-panel">
                <div className="component-summary">
                  <div>
                    <h3 className="inspector-heading">{selectedSection.title}</h3>
                    <p className="muted">{selectedTemplate?.description}</p>
                  </div>
                  <span className="component-type">{selectedSection.type}</span>
                </div>

                <div className="inspector-quick-actions">
                  <button
                    className="btn"
                    onClick={() => duplicateSection(selectedSection)}
                    type="button"
                  >
                    <Copy size={15} />
                    คัดลอกส่วนนี้
                  </button>
                </div>

                <div className="property-tabs" role="tablist">
                  {renderInspectorTab("content", "เนื้อหา (Content)", FileText)}
                  {renderInspectorTab("design", "ตกแต่ง (Design)", Palette)}
                </div>

                {inspectorTab === "content" ? (
                  <div className="property-panel">
                    <div className="field">
                      <label>ชื่อส่วนนี้ (Title)</label>
                      <input className="input" onChange={(event) => updateSection(selectedSection.id, { title: event.target.value })} value={selectedSection.title} />
                    </div>
                    <label className="switch-row">
                      <input checked={selectedSection.visible} onChange={(event) => updateSection(selectedSection.id, { visible: event.target.checked })} type="checkbox" />
                      แสดงส่วนนี้บนหน้า Resume
                    </label>
                    <div className="field">
                      <label>รายละเอียดข้อความ</label>
                      <textarea
                        className="textarea"
                        onChange={(event) => updateContent(selectedSection.id, event.target.value, selectedItemsText)}
                        rows={4}
                        value={selectedSection.content.body || ""}
                      />
                    </div>
                    <div className="field">
                      <label>รายการย่อย (หนึ่งบรรทัดต่อรายการ)</label>
                      <textarea className="textarea" onChange={(event) => updateContent(selectedSection.id, selectedSection.content.body || "", event.target.value)} rows={4} value={selectedItemsText} />
                    </div>
                    <div className="field">
                      <label>รูปภาพประกอบ</label>
                      <div className="image-tools">
                        <label className="upload-box">
                          <ImageIcon size={18} />
                          เลือกรูปภาพ
                          <input accept="image/*" onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0], selectedSection.id)} type="file" />
                        </label>
                        {selectedSection.content.imageUrl ? (
                          <button className="btn btn-danger" onClick={() => updateSectionContent(selectedSection.id, { imageUrl: "" })} type="button">
                            <X size={16} />
                            ลบรูป
                          </button>
                        ) : null}
                      </div>
                      <div className="field compact-field">
                        <label>
                          <LinkIcon size={14} />
                          หรือใส่ Image URL
                        </label>
                        <input className="input" onChange={(event) => updateSectionContent(selectedSection.id, { imageUrl: event.target.value })} placeholder="https://example.com/image.jpg" value={selectedSection.content.imageUrl || ""} />
                      </div>
                    </div>
                  </div>
                ) : null}

                {inspectorTab === "design" ? (
                  <div className="property-panel">
                    <div className="grid grid-2">
                      <div className="field">
                        <label>สีประจำส่วนนี้</label>
                        <input className="input color-input" onChange={(event) => updateSection(selectedSection.id, { accentColor: event.target.value })} type="color" value={selectedSection.accentColor || selectedTemplate?.accentColor || "#b83919"} />
                      </div>
                      <div className="field">
                        <label>สีพื้นหลังส่วนนี้</label>
                        <input className="input color-input" onChange={(event) => updateSection(selectedSection.id, { backgroundColor: event.target.value })} type="color" value={selectedSection.backgroundColor || "#ffffff"} />
                      </div>
                    </div>
                    <div className="field">
                      <label>เลือกสีจานเร็ว</label>
                      <div className="swatch-row">
                        {colorSwatches.map((color) => (
                          <button
                            aria-label={`เลือกสี ${color}`}
                            className="swatch-btn"
                            key={color}
                            onClick={() => updateSection(selectedSection.id, { accentColor: color })}
                            style={{ backgroundColor: color }}
                            type="button"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="field">
                      <label>รูปแบบการแสดงผลรายการ (Item Style)</label>
                      <select
                        className="select"
                        onChange={(event) => updateSectionSettings(selectedSection.id, { itemStyle: event.target.value as any })}
                        value={selectedSettings.itemStyle || "timeline"}
                      >
                        <option value="timeline">Vertical Timeline (ลำดับไทม์ไลน์)</option>
                        <option value="chips">Chips / Tags Badge (ป้ายเรียง)</option>
                        <option value="cards">Mini Cards (การ์ดย่อย)</option>
                        <option value="list">Clean List (รายการธรรมดา)</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>จัดแนวข้อความ</label>
                      <div className="segmented three icon-segmented">
                        {renderSegmentButton(selectedSettings.alignment === "left", () => updateSectionSettings(selectedSection.id, { alignment: "left" }), "Left", AlignLeft)}
                        {renderSegmentButton(selectedSettings.alignment === "center", () => updateSectionSettings(selectedSection.id, { alignment: "center" }), "Center", AlignCenter)}
                        {renderSegmentButton(selectedSettings.alignment === "right", () => updateSectionSettings(selectedSection.id, { alignment: "right" }), "Right", AlignRight)}
                      </div>
                    </div>

                    {selectedSection.type !== "profile" ? (
                      <div className="field">
                        <label>ตำแหน่งฝั่งคอลัมน์ (Column Side)</label>
                        <div className="segmented">
                          {renderSegmentButton(
                            (selectedSettings.column || (["skills", "certificates"].includes(selectedSection.type) ? "right" : "left")) === "left",
                            () => updateSectionSettings(selectedSection.id, { column: "left" }),
                            "⬅️ ฝั่งซ้าย (Left)"
                          )}
                          {renderSegmentButton(
                            (selectedSettings.column || (["skills", "certificates"].includes(selectedSection.type) ? "right" : "left")) === "right",
                            () => updateSectionSettings(selectedSection.id, { column: "right" }),
                            "➡️ ฝั่งขวา (Right)"
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="empty-state">เลือกส่วนบนเรซูเม่เพื่อแก้ไขรายละเอียด</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
