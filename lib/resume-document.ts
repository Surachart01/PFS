import type { GridPlacement, PortfolioSection, PortfolioSectionFrame, SerializedPortfolio, TemplateId } from "@/lib/types";
import { documentPadding, documentSize, gridSize } from "@/lib/resume-options";

export type Frame = Required<PortfolioSectionFrame>;

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function snap(value: number, enabled = true) {
  return enabled ? Math.round(value / gridSize) * gridSize : Math.round(value);
}

export function normalizeFrame(section: PortfolioSection): Frame {
  const source = section.frame || {};
  const width = clamp(Number(source.width) || 320, 120, documentSize.width);
  const height = clamp(Number(source.height) || 150, 72, documentSize.height);
  return {
    x: clamp(Number(source.x) || 0, 0, documentSize.width - width),
    y: clamp(Number(source.y) || 0, 0, documentSize.height - height),
    width, height,
    zIndex: clamp(Number(source.zIndex) || section.order || 1, 1, 999),
    locked: source.locked === true
  };
}

export function frameFromGrid(gp: GridPlacement | undefined, order: number): Frame {
  if (!gp) {
    const column = (order - 1) % 2;
    const row = Math.floor((order - 1) / 2);
    return { x: 42 + column * 362, y: 42 + row * 176, width: 346, height: 160, zIndex: order, locked: false };
  }
  const track = (documentSize.width - documentPadding * 2) / 12;
  const x = documentPadding + (gp.colStart - 1) * track;
  const y = documentPadding + (gp.rowStart - 1) * 110;
  const width = Math.max(140, (gp.colEnd - gp.colStart) * track - 14);
  const height = Math.max(88, (gp.rowEnd - gp.rowStart) * 110 - 14);
  return {
    x: Math.round(clamp(x, 0, documentSize.width - width)),
    y: Math.round(clamp(y, 0, documentSize.height - height)),
    width: Math.round(width), height: Math.round(height), zIndex: order, locked: false
  };
}

export function preparePortfolio(portfolio: SerializedPortfolio): SerializedPortfolio {
  if (portfolio.layoutVersion === 1) {
    return { ...portfolio, sections: portfolio.sections.map(section => ({ ...section, frame: normalizeFrame(section) })) };
  }
  return {
    ...portfolio,
    layoutVersion: 1,
    sections: portfolio.sections.map((section, index) => ({
      ...section,
      frame: frameFromGrid(section.gridPlacement, index + 1)
    }))
  };
}

export function overlaps(a: Frame, b: Frame) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function findFreeFrame(sections: PortfolioSection[], width = 320, height = 150): Frame | null {
  const frames = sections.map(normalizeFrame);
  for (let y = 48; y <= documentSize.height - height - 24; y += gridSize) {
    for (let x = 48; x <= documentSize.width - width - 24; x += gridSize) {
      const candidate: Frame = { x, y, width, height, zIndex: sections.length + 1, locked: false };
      if (frames.every(frame => !overlaps(frame, candidate))) return candidate;
    }
  }
  return null;
}

const templateAlias: Record<TemplateId, TemplateId> = {
  professional: "professional", modern: "modern", minimal: "minimal",
  creative: "modern", academic: "professional", compact: "minimal"
};

function layoutForTemplate(type: TemplateId, index: number): Frame | null {
  const preset = templateAlias[type];
  if (preset === "minimal") {
    const widths = [710, 710, 710, 710, 710, 710];
    const heights = [170, 142, 122, 150, 150, 112];
    if (index >= widths.length) return null;
    const y = 42 + heights.slice(0, index).reduce((sum, item) => sum + item + 12, 0);
    return { x: 42, y, width: widths[index], height: heights[index], zIndex: index + 1, locked: false };
  }
  const professional = [
    [42, 42, 710, 178], [42, 232, 220, 180], [274, 232, 478, 180],
    [42, 424, 220, 198], [274, 424, 478, 198], [42, 634, 710, 154]
  ];
  const modern = [
    [42, 42, 340, 224], [394, 42, 358, 224], [42, 278, 340, 190],
    [394, 278, 358, 190], [42, 480, 340, 214], [394, 480, 358, 214]
  ];
  const item = (preset === "modern" ? modern : professional)[index];
  return item ? { x: item[0], y: item[1], width: item[2], height: item[3], zIndex: index + 1, locked: false } : null;
}

export function applyDocumentTemplate(portfolio: SerializedPortfolio, id: TemplateId, withTheme: boolean): SerializedPortfolio | null {
  const sections: PortfolioSection[] = [];
  for (const [index, old] of portfolio.sections.entries()) {
    const preset = layoutForTemplate(id, index);
    const frame = preset || findFreeFrame(sections, 320, 150);
    if (!frame) return null;
    sections.push({ ...old, order: index + 1, frame });
  }
  const accent = id === "modern" || id === "creative" ? "#2563eb" : id === "minimal" || id === "compact" ? "#26313c" : "#0f766e";
  return {
    ...portfolio, layoutVersion: 1, templateId: id, sections,
    styleSettings: withTheme ? { ...portfolio.styleSettings, primaryColor: accent } : portfolio.styleSettings
  };
}

export function makeSection(type: PortfolioSection["type"], frame: Frame, mode: "section" | "text" | "image" = "section"): PortfolioSection {
  const titles: Record<PortfolioSection["type"], string> = {
    profile: "ข้อมูลส่วนตัว", about: "แนะนำตัว", education: "การศึกษา", skills: "ทักษะ",
    projects: "ผลงาน", experience: "ประสบการณ์", certificates: "ใบรับรอง", contact: "ติดต่อ", custom: "ข้อความ"
  };
  return {
    id: crypto.randomUUID(), type, title: mode === "image" ? "รูปภาพ" : titles[type],
    visible: true, order: frame.zIndex, frame, columns: 1,
    settings: { showTitle: mode === "section", contentMode: mode, padding: "comfortable", alignment: "left", imageFit: "cover" },
    content: { body: mode === "text" ? "เขียนข้อความของคุณ" : "", items: [] }
  };
}
