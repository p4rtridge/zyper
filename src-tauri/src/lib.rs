use arc_swap::ArcSwap;
use std::{sync::Arc, time::Duration};
use tauri::Manager;
use tauri_plugin_store::StoreExt;

mod commands;
mod key_event;
mod settings;
mod state;
mod utils;

async fn mimalloc_memory_loop() {
    loop {
        unsafe {
            libmimalloc_sys::mi_collect(true);
        }
        tokio::time::sleep(Duration::from_secs(30)).await;
    }
}

/// Start application
///
/// # Panics
/// Destroy application if it ran into an issue
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            tauri::async_runtime::spawn(mimalloc_memory_loop());

            let store = app.store_builder("config").disable_auto_save().build()?;

            let settings = match store.get("settings") {
                Some(value) => serde_json::from_value::<settings::Settings>(value)?,
                None => settings::Settings::default(),
            };

            let cache = moka::future::Cache::builder()
                .max_capacity(settings.cache_cap)
                .time_to_live(Duration::from_secs(60 * settings.cache_ttl))
                .build();

            let settings_cache = Arc::new(ArcSwap::from(Arc::new(settings)));

            let state = state::AppState {
                cache,
                read_lock: tokio::sync::Mutex::new(()),
                settings: settings_cache,
            };

            app.manage(state);

            let app = app.app_handle().clone();

            key_event::handle_shortcut(app);

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
