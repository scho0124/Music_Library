use serde::Serialize;
use walkdir::WalkDir;

use lofty::read_from_path;
use lofty::file::{TaggedFileExt, AudioFile};
use lofty::tag::Accessor;

// -----------------------------
// Song struct sent to frontend
// -----------------------------
#[derive(Serialize)]
struct Song {
    path: String,
    title: String,
    artist: String,
    album: String,
    duration: u64,
}

// -----------------------------
// Scan directory command
// -----------------------------
#[tauri::command]
fn scan_directory(path: String) -> Vec<Song> {
    let mut songs = Vec::new();

    for entry in WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();

        if let Some(ext) = path.extension() {
            let ext = ext.to_string_lossy().to_lowercase();

            // Supported formats
            if ["mp3", "flac", "wav", "m4a"].contains(&ext.as_str()) {
                let mut title = "Unknown".to_string();
                let mut artist = "Unknown".to_string();
                let mut album = "Unknown".to_string();
                let mut duration = 0;

                // Extract metadata
                if let Ok(tagged_file) = read_from_path(path) {
                    if let Some(tag) = tagged_file.primary_tag() {
                        if let Some(t) = tag.title() {
                            title = t.to_string();
                        }
                        if let Some(a) = tag.artist() {
                            artist = a.to_string();
                        }
                        if let Some(al) = tag.album() {
                            album = al.to_string();
                        }
                    }

                    duration = tagged_file.properties().duration().as_secs();
                }

                songs.push(Song {
                    path: path.to_string_lossy().to_string(),
                    title,
                    artist,
                    album,
                    duration,
                });
            }
        }
    }

    songs
}

// -----------------------------
// App entry point
// -----------------------------
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            scan_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// -----------------------------
// Existing example command
// -----------------------------
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}