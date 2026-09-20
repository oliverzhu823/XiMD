import React, { useState, useRef } from "react";

interface TooltipProps {
  title: string;
  description?: string;
  shortcut?: string;
  children: React.ReactNode;
  position?: "bottom" | "top";
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  description,
  shortcut,
  children,
  position = "bottom",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 180);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute ${
            position === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          } right-0 z-50 pointer-events-none min-w-[140px] max-w-[240px] px-2.5 py-1.5 rounded-lg shadow-xl bg-zinc-900/95 dark:bg-zinc-800/95 text-white border border-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 text-left`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[11px] leading-tight text-zinc-100">{title}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/15 text-zinc-300">
                {shortcut}
              </kbd>
            )}
          </div>
          {description && (
            <p className="mt-1 text-[10px] text-zinc-400 leading-normal">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
