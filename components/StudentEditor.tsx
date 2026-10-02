"use client";

import {
  AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Check, ChevronDown, Copy,
  Eye, EyeOff, FileDown, Image as ImageIcon, Layers3, LockKeyhole, Maximize2,
  Minus, Plus, Redo2, RotateCcw, Save, Send, Settings2, Share2, Trash2,
  Type, Undo2, UnlockKeyhole, X
} from "lucide-react";
import { Rnd } from "react-rnd";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, DragEvent } from "react";

import { ResumeRenderer } from "@/components/ResumeRenderer";
import { ResumeSection } from "@/components/resume/ResumeSection";
import { applyDocumentTemplate, clamp, findFreeFrame, makeSection, normalizeFrame, preparePortfolio, snap } from "@/lib/resume-document";
import { assetTypes, documentSize, fontOptions, primaryTemplates } from "@/lib/resume-options";
import type { PortfolioSection, PortfolioSectionSettings, SerializedPortfolio, TemplateId } from "@/lib/types";

type Asset = { type: PortfolioSection["type"]; mode: "section" | "text" | "image" };
type Status = "saved" | "dirty" | "saving" | "error";
type InspectorTab = "content" | "design" | "layout";
type MobilePanel = "assets" | "layers" | "properties" | null;

const assets: (Asset & { label: string; hint: string })[] = [
  ...assetTypes.filter(item => item.type !== "custom").map(item => ({ type: item.type, mode: "section" as const, label: item.title, hint: item.hint })),
  { type: "custom", mode: "text", label: "ข้อความอิสระ", hint: "วางข้อความได้ทุกตำแหน่ง" },
  { type: "custom", mode: "image", label: "รูปภาพ", hint: "เพิ่มภาพประกอบ" }
];

const colors = ["#0f766e", "#2563eb", "#be123c", "#ca8a04", "#26313c", "#ffffff"];

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return Boolean(element?.closest("input, textarea, select, [contenteditable='true']"));
}

