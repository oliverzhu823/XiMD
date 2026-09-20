import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  ListTree,
  FolderPlus,
  FilePlus,
  Compass,
} from "lucide-react";
import { FileItem } from "@/services/tauriBridge";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface SidebarProps {
  isOpen: boolean;
  activeTab: "files" | "outline";
  onTabChange: (tab: "files" | "outline") => void;
  rootPath: string | null;
  fileTree: FileItem[];
  currentFilePath: string | null;
  onSelectFile: (path: string) => void;
  onOpenFolder: () => void;
  tocList: TocItem[];
  onSelectHeading: (text: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeTab,
  onTabChange,
  rootPath,
  fileTree,
  currentFilePath,
  onSelectFile,
  onOpenFolder,
  tocList,
  onSelectHeading,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-60 h-[calc(100vh-2.5rem)] flex flex-col mac-sidebar-vibrancy border-r border-mac-border select-none text-xs text-mac-text shrink-0 z-20">
      {/* Top Tabs */}
      <div className="flex border-b border-mac-border px-2 pt-2 gap-1">
        <button
          onClick={() => onTabChange("files")}
          className={`flex-1 py-1 px-2 rounded-t-md text-center font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "files"
              ? "bg-mac-surface text-mac-accent border-b-2 border-mac-accent"
              : "text-mac-muted hover:text-mac-text"
          }`}
        >
          <Folder size={14} />
          <span>文件</span>
        </button>
        <button
          onClick={() => onTabChange("outline")}
          className={`flex-1 py-1 px-2 rounded-t-md text-center font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "outline"
              ? "bg-mac-surface text-mac-accent border-b-2 border-mac-accent"
              : "text-mac-muted hover:text-mac-text"
          }`}
        >
          <ListTree size={14} />
          <span>大纲</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === "files" ? (
          <div>
            <div className="flex items-center justify-between px-2 py-1 mb-1 text-mac-muted text-[11px] font-semibold uppercase tracking-wider">
              <span className="truncate">{rootPath ? rootPath.split("/").pop() : "未打开工作区"}</span>
              <button
                onClick={onOpenFolder}
                className="hover:text-mac-accent p-0.5 rounded transition-colors"
                title="打开文件夹"
              >
                <FolderPlus size={14} />
              </button>
            </div>

            {fileTree.length === 0 ? (
              <div className="py-8 px-4 text-center text-mac-muted">
                <Compass size={28} className="mx-auto mb-2 opacity-50" />
                <p className="mb-2">暂无文件列表</p>
                <button
                  onClick={onOpenFolder}
                  className="px-3 py-1 bg-mac-surface border border-mac-border rounded hover:bg-mac-hover text-mac-accent transition-colors"
                >
                  打开文件夹...
                </button>
              </div>
            ) : (
              <div className="space-y-0.5">
                {fileTree.map((item) => (
                  <FileTreeNode
                    key={item.path}
                    item={item}
                    currentFilePath={currentFilePath}
                    onSelectFile={onSelectFile}
                    depth={0}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-1">
            <div className="px-2 py-1 mb-2 text-mac-muted text-[11px] font-semibold uppercase tracking-wider">
              目录大纲 ({tocList.length})
            </div>
            {tocList.length === 0 ? (
              <div className="py-8 px-4 text-center text-mac-muted">
                <p>当前文档暂无标题</p>
                <p className="text-[11px] opacity-70 mt-1">使用 # 一级标题 编写即可生成大纲</p>
              </div>
            ) : (
              <div className="space-y-1">
                {tocList.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    onClick={() => onSelectHeading(item.text)}
                    className="w-full text-left truncate py-1 px-2 rounded hover:bg-mac-hover hover:text-mac-accent transition-colors flex items-center gap-1.5"
                    style={{ paddingLeft: `${Math.max(item.level - 1, 0) * 12 + 8}px` }}
                  >
                    <span className="text-[10px] text-mac-muted font-mono">H{item.level}</span>
                    <span className="truncate">{item.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

const FileTreeNode: React.FC<{
  item: FileItem;
  currentFilePath: string | null;
  onSelectFile: (path: string) => void;
  depth: number;
}> = ({ item, currentFilePath, onSelectFile, depth }) => {
  const [expanded, setExpanded] = useState(false);
  const isSelected = currentFilePath === item.path;

  if (item.is_dir) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-1.5 py-1 px-2 rounded hover:bg-mac-hover text-mac-text transition-colors text-left"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {expanded ? <ChevronDown size={13} className="text-mac-muted" /> : <ChevronRight size={13} className="text-mac-muted" />}
          {expanded ? <FolderOpen size={14} className="text-amber-500" /> : <Folder size={14} className="text-amber-500" />}
          <span className="truncate font-medium">{item.name}</span>
        </button>
        {expanded && item.children && (
          <div className="space-y-0.5">
            {item.children.map((child) => (
              <FileTreeNode
                key={child.path}
                item={child}
                currentFilePath={currentFilePath}
                onSelectFile={onSelectFile}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File
  const isMarkdown = item.name.endsWith(".md") || item.name.endsWith(".markdown");
  return (
    <button
      onClick={() => onSelectFile(item.path)}
      className={`w-full flex items-center gap-1.5 py-1 px-2 rounded transition-colors text-left ${
        isSelected
          ? "bg-mac-accent text-white font-medium shadow-sm"
          : "hover:bg-mac-hover text-mac-text"
      }`}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      <FileText size={13} className={isSelected ? "text-white" : isMarkdown ? "text-mac-accent" : "text-mac-muted"} />
      <span className="truncate">{item.name}</span>
    </button>
  );
};
