use serde::Serialize;
use tauri::{AppHandle, Manager};


use crate::get_db;

use std::fs;
use std::path::{Path, PathBuf};

use lofty::{read_from_path};
use lofty::file::TaggedFileExt;
use md5;

// -----------------------------
// TYPES
// -----------------------------
#[derive(Serialize)]
pub struct Album {
    pub name: String,
    pub artist: String,
    pub year: Option<i32>,
    pub artwork: Option<String>,
}

#[derive(Serialize)]
pub struct Artist {
    pub name: String,
}

// -----------------------------
// EMBEDDED ART EXTRACTION
// -----------------------------
fn extract_embedded_art(app: &AppHandle, path: &str) -> Option<String> {
    let tagged_file = read_from_path(path).ok()?;
    let tag = tagged_file
        .primary_tag()
        .or_else(|| tagged_file.first_tag())?;

    let picture = tag.pictures().first()?;

    let cache_dir = app.path().app_cache_dir().ok()?;

    if !cache_dir.exists() {
        fs::create_dir_all(&cache_dir).ok()?;
    }

    let hash = format!("{:x}", md5::compute(path));
    let file_path: PathBuf = cache_dir.join(format!("{}.jpg", hash));

    if file_path.exists() {
        return Some(file_path.to_string_lossy().to_string());
    }

    fs::write(&file_path, picture.data()).ok()?;

    Some(file_path.to_string_lossy().to_string())
}

// -----------------------------
// FALLBACK: FOLDER ART
// -----------------------------
fn find_album_art(song_path: &str) -> Option<String> {
    let path = Path::new(song_path);
    let dir = path.parent()?;

    let candidates = [
        "cover.jpg",
        "cover.png",
        "folder.jpg",
        "folder.png",
        "album.jpg",
        "album.png",
    ];

    for file in candidates {
        let p = dir.join(file);
        if p.exists() {
            return Some(p.to_string_lossy().to_string());
        }
    }

    // fallback: first image
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if let Some(ext) = p.extension() {
                let ext = ext.to_string_lossy().to_lowercase();
                if ext == "jpg" || ext == "jpeg" || ext == "png" {
                    return Some(p.to_string_lossy().to_string());
                }
            }
        }
    }

    None
}

// -----------------------------
// GET ALBUMS
// -----------------------------
#[tauri::command]
pub fn get_albums(app: AppHandle) -> Result<Vec<Album>, String> {
    let conn = get_db(&app);

    let mut stmt = conn
        .prepare(
            "
            SELECT album, artist, MIN(path)
            FROM songs
            GROUP BY album, artist
            ORDER BY album ASC
            ",
        )
        .map_err(|e| e.to_string())?;

    let albums = stmt
        .query_map([], |row| {
            let name: String = row.get(0)?;
            let artist: String = row.get(1)?;
            let path: String = row.get(2)?;

            let year = name
                .split_whitespace()
                .find_map(|w| {
                    if w.len() == 4 && w.chars().all(|c| c.is_numeric()) {
                        w.parse::<i32>().ok()
                    } else {
                        None
                    }
                });

            let artwork =
    extract_embedded_art(&app, &path)
        .or_else(|| find_album_art(&path));

            Ok(Album {
                name,
                artist,
                year,
                artwork,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();

    Ok(albums)
}

// -----------------------------
// GET ARTISTS
// -----------------------------
#[tauri::command]
pub fn get_artists(app: AppHandle) -> Result<Vec<Artist>, String> {
    let conn = get_db(&app);

    let mut stmt = conn
        .prepare(
            "
            SELECT DISTINCT artist
            FROM songs
            ORDER BY artist ASC
            ",
        )
        .map_err(|e| e.to_string())?;

    let artists = stmt
        .query_map([], |row| {
            Ok(Artist {
                name: row.get(0)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();

    Ok(artists)
}