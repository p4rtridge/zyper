use tauri::{AppHandle, Runtime};

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
    .min_inner_size(800f64, 600f64)
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
