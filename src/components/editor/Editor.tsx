import React, { useEffect, useRef, useCallback } from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { TauriBridge } from "@/services/tauriBridge";
import { TocItem } from "@/components/sidebar/Sidebar";
import { SelectionAiBubble } from "./SelectionAiBubble";

interface EditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  documentDir: string | null;
  typewriterMode: boolean;
  focusMode: boolean;
  wideMode: boolean;
  onTocChange: (toc: TocItem[]) => void;
  onOpenAiSelection?: (text: string) => void;
  editorRefInstance?: React.MutableRefObject<{
    insertText: (text: string) => void;
    replaceSelection: (text: string) => void;
    scrollToHeading: (headingText: string) => void;
  } | null>;
}

export const Editor: React.FC<EditorProps> = ({
  initialContent,
  onChange,
  documentDir,
  typewriterMode,
  focusMode,
  wideMode,
  onTocChange,
  onOpenAiSelection,
  editorRefInstance,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const contentRef = useRef<string>(initialContent);

  // Parse markdown headings to TOC list
  const extractHeadings = useCallback((markdown: string) => {
    const lines = markdown.split("\n");
    const list: TocItem[] = [];
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        list.push({
          id: `heading-${index}`,
          text,
          level,
        });
      }
    });
    onTocChange(list);
  }, [onTocChange]);

  // Handle Typewriter scrolling
  const handleTypewriterScroll = useCallback(() => {
    if (!typewriterMode) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect || rect.top === 0) return;

    const viewportHeight = window.innerHeight;
    const targetY = viewportHeight * 0.42;
    const diff = rect.top - targetY;

    if (Math.abs(diff) > 24) {
      window.scrollBy({
        top: diff,
        behavior: "smooth",
      });
    }
  }, [typewriterMode]);

  // Initialize Crepe Editor
  useEffect(() => {
    if (!containerRef.current) return;
    let isSubscribed = true;

    const crepe = new Crepe({
      root: containerRef.current,
      defaultValue: initialContent,
    });

    crepeRef.current = crepe;

    crepe
      .create()
      .then(() => {
        if (!isSubscribed) return;
        extractHeadings(initialContent);

        crepe.on((listener) => {
          listener.markdownUpdated((_, markdown) => {
            contentRef.current = markdown;
            onChange(markdown);
            extractHeadings(markdown);
            handleTypewriterScroll();
          });
        });
      })
      .catch((err) => {
        console.error("Failed to create Milkdown Crepe editor:", err);
      });

    return () => {
      isSubscribed = false;
      try {
        crepe.destroy();
      } catch {
        // ignore cleanup error
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      crepeRef.current = null;
    };
  }, []);

  // Handle paste image -> save to assets folder
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        let imagePath = "";
        if (documentDir) {
          try {
            imagePath = await TauriBridge.saveImageToAssets(documentDir, bytes, "png");
          } catch (err) {
            console.error("Failed to save image natively:", err);
          }
        }

        if (!imagePath) {
          // fallback to base64 Data URL
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            insertMarkdownImage(dataUrl);
          };
          reader.readAsDataURL(file);
          return;
        }

        insertMarkdownImage(imagePath);
        return;
      }
    }
  };

  const insertMarkdownImage = (src: string) => {
    const imgMd = `\n![图片](${src})\n`;
    const cur = contentRef.current;
    const updated = cur + imgMd;
    contentRef.current = updated;
    onChange(updated);
  };

  // Expose helpers via ref
  if (editorRefInstance) {
    editorRefInstance.current = {
      insertText: (text: string) => {
        const cur = contentRef.current;
        const updated = cur + "\n" + text + "\n";
        contentRef.current = updated;
        onChange(updated);
      },
      replaceSelection: (text: string) => {
        // simple append or replace
        const cur = contentRef.current;
        const updated = cur + "\n" + text + "\n";
        contentRef.current = updated;
        onChange(updated);
      },
      scrollToHeading: (headingText: string) => {
        const headers = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
        const target = headers.find((h) => h.textContent?.includes(headingText));
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
    };
  }

  return (
    <div
      onPaste={handlePaste}
      onKeyUp={handleTypewriterScroll}
      className={`w-full h-full overflow-y-auto px-6 py-8 flex justify-center transition-all ${
        focusMode ? "focus-mode-active" : ""
      }`}
    >
      {/* Floating selection AI bubble */}
      {onOpenAiSelection && <SelectionAiBubble onOpenAi={onOpenAiSelection} />}

      {/* Adaptive reading canvas: expands fluidly when wideMode is true */}
      <div
        className={`w-full min-h-full transition-all duration-200 ${
          wideMode
            ? "max-w-5xl xl:max-w-6xl 2xl:max-w-7xl px-2 md:px-8"
            : "max-w-[780px]"
        }`}
      >
        <div ref={containerRef} className="milkdown w-full" />
      </div>
    </div>
  );
};
