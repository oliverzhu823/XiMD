export interface AiConfig {
  provider: "ollama" | "openai" | "custom";
  apiKey: string;
  baseUrl: string;
  model: string;
}

export const defaultAiConfig: AiConfig = {
  provider: "ollama",
  apiKey: "",
  baseUrl: "http://localhost:11434",
  model: "llama3.2",
};

export const getSavedAiConfig = (): AiConfig => {
  const saved = localStorage.getItem("ximd_ai_config");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return defaultAiConfig;
};

export const saveAiConfig = (config: AiConfig) => {
  localStorage.setItem("ximd_ai_config", JSON.stringify(config));
};

export async function* streamAiPrompt(
  prompt: string,
  selectedText: string,
  config: AiConfig
): AsyncGenerator<string, void, unknown> {
  const fullPrompt = `${prompt}\n\n【原始文本】：\n${selectedText}\n\n请直接输出处理后的结果，不要有多余的客套话或代码块包裹，保持排版优美：`;

  if (config.provider === "ollama") {
    const url = `${config.baseUrl.replace(/\/$/, "")}/api/generate`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model || "llama3.2",
        prompt: fullPrompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama 请求失败: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            yield parsed.response;
          }
        } catch {
          // ignore chunk split issues
        }
      }
    }
  } else {
    // OpenAI Compatible API
    const url = `${(config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || "gpt-4o-mini",
        messages: [{ role: "user", content: fullPrompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI 请求失败 (${response.status}): ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (!reader) return;

    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const jsonStr = trimmed.replace("data: ", "").trim();
        if (jsonStr === "[DONE]") return;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            yield delta;
          }
        } catch {
          // ignore parse error
        }
      }
    }
  }
}
