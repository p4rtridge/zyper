use moka::future::Cache;
use std::{sync::Mutex, time::Duration};
use tauri::Manager;
use tauri_plugin_store::StoreExt;

mod commands;
mod settings;
mod state;
mod utils;

/// Start application
///
/// # Panics
/// Destroy application if it ran into an issue
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let store = app.store_builder("config").disable_auto_save().build()?;

            let settings = match store.get("settings") {
                None => settings::Settings::default(),
                Some(value) => serde_json::from_value::<settings::Settings>(value)?,
            };

            let cache = Cache::builder()
                .max_capacity(settings.cache_cap)
                .time_to_live(Duration::from_secs(60 * settings.cache_ttl))
                .build();

            let state = state::AppState {
                read_lock: tokio::sync::Mutex::new(()),
                cache,
                settings: Mutex::new(settings),
            };

            app.manage(state);

            Ok(())
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(commands::prepare_handlers())
        .run(tauri::generate_context!())
        .expect("[Bug] Error while running Zyper");
}
