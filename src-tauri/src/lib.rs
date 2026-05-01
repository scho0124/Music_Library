use serde::Serialize;
use walkdir::WalkDir;

use lofty::read_from_path;
use lofty::file::{TaggedFileExt, AudioFile};
use lofty::tag::Accessor;

use rusqlite::{Connection, params};

use tauri::{Manager, AppHandle};


mod commands;

// -----------------------------
// Song struct
// -----------------------------
#[derive(Serialize)]
struct Song {
    id: i64,
    path: String,
    title: String,
    artist: String,
    album: String,
    duration: u64,
    genre: Option<String>,
    rating: Option<i64>,
    listen_count: i64,
}

// -----------------------------
// DB INIT
// -----------------------------
pub fn get_db(app: &AppHandle) -> Connection {
    let mut path = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| std::env::current_dir().unwrap());

    std::fs::create_dir_all(&path).ok();

    path.push("library.db");

    let conn = Connection::open(path).unwrap();

    conn.execute(
        "CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY,
            path TEXT UNIQUE,
            title TEXT,
            artist TEXT,
            album TEXT,
            duration INTEGER,
            genre TEXT,
            rating INTEGER,
            listen_count INTEGER DEFAULT 0
        )",
        [],
    ).unwrap();

    conn.execute(
        "ALTER TABLE songs ADD COLUMN listen_count INTEGER DEFAULT 0",
        [],
    ).ok();

    conn.execute(
        "ALTER TABLE songs ADD COLUMN rating INTEGER",
        [],
    ).ok();

    conn
}

// -----------------------------
// SCAN DIRECTORY
// -----------------------------
#[tauri::command]
fn scan_directory(app: AppHandle, path: String) -> Vec<Song> {
    let conn = get_db(&app);

    for entry in WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();

        if let Some(ext) = path.extension() {
            let ext = ext.to_string_lossy().to_lowercase();

            if ["mp3", "flac", "wav", "m4a"].contains(&ext.as_str()) {
                let mut title = "Unknown".to_string();
                let mut artist = "Unknown".to_string();
                let mut album = "Unknown".to_string();
                let mut duration = 0;
                let mut genre = None;

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
                        if let Some(g) = tag.genre() {
                            genre = Some(g.to_string());
                        }
                    }

                    duration = tagged_file.properties().duration().as_secs();
                }

                let path_str = path.to_string_lossy().to_string();

                conn.execute(
                    "INSERT OR IGNORE INTO songs
                    (path, title, artist, album, duration, genre)
                    VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    params![path_str, title, artist, album, duration, genre],
                ).ok();
            }
        }
    }

    load_songs(app)
}

// -----------------------------
// LOAD SONGS
// -----------------------------
#[tauri::command]
fn load_songs(app: AppHandle) -> Vec<Song> {
    let conn = get_db(&app);

    let mut stmt = conn.prepare(
        "SELECT id, path, title, artist, album, duration, genre, rating, listen_count FROM songs"
    ).unwrap();

    let rows = stmt
        .query_map([], |row| {
            Ok(Song {
                id: row.get(0)?,
                path: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                duration: row.get(5)?,
                genre: row.get(6)?,
                rating: row.get(7)?,
                listen_count: row.get(8)?,
            })
        })
        .unwrap();

    rows.filter_map(Result::ok).collect()
}

// -----------------------------
// LISTEN COUNT
// -----------------------------
#[tauri::command]
fn increment_listen_count(app: AppHandle, id: i64) {
    let conn = get_db(&app);

    conn.execute(
        "UPDATE songs SET listen_count = listen_count + 1 WHERE id = ?1",
        params![id],
    ).ok();
}

// -----------------------------
// RATING
// -----------------------------
#[tauri::command]
fn set_rating(app: AppHandle, id: i64, rating: i64) {
    let conn = get_db(&app);

    conn.execute(
        "UPDATE songs SET rating = ?1 WHERE id = ?2",
        params![rating, id],
    ).ok();
}

// -----------------------------
// DELETE
// -----------------------------
#[tauri::command]
fn delete_songs(app: tauri::AppHandle, ids: Vec<i64>) {
    let mut conn = get_db(&app);

    let tx = conn.transaction().unwrap();

    for id in &ids {
        tx.execute(
            "DELETE FROM songs WHERE id = ?1",
            rusqlite::params![id],
        )
        .expect("failed to delete song");
    }

    tx.commit().expect("failed to commit delete");
}

// -----------------------------
// RUN APP
// -----------------------------
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            scan_directory,
            load_songs,
            delete_songs,
            commands::get_albums,
            commands::get_artists,
            increment_listen_count,
            set_rating,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}