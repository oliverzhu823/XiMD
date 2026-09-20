import React, { useState, useEffect, useRef, useCallback } from "react";
import { TitleBar } from "@/components/titlebar/TitleBar";
import { Sidebar, TocItem } from "@/components/sidebar/Sidebar";
import { Editor } from "@/components/editor/Editor";
import { StatusBar } from "@/components/statusbar/StatusBar";
import { AiModal } from "@/components/ai/AiModal";
import { TauriBridge, FileItem, isTauri } from "@/services/tauriBridge";

const DEFAULT_WELCOME_MARKDOWN = `# 欢迎使用 XiMD

XiMD 是一款专为 **macOS** 打造的极简高颜值 Markdown 编辑器。它结合了类似 **Typora** 的行内所见即所得体验与 Apple 原生美学设计。

---

## ✨ 核心特性

- 🍃 **极速轻巧**：基于 Tauri 2.0 构建，启动飞快，内存开销低
- 🎨 **苹果质感**：原生毛玻璃侧边栏、无边框沉浸式标题栏、居中舒适排版
- ⚡ **无感自动保存**：编辑即存盘，告别数据丢失焦虑
- 🎯 **打字机与对焦模式**：始终将视线保持在黄金阅读区域
- ✦ **轻量 AI 助手**：随时按下 \`Cmd + J\` 即可对选中文本进行润色、翻译与提炼

---

## 📊 丰富扩展语法支持

### 1. 交互式表格 (GFM)

| 功能特性 | 状态 | 说明 |
| :--- | :---: | :--- |
| 行内实时排版 | ✅ | 光标进入展开源码，移开即排版 |
| 数学公式支持 | ✅ | 集成 KaTeX 超快公式引擎 |
| Mermaid 图表 | ✅ | 流程图、时序图无缝渲染 |
| 相对路径图片 | ✅ | 剪贴板图片自动存入 \`./assets\` |

### 2. 数学公式 (KaTeX)

质能守恒方程：
$$E = mc^2$$

欧拉恒等式：
$$e^{i\\pi} + 1 = 0$$

### 3. 代码高亮

\`\`\`typescript
interface XiMDEditor {
  aesthetic: "minimalist" | "native";
  framework: "React 19 + Milkdown";
  platform: "macOS";
}

const editor: XiMDEditor = {
  aesthetic: "minimalist",
  framework: "React 19 + Milkdown",
  platform: "macOS",
};
\`\`\`

> 💡 **提示**：你可以通过顶部工具栏随时导出高质量 PDF、独立网页，或一键复制为微信公众号/知乎富文本格式。

祝你写作愉快！
`;

