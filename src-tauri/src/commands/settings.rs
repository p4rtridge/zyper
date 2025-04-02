use crate::{settings, state::AppState};
use tauri::{AppHandle, Manager, Runtime, State};
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn create_new_window<R>(app: AppHandle<R>) -> Result<&'static str, &'static str>
where
    R: Runtime,
{
    let _window = match tauri::WebviewWindow::builder(
        &app,
        "zyper_settings_window",
        tauri::WebviewUrl::App("settings.html".into()),
    )
    .title("zyper settings")
    .drag_and_drop(false)
    .min_inner_size(480f64, 320f64)
    .center()
    .build()
    {
        Ok(window) => window,
        Err(err) => match err {
            tauri::Error::WebviewLabelAlreadyExists(..) => return Err("existedWindowError"),
            err => {
                eprintln!("[Error] Create window error: {err:?}");

                return Err("internalError");
            }
        },
    };

    Ok("ok")
}

#[tauri::command]
pub fn get_settings(state: State<'_, AppState>) -> settings::Settings {
    let settings = state.settings.lock().unwrap();

    (*settings).clone()
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
    let mut settings = state.settings.lock().unwrap();

    if (*settings) == payload {
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
        Err(err) => return Err(err.to_string()),
    };

    *settings = payload;

    let settings = match serde_json::to_value((*settings).clone()) {
        Ok(settings) => settings,
        Err(err) => return Err(err.to_string()),
    };

    store.set("settings", settings);
    let _ = store.save();

    Ok("ok")
}
