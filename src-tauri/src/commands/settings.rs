use crate::{settings, state::AppState};
use std::sync::Arc;
use tauri::{AppHandle, Manager, Runtime, State};
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn create_new_window<R>(app: AppHandle<R>) -> Result<&'static str, String>
where
    R: Runtime,
{
    let _window = match tauri::WebviewWindow::builder(
        &app,
        "zyper_settings_window",
        tauri::WebviewUrl::App("settings.html".into()),
    )
    .title("Zyper Settings")
    .drag_and_drop(false)
    .min_inner_size(480f64, 320f64)
    .center()
    .build()
    {
        Ok(window) => window,
        Err(err) => match err {
            tauri::Error::WebviewLabelAlreadyExists(..) => {
                return Err(String::from("existedWindowError"));
            }
            err => {
                eprintln!("[Error] Create window error: {err:?}");
                return Err(format!("[BUG] Internal Error: {err}"));
            }
        },
    };

    Ok("ok")
}

#[tauri::command]
pub fn get_settings(state: State<'_, AppState>) -> settings::Settings {
    let settings = state.settings.load();

    (**settings).clone()
}

#[tauri::command]
pub fn set_settings<R>(
    app: AppHandle<R>,
    payload: settings::Settings,
) -> Result<&'static str, String>
where
    R: Runtime,
{
    let state = app.state::<AppState>();
    let settings = state.settings.load();

    if (**settings) == payload {
        return Ok("ok");
    }

    if payload.cache_cap < 1 || payload.cache_cap > 128 {
        return Err(String::from("invalidSettingsError"));
    }

    if payload.cache_ttl < 1 || payload.cache_cap > 30 {
        return Err(String::from("invalidSettingsError"));
    }

    let store = match app.store("config") {
        Ok(store) => store,
        Err(err) => return Err(format!("[BUG] Internal Error: {err}")),
    };

    let settings = match serde_json::to_value(&payload) {
        Ok(value) => value,
        Err(err) => {
            eprintln!("[Error] Serialize error: {err:?}");
            return Err(format!("[BUG] Internal Error: {err}"));
        }
    };

    state.settings.store(Arc::new(payload));
    store.set("settings", settings);
    let _ = store.save();

    Ok("ok")
}