export const App: React.FC = () => {
  // Document state
  const [content, setContent] = useState<string>(DEFAULT_WELCOME_MARKDOWN);
  const [savedContent, setSavedContent] = useState<string>(DEFAULT_WELCOME_MARKDOWN);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState<string | null>("欢迎使用 XiMD.md");
  const [docSessionId, setDocSessionId] = useState<string>("init");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Layout & View state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<"files" | "outline">("outline");
  const [outlineOpen, setOutlineOpen] = useState<boolean>(false);
  const [tocList, setTocList] = useState<TocItem[]>([]);
  const [typewriterMode, setTypewriterMode] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [wideMode, setWideMode] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Workspace & Tree
  const [rootFolderPath, setRootFolderPath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileItem[]>([]);

  // AI Modal
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>("");

  const editorActionsRef = useRef<{
    insertText: (t: string) => void;
    replaceSelection: (t: string) => void;
    scrollToHeading: (h: string) => void;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isModified = content !== savedContent;
  const fileName = currentFilePath
    ? currentFilePath.split("/").pop() || ""
    : customTitle || "未命名文档.md";
  const documentDir = currentFilePath ? currentFilePath.substring(0, currentFilePath.lastIndexOf("/")) : null;

  // Toggle dark class on root document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Save current file
  const handleSaveFile = useCallback(async () => {
    let targetPath = currentFilePath;
    if (!targetPath) {
      if (!isTauri()) {
        // Browser fallback: trigger markdown file download
        const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
        a.click();
        URL.revokeObjectURL(url);
        setSavedContent(content);
        return;
      }
      targetPath = await TauriBridge.pickSavePath("未命名文档.md");
      if (!targetPath) return;
      setCurrentFilePath(targetPath);
    }

    setIsSaving(true);
    try {
      await TauriBridge.writeFile(targetPath, content);
      setSavedContent(content);
    } catch (err: any) {
      console.error("Failed to save file:", err);
      alert(`保存文件失败: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  }, [content, currentFilePath, fileName]);

  // Debounced auto-save
  useEffect(() => {
    if (!currentFilePath || !isModified) return;

    const timer = setTimeout(() => {
      handleSaveFile();
    }, 1200);

    return () => clearTimeout(timer);
  }, [content, currentFilePath, isModified, handleSaveFile]);

  // Blur auto-save
  useEffect(() => {
    const handleBlur = () => {
      if (currentFilePath && isModified) {
        handleSaveFile();
      }
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [currentFilePath, isModified, handleSaveFile]);

  // Open file
  const handleOpenFile = async () => {
    if (isTauri()) {
      try {
        const filePath = await TauriBridge.pickMarkdownFile();
        if (!filePath) return;

        const data = await TauriBridge.readFile(filePath);
        setCurrentFilePath(filePath);
        setContent(data);
        setSavedContent(data);
        setDocSessionId(filePath + "_" + Date.now());
      } catch (err: any) {
        console.error("Failed to open file:", err);
        alert(`打开文件失败: ${err?.message || err}`);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  // Browser fallback file picker change
  const handleBrowserFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setCurrentFilePath(null);
      setCustomTitle(file.name);
      setContent(text);
      setSavedContent(text);
      setDocSessionId(file.name + "_" + Date.now());
    } catch (err: any) {
      console.error("Failed to read browser file:", err);
      alert(`打开文件失败: ${err?.message || err}`);
    }
    e.target.value = "";
  };

  // New blank file
  const handleNewFile = () => {
    setCurrentFilePath(null);
    setCustomTitle("未命名文档.md");
    setContent("");
    setSavedContent("");
    setDocSessionId("new_" + Date.now());
  };

  // Open workspace directory
  const handleOpenFolder = async () => {
    const folderPath = await TauriBridge.pickDirectory();
    if (!folderPath) return;

    setRootFolderPath(folderPath);
    const tree = await TauriBridge.readDirTree(folderPath);
    setFileTree(tree);
    setSidebarTab("files");
    setSidebarOpen(true);
  };

  // Select file from sidebar
  const handleSelectFile = async (path: string) => {
    if (path === currentFilePath) return;
    try {
      const data = await TauriBridge.readFile(path);
      setCurrentFilePath(path);
      setContent(data);
      setSavedContent(data);
      setDocSessionId(path + "_" + Date.now());
    } catch (err: any) {
      console.error("Failed to read file from tree:", err);
      alert(`无法读取文件: ${err?.message || err}`);
    }
  };

  // Open AI modal
  const handleOpenAi = () => {
    const selection = window.getSelection();
    const selText = selection ? selection.toString().trim() : "";
    setSelectedText(selText);
    setAiModalOpen(true);
  };

  // Export handlers
  const handleExportPdf = () => {
    window.print();
  };

  const handleExportHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${fileName.replace(".md", "")}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; margin-top: 1.6em; }
    pre { background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
    th { background: #f8fafc; }
    blockquote { border-left: 4px solid #0284c7; margin: 0; padding-left: 16px; color: #64748b; }
  </style>
</head>
<body>
  ${document.querySelector(".milkdown .editor")?.innerHTML || content}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(".md", "")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyRichText = async () => {
    const editorElem = document.querySelector(".milkdown .editor");
    if (!editorElem) return;
    const richHtml = editorElem.innerHTML;

    try {
      const blobHtml = new Blob([richHtml], { type: "text/html" });
      const blobText = new Blob([content], { type: "text/plain" });
      const item = new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText,
      });
      await navigator.clipboard.write([item]);
      alert("已复制微信公众号/知乎排版格式到剪贴板！可直接粘贴。");
    } catch {
      await TauriBridge.copyText(content);
      alert("已复制纯文本格式到剪贴板！");
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd / Ctrl shortcuts
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          handleSaveFile();
        } else if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          handleNewFile();
        } else if (e.key === "o" || e.key === "O") {
          e.preventDefault();
          handleOpenFile();
        } else if (e.key === "\\") {
          e.preventDefault();
          setSidebarOpen((prev) => !prev);
        } else if (e.key === "j" || e.key === "J") {
          e.preventDefault();
          handleOpenAi();
        } else if (e.key === "p" || e.key === "P") {
          e.preventDefault();
          handleExportPdf();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveFile]);

  // Handle Drag & Drop of Markdown files into window
  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.name.endsWith(".txt")) {
      try {
        const text = await file.text();
        const filePath = (file as any).path || null;
        setCurrentFilePath(filePath);
        setCustomTitle(file.name);
        setContent(text);
        setSavedContent(text);
        setDocSessionId(filePath ? filePath + "_" + Date.now() : file.name + "_" + Date.now());
      } catch (err) {
        console.error("Failed to read dropped file:", err);
      }
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
      className="h-screen w-screen flex flex-col overflow-hidden mac-vibrancy"
    >
      {/* Title Bar */}
      <TitleBar
        fileName={fileName}
        isModified={isModified}
        isSaving={isSaving}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        outlineOpen={outlineOpen || (sidebarOpen && sidebarTab === "outline")}
        onToggleOutline={() => {
          setSidebarOpen(true);
          setSidebarTab("outline");
        }}
        typewriterMode={typewriterMode}
        onToggleTypewriter={() => setTypewriterMode(!typewriterMode)}
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode(!focusMode)}
        wideMode={wideMode}
        onToggleWideMode={() => setWideMode(!wideMode)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        onOpenAi={handleOpenAi}
        onExportPdf={handleExportPdf}
        onExportHtml={handleExportHtml}
        onCopyRichText={handleCopyRichText}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onNewFile={handleNewFile}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          rootPath={rootFolderPath}
          fileTree={fileTree}
          currentFilePath={currentFilePath}
          onSelectFile={handleSelectFile}
          onOpenFolder={handleOpenFolder}
          tocList={tocList}
          onSelectHeading={(headingText) => {
            editorActionsRef.current?.scrollToHeading(headingText);
          }}
        />

        {/* Editor Area */}
        <main className="flex-1 h-full overflow-hidden bg-mac-bg/40 relative">
          <Editor
            key={docSessionId}
            initialContent={content}
            onChange={setContent}
            documentDir={documentDir}
            typewriterMode={typewriterMode}
            focusMode={focusMode}
            wideMode={wideMode}
            onTocChange={setTocList}
            onOpenAiSelection={(text) => {
              setSelectedText(text);
              setAiModalOpen(true);
            }}
            editorRefInstance={editorActionsRef}
          />
        </main>
      </div>

      {/* Status Bar */}
      <StatusBar
        content={content}
        typewriterMode={typewriterMode}
        focusMode={focusMode}
      />

      {/* AI Assistant Modal */}
      <AiModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        selectedText={selectedText}
        onApplyResult={(newText, mode) => {
          if (mode === "insert") {
            setContent((prev) => {
              const updated = prev + "\n" + newText + "\n";
              setDocSessionId("ai_" + Date.now());
              return updated;
            });
          } else {
            setContent((prev) => {
              const updated = selectedText ? prev.replace(selectedText, newText) : newText;
              setDocSessionId("ai_" + Date.now());
              return updated;
            });
          }
        }}
      />

      {/* Hidden browser file input for web fallback */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBrowserFileChange}
        accept=".md,.markdown,.txt"
        className="hidden"
      />
    </div>
  );
};
