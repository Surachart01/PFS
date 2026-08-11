"use client";

import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Share2,
  Sparkles,
  UserRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PortfolioSection, PortfolioSectionSettings, PortfolioStyleSettings } from "@/lib/types";
import type { CSSProperties } from "react";

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

function sectionItems(section: PortfolioSection) {
  return section.content.items?.filter(Boolean) || [];
}

function sectionSettings(section: PortfolioSection): Required<PortfolioSectionSettings> {
  return {
    showTitle: section.settings?.showTitle !== false,
    alignment: section.settings?.alignment || "left",
    padding: section.settings?.padding || "comfortable",
    radius: section.settings?.radius || "rounded",
    shadow: section.settings?.shadow || "soft",
    width: section.settings?.width || "full",
    imagePosition: section.settings?.imagePosition || "left",
    itemStyle: section.settings?.itemStyle || (section.type === "skills" ? "chips" : "cards"),
    borderStyle: section.settings?.borderStyle || "subtle",
    cardVariant: section.settings?.cardVariant || "solid",
    column: section.settings?.column || (["skills", "certificates"].includes(section.type) ? "right" : "left")
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

  if (itemStyle === "cards") {
    return (
      <div className="document-mini-items items-cards-wrap">
        {items.map((item) => (
          <div className="item-card-box" key={item}>
            <CheckCircle2 size={15} style={{ color: accent }} />
            <span>{item}</span>
          </div>
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

export function PortfolioRenderer({
  title,
  sections,
  styleSettings
}: {
  title: string;
  status?: string;
  sections: PortfolioSection[];
  styleSettings: PortfolioStyleSettings;
}) {
  const visibleSections = sections.filter((section) => section.visible).sort((a, b) => a.order - b.order);
  const accent = styleSettings.primaryColor || "#2563eb";
  const fontFamily = styleSettings.fontFamily || "Inter";
  const bgTheme = styleSettings.backgroundTheme || "default";

  const maxRow = visibleSections.reduce((max, s) => Math.max(max, s.gridPlacement?.rowEnd || 2), 2);

  function copyLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("คัดลอกลิงก์เรียบร้อยแล้ว!");
    }
  }

  return (
    <article
      className={`public-portfolio-wrapper bg-theme-${bgTheme}`}
      style={{ fontSize: styleSettings.fontSize, fontFamily: `${fontFamily}, sans-serif` }}
    >
      <div className="portfolio-hero-banner" style={{ "--hero-accent": accent } as CSSProperties}>
        <div className="hero-gradient-overlay" />
        <div className="hero-container">
          <div className="hero-title-group">
            <span className="hero-available-badge">
              <span className="badge-dot" />
              Online Portfolio
            </span>
            <h1 className="hero-name">{title}</h1>
          </div>
          <div className="hero-actions">
            <button className="btn btn-hero-action" onClick={copyLink} type="button">
              <Share2 size={16} />
              แชร์ Portfolio
            </button>
          </div>
        </div>
      </div>

      {visibleSections.length === 0 ? (
        <div className="empty-state">ยังไม่มีข้อมูลใน Portfolio</div>
      ) : (
        <div className="public-content-container">
          <div
            className={`grid-document-sheet public-grid-sheet bg-theme-${bgTheme}`}
            style={{ gridTemplateRows: `repeat(${maxRow}, minmax(70px, auto))` } as CSSProperties}
          >
            {visibleSections.map((section) => {
              const items = sectionItems(section);
              const settings = sectionSettings(section);
              const sectionAccent = section.accentColor || accent;
              const sectionBackground = section.backgroundColor || "#ffffff";
              const hasMedia = Boolean(section.content.imageUrl);
              const gp = section.gridPlacement;
              const Icon = sectionIcons[section.type] || Sparkles;

              const elementStyle = {
                "--block-accent": sectionAccent,
                "--block-bg": sectionBackground,
                gridColumn: gp ? `${gp.colStart} / ${gp.colEnd}` : "1 / 13",
                gridRow: gp ? `${gp.rowStart} / ${gp.rowEnd}` : "auto"
              } as CSSProperties;

              return (
                <section
                  className={`grid-document-element public-element columns-${section.columns || 1} align-${settings.alignment} pad-${settings.padding} radius-${settings.radius} shadow-${settings.shadow} image-${settings.imagePosition} items-${settings.itemStyle} border-${settings.borderStyle} variant-${settings.cardVariant}`}
                  key={section.id}
                  style={elementStyle}
                >
                  <div className="document-element-inner">
                    {settings.showTitle ? (
                      <div className="public-section-header">
                        <div className="section-icon-badge" style={{ backgroundColor: `color-mix(in srgb, ${sectionAccent} 15%, #ffffff)`, color: sectionAccent }}>
                          <Icon size={18} />
                        </div>
                        <h2>{section.title}</h2>
                      </div>
                    ) : null}

                    <div className={`document-element-layout ${hasMedia ? "has-media" : "no-media"}`}>
                      {section.content.imageUrl ? (
                        <div className="document-element-image public-image-box">
                          <img alt={`${section.title} image`} src={section.content.imageUrl} />
                        </div>
                      ) : null}
                      <div className="document-element-copy">
                        {section.content.body ? <div className="portfolio-body">{section.content.body}</div> : null}
                        {renderSectionItems(items, settings.itemStyle, sectionAccent)}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
