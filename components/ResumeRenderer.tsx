"use client";

import {
  Award,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Share2,
  Sparkles,
  UserRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PortfolioSection, PortfolioStyleSettings, TemplateId } from "@/lib/types";

/* ── Icon map ──────────────────────────────────────── */
const sectionIcons: Record<string, LucideIcon> = {
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

type Props = {
  title: string;
  sections: PortfolioSection[];
  styleSettings: PortfolioStyleSettings;
  templateId?: TemplateId;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
};

function items(s: PortfolioSection) {
  return s.content.items?.map((item) => item.trim()).filter((item) => item.length > 0) ?? [];
}

function copyLink() {
  if (typeof window !== "undefined") {
    navigator.clipboard.writeText(window.location.href);
    alert("คัดลอกลิงก์เรียบร้อยแล้ว!");
  }
}

function getSectionSide(s: PortfolioSection, defaultSide: "left" | "right"): "left" | "right" {
  if (s.settings?.column === "left") return "left";
  if (s.settings?.column === "right") return "right";
  return defaultSide;
}

/* ========================================================
   TEMPLATE 1 — "Emily / Professional CV" (Exact matches reference image)
   ======================================================== */
function TemplateExecutive({
  title,
  sections,
  accent,
  selectedSectionId,
  onSelectSection
}: {
  title: string;
  sections: PortfolioSection[];
  accent: string;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}) {
  const sorted = [...sections]
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const profile = sorted.find((s) => s.type === "profile");
  const contact = sorted.find((s) => s.type === "contact");

  const sidebarSections = sorted.filter((s) => {
    if (s.type === "profile" || s.type === "contact") return false;
    const defaultSide = ["skills", "certificates"].includes(s.type) ? "right" : "left";
    return getSectionSide(s, defaultSide) === "right";
  });

  const mainSections = sorted.filter((s) => {
    if (s.type === "profile" || s.type === "contact") return false;
    const defaultSide = ["skills", "certificates"].includes(s.type) ? "right" : "left";
    return getSectionSide(s, defaultSide) === "left";
  });

  const titleParts = title.trim().split(" ");
  const firstName = titleParts[0] || title;
  const lastName = titleParts.slice(1).join(" ");
  const primaryAccent = accent || "#b83919";

  const getInteractiveProps = (sectionId?: string) => {
    if (!onSelectSection || !sectionId) return {};
    const isSelected = selectedSectionId === sectionId;
    return {
      onClick: () => onSelectSection(sectionId),
      className: `interactive-section ${isSelected ? "selected-editor-section" : ""}`,
      style: { cursor: "pointer" }
    };
  };

  return (
    <div className="emily-wrapper">
      {!onSelectSection && (
        <div className="resume-share-bar">
          <button className="resume-share-btn" onClick={copyLink} type="button">
            <Share2 size={14} />
            แชร์ Portfolio
          </button>
        </div>
      )}

      <div className="emily-layout">
        {/* ── Left Sidebar ─────────────────────── */}
        <aside className="emily-sidebar">
          {/* Avatar Photo Circle */}
          <div
            className={`emily-avatar-wrap ${getInteractiveProps(profile?.id).className || ""}`}
            onClick={getInteractiveProps(profile?.id).onClick}
            title={onSelectSection ? "คลิกเพื่อแก้ไขรูปโปรไฟล์" : undefined}
          >
            {profile?.content.imageUrl ? (
              <img alt="profile" className="emily-avatar-img" src={profile.content.imageUrl} />
            ) : (
              <div className="emily-avatar-placeholder">
                {title.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </div>
            )}
          </div>

          {/* CONTACT Section */}
          {contact && (
            <div
              className={`emily-side-block ${getInteractiveProps(contact.id).className || ""}`}
              onClick={getInteractiveProps(contact.id).onClick}
              title={onSelectSection ? "คลิกเพื่อแก้ไขข้อมูลติดต่อ" : undefined}
            >
              <div className="emily-side-banner" style={{ background: primaryAccent }}>
                CONTACT
              </div>
              <ul className="emily-contact-list">
                {items(contact).map((item) => {
                  const isEmail = item.includes("@");
                  const isPhone = item.match(/^\+?[\d\s\-()]{8,}/);
                  return (
                    <li key={item}>
                      <span className="emily-contact-icon">
                        {isEmail ? <Mail size={13} /> : isPhone ? <Phone size={13} /> : <MapPin size={13} />}
                      </span>
                      <span className="emily-contact-text">{item}</span>
                    </li>
                  );
                })}
                {contact.content.body && (
                  <li>
                    <span className="emily-contact-icon"><ExternalLink size={13} /></span>
                    <span className="emily-contact-text">{contact.content.body}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Dynamic Sidebar Sections in sorted order */}
          {sidebarSections.map((s) => (
            <div
              className={`emily-side-block ${getInteractiveProps(s.id).className || ""}`}
              key={s.id}
              onClick={getInteractiveProps(s.id).onClick}
              title={onSelectSection ? `คลิกเพื่อแก้ไข ${s.title}` : undefined}
            >
              <div className="emily-side-banner" style={{ background: primaryAccent }}>
                {s.title.toUpperCase()}
              </div>
              <ul className="emily-bullet-list">
                {items(s).map((item) => (
                  <li key={item}>
                    <span className="emily-bullet-dot" style={{ background: primaryAccent }} />
                    <span>{item}</span>
                  </li>
                ))}
                {s.content.body && <li><span>{s.content.body}</span></li>}
              </ul>
            </div>
          ))}
        </aside>

        {/* ── Right Main Area ─────────────────── */}
        <main className="emily-main">
          {/* Header Name & Role */}
          <div
            className={`emily-header ${getInteractiveProps(profile?.id).className || ""}`}
            onClick={getInteractiveProps(profile?.id).onClick}
            title={onSelectSection ? "คลิกเพื่อแก้ไขชื่อ / บทบาท" : undefined}
          >
            <h1 className="emily-name">
              <span className="emily-name-first" style={{ color: primaryAccent }}>{firstName}</span>
              {lastName ? <span className="emily-name-last"> {lastName}</span> : null}
            </h1>

            {profile?.content.body && (
              <p className="emily-role-title">{profile.content.body.toUpperCase()}</p>
            )}

            <div className="emily-header-rule" style={{ background: `${primaryAccent}40` }} />
          </div>

          {/* Dynamic Main Sections in sorted order */}
          {mainSections.map((s) => {
            const list = items(s);

            if (s.type === "about") {
              return (
                <div
                  className={`emily-main-block ${getInteractiveProps(s.id).className || ""}`}
                  key={s.id}
                  onClick={getInteractiveProps(s.id).onClick}
                  title={onSelectSection ? `คลิกเพื่อแก้ไข ${s.title}` : undefined}
                >
                  <div className="emily-main-banner" style={{ background: primaryAccent }}>
                    {s.title.toUpperCase()}
                  </div>
                  {s.content.body && (
                    <p className="emily-summary-text" style={{ padding: "8px 12px 0" }}>{s.content.body}</p>
                  )}
                </div>
              );
            }

            return (
              <div
                className={`emily-main-block ${getInteractiveProps(s.id).className || ""}`}
                key={s.id}
                onClick={getInteractiveProps(s.id).onClick}
                title={onSelectSection ? `คลิกเพื่อแก้ไข ${s.title}` : undefined}
              >
                <div className="emily-main-banner" style={{ background: primaryAccent }}>
                  {s.title.toUpperCase()}
                </div>

                <div className="emily-timeline-container">
                  {s.content.body && (
                    <div className="emily-timeline-item">
                      <div className="emily-timeline-line-wrap">
                        <span className="emily-timeline-dot" style={{ background: primaryAccent, borderColor: `${primaryAccent}50` }} />
                        <div className="emily-timeline-line" style={{ background: `${primaryAccent}30` }} />
                      </div>
                      <div className="emily-timeline-content">
                        <p className="emily-timeline-body">{s.content.body}</p>
                      </div>
                    </div>
                  )}

                  {list.map((item, idx) => (
                    <div className="emily-timeline-item" key={item}>
                      <div className="emily-timeline-line-wrap">
                        <span className="emily-timeline-dot" style={{ background: primaryAccent, borderColor: `${primaryAccent}50` }} />
                        {idx < list.length - 1 ? (
                          <div className="emily-timeline-line" style={{ background: `${primaryAccent}30` }} />
                        ) : null}
                      </div>
                      <div className="emily-timeline-content">
                        <div className="emily-timeline-item-title">{item}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}

/* ========================================================
   TEMPLATE 2 — "Atlas" (Top header + 2-col body)
   ======================================================== */
function TemplateAtlas({
  title,
  sections,
  accent,
  selectedSectionId,
  onSelectSection
}: {
  title: string;
  sections: PortfolioSection[];
  accent: string;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}) {
  const sorted = [...sections]
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const profile = sorted.find((s) => s.type === "profile");
  const contact = sorted.find((s) => s.type === "contact");

  const leftColumnSections = sorted.filter((s) => {
    if (s.type === "profile" || s.type === "contact") return false;
    const defaultSide = ["about", "experience", "projects"].includes(s.type) ? "left" : "right";
    return getSectionSide(s, defaultSide) === "left";
  });

  const rightColumnSections = sorted.filter((s) => {
    if (s.type === "profile" || s.type === "contact") return false;
    const defaultSide = ["about", "experience", "projects"].includes(s.type) ? "left" : "right";
    return getSectionSide(s, defaultSide) === "right";
  });

  const getInteractiveProps = (sectionId?: string) => {
    if (!onSelectSection || !sectionId) return {};
    const isSelected = selectedSectionId === sectionId;
    return {
      onClick: () => onSelectSection(sectionId),
      className: `interactive-section ${isSelected ? "selected-editor-section" : ""}`,
      style: { cursor: "pointer" }
    };
  };

  function Tag({ children }: { children: string }) {
    return <span className="atlas-tag" style={{ background: `${accent}18`, color: accent, borderColor: `${accent}40` }}>{children}</span>;
  }

  function SectionBlock({ section }: { section: PortfolioSection }) {
    const Icon = sectionIcons[section.type] || Sparkles;
    const list = items(section);
    return (
      <div
        className={`atlas-section ${getInteractiveProps(section.id).className || ""}`}
        onClick={getInteractiveProps(section.id).onClick}
      >
        <div className="atlas-section-head">
          <div className="atlas-section-icon" style={{ background: `${accent}15`, color: accent }}>
            <Icon size={15} />
          </div>
          <h3 className="atlas-section-title">{section.title}</h3>
          <div className="atlas-section-rule" style={{ background: accent }} />
        </div>
        {section.content.body && <p className="atlas-body">{section.content.body}</p>}
        {list.length > 0 && (
          <div className="atlas-items">
            {list.map((item) => <Tag key={item}>{item}</Tag>)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="atlas-wrapper">
      {!onSelectSection && (
        <div className="resume-share-bar">
          <button className="resume-share-btn" onClick={copyLink} type="button">
            <Share2 size={14} />
            แชร์ Portfolio
          </button>
        </div>
      )}

      {/* Header strip */}
      <header className="atlas-header" style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)` }}>
        <div className="atlas-header-inner">
          <div
            className={`atlas-header-left ${getInteractiveProps(profile?.id).className || ""}`}
            onClick={getInteractiveProps(profile?.id).onClick}
          >
            {profile?.content.imageUrl ? (
              <img alt="profile" className="atlas-photo" src={profile.content.imageUrl} />
            ) : (
              <div className="atlas-photo-placeholder">
                {title.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </div>
            )}
            <div>
              <h1 className="atlas-name">{title}</h1>
              {profile?.content.body && <p className="atlas-role">{profile.content.body}</p>}
            </div>
          </div>
          {contact && (
            <div
              className={`atlas-contact ${getInteractiveProps(contact.id).className || ""}`}
              onClick={getInteractiveProps(contact.id).onClick}
            >
              {items(contact).map((item) => (
                <span key={item} className="atlas-contact-item">
                  <Mail size={12} />
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="atlas-body-layout">
        {/* Left col */}
        <div className="atlas-left-col">
          {leftColumnSections.map((s) => <SectionBlock key={s.id} section={s} />)}
        </div>

        {/* Right col */}
        <div className="atlas-right-col">
          {rightColumnSections.map((s) => <SectionBlock key={s.id} section={s} />)}
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   TEMPLATE 3 — "Minimal" (Clean black/white editorial)
   ======================================================== */
function TemplateMinimal({
  title,
  sections,
  accent,
  selectedSectionId,
  onSelectSection
}: {
  title: string;
  sections: PortfolioSection[];
  accent: string;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}) {
  const sorted = [...sections]
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const profile = sorted.find((s) => s.type === "profile");
  const contact = sorted.find((s) => s.type === "contact");
  const bodySections = sorted.filter((s) => s.type !== "profile" && s.type !== "contact");

  const getInteractiveProps = (sectionId?: string) => {
    if (!onSelectSection || !sectionId) return {};
    const isSelected = selectedSectionId === sectionId;
    return {
      onClick: () => onSelectSection(sectionId),
      className: `interactive-section ${isSelected ? "selected-editor-section" : ""}`,
      style: { cursor: "pointer" }
    };
  };

  function Section({ section }: { section: PortfolioSection }) {
    const list = items(section);
    return (
      <div
        className={`minimal-section ${getInteractiveProps(section.id).className || ""}`}
        onClick={getInteractiveProps(section.id).onClick}
      >
        <div className="minimal-section-row">
          <h3 className="minimal-section-title">{section.title.toUpperCase()}</h3>
          <div className="minimal-section-line" style={{ background: accent }} />
        </div>
        <div className="minimal-section-body">
          {section.content.body && <p className="minimal-body">{section.content.body}</p>}
          {list.length > 0 && (
            <div className="minimal-items">
              {list.map((item) => (
                <div className="minimal-item-row" key={item}>
                  <span className="minimal-item-dash" style={{ color: accent }}>—</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="minimal-wrapper">
      {!onSelectSection && (
        <div className="resume-share-bar">
          <button className="resume-share-btn" onClick={copyLink} type="button">
            <Share2 size={14} />
            แชร์ Portfolio
          </button>
        </div>
      )}

      {/* Top nameplate */}
      <header
        className={`minimal-header ${getInteractiveProps(profile?.id).className || ""}`}
        onClick={getInteractiveProps(profile?.id).onClick}
      >
        <div className="minimal-header-left">
          <h1 className="minimal-name">{title}</h1>
          {profile?.content.body && (
            <p className="minimal-role" style={{ color: accent }}>{profile.content.body}</p>
          )}
        </div>
        {contact && (
          <div className="minimal-contact">
            {items(contact).map((item) => (
              <span key={item} className="minimal-contact-item">{item}</span>
            ))}
          </div>
        )}
        <div className="minimal-header-accent" style={{ background: accent }} />
      </header>

      {/* Dynamic Sections strictly following section.order */}
      <div className="minimal-sections" style={{ marginTop: "24px" }}>
        {bodySections.map((s) => <Section key={s.id} section={s} />)}
      </div>
    </div>
  );
}

/* ========================================================
   MAIN EXPORT — chooses template based on templateId
   ======================================================== */
export function ResumeRenderer({
  title,
  sections,
  styleSettings,
  templateId,
  selectedSectionId,
  onSelectSection
}: Props) {
  const visibleSections = sections.filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const accent = styleSettings.primaryColor || "#b83919";
  const fontFamily = styleSettings.fontFamily || "Inter";
  const bgTheme = styleSettings.backgroundTheme || "default";

  const tpl = templateId || "professional";

  const content = (() => {
    if (tpl === "minimal" || tpl === "academic" || tpl === "compact") {
      return (
        <TemplateMinimal
          accent={accent}
          onSelectSection={onSelectSection}
          sections={visibleSections}
          selectedSectionId={selectedSectionId}
          title={title}
        />
      );
    }
    if (tpl === "modern" || tpl === "creative") {
      return (
        <TemplateAtlas
          accent={accent}
          onSelectSection={onSelectSection}
          sections={visibleSections}
          selectedSectionId={selectedSectionId}
          title={title}
        />
      );
    }
    // professional + default -> Emily Hughes style CV
    return (
      <TemplateExecutive
        accent={accent}
        onSelectSection={onSelectSection}
        sections={visibleSections}
        selectedSectionId={selectedSectionId}
        title={title}
      />
    );
  })();

  return (
    <div
      className={`resume-renderer-root bg-theme-${bgTheme}`}
      style={{ fontFamily: `${fontFamily}, 'Noto Sans Thai', sans-serif`, fontSize: styleSettings.fontSize }}
    >
      {content}
    </div>
  );
}
