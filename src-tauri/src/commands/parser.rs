use crate::{state::AppState, utils};
use bytes::{BufMut, BytesMut};
use serde::Serialize;
use std::path::Path;
use tauri::{State, ipc};

#[derive(Debug, Serialize)]
pub struct FileResult {
    pub hash: String,
    pub file_name: Option<String>,
}

#[tauri::command]
pub async fn process_file(
    state: State<'_, AppState>,
    path: String,
) -> Result<ipc::Response, &'static str> {
    let hashed = utils::hash(&path);
    let path = Path::new(&path);

    let file_name = path
        .file_name()
        .and_then(|str| str.to_str().map(String::from));

    let file_result = FileResult {
        hash: hashed.clone(),
        file_name,
    };

    let mut buf = BytesMut::with_capacity(128).writer();
    if let Err(err) = sonic_rs::to_writer(&mut buf, &file_result) {
        eprintln!("[Error] Serialize error: {err:?}");
        return Err("internalError");
    }

    let out: Vec<u8> = buf.into_inner().freeze().into();

    if state.cache.contains_key(&hashed) {
        return Ok(ipc::Response::new(out));
    }

    let _lock = state.read_lock.lock().await;

    if state.cache.contains_key(&hashed) {
        return Ok(ipc::Response::new(out));
    }

    let content = match utils::read_file_utf8(path).await {
        Ok(content) => content,
        Err(err) => return Err(err),
    };

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
pub async fn get_file(
    state: State<'_, AppState>,
    hash: String,
    path: String,
) -> Result<ipc::Response, &'static str> {
    if let Some(content) = state.cache.get(&hash).await {
        return Ok(ipc::Response::new(content));
    }

    let _lock = state.read_lock.lock().await;

    let content = if let Some(content) = state.cache.get(&hash).await {
        content
    } else {
        let content = match utils::read_file_utf8(&path).await {
            Ok(content) => content,
            Err(err) => return Err(err),
        };

        state.cache.insert(hash, content.clone()).await;

        content
    };

    Ok(ipc::Response::new(content))
}
