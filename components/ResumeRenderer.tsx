"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Share2 } from "lucide-react";

import { ResumeSection } from "@/components/resume/ResumeSection";
import { documentSize } from "@/lib/resume-options";
import { normalizeFrame } from "@/lib/resume-document";
import type { PortfolioSection, PortfolioStyleSettings, TemplateId } from "@/lib/types";

type Props = {
  title: string;
  sections: PortfolioSection[];
  styleSettings: PortfolioStyleSettings;
  templateId?: TemplateId;
  showShare?: boolean;
};

export function ResumeRenderer({ title, sections, styleSettings, showShare = false }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!wrapperRef.current) return;
    const measure = () => {
      const width = wrapperRef.current?.clientWidth || documentSize.width;
      setScale(Math.min(1, width / documentSize.width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("คัดลอกลิงก์แล้ว");
    } catch {
      setMessage("คัดลอกลิงก์ไม่สำเร็จ");
    }
  }

  return (
    <div className="rs-public-wrap">
      {showShare && <div className="rs-public-actions">
        <span>{title}</span>
        <button className="rs-button" onClick={copyLink} type="button"><Share2 size={16} /> แชร์ Resume</button>
        <span aria-live="polite" className="rs-copy-status">{message}</span>
      </div>}
      <div className="rs-public-viewport" ref={wrapperRef} style={{ height: documentSize.height * scale }}>
        <div className="rs-sheet rs-print-sheet" style={{ transform: `scale(${scale})` }}>
          {sections.filter(section => section.visible).map(section => {
            const frame = normalizeFrame(section);
            return (
              <div className="rs-position" key={section.id} style={{
                left: frame.x, top: frame.y, width: frame.width, height: frame.height, zIndex: frame.zIndex
              } as CSSProperties}>
                <ResumeSection section={section} styleSettings={styleSettings} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
