use crate::{state::AppState, utils};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::{State, ipc};

#[derive(Debug, Serialize)]
pub struct FileResult {
    pub hash: String,
    pub file_name: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Content {
    pub is_comment: bool,
    pub color: Option<String>,
    pub text: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct ParsedFile {
    pub page: Option<String>,
    pub content: Content,
    pub index: u32,
}

#[tauri::command]
pub async fn process_file(
    state: State<'_, AppState>,
    path: String,
) -> Result<ipc::Response, String> {
    let hashed = utils::hash(&path);
    let path = Path::new(&path);

    let file_name = path
        .file_name()
        .and_then(|str| str.to_str().map(String::from));

    let file_result = FileResult {
        hash: hashed.clone(),
        file_name,
    };

    let out = match utils::serialize_simd(&file_result) {
        Ok(out) => out,
        Err(err) => return Err(err),
    };

    if state.cache.contains_key(&hashed) {
        return Ok(ipc::Response::new(out));
    }

    let _lock = state.read_lock.lock().await;

    if state.cache.contains_key(&hashed) {
        return Ok(ipc::Response::new(out));
    }

    let settings = state.settings.load();
    let content = utils::read_and_parse_file(path, &settings).await?;

    state.cache.insert(hashed, content).await;

    Ok(ipc::Response::new(out))
}

#[tauri::command]
pub async fn remove_file(
    state: State<'_, AppState>,
    hash: String,
) -> Result<&'static str, &'static str> {
    state.cache.invalidate(&hash).await;

    Ok("ok")
}

#[tauri::command]
pub async fn flush_cache(state: State<'_, AppState>) -> Result<&'static str, &'static str> {
    state.cache.invalidate_all();

    Ok("ok")
}

#[tauri::command]
pub async fn get_file(
    state: State<'_, AppState>,
    hash: String,
    path: String,
) -> Result<ipc::Response, String> {
    if let Some(content) = state.cache.get(&hash).await {
        let out = match utils::serialize_simd(&content) {
            Ok(out) => out,
            Err(err) => return Err(err),
        };

        return Ok(ipc::Response::new(out));
    }

    let _lock = state.read_lock.lock().await;

    let content = if let Some(content) = state.cache.get(&hash).await {
        content
    } else {
        let settings = state.settings.load();
        let content = utils::read_and_parse_file(&path, &settings).await?;

        state.cache.insert(hash, content.clone()).await;

        content
    };

    let out = utils::serialize_simd(&content)?;

    Ok(ipc::Response::new(out))
}
