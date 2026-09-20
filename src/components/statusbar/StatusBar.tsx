import React from "react";

interface StatusBarProps {
  content: string;
  typewriterMode: boolean;
  focusMode: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  content,
  typewriterMode,
  focusMode,
}) => {
  // Calculate statistics
  const characters = content.length;
  // CJK character count + English word count
  const cjkChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const nonCjkWords = (content.replace(/[\u4e00-\u9fa5]/g, " ").match(/\b\w+\b/g) || []).length;
  const wordCount = cjkChars + nonCjkWords;
  const lines = content.split("\n").length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 300));

  return (
    <footer className="h-6 w-full px-3 select-none flex items-center justify-between text-[11px] text-mac-muted border-t border-mac-border bg-mac-bg backdrop-blur-md z-30 shrink-0">
      <div className="flex items-center space-x-3">
        <span>{wordCount.toLocaleString()} 词</span>
        <span>{characters.toLocaleString()} 字符</span>
        <span>{lines} 行</span>
        <span>阅读约 {readTimeMin} 分钟</span>
      </div>

      <div className="flex items-center space-x-2">
        {typewriterMode && (
          <span className="px-1.5 py-0.2 rounded bg-mac-hover text-mac-accent font-medium">
            打字机
          </span>
        )}
        {focusMode && (
          <span className="px-1.5 py-0.2 rounded bg-mac-hover text-mac-accent font-medium">
            对焦
          </span>
        )}
        <span className="font-mono">UTF-8</span>
        <span className="text-[10px] opacity-75">Markdown</span>
      </div>
    </footer>
  );
};
