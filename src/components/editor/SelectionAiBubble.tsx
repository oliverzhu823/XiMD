import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface SelectionAiBubbleProps {
  onOpenAi: (text: string) => void;
}

export const SelectionAiBubble: React.FC<SelectionAiBubbleProps> = ({ onOpenAi }) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setPosition(null);
        setSelectedText("");
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 2) {
        setPosition(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        let rect = range.getBoundingClientRect();
        if ((!rect || (rect.width === 0 && rect.height === 0)) && range.getClientRects().length > 0) {
          rect = range.getClientRects()[0];
        }
        if (!rect || (rect.width === 0 && rect.height === 0)) {
          const parent = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
            ? (range.commonAncestorContainer as HTMLElement)
            : range.commonAncestorContainer.parentElement;
          if (parent) {
            rect = parent.getBoundingClientRect();
          }
        }

        if (!rect || rect.top === 0) {
          setPosition(null);
          return;
        }

        // Check if inside editor
        const editor = document.querySelector(".milkdown");
        if (!editor || !editor.contains(range.commonAncestorContainer)) {
          setPosition(null);
          return;
        }

        setSelectedText(text);
        setPosition({
          top: Math.max(45, rect.top - 36),
          left: Math.max(20, rect.left + rect.width / 2 - 50),
        });
      } catch {
        setPosition(null);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  if (!position || !selectedText) return null;

  return (
    <div
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-40 animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        onClick={() => onOpenAi(selectedText)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 dark:bg-zinc-800/95 text-white border border-amber-500/40 shadow-xl backdrop-blur-md hover:bg-zinc-800 dark:hover:bg-zinc-700 hover:border-amber-400 transition-all text-xs font-medium cursor-pointer"
      >
        <Sparkles size={13} className="text-amber-400 animate-pulse" />
        <span>AI 润色</span>
        <kbd className="text-[10px] text-zinc-400 font-mono bg-white/10 px-1 py-0.2 rounded">⌘J</kbd>
      </button>
    </div>
  );
};
