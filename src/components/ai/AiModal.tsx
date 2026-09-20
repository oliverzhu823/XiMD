import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Settings,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Bot,
} from "lucide-react";
import {
  AiConfig,
  getSavedAiConfig,
  saveAiConfig,
  streamAiPrompt,
} from "@/services/aiService";

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onApplyResult: (newText: string, mode: "replace" | "insert") => void;
}

export const AiModal: React.FC<AiModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  onApplyResult,
}) => {
  const [config, setConfig] = useState<AiConfig>(getSavedAiConfig());
  const [showSettings, setShowSettings] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOutput("");
      setErrorMsg(null);
      setCustomPrompt("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunAi = async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput("");
    setErrorMsg(null);

    try {
      const generator = streamAiPrompt(prompt, selectedText, config);
      for await (const chunk of generator) {
        setOutput((prev) => prev + chunk);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "请求失败，请检查设置或服务是否启动");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetActions = [
    { label: "✍️ 润色优化", prompt: "请对以下内容进行文学和逻辑上的润色，使行文更流畅优美，保持原有意思" },
    { label: "🔍 错别字纠错", prompt: "请纠正以下文本中的错别字、标点符号误用和语病，直接输出修正后的完整文本" },
    { label: "🌐 翻译为英文", prompt: "请将以下文本翻译为优雅地道的英文" },
    { label: "⚡ 精简提炼", prompt: "请对以下内容进行结构化提炼和精简，保留最核心要点" },
    { label: "📖 扩写丰富", prompt: "请基于以下要点进行合理的细节补充与论述扩写，使其更详实" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-mac-surface border border-mac-border rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs text-mac-text">
        {/* Header */}
        <div className="h-10 px-4 flex items-center justify-between border-b border-mac-border bg-mac-bg">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles size={15} className="text-amber-500" />
            <span>AI 写作助手</span>
            <span className="text-[10px] text-mac-muted px-1.5 py-0.5 rounded bg-mac-hover">
              {config.provider === "ollama" ? "本地 Ollama" : "OpenAI API"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded hover:bg-mac-hover text-mac-muted hover:text-mac-text ${
                showSettings ? "text-mac-accent bg-mac-hover" : ""
              }`}
              title="配置 AI 服务"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-mac-hover text-mac-muted hover:text-mac-text"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-3 bg-mac-hover/40 border-b border-mac-border space-y-2">
            <div className="font-semibold text-mac-text flex items-center gap-1">
              <Bot size={13} />
              <span>模型与接口配置</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-mac-muted block mb-1">服务类型</label>
                <select
                  value={config.provider}
                  onChange={(e) => {
                    const c = { ...config, provider: e.target.value as any };
                    setConfig(c);
                    saveAiConfig(c);
                  }}
                  className="w-full bg-mac-bg border border-mac-border rounded px-2 py-1"
                >
                  <option value="ollama">本地 Ollama (零外网依赖)</option>
                  <option value="openai">OpenAI / 兼容接口 (BYOK)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-mac-muted block mb-1">模型名称</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => {
                    const c = { ...config, model: e.target.value };
                    setConfig(c);
                    saveAiConfig(c);
                  }}
                  placeholder={config.provider === "ollama" ? "llama3.2 / qwen2.5" : "gpt-4o-mini"}
                  className="w-full bg-mac-bg border border-mac-border rounded px-2 py-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-mac-muted block mb-1">Base URL</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => {
                    const c = { ...config, baseUrl: e.target.value };
                    setConfig(c);
                    saveAiConfig(c);
                  }}
                  placeholder={config.provider === "ollama" ? "http://localhost:11434" : "https://api.openai.com/v1"}
                  className="w-full bg-mac-bg border border-mac-border rounded px-2 py-1"
                />
              </div>
              {config.provider !== "ollama" && (
                <div>
                  <label className="text-[10px] text-mac-muted block mb-1">API Key</label>
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => {
                      const c = { ...config, apiKey: e.target.value };
                      setConfig(c);
                      saveAiConfig(c);
                    }}
                    placeholder="sk-..."
                    className="w-full bg-mac-bg border border-mac-border rounded px-2 py-1"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Selected context preview */}
          {selectedText ? (
            <div className="p-2.5 rounded-lg bg-mac-bg border border-mac-border">
              <span className="text-[10px] text-mac-muted block mb-1">选中参考文本：</span>
              <p className="line-clamp-3 text-mac-text font-mono text-[11px] select-text">
                {selectedText}
              </p>
            </div>
          ) : (
            <div className="text-mac-muted text-center py-1">
              当前未选中文本（将针对输入指令或全文进行处理）
            </div>
          )}

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5">
            {presetActions.map((action, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => handleRunAi(action.prompt)}
                className="px-2.5 py-1 rounded-full bg-mac-hover hover:bg-mac-accent hover:text-white transition-colors text-mac-text"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Custom Prompt Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleRunAi(customPrompt);
                }
              }}
              placeholder="输入自定义指令，例如：提炼 3 个核心论点..."
              className="flex-1 bg-mac-bg border border-mac-border rounded-lg px-3 py-1.5 text-xs text-mac-text focus:outline-none focus:border-mac-accent"
            />
            <button
              disabled={loading || !customPrompt.trim()}
              onClick={() => handleRunAi(customPrompt)}
              className="px-3 py-1.5 bg-mac-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1 font-medium"
            >
              <span>发送</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Stream Output */}
          {(output || loading) && (
            <div className="p-3 rounded-lg bg-mac-bg border border-mac-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-mac-accent flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>处理结果</span>
                  {loading && <span className="animate-pulse">生成中...</span>}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-mac-hover text-mac-muted"
                    title="复制到剪贴板"
                  >
                    {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="font-mono text-xs whitespace-pre-wrap select-text leading-relaxed">
                {output}
              </div>

              {output && !loading && (
                <div className="flex justify-end gap-2 pt-2 border-t border-mac-border">
                  <button
                    onClick={() => {
                      onApplyResult(output, "insert");
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-mac-hover hover:bg-mac-border text-mac-text font-medium"
                  >
                    插入到下方
                  </button>
                  {selectedText && (
                    <button
                      onClick={() => {
                        onApplyResult(output, "replace");
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-mac-accent text-white hover:opacity-90 font-medium"
                    >
                      替换选中内容
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
