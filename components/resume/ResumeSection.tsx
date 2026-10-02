"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { PortfolioSection, PortfolioStyleSettings } from "@/lib/types";

type Props = {
  section: PortfolioSection;
  styleSettings: PortfolioStyleSettings;
  onOverflow?: (id: string, overflowing: boolean) => void;
};

export function ResumeSection({ section, styleSettings, onOverflow }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const settings = section.settings || {};
  const mode = settings.contentMode || "section";
  const body = section.content.body || "";
  const items = (section.content.items || []).filter(Boolean);
  const accent = section.accentColor || styleSettings.primaryColor || "#0f766e";
  const image = section.content.imageUrl;
  const blockStyle = {
    "--rs-accent": accent,
    "--rs-bg": section.backgroundColor || "#ffffff",
    "--rs-ink": settings.textColor || "#23313c",
    fontFamily: settings.fontFamily || styleSettings.fontFamily || "Inter",
    fontSize: settings.fontSize || styleSettings.fontSize || 16,
    fontWeight: settings.fontWeight || 400,
    lineHeight: settings.lineHeight || 1.5
  } as CSSProperties;

  useEffect(() => {
    if (!onOverflow || !contentRef.current) return;
    const element = contentRef.current;
    const inspect = () => onOverflow(section.id, element.scrollHeight > element.clientHeight + 2 || element.scrollWidth > element.clientWidth + 2);
    inspect();
    const observer = new ResizeObserver(inspect);
    observer.observe(element);
    return () => observer.disconnect();
  }, [section.id, section.content, section.frame?.width, section.frame?.height, settings, onOverflow]);

  return (
    <div
      className={`rs-block rs-mode-${mode} rs-type-${section.type} rs-pad-${settings.padding || "comfortable"} rs-radius-${settings.radius || "soft"} rs-shadow-${settings.shadow || "none"} rs-align-${settings.alignment || "left"} rs-image-${settings.imagePosition || "left"} rs-items-${settings.itemStyle || "list"}`}
      style={blockStyle}
    >
      <div className="rs-block-scroll" ref={contentRef}>
        {mode !== "image" && mode !== "text" && settings.showTitle !== false && <h2 className="rs-heading">{section.title}</h2>}
        {mode === "image" && !image ? <span className="rs-image-placeholder">เพิ่มรูปภาพ</span> : null}
        {image && <img alt={section.title} className="rs-image" src={image} style={{ objectFit: settings.imageFit || "cover" }} />}
        {mode !== "image" && (
          <div className={`rs-copy rs-columns-${section.columns || 1}`}>
            {body && <div className="rs-body">{body.split("\n").map((line, index) => <span className="rs-body-line" key={index}>{line || "\u00a0"}</span>)}</div>}
            {items.length > 0 && (
              <ul className="rs-items">
                {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
