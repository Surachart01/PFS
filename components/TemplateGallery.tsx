"use client";

import { Layout, Sparkles } from "lucide-react";

import type { TemplateId } from "@/lib/types";

type TemplateCard = {
  id: TemplateId;
  name: string;
  description: string;
  accentColor: string;
  previewGradient: string;
};

const templates: TemplateCard[] = [
  {
    id: "professional",
    name: "Professional (Emily Hughes)",
    description: "รูปแบบยอดนิยม มี Dark Sidebar รูปโปรไฟล์ และหัวข้อสีชัดเจน",
    accentColor: "#b83919",
    previewGradient: "linear-gradient(135deg, #1f242b 0%, #374151 100%)"
  },
  {
    id: "modern",
    name: "Modern (Atlas)",
    description: "เน้นส่วนบนโดดเด่น แบ่งเนื้อหา 2 คอลัมน์ทันสมัย",
    accentColor: "#7c3aed",
    previewGradient: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)"
  },
  {
    id: "creative",
    name: "Creative",
    description: "สีสันสดใส โดดเด่น เหมาะกับสายงานดีไซน์ / ครีเอทีฟ",
    accentColor: "#ea580c",
    previewGradient: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)"
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "เรียบหรู คลีน สไตล์บรรณาธิการ เน้นอ่านง่าย",
    accentColor: "#475569",
    previewGradient: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
  },
  {
    id: "academic",
    name: "Academic",
    description: "สไตล์วิชาการ สรุปข้อมูลการศึกษาและทักษะชัดเจน",
    accentColor: "#2563eb",
    previewGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
  },
  {
    id: "compact",
    name: "Compact",
    description: "กระชับ จัดระเบียบข้อมูลได้เยอะในหน้าเดียว",
    accentColor: "#0f766e",
    previewGradient: "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%)"
  }
];

function MiniTemplatePreview({ templateId, accentColor }: { templateId: TemplateId; accentColor: string }) {
  if (templateId === "professional") {
    return (
      <div className="mini-cv-preview mini-cv-exec">
        <div className="mini-exec-sidebar">
          <div className="mini-exec-avatar" />
          <div className="mini-exec-banner" style={{ background: accentColor }} />
          <div className="mini-exec-line" />
          <div className="mini-exec-line" />
          <div className="mini-exec-banner" style={{ background: accentColor }} />
          <div className="mini-exec-line" />
          <div className="mini-exec-line" />
        </div>
        <div className="mini-exec-main">
          <div className="mini-exec-title" style={{ background: accentColor }} />
          <div className="mini-exec-subtitle" />
          <div className="mini-exec-rule" />
          <div className="mini-exec-main-banner" style={{ background: accentColor }}>EXPERIENCE</div>
          <div className="mini-exec-timeline">
            <div className="mini-timeline-dot" style={{ background: accentColor }} />
            <div className="mini-timeline-text" />
          </div>
          <div className="mini-exec-main-banner" style={{ background: accentColor }}>EDUCATION</div>
          <div className="mini-exec-timeline">
            <div className="mini-timeline-dot" style={{ background: accentColor }} />
            <div className="mini-timeline-text" />
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "modern" || templateId === "creative") {
    return (
      <div className="mini-cv-preview mini-cv-atlas">
        <div className="mini-atlas-header" style={{ background: accentColor }}>
          <div className="mini-atlas-avatar" />
          <div className="mini-atlas-name" />
        </div>
        <div className="mini-atlas-body">
          <div className="mini-atlas-col-left">
            <div className="mini-atlas-section-title" style={{ background: accentColor }} />
            <div className="mini-atlas-line" />
            <div className="mini-atlas-line" />
            <div className="mini-atlas-section-title" style={{ background: accentColor }} />
            <div className="mini-atlas-line" />
          </div>
          <div className="mini-atlas-col-right">
            <div className="mini-atlas-section-title" style={{ background: accentColor }} />
            <div className="mini-atlas-tags">
              <span style={{ background: `${accentColor}60` }} />
              <span style={{ background: `${accentColor}60` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mini-cv-preview mini-cv-minimal">
      <div className="mini-minimal-header">
        <div className="mini-minimal-name" style={{ background: accentColor }} />
        <div className="mini-minimal-rule" style={{ background: accentColor }} />
      </div>
      <div className="mini-minimal-body">
        <div className="mini-minimal-head" style={{ borderBottomColor: accentColor }} />
        <div className="mini-minimal-line" />
        <div className="mini-minimal-line" />
        <div className="mini-minimal-head" style={{ borderBottomColor: accentColor }} />
        <div className="mini-minimal-line" />
      </div>
    </div>
  );
}

export function TemplateGallery({
  currentTemplate,
  onSelect
}: {
  currentTemplate?: TemplateId;
  onSelect: (id: TemplateId) => void;
}) {
  return (
    <div className="template-gallery">
      <div className="template-gallery-header">
        <div className="template-gallery-icon">
          <Sparkles size={22} />
        </div>
        <div>
          <h2>เลือก Template เรซูเม่</h2>
          <p className="muted">เลือกรูปแบบเรซูเม่ที่ตรงกับการสมัครงานของคุณ</p>
        </div>
      </div>
      <div className="template-grid">
        {templates.map((template) => {
          const isActive = currentTemplate === template.id || (!currentTemplate && template.id === "professional");
          return (
            <button
              className={`template-card ${isActive ? "active" : ""}`}
              key={template.id}
              onClick={() => onSelect(template.id)}
              type="button"
            >
              <div className="template-preview">
                <MiniTemplatePreview accentColor={template.accentColor} templateId={template.id} />
              </div>
              <div className="template-info">
                <div className="template-name-row">
                  <Layout size={15} style={{ color: template.accentColor }} />
                  <strong>{template.name}</strong>
                  {isActive ? <span className="template-active-badge">Active</span> : null}
                </div>
                <small>{template.description}</small>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
