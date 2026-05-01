use serde::Serialize;
use rusqlite::Connection;
use tauri::AppHandle;

use crate::get_db;

#[derive(Serialize)]
pub struct Album {
    pub name: String,
    pub artist: String,
    pub year: Option<i32>,
}

#[derive(Serialize)]
pub struct Artist {
    pub name: String,
}

#[tauri::command]
pub fn get_albums(app: AppHandle) -> Result<Vec<Album>, String> {
    let conn = get_db(&app);

    let mut stmt = conn
        .prepare(
            "
            SELECT album, artist
            FROM songs
            GROUP BY album, artist
            ORDER BY album ASC
            ",
        )
        .map_err(|e| e.to_string())?;

    let albums = stmt
        .query_map([], |row| {
            Ok(Album {
                name: row.get(0)?,
                artist: row.get(1)?,
                year: None,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();

    Ok(albums)
}

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