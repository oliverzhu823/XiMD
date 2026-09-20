import { invoke } from "@tauri-apps/api/core";
import { open as openDialog, save as saveDialog } from "@tauri-apps/plugin-dialog";
import { writeText as clipboardWriteText } from "@tauri-apps/plugin-clipboard-manager";

export interface FileItem {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileItem[];
}

export const isTauri = () => {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

export const TauriBridge = {
  // Open file picker dialog
  async pickMarkdownFile(): Promise<string | null> {
    if (!isTauri()) {
      return null;
    }
    const selected = await openDialog({
      multiple: false,
      filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
    });
    if (!selected) return null;
    if (Array.isArray(selected)) {
      return selected[0] || null;
    }
    return typeof selected === "string" ? selected : null;
  },

  // Open directory picker dialog
  async pickDirectory(): Promise<string | null> {
    if (!isTauri()) {
      return null;
    }
    const selected = await openDialog({
      directory: true,
      multiple: false,
    });
    if (!selected) return null;
    if (Array.isArray(selected)) {
      return selected[0] || null;
    }
    return typeof selected === "string" ? selected : null;
  },

  // Save as dialog
  async pickSavePath(defaultName: string = "Untitled.md"): Promise<string | null> {
    if (!isTauri()) {
      return null;
    }
    const selected = await saveDialog({
      defaultPath: defaultName,
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
    if (!selected) return null;
    return typeof selected === "string" ? selected : null;
  },

  // Read file contents (bypasses Tauri plugin-fs scope limits via native Rust command)
  async readFile(filePath: string): Promise<string> {
    if (!isTauri()) {
      return localStorage.getItem(`ximd_doc_${filePath}`) || "";
    }
    return await invoke<string>("read_file_content", { path: filePath });
  },

  // Write file contents (bypasses Tauri plugin-fs scope limits via native Rust command)
  async writeFile(filePath: string, content: string): Promise<void> {
    if (!isTauri()) {
      localStorage.setItem(`ximd_doc_${filePath}`, content);
      return;
    }
    await invoke("write_file_content", { path: filePath, content });
  },

  // Read directory tree via Rust backend
  async readDirTree(dirPath: string): Promise<FileItem[]> {
    if (!isTauri()) {
      return [];
    }
    try {
      return await invoke<FileItem[]>("read_dir_tree", { dirPath });
    } catch (e) {
      console.error("Failed to read dir tree:", e);
      return [];
    }
  },

  // Save image buffer to doc's ./assets folder
  async saveImageToAssets(documentDir: string, imageBytes: Uint8Array, extension = "png"): Promise<string> {
    if (!isTauri()) {
      return "";
    }
    return await invoke<string>("save_image_to_assets", {
      documentDir,
      imageBytes: Array.from(imageBytes),
      extension,
    });
  },

  // Copy rich text or HTML to clipboard
  async copyText(text: string): Promise<void> {
    if (isTauri()) {
      await clipboardWriteText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }
  },
};
