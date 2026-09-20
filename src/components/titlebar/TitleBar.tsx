import React from "react";
import {
  Sidebar,
  ListTree,
  Sparkles,
  Share,
  Sun,
  Moon,
  Crosshair,
  AlignVerticalJustifyCenter,
  FolderOpen,
  Save,
  FilePlus,
  CheckCircle2,
  Clock,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

interface TitleBarProps {
  fileName: string;
  isModified: boolean;
  isSaving: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  outlineOpen: boolean;
  onToggleOutline: () => void;
  typewriterMode: boolean;
  onToggleTypewriter: () => void;
  focusMode: boolean;
  onToggleFocus: () => void;
  wideMode: boolean;
  onToggleWideMode: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenAi: () => void;
  onExportPdf: () => void;
  onExportHtml: () => void;
  onCopyRichText: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onNewFile: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  fileName,
  isModified,
  isSaving,
  sidebarOpen,
  onToggleSidebar,
  outlineOpen,
  onToggleOutline,
  typewriterMode,
  onToggleTypewriter,
  focusMode,
  onToggleFocus,
  wideMode,
  onToggleWideMode,
  isDark,
  onToggleDark,
  onOpenAi,
  onExportPdf,
  onExportHtml,
  onCopyRichText,
  onOpenFile,
  onSaveFile,
  onNewFile,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  return (
    <div className="h-10 w-full flex items-center justify-between px-3 select-none titlebar-drag border-b border-mac-border bg-mac-bg backdrop-blur-md relative z-30">
      {/* Left side: traffic light offset + sidebar toggle & file controls */}
      <div className="flex items-center space-x-1.5 pl-[70px] titlebar-no-drag">
        <Tooltip title="侧边栏" shortcut="⌘\" description="展开/收起工作区文件树与大纲">
          <button
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-md hover:bg-mac-hover text-mac-muted hover:text-mac-text transition-colors ${
              sidebarOpen ? "bg-mac-hover text-mac-accent" : ""
            }`}
          >
            <Sidebar size={16} />
          </button>
        </Tooltip>

        <Tooltip title="新建文档" shortcut="⌘N" description="创建一个空白的新 Markdown 文档">
          <button
            onClick={onNewFile}
            className="p-1.5 rounded-md hover:bg-mac-hover text-mac-muted hover:text-mac-text transition-colors"
          >
            <FilePlus size={16} />
          </button>
        </Tooltip>

        <Tooltip title="打开文件" shortcut="⌘O" description="从本地磁盘选择 Markdown 文件打开">
          <button
            onClick={onOpenFile}
            className="p-1.5 rounded-md hover:bg-mac-hover text-mac-muted hover:text-mac-text transition-colors"
          >
            <FolderOpen size={16} />
          </button>
        </Tooltip>

        <Tooltip title="保存文档" shortcut="⌘S" description="立即存盘（默认开启无感防抖自动存盘）">
          <button
            onClick={onSaveFile}
            className="p-1.5 rounded-md hover:bg-mac-hover text-mac-muted hover:text-mac-text transition-colors"
          >
            <Save size={16} />
          </button>
        </Tooltip>
      </div>

      {/* Center: File Title & Save Status */}
      <div className="flex items-center space-x-2 text-xs font-medium text-mac-text pointer-events-none">
        <span className="truncate max-w-[280px]">{fileName || "未命名文档.md"}</span>
        {isSaving ? (
          <span className="text-[11px] text-mac-muted flex items-center gap-1">
            <Clock size={11} className="animate-spin" /> 保存中...
          </span>
        ) : isModified ? (
          <span className="w-2 h-2 rounded-full bg-amber-500" title="未保存更改" />
        ) : (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <CheckCircle2 size={11} />
          </span>
        )}
      </div>

      {/* Right side: Writing aids, Width Mode, AI, Export, Theme */}
      <div className="flex items-center space-x-1.5 titlebar-no-drag">
        {/* Outline */}
        <Tooltip title="文档大纲" description="显示文档的 H1-H6 目录结构并快速跳转">
          <button
            onClick={onToggleOutline}
            className={`p-1.5 rounded-md hover:bg-mac-hover text-mac-muted hover:text-mac-text transition-colors ${
              outlineOpen ? "bg-mac-hover text-mac-accent" : ""
            }`}
          >
            <ListTree size={16} />
          </button>
        </Tooltip>

        {/* Typewriter mode */}
        <Tooltip title="打字机居中模式" description="光标行始终平滑居中在视线平视区域">
          <button
            onClick={onToggleTypewriter}
            className={`p-1.5 rounded-md hover:bg-mac-hover text-mac-muted hover:text-mac-text transition-colors ${
              typewriterMode ? "bg-mac-hover text-mac-accent" : ""
            }`}
          >
            <AlignVerticalJustifyCenter size={16} />
          </button>
        </Tooltip>

        {/* Focus mode */}
        <Tooltip title="专注对焦模式" description="高亮当前编辑的段落，其他段落自动降低透明度">
          <button
            onClick={onToggleFocus}
            className={`p-1.5 rounded-md hover:bg-mac-hover text-mac-muted hover:text-mac-text transition-colors ${
              focusMode ? "bg-mac-hover text-mac-accent" : ""
            }`}
          >
            <Crosshair size={16} />
          </button>
        </Tooltip>

        {/* Adaptive width / Wide mode */}
        <Tooltip
          title={wideMode ? "宽屏自适应铺满 (当前开启)" : "黄金阅读行宽 (当前 780px)"}
          description={wideMode ? "内容将随窗口最大化自适应延展，充分利用大屏幕" : "固定居中舒适行宽，适合纯长文专注阅读"}
        >
          <button
            onClick={onToggleWideMode}
            className={`p-1.5 rounded-md hover:bg-mac-hover text-mac-muted hover:text-mac-text transition-colors ${
              wideMode ? "bg-mac-hover text-mac-accent" : ""
            }`}
          >
            {wideMode ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </Tooltip>

        {/* AI Assistant Pill Button */}
        <Tooltip title="AI 写作助手" shortcut="⌘J" description="选中文本进行润色、翻译、语法纠错或总结">
          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-medium hover:from-amber-500/25 hover:to-orange-500/20 transition-all text-xs shadow-sm cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>AI 助手</span>
            <kbd className="text-[10px] text-amber-600 dark:text-amber-300 font-mono bg-amber-500/15 px-1 py-0.2 rounded">⌘J</kbd>
          </button>
        </Tooltip>

        {/* Export Dropdown */}
        <div className="relative">
          <Tooltip title="导出与分享" shortcut="⌘P" description="导出高清 PDF、独立 HTML 网页或复制公众号富文本">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-1.5 rounded-md hover:bg-mac-hover text-mac-muted hover:text-mac-text transition-colors"
            >
              <Share size={16} />
            </button>
          </Tooltip>

          {showExportMenu && (
            <div
              className="absolute right-0 top-8 w-48 rounded-lg shadow-xl bg-mac-surface border border-mac-border py-1 text-xs text-mac-text z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowExportMenu(false)}
            >
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPdf();
                }}
                className="w-full text-left px-3 py-2 hover:bg-mac-hover flex items-center justify-between"
              >
                <span>高质量 PDF 导出 (打印)</span>
                <span className="text-[10px] text-mac-muted">⌘P</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportHtml();
                }}
                className="w-full text-left px-3 py-2 hover:bg-mac-hover flex items-center justify-between"
              >
                <span>独立 HTML 网页</span>
              </button>
              <div className="h-[1px] bg-mac-border my-1" />
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onCopyRichText();
                }}
                className="w-full text-left px-3 py-2 hover:bg-mac-hover flex items-center justify-between text-mac-accent font-medium"
              >
                <span>复制公众号/知乎富文本</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <Tooltip title="主题外观" description={isDark ? "切换为明亮模式" : "切换为深色模式"}>
          <button
            onClick={onToggleDark}
            className="p-1.5 rounded-md hover:bg-mac-hover text-mac-muted hover:text-mac-text transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
