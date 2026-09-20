use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileEntry>>,
}

#[tauri::command]
fn read_dir_tree(dir_path: String) -> Result<Vec<FileEntry>, String> {
    fn scan_dir(path: &Path) -> std::io::Result<Vec<FileEntry>> {
        let mut entries = Vec::new();
        if path.is_dir() {
            for entry in fs::read_dir(path)? {
                let entry = entry?;
                let file_name = entry.file_name().to_string_lossy().to_string();
                
                // Skip hidden files/directories like .git, .DS_Store, .trash
                if file_name.starts_with('.') {
                    continue;
                }

                let p = entry.path();
                let is_dir = p.is_dir();
                let children = if is_dir {
                    // Only scan 1 level deeper or lazy load
                    scan_dir(&p).ok()
                } else {
                    None
                };

                entries.push(FileEntry {
                    name: file_name,
                    path: p.to_string_lossy().to_string(),
                    is_dir,
                    children,
                });
            }
        }
        // Sort directories first, then alphabetically
        entries.sort_by(|a, b| {
            if a.is_dir == b.is_dir {
                a.name.to_lowercase().cmp(&b.name.to_lowercase())
            } else if a.is_dir {
                std::cmp::Ordering::Less
            } else {
                std::cmp::Ordering::Greater
            }
        });
        Ok(entries)
    }

    let root = Path::new(&dir_path);
    scan_dir(root).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_image_to_assets(
    document_dir: String,
    image_bytes: Vec<u8>,
    extension: Option<String>,
) -> Result<String, String> {
    let ext = extension.unwrap_or_else(|| "png".to_string());
    let doc_path = Path::new(&document_dir);
    let assets_dir = doc_path.join("assets");

    if !assets_dir.exists() {
        fs::create_dir_all(&assets_dir).map_err(|e| format!("Failed to create assets dir: {}", e))?;
    }

    let timestamp = chrono::Local::now().format("%Y%m%d%H%M%S").to_string();
    let file_name = format!("image_{}.{}", timestamp, ext);
    let file_path = assets_dir.join(&file_name);

    fs::write(&file_path, image_bytes).map_err(|e| format!("Failed to save image: {}", e))?;

    // Return the relative markdown path
    Ok(format!("./assets/{}", file_name))
}

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("无法读取文件 ({}): {}", path, e))
}

#[tauri::command]
fn write_file_content(path: String, content: String) -> Result<(), String> {
    let p = Path::new(&path);
    if let Some(parent) = p.parent() {
        if !parent.exists() {
            let _ = fs::create_dir_all(parent);
        }
    }
    fs::write(&path, content).map_err(|e| format!("无法保存文件 ({}): {}", path, e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            read_dir_tree,
            save_image_to_assets,
            read_file_content,
            write_file_content
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                let _ = apply_vibrancy(&window, NSVisualEffectMaterial::Sidebar, None, None);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
