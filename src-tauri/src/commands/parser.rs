use crate::{AppState, utils};
use bytes::{BufMut, BytesMut};
use serde::Serialize;
use std::{io::ErrorKind, path::Path};
use tauri::{State, ipc};
use tokio::fs;

#[derive(Debug, Serialize)]
pub struct FileResult {
    pub hash: String,
    pub file_name: Option<String>,
}

#[tauri::command]
pub async fn process_file(
    app_state: State<'_, AppState>,
    path: String,
) -> Result<ipc::Response, &'static str> {
    let hashed = utils::hash(&path);
    let path = Path::new(&path);

    let file_name = path
        .file_name()
        .and_then(|str| str.to_str().map(String::from));

    let content = match fs::read(path).await {
        Ok(content) => content,
        Err(err) => match err.kind() {
            ErrorKind::NotFound => return Err("fileNotFoundError"),
            ErrorKind::PermissionDenied => return Err("permissionDeniedError"),
            _ => {
                eprintln!("[Error] Read file error: {err:?}");

                return Err("internalError");
            }
        },
    };

    app_state.cache.insert(hashed.clone(), content).await;

    let file_result = FileResult {
        hash: hashed,
        file_name,
    };

    let mut buf = BytesMut::with_capacity(128).writer();
    match sonic_rs::to_writer(&mut buf, &file_result) {
        Ok(()) => {
            let bytes: Vec<u8> = buf.into_inner().freeze().into();

            Ok(ipc::Response::new(bytes))
        }
        Err(err) => {
            eprintln!("[Error] Serialize error: {err:?}");

            Err("internalError")
        }
    }
}

#[tauri::command]
pub async fn remove_file(
    state: State<'_, AppState>,
    hash: String,
) -> Result<&'static str, &'static str> {
    state.cache.invalidate(&hash).await;

    Ok("ok")
}
