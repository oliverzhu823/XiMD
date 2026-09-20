<div align="center">

# 🍃 XiMD

**专为 macOS 打造的极简高颜值 Markdown 编辑器**

*类似 Typora 的行内所见即所得 · 苹果原生毛玻璃美学 · 极速轻量 Tauri 2.0 原生架构*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: macOS](https://img.shields.io/badge/Platform-macOS%20(Apple%20Silicon%20%2F%20Intel)-black.svg)]()
[![Built with: Tauri 2.0](https://img.shields.io/badge/Built%20with-Tauri%202.0%20(Rust)-orange.svg)]()
[![React: 19](https://img.shields.io/badge/React-19-61dafb.svg)]()

</div>

---

## 📖 简介

**XiMD** 是一款注重纯粹书写体验与视觉美感的 macOS 原生 Markdown 编辑器。

它汲取了 **Typora**“行内所见即所得”的直觉化编辑哲学，深度融入 Apple 原生设计语言（macOS Vibrancy 毛玻璃、沉浸式无边框标题栏、精致悬停微交互），并基于 **Tauri 2.0 + Rust** 构建，彻底告别传统 Electron 应用动辄数百兆的内存开销与笨重感，常驻内存仅约 **90MB**，启动瞬开、轻快如风。

---

## ✨ 核心特性

### 1. ✍️ 极致纯粹的行内所见即所得
- **光标驱动排版**：光标置于文本时展开 Markdown 源码语法，移开光标即刻无缝转换为精美富文本。
- **告别左右分屏**：无需对照双栏预览，让视线始终聚焦在内容创作本身。
- **GFM 与现代语法**：全量支持交互式表格、KaTeX 数学公式（`$...$` 与 `$$...$$`）、Mermaid 流程图/时序图、代码语法高亮与任务清单。

### 2. 🎨 纯正 Apple 原生质感
- **Vibrancy 材质**：原生毛玻璃侧边栏，跟随系统壁纸产生通透呼吸感。
- **无边框沉浸标题栏**：无缝融入系统红绿灯控制按键，窗口拖拽与控件布局张弛有度。
- **中文悬停提示 HUD**：全工具栏按钮配备鼠标悬停说明卡片与快捷键指引，上手零门槛。
- **宽屏自适应与居中排版**：支持在「自适应宽屏（最大化铺满）」与「黄金阅读行宽（经典居中）」之间一键切换。

### 3. ⚡ 无感防抖自动保存
- **编辑即存盘**：键入内容后 1.2 秒自动触发后台防抖持久化，窗口失焦自动存盘，彻底消除数据丢失焦虑。
- **原生文件系统读写**：基于底层 Rust 原生命令读写文件，摆脱沙箱限制，任意目录下的 `.md` 文件均可秒速打开与保存。

### 4. 🎯 沉浸式写作辅助
- **打字机模式 (Typewriter Mode)**：光标所在行始终平滑垂直居中在视线平视黄金区域。
- **段落专注模式 (Focus Mode)**：高亮正在编辑的当前段落，其他段落自动降低透明度，屏蔽一切视觉干扰。
- **实时统计状态栏**：底部实时呈现当前文档字数、字符数、行数及预估阅读时间。

### 5. ✦ 轻量级 AI 写作助手 (⌘J)
- **多端模型支持**：
  - **本地 Ollama（推荐）**：支持 `llama3.2`、`qwen2.5` 等本地大模型，完全离线运行，**0 外部网络调用，绝无数据隐私泄露风险**。
  - **OpenAI 兼容接口**：支持自定义 BaseURL 与 API Key（如 DeepSeek、OpenAI、Claude 等），自带 BYOK（Bring Your Own Key）模式。
- **划词即呼出**：在正文中选中文本，上方自动浮现 `[ ✦ AI 润色 ⌘J ]` 悬浮气泡，一键润色、校对纠错、中英互译或总结提炼。
- **隐私保护承诺**：所有模型配置与 API Key **仅保存在用户本地设备（浏览器安全存储 LocalStorage）**，绝不上传任何云端服务器，开源代码中不包含任何内置 Key。

### 6. 🖼 原生剪贴板图片持久化
- 复制任意图片或截屏后在编辑器内直接按下 `⌘V` 粘贴，系统自动在当前文档同级创建 `./assets/` 目录保存时间戳图片，并自动转为 Markdown 相对路径引用，文档迁移与分享零顾虑。

### 7. 📤 一键导出与多端分发
- **高质量 PDF 导出**：专业分页打印样式，代码块与表格自动防断页。
- **单文件 HTML 导出**：内置轻量优美排版样式的独立 HTML 文件，直接离线分发。
- **公众号 / 知乎排版复制**：一键将当前渲染内容转换为带内联样式的富文本存入剪贴板，直接粘贴到微信公众平台、知乎等富文本编辑器。

---

## ⌨️ 常用快捷键

| 快捷键 | 功能描述 |
| :--- | :--- |
| `⌘ + N` | 新建空白 Markdown 文档 |
| `⌘ + O` | 打开本地 Markdown 文件 |
| `⌘ + S` | 立即保存当前文档（日常编辑默认自动存盘） |
| `⌘ + J` | 唤起 AI 写作助手（选中文本时自动带入所选内容） |
| `⌘ + \` | 展开 / 折叠左侧边栏 |
| `⌘ + P` | 打印 / 导出高质量 PDF |

---

## 🚀 快速上手与本地开发

### 环境准备
确保本地已安装以下环境：
- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0 (`npm install -g pnpm`)
- **Rust & Cargo**（用于构建 Tauri 桌面端：`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`）

### 1. 克隆项目与安装依赖
```bash
git clone https://github.com/oliverzhu823/XiMD.git
cd XiMD

# 安装前端依赖
pnpm install
```

### 2. 本地开发调试
启动开发服务器，自动编译 Rust 后端并拉起 macOS 原生桌面窗口（支持热重载）：
```bash
pnpm tauri dev
```

> 💡 **提示**：若仅需在纯 Web 浏览器中调试前端 UI，可直接运行 `pnpm dev`。

### 3. 打包生成发布安装包 (.dmg)
```bash
pnpm tauri build
```
打包完成后，可在 `src-tauri/target/release/bundle/dmg/` 目录下找到生成的 macOS `.dmg` 安装镜像。

---

## 🛠 技术架构

XiMD 采用轻量且健壮的现代跨平台技术栈：

- **桌面底座**：[Tauri 2.0](https://tauri.app/) (Rust 语言驱动，利用 macOS 系统自带 WKWebView，无需捆绑庞大 Chromium)
- **前端视图**：[React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite 6](https://vitejs.dev/)
- **编辑器内核**：[Milkdown Crepe](https://milkdown.dev/) (基于 ProseMirror 构建的插件化所见即所得编辑器)
- **视觉样式**：[Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **系统级特效**：`window-vibrancy` (调用 macOS 原生私有 API 启用 Sidebar / Frosted Glass 毛玻璃材质)
- **数学与图表**：[KaTeX](https://katex.org/) (极速数学排版) + [Mermaid.js](https://mermaid.js.org/)

---

## 🔒 隐私与安全性

1. **完全本地化运行**：XiMD 默认不收集任何用户使用数据、遥测日志或统计信息。
2. **零硬编码密钥**：代码库中没有任何硬编码的 API Key、测试凭据或私有文档。
3. **AI 密钥安全**：如使用 OpenAI 兼容服务，用户配置的 API Key 仅保存在本机端，请求直接发送至用户填写的服务接口地址。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 许可证开源，欢迎自由使用、学习与二次开发。
