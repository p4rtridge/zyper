use moka::future::Cache;
use std::time::Duration;

mod commands;
mod utils;

pub struct AppState {
    pub cache: Cache<String, Vec<u8>>,
}

/// Start application
///
/// # Panics
/// Destroy application if it ran into an issue
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let cache = Cache::builder()
        .max_capacity(16)
        .time_to_live(Duration::from_secs(60 * 10))
        .build();

    tauri::Builder::default()
        .manage(AppState { cache })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(commands::prepare_handlers())
        .run(tauri::generate_context!())
        .expect("[Bug] Error while running Zyper");
}