export function StudentEditor({ initialPortfolio }: { initialPortfolio: SerializedPortfolio }) {
  const [portfolio, setPortfolio] = useState(() => preparePortfolio(initialPortfolio));
  const portfolioRef = useRef(portfolio);
  const pastRef = useRef<SerializedPortfolio[]>([]);
  const futureRef = useRef<SerializedPortfolio[]>([]);
  const lastGroupRef = useRef<{ key: string; time: number } | null>(null);
  const revisionRef = useRef(0);
  const savedRevisionRef = useRef(0);
  const savePromiseRef = useRef<Promise<boolean> | null>(null);
  const [revision, setRevision] = useState(0);
  const [historyTick, setHistoryTick] = useState(0);
  const [status, setStatus] = useState<Status>("saved");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(portfolio.sections[0]?.id || null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("content");
  const [leftTab, setLeftTab] = useState<"assets" | "layers">("assets");
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [applyTheme, setApplyTheme] = useState(false);
  const [preview, setPreview] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(true);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const [overflowIds, setOverflowIds] = useState<Set<string>>(new Set());
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const selected = portfolio.sections.find(section => section.id === selectedId) || null;

  const markChanged = useCallback((next: SerializedPortfolio, group?: string) => {
    const previous = portfolioRef.current;
    if (next === previous) return;
    const now = Date.now();
    if (!group || lastGroupRef.current?.key !== group || now - lastGroupRef.current.time > 800) {
      pastRef.current = [...pastRef.current.slice(-49), previous];
    }
    lastGroupRef.current = group ? { key: group, time: now } : null;
    futureRef.current = [];
    portfolioRef.current = next;
    setPortfolio(next);
    revisionRef.current += 1;
    setRevision(revisionRef.current);
    setStatus("dirty");
    setHistoryTick(value => value + 1);
  }, []);

  const updateSection = useCallback((id: string, update: (section: PortfolioSection) => PortfolioSection, group?: string) => {
    const current = portfolioRef.current;
    markChanged({ ...current, sections: current.sections.map(section => section.id === id ? update(section) : section) }, group);
  }, [markChanged]);

  function updateSettings(id: string, patch: Partial<PortfolioSectionSettings>, group?: string) {
    updateSection(id, section => ({ ...section, settings: { ...section.settings, ...patch } }), group);
  }

  function updateFrame(id: string, patch: Partial<ReturnType<typeof normalizeFrame>>) {
    updateSection(id, section => ({ ...section, frame: normalizeFrame({ ...section, frame: { ...normalizeFrame(section), ...patch } }) }));
  }

  function addAsset(asset: Asset, point?: { x: number; y: number }) {
    const current = portfolioRef.current;
    const width = asset.mode === "image" ? 240 : asset.mode === "text" ? 310 : asset.type === "profile" ? 430 : 320;
    const height = asset.mode === "image" ? 220 : asset.mode === "text" ? 130 : 170;
    const frame = point
      ? { x: clamp(snap(point.x, snapEnabled), 0, documentSize.width - width), y: clamp(snap(point.y, snapEnabled), 0, documentSize.height - height), width, height, zIndex: Math.max(0, ...current.sections.map(item => normalizeFrame(item).zIndex)) + 1, locked: false }
      : findFreeFrame(current.sections, width, height);
    if (!frame) { setMessage("กระดาษเต็มแล้ว กรุณาย้ายหรือย่อบล็อกเดิมก่อน"); return; }
    const section = makeSection(asset.type, frame, asset.mode);
    markChanged({ ...current, sections: [...current.sections, section] });
    setSelectedId(section.id);
    setLeftTab("layers");
    setMobilePanel(null);
  }

  function duplicateSection(section: PortfolioSection) {
    const current = portfolioRef.current;
    const frame = normalizeFrame(section);
    const highest = Math.max(...current.sections.map(item => normalizeFrame(item).zIndex), 0);
    const duplicate: PortfolioSection = {
      ...section,
      id: crypto.randomUUID(), title: `${section.title} สำเนา`, order: current.sections.length + 1,
      frame: { ...frame, x: clamp(frame.x + 24, 0, documentSize.width - frame.width), y: clamp(frame.y + 24, 0, documentSize.height - frame.height), zIndex: highest + 1, locked: false },
      settings: { ...section.settings }, content: { ...section.content, items: [...(section.content.items || [])] }
    };
    markChanged({ ...current, sections: [...current.sections, duplicate] });
    setSelectedId(duplicate.id);
  }

  function removeSection(section: PortfolioSection) {
    if (section.frame?.locked) return;
    const current = portfolioRef.current;
    markChanged({ ...current, sections: current.sections.filter(item => item.id !== section.id) });
    setOverflowIds(old => { const next = new Set(old); next.delete(section.id); return next; });
    setSelectedId(current.sections.find(item => item.id !== section.id)?.id || null);
  }

  function moveLayer(section: PortfolioSection, direction: 1 | -1) {
    const sorted = [...portfolioRef.current.sections].sort((a, b) => normalizeFrame(a).zIndex - normalizeFrame(b).zIndex);
    const index = sorted.findIndex(item => item.id === section.id);
    const nextIndex = clamp(index + direction, 0, sorted.length - 1);
    if (index === nextIndex) return;
    [sorted[index], sorted[nextIndex]] = [sorted[nextIndex], sorted[index]];
    const zIndex = new Map(sorted.map((item, position) => [item.id, position + 1]));
    markChanged({ ...portfolioRef.current, sections: portfolioRef.current.sections.map(item => ({ ...item, frame: { ...normalizeFrame(item), zIndex: zIndex.get(item.id)! } })) });
  }

  function undo() {
    const previous = pastRef.current.pop();
    if (!previous) return;
    futureRef.current.push(portfolioRef.current);
    portfolioRef.current = previous;
    setPortfolio(previous);
    revisionRef.current += 1;
    setRevision(revisionRef.current);
    setStatus("dirty");
    setHistoryTick(value => value + 1);
    lastGroupRef.current = null;
  }

  function redo() {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push(portfolioRef.current);
    portfolioRef.current = next;
    setPortfolio(next);
    revisionRef.current += 1;
    setRevision(revisionRef.current);
    setStatus("dirty");
    setHistoryTick(value => value + 1);
    lastGroupRef.current = null;
  }

  async function save(): Promise<boolean> {
    if (savePromiseRef.current) return savePromiseRef.current;
    if (savedRevisionRef.current >= revisionRef.current) return true;
    const operation = (async () => {
      while (savedRevisionRef.current < revisionRef.current) {
        const targetRevision = revisionRef.current;
        const snapshot = portfolioRef.current;
        setStatus("saving");
        try {
          const response = await fetch("/api/portfolio/me", {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(snapshot)
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            setStatus("error");
            setMessage(data.message || "บันทึกไม่สำเร็จ กดบันทึกเพื่อลองอีกครั้ง");
            return false;
          }
          savedRevisionRef.current = targetRevision;
          if (targetRevision === revisionRef.current) {
            const merged = { ...portfolioRef.current, slug: data.portfolio.slug, updatedAt: data.portfolio.updatedAt };
            portfolioRef.current = merged;
            setPortfolio(merged);
            setStatus("saved");
            setMessage("");
          }
        } catch {
          setStatus("error");
          setMessage("เชื่อมต่อไม่ได้ ข้อมูลยังอยู่ในหน้านี้ กดบันทึกเพื่อลองอีกครั้ง");
          return false;
        }
      }
      return true;
    })();
    savePromiseRef.current = operation;
    try { return await operation; } finally { savePromiseRef.current = null; }
  }

  useEffect(() => {
    if (savedRevisionRef.current >= revisionRef.current || busy) return;
    const timer = window.setTimeout(() => void save(), 1100);
    return () => window.clearTimeout(timer);
  }, [revision, busy]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (savedRevisionRef.current < revisionRef.current) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  async function publish() {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await save())) return;
      const response = await fetch("/api/portfolio/me/publish", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(data.message || "เผยแพร่ไม่สำเร็จ"); return; }
      const next = { ...portfolioRef.current, status: data.portfolio.status, publishedAt: data.portfolio.publishedAt };
      portfolioRef.current = next;
      setPortfolio(next);
      setMessage("เผยแพร่ Resume แล้ว");
    } catch { setMessage("เผยแพร่ไม่สำเร็จ กรุณาลองอีกครั้ง"); }
    finally { setBusy(false); }
  }

  async function unpublish() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/portfolio/me/unpublish", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(data.message || "ปิดเผยแพร่ไม่สำเร็จ"); return; }
      const next = { ...portfolioRef.current, status: data.portfolio.status };
      portfolioRef.current = next;
      setPortfolio(next);
      setMessage("ปิดเผยแพร่แล้ว งานที่กำลังแก้ยังอยู่");
    } catch { setMessage("ปิดเผยแพร่ไม่สำเร็จ กรุณาลองอีกครั้ง"); }
    finally { setBusy(false); }
  }

  function applyTemplate(id: TemplateId) {
    const next = applyDocumentTemplate(portfolioRef.current, id, applyTheme);
    if (!next) { setMessage("พื้นที่บนกระดาษไม่พอสำหรับเทมเพลตนี้ งานเดิมยังอยู่ครบ"); return; }
    markChanged(next);
    setShowTemplates(false);
  }

  async function uploadImage(file: File) {
    if (!selected || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setMessage("เลือกไฟล์ JPG, PNG, WebP หรือ GIF"); return;
    }
    if (file.size > 900 * 1024) { setMessage("รูปใหญ่เกิน 900 KB กรุณาใช้รูปที่เล็กลง"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateSection(selected.id, section => ({ ...section, content: { ...section.content, imageUrl: reader.result as string } }));
      }
    };
    reader.onerror = () => setMessage("อ่านไฟล์รูปไม่สำเร็จ");
    reader.readAsDataURL(file);
  }

  const fitCanvas = useCallback(() => {
    const width = stageRef.current?.clientWidth || 900;
    setZoom(clamp((width - 72) / documentSize.width, 0.35, 1));
  }, []);

  useEffect(() => {
    if (!fit || !stageRef.current) return;
    fitCanvas();
    const observer = new ResizeObserver(fitCanvas);
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [fit, fitCanvas]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || preview) return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      } else if (command && event.key.toLowerCase() === "d" && selected) {
        event.preventDefault(); duplicateSection(selected);
      } else if ((event.key === "Delete" || event.key === "Backspace") && selected && !selected.frame?.locked) {
        event.preventDefault(); removeSection(selected);
      } else if (event.key.startsWith("Arrow") && selected && !selected.frame?.locked) {
        event.preventDefault();
        const frame = normalizeFrame(selected);
        const delta = event.shiftKey ? 10 : 1;
        updateFrame(selected.id, {
          x: frame.x + (event.key === "ArrowRight" ? delta : event.key === "ArrowLeft" ? -delta : 0),
          y: frame.y + (event.key === "ArrowDown" ? delta : event.key === "ArrowUp" ? -delta : 0)
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, preview]);

  const reportOverflow = useCallback((id: string, overflowing: boolean) => {
    setOverflowIds(old => {
      if (old.has(id) === overflowing) return old;
      const next = new Set(old);
      if (overflowing) next.add(id); else next.delete(id);
      return next;
    });
  }, []);

  function dropAsset(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/x-resume-asset");
    if (!raw || !sheetRef.current) return;
    try {
      const asset = JSON.parse(raw) as Asset;
      if (!assets.some(item => item.type === asset.type && item.mode === asset.mode)) return;
      const rect = sheetRef.current.getBoundingClientRect();
      addAsset(asset, { x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom });
    } catch { setMessage("วางบล็อกไม่สำเร็จ กรุณาลองอีกครั้ง"); }
  }

  function showAlignment(id: string, x: number, y: number) {
    const section = portfolioRef.current.sections.find(item => item.id === id);
    if (!section) return;
    const frame = normalizeFrame(section);
    const xPoints = [documentSize.width / 2, ...portfolioRef.current.sections.filter(item => item.id !== id).flatMap(item => {
      const other = normalizeFrame(item);
      return [other.x, other.x + other.width / 2, other.x + other.width];
    })];
    const yPoints = [documentSize.height / 2, ...portfolioRef.current.sections.filter(item => item.id !== id).flatMap(item => {
      const other = normalizeFrame(item);
      return [other.y, other.y + other.height / 2, other.y + other.height];
    })];
    const gx = xPoints.find(point => [x, x + frame.width / 2, x + frame.width].some(edge => Math.abs(point - edge) < 5));
    const gy = yPoints.find(point => [y, y + frame.height / 2, y + frame.height].some(edge => Math.abs(point - edge) < 5));
    setGuides({ x: gx, y: gy });
  }

  async function printPdf() {
    if (overflowIds.size) { setMessage("มีเนื้อหาล้นบล็อก กรุณาขยายบล็อกก่อนพิมพ์ PDF"); return; }
    setPreview(true);
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    await document.fonts.ready;
    await Promise.all(Array.from(document.querySelectorAll(".rs-preview-overlay img")).map(image => {
      const img = image as HTMLImageElement;
      return img.complete ? Promise.resolve() : new Promise<void>(resolve => { img.onload = () => resolve(); img.onerror = () => resolve(); });
    }));
    window.print();
  }

  const statusLabel = status === "saved" ? "บันทึกแล้ว" : status === "saving" ? "กำลังบันทึก" : status === "error" ? "บันทึกไม่สำเร็จ" : "ยังไม่บันทึก";
  const sortedLayers = [...portfolio.sections].sort((a, b) => normalizeFrame(b).zIndex - normalizeFrame(a).zIndex);

  return (
    <div className="rs-studio">
      <div className="rs-topbar">
        <div className="rs-title-group">
          <strong>Resume Studio</strong>
          <span className={`rs-save-state rs-save-${status}`} aria-live="polite">{status === "saved" && <Check size={13} />}{statusLabel}</span>
        </div>
        <div className="rs-top-actions">
          <button className="rs-icon-button" aria-label="ย้อนกลับ" title="ย้อนกลับ" disabled={!pastRef.current.length} onClick={undo} type="button"><Undo2 size={18} /></button>
          <button className="rs-icon-button" aria-label="ทำซ้ำ" title="ทำซ้ำ" disabled={!futureRef.current.length} onClick={redo} type="button"><Redo2 size={18} /></button>
          <span className="rs-toolbar-separator" />
          <button className="rs-button" onClick={() => setShowTemplates(value => !value)} type="button"><Layers3 size={16} /> เทมเพลต</button>
          <button className="rs-button" onClick={() => setPreview(true)} type="button"><Eye size={16} /> ดูตัวอย่าง</button>
          <button className="rs-button" disabled={busy} onClick={() => void save()} type="button"><Save size={16} /> บันทึก</button>
          <button className="rs-button" onClick={() => void printPdf()} type="button"><FileDown size={16} /> บันทึก PDF</button>
          {portfolio.status === "published" ? (
            <button className="rs-button rs-button-muted" disabled={busy} onClick={() => void unpublish()} type="button">ปิดเผยแพร่</button>
          ) : (
            <button className="rs-button rs-button-primary" disabled={busy} onClick={() => void publish()} type="button"><Send size={16} /> เผยแพร่</button>
          )}
        </div>
      </div>

      {message && <div className="rs-message" role="status">{message}<button aria-label="ปิดข้อความ" onClick={() => setMessage("")} type="button"><X size={16} /></button></div>}
      {overflowIds.size > 0 && <div className="rs-overflow-alert" role="status">มีเนื้อหาล้นใน {overflowIds.size} บล็อก <button onClick={() => { setSelectedId([...overflowIds][0]); setLeftTab("layers"); }} type="button">ไปที่บล็อก</button></div>}

      {showTemplates && <div className="rs-template-strip">
        <div className="rs-template-heading"><strong>เลือกรูปแบบ</strong><label><input checked={applyTheme} onChange={event => setApplyTheme(event.target.checked)} type="checkbox" /> เปลี่ยนสีหลักด้วย</label></div>
        <div className="rs-template-list">{primaryTemplates.map(template => {
          const thumbnail = applyDocumentTemplate({ ...portfolio, sections: portfolio.sections.slice(0, 6) }, template.id, false);
          return <button className={`rs-template rs-template-${template.id}`} key={template.id} onClick={() => applyTemplate(template.id)} type="button">
            <span className="rs-template-graphic">{thumbnail && <ResumeRenderer sections={thumbnail.sections} styleSettings={thumbnail.styleSettings} title={thumbnail.title} />}</span>
            <strong>{template.name}</strong><small>{template.description}</small>
          </button>;
        })}</div>
      </div>}

      <div className="rs-mobile-tabs">
        <button onClick={() => { setLeftTab("assets"); setMobilePanel("assets"); }} type="button">เพิ่มบล็อก</button>
        <button onClick={() => { setLeftTab("layers"); setMobilePanel("layers"); }} type="button">เลเยอร์</button>
        <button onClick={() => setMobilePanel("properties")} type="button">ปรับแต่ง</button>
      </div>

      <div className="rs-workspace">
        <aside className={`rs-left rs-mobile-${mobilePanel === leftTab ? "open" : "closed"}`}>
          <div className="rs-panel-tabs">
            <button className={leftTab === "assets" ? "active" : ""} onClick={() => setLeftTab("assets")} type="button">เพิ่มบล็อก</button>
            <button className={leftTab === "layers" ? "active" : ""} onClick={() => setLeftTab("layers")} type="button">เลเยอร์</button>
            <button className="rs-mobile-close" aria-label="ปิดแผง" onClick={() => setMobilePanel(null)} type="button"><X size={17} /></button>
          </div>
          {leftTab === "assets" ? <div className="rs-assets">
            <p className="rs-panel-note">ลากลงบนกระดาษ หรือคลิกเพื่อเพิ่ม</p>
            {assets.map(asset => (
              <button
                className="rs-asset" draggable key={`${asset.type}-${asset.mode}`}
                onClick={() => addAsset(asset)}
                onDragStart={event => { event.dataTransfer.effectAllowed = "copy"; event.dataTransfer.setData("application/x-resume-asset", JSON.stringify({ type: asset.type, mode: asset.mode })); }}
                type="button"
              >
                <span className="rs-asset-icon">{asset.mode === "image" ? <ImageIcon size={18} /> : asset.mode === "text" ? <Type size={18} /> : <Plus size={18} />}</span>
                <span><strong>{asset.label}</strong><small>{asset.hint}</small></span>
              </button>
            ))}
          </div> : <div className="rs-layers">
            {sortedLayers.map(section => <div className={`rs-layer ${selectedId === section.id ? "selected" : ""}`} key={section.id}>
              <button className="rs-layer-name" onClick={() => { setSelectedId(section.id); setMobilePanel(null); }} type="button">
                <Layers3 size={15} /><span>{section.title}</span>{overflowIds.has(section.id) && <b title="เนื้อหาล้น">!</b>}
              </button>
              <button className="rs-mini-icon" aria-label={section.visible ? "ซ่อน" : "แสดง"} title={section.visible ? "ซ่อน" : "แสดง"} onClick={() => updateSection(section.id, old => ({ ...old, visible: !old.visible }))} type="button">{section.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
              <button className="rs-mini-icon" aria-label={section.frame?.locked ? "ปลดล็อก" : "ล็อก"} title={section.frame?.locked ? "ปลดล็อก" : "ล็อก"} onClick={() => updateFrame(section.id, { locked: !section.frame?.locked })} type="button">{section.frame?.locked ? <LockKeyhole size={14} /> : <UnlockKeyhole size={14} />}</button>
            </div>)}
          </div>}
        </aside>

        <main className="rs-center">
          <div className="rs-canvas-toolbar">
            <span><strong>A4</strong> · 794 × 1123</span>
            <div className="rs-canvas-tools">
              <label className="rs-snap-label"><input checked={snapEnabled} onChange={event => setSnapEnabled(event.target.checked)} type="checkbox" /> จัดแนวกริด</label>
              <button className="rs-icon-button" aria-label="ซูมออก" title="ซูมออก" onClick={() => { setFit(false); setZoom(value => clamp(Math.round((value - 0.25) * 4) / 4, 0.5, 1.5)); }} type="button"><Minus size={16} /></button>
              <span className="rs-zoom-label">{Math.round(zoom * 100)}%</span>
              <button className="rs-icon-button" aria-label="ซูมเข้า" title="ซูมเข้า" onClick={() => { setFit(false); setZoom(value => clamp(Math.round((value + 0.25) * 4) / 4, 0.5, 1.5)); }} type="button"><Plus size={16} /></button>
              <button className="rs-icon-button" aria-label="พอดีหน้าจอ" title="พอดีหน้าจอ" onClick={() => { setFit(true); fitCanvas(); }} type="button"><Maximize2 size={16} /></button>
            </div>
          </div>
          <div className="rs-stage" ref={stageRef}>
            <div className="rs-stage-space" style={{ width: documentSize.width * zoom, height: documentSize.height * zoom }}>
              <div className="rs-sheet rs-editor-sheet" ref={sheetRef} style={{ transform: `scale(${zoom})` }} onDragOver={event => event.preventDefault()} onDrop={dropAsset}>
                <div className="rs-safe-area" />
                {guides.x !== undefined && <div className="rs-guide rs-guide-x" style={{ left: guides.x }} />}
                {guides.y !== undefined && <div className="rs-guide rs-guide-y" style={{ top: guides.y }} />}
                {portfolio.sections.filter(section => section.visible).map(section => {
                  const frame = normalizeFrame(section);
                  const active = selectedId === section.id;
                  return <Rnd
                    bounds="parent" className={`rs-rnd ${active ? "selected" : ""} ${overflowIds.has(section.id) ? "overflow" : ""}`}
                    dragGrid={snapEnabled ? [8, 8] : [1, 1]}
                    enableResizing={active && !frame.locked}
                    key={section.id}
                    minHeight={72} minWidth={120}
                    onDrag={(event, data) => showAlignment(section.id, data.x, data.y)}
                    onDragStart={() => setSelectedId(section.id)}
                    onDragStop={(event, data) => {
                      setGuides({});
                      if (Math.abs(data.x - frame.x) > .5 || Math.abs(data.y - frame.y) > .5) {
                        updateFrame(section.id, { x: snap(data.x, snapEnabled), y: snap(data.y, snapEnabled) });
                      }
                    }}
                    onResizeStop={(event, direction, ref, delta, position) => {
                      if (Math.abs(delta.width) > .5 || Math.abs(delta.height) > .5) {
                        updateFrame(section.id, { x: snap(position.x, snapEnabled), y: snap(position.y, snapEnabled), width: snap(ref.offsetWidth, snapEnabled), height: snap(ref.offsetHeight, snapEnabled) });
                      }
                    }}
                    position={{ x: frame.x, y: frame.y }}
                    scale={zoom}
                    size={{ width: frame.width, height: frame.height }}
                    style={{ zIndex: frame.zIndex }}
                    disableDragging={frame.locked}
                    resizeGrid={snapEnabled ? [8, 8] : [1, 1]}
                  >
                    <div className="rs-selection-target" onClick={() => setSelectedId(section.id)}>
                      <ResumeSection section={section} styleSettings={portfolio.styleSettings} onOverflow={reportOverflow} />
                      {active && <div className="rs-selection-label"><span>{section.title}</span>{frame.locked && <LockKeyhole size={12} />}</div>}
                    </div>
                  </Rnd>;
                })}
              </div>
            </div>
          </div>
        </main>

        <aside className={`rs-right rs-mobile-${mobilePanel === "properties" ? "open" : "closed"}`}>
          <div className="rs-inspector-header"><strong>ปรับแต่ง</strong><button className="rs-mobile-close" aria-label="ปิดแผง" onClick={() => setMobilePanel(null)} type="button"><X size={17} /></button></div>
          <div className="rs-inspector-scroll">
            <div className="rs-field"><label htmlFor="resume-title">ชื่อ Resume</label><input id="resume-title" value={portfolio.title} onChange={event => markChanged({ ...portfolioRef.current, title: event.target.value }, "title")} /></div>
            <div className="rs-document-fields"><div className="rs-field"><label htmlFor="resume-font">ฟอนต์หลัก</label><select id="resume-font" value={portfolio.styleSettings.fontFamily} onChange={event => markChanged({ ...portfolioRef.current, styleSettings: { ...portfolioRef.current.styleSettings, fontFamily: event.target.value } })}>{fontOptions.map(font => <option key={font}>{font}</option>)}</select></div>
            <div className="rs-field"><label htmlFor="resume-accent">สีหลัก</label><input id="resume-accent" type="color" value={portfolio.styleSettings.primaryColor} onChange={event => markChanged({ ...portfolioRef.current, styleSettings: { ...portfolioRef.current.styleSettings, primaryColor: event.target.value } }, "accent")} /></div></div>
            {selected ? <>
              <div className="rs-selection-summary"><span><Settings2 size={17} /> {selected.title}</span><div>
                <button className="rs-mini-icon" aria-label="คัดลอกบล็อก" title="คัดลอกบล็อก" onClick={() => duplicateSection(selected)} type="button"><Copy size={16} /></button>
                <button className="rs-mini-icon" aria-label="ลบบล็อก" title="ลบบล็อก" disabled={selected.frame?.locked} onClick={() => removeSection(selected)} type="button"><Trash2 size={16} /></button>
              </div></div>
              <div className="rs-property-tabs">{(["content", "design", "layout"] as InspectorTab[]).map(tab => <button className={inspectorTab === tab ? "active" : ""} key={tab} onClick={() => setInspectorTab(tab)} type="button">{tab === "content" ? "เนื้อหา" : tab === "design" ? "ดีไซน์" : "ตำแหน่ง"}</button>)}</div>
              {inspectorTab === "content" && <div className="rs-property-body">
                <div className="rs-field"><label htmlFor="block-title">ชื่อบล็อก</label><input id="block-title" value={selected.title} onChange={event => updateSection(selected.id, section => ({ ...section, title: event.target.value }), `title-${selected.id}`)} /></div>
                <label className="rs-check"><input checked={selected.visible} onChange={event => updateSection(selected.id, section => ({ ...section, visible: event.target.checked }))} type="checkbox" /> แสดงบล็อกนี้</label>
                {selected.settings?.contentMode !== "image" && <>
                  <label className="rs-check"><input checked={selected.settings?.showTitle !== false} onChange={event => updateSettings(selected.id, { showTitle: event.target.checked })} type="checkbox" /> แสดงหัวข้อ</label>
                  <div className="rs-field"><label htmlFor="block-body">รายละเอียด</label><textarea id="block-body" rows={5} value={selected.content.body || ""} onChange={event => updateSection(selected.id, section => ({ ...section, content: { ...section.content, body: event.target.value } }), `body-${selected.id}`)} /></div>
                  <div className="rs-field"><label htmlFor="block-items">รายการ (บรรทัดละหนึ่ง)</label><textarea id="block-items" rows={4} value={(selected.content.items || []).join("\n")} onChange={event => updateSection(selected.id, section => ({ ...section, content: { ...section.content, items: event.target.value.split("\n") } }), `items-${selected.id}`)} /></div>
                </>}
                <div className="rs-field"><label htmlFor="block-image">รูปภาพ</label><input accept="image/jpeg,image/png,image/webp,image/gif" id="block-image" onChange={event => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} type="file" /></div>
                <div className="rs-field"><label htmlFor="block-image-url">หรือ URL รูปภาพ</label><input id="block-image-url" placeholder="https://..." value={selected.content.imageUrl?.startsWith("data:") ? "" : selected.content.imageUrl || ""} onChange={event => updateSection(selected.id, section => ({ ...section, content: { ...section.content, imageUrl: event.target.value } }), `image-${selected.id}`)} /></div>
                {selected.content.imageUrl && <button className="rs-button" onClick={() => updateSection(selected.id, section => ({ ...section, content: { ...section.content, imageUrl: "" } }))} type="button"><Trash2 size={15} /> ลบรูป</button>}
                <div className="rs-field"><label htmlFor="block-fit">การวางภาพ</label><select id="block-fit" value={selected.settings?.imageFit || "cover"} onChange={event => updateSettings(selected.id, { imageFit: event.target.value as "cover" | "contain" })}><option value="cover">เต็มพื้นที่</option><option value="contain">เห็นภาพทั้งหมด</option></select></div>
                {selected.settings?.contentMode !== "image" && selected.content.imageUrl && <div className="rs-field"><label htmlFor="block-image-position">ตำแหน่งรูปกับข้อความ</label><select id="block-image-position" value={selected.settings?.imagePosition || "left"} onChange={event => updateSettings(selected.id, { imagePosition: event.target.value as "left" | "right" | "top" })}><option value="left">ด้านซ้าย</option><option value="right">ด้านขวา</option><option value="top">ด้านบน</option></select></div>}
              </div>}
              {inspectorTab === "design" && <div className="rs-property-body">
                <div className="rs-color-pair"><div className="rs-field"><label htmlFor="block-accent">สีหัวข้อ</label><input id="block-accent" type="color" value={selected.accentColor || portfolio.styleSettings.primaryColor} onChange={event => updateSection(selected.id, section => ({ ...section, accentColor: event.target.value }), `color-${selected.id}`)} /></div><div className="rs-field"><label htmlFor="block-background">สีพื้นหลัง</label><input id="block-background" type="color" value={selected.backgroundColor || "#ffffff"} onChange={event => updateSection(selected.id, section => ({ ...section, backgroundColor: event.target.value }), `background-${selected.id}`)} /></div></div>
                <div className="rs-swatches">{colors.map(color => <button aria-label={`ใช้สี ${color}`} key={color} onClick={() => updateSection(selected.id, section => ({ ...section, accentColor: color }))} style={{ backgroundColor: color }} type="button" />)}</div>
                <div className="rs-field"><label htmlFor="block-text-color">สีข้อความ</label><input id="block-text-color" type="color" value={selected.settings?.textColor || "#23313c"} onChange={event => updateSettings(selected.id, { textColor: event.target.value }, `textcolor-${selected.id}`)} /></div>
                <div className="rs-field"><label htmlFor="block-font">ฟอนต์บล็อก</label><select id="block-font" value={selected.settings?.fontFamily || ""} onChange={event => updateSettings(selected.id, { fontFamily: event.target.value || undefined })}><option value="">ตาม Resume</option>{fontOptions.map(font => <option key={font}>{font}</option>)}</select></div>
                <div className="rs-compact-row"><div className="rs-field"><label htmlFor="block-font-size">ขนาดตัวอักษร</label><input id="block-font-size" max={42} min={10} onChange={event => updateSettings(selected.id, { fontSize: Number(event.target.value) }, `fontsize-${selected.id}`)} type="number" value={selected.settings?.fontSize || portfolio.styleSettings.fontSize} /></div><div className="rs-field"><label htmlFor="block-line-height">ระยะบรรทัด</label><input id="block-line-height" max={2} min={1} onChange={event => updateSettings(selected.id, { lineHeight: Number(event.target.value) }, `lineheight-${selected.id}`)} step={0.1} type="number" value={selected.settings?.lineHeight || 1.5} /></div></div>
                <div className="rs-field"><label htmlFor="block-weight">น้ำหนักตัวอักษร</label><select id="block-weight" value={selected.settings?.fontWeight || 400} onChange={event => updateSettings(selected.id, { fontWeight: Number(event.target.value) })}><option value={400}>ปกติ</option><option value={600}>กึ่งหนา</option><option value={700}>หนา</option></select></div>
                <div className="rs-field"><span>การจัดแนวข้อความ</span><div className="rs-segments">{(["left", "center", "right"] as const).map((value, index) => <button aria-label={`จัด${value}`} className={selected.settings?.alignment === value ? "active" : ""} key={value} onClick={() => updateSettings(selected.id, { alignment: value })} type="button">{index === 0 ? <AlignLeft size={17} /> : index === 1 ? <AlignCenter size={17} /> : <AlignRight size={17} />}</button>)}</div></div>
                <div className="rs-field"><label htmlFor="block-columns">คอลัมน์ภายในบล็อก</label><select id="block-columns" value={selected.columns || 1} onChange={event => updateSection(selected.id, section => ({ ...section, columns: Number(event.target.value) as 1 | 2 }))}><option value={1}>1 คอลัมน์</option><option value={2}>2 คอลัมน์</option></select></div>
                <div className="rs-field"><label htmlFor="block-items-style">รูปแบบรายการ</label><select id="block-items-style" value={selected.settings?.itemStyle || "list"} onChange={event => updateSettings(selected.id, { itemStyle: event.target.value as PortfolioSectionSettings["itemStyle"] })}>{["list", "chips", "cards", "timeline", "bars", "pills"].map(style => <option key={style} value={style}>{style}</option>)}</select></div>
                <div className="rs-field"><label htmlFor="block-padding">ระยะขอบในบล็อก</label><select id="block-padding" value={selected.settings?.padding || "comfortable"} onChange={event => updateSettings(selected.id, { padding: event.target.value as PortfolioSectionSettings["padding"] })}><option value="compact">กระชับ</option><option value="comfortable">ปกติ</option><option value="spacious">โปร่ง</option></select></div>
                <div className="rs-compact-row"><div className="rs-field"><label htmlFor="block-radius">มุม</label><select id="block-radius" value={selected.settings?.radius || "soft"} onChange={event => updateSettings(selected.id, { radius: event.target.value as PortfolioSectionSettings["radius"] })}><option value="none">เหลี่ยม</option><option value="soft">เล็กน้อย</option><option value="rounded">โค้ง</option></select></div><div className="rs-field"><label htmlFor="block-shadow">เงา</label><select id="block-shadow" value={selected.settings?.shadow || "none"} onChange={event => updateSettings(selected.id, { shadow: event.target.value as PortfolioSectionSettings["shadow"] })}><option value="none">ไม่มี</option><option value="soft">บาง</option><option value="elevated">ชัด</option></select></div></div>
              </div>}
              {inspectorTab === "layout" && <div className="rs-property-body">
                <div className="rs-geometry-grid">{(["x", "y", "width", "height"] as const).map(key => <div className="rs-field" key={key}><label htmlFor={`frame-${key}`}>{key.toUpperCase()}</label><input id={`frame-${key}`} min={0} onChange={event => updateFrame(selected.id, { [key]: Number(event.target.value) })} type="number" value={Math.round(normalizeFrame(selected)[key])} /></div>)}</div>
                <div className="rs-compact-row"><button className="rs-button" onClick={() => moveLayer(selected, 1)} type="button"><ArrowUp size={15} /> นำไปหน้า</button><button className="rs-button" onClick={() => moveLayer(selected, -1)} type="button"><ArrowDown size={15} /> ส่งไปหลัง</button></div>
                <label className="rs-check"><input checked={Boolean(selected.frame?.locked)} onChange={event => updateFrame(selected.id, { locked: event.target.checked })} type="checkbox" /> ล็อกตำแหน่ง</label>
              </div>}
            </> : <div className="rs-no-selection">เลือกบล็อกบนกระดาษเพื่อแก้ไข</div>}
          </div>
        </aside>
      </div>

      {mobilePanel && <button className="rs-mobile-scrim" aria-label="ปิดแผง" onClick={() => setMobilePanel(null)} type="button" />}

      {preview && <div className="rs-preview-overlay" role="dialog" aria-modal="true" aria-label="ตัวอย่าง Resume">
        <div className="rs-preview-toolbar"><strong>ตัวอย่าง Resume</strong><div><button className="rs-button" onClick={() => void printPdf()} type="button"><FileDown size={16} /> บันทึก PDF</button><button className="rs-icon-button" aria-label="ปิดตัวอย่าง" onClick={() => setPreview(false)} type="button"><X size={20} /></button></div></div>
        <ResumeRenderer sections={portfolio.sections} styleSettings={portfolio.styleSettings} templateId={portfolio.templateId} title={portfolio.title} />
      </div>}
    </div>
  );
}
