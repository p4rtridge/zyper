use std::{thread, time::Duration};
use tauri::{AppHandle, Runtime};
use tauri_plugin_clipboard_manager::ClipboardExt;

use super::parser;

const CTRL_KEY: rdev::Key = rdev::Key::ControlLeft;
const V_KEY: rdev::Key = rdev::Key::KeyV;

fn send_key(event: &rdev::EventType) {
    match rdev::simulate(event) {
        Ok(()) => (),
        Err(err) => {
            panic!("[BUG] Error occured while sending key event: {err:?}")
        }
    }

    #[cfg(target_os = "linux")]
    thread::sleep(Duration::from_millis(12));

    #[cfg(all(
        not(target_os = "linux"),
        any(target_os = "windows", target_os = "macos")
    ))]
    thread::sleep(Duration::from_millis(1));
}

#[tauri::command]
pub fn send_key_events<R>(app: AppHandle<R>, line: parser::Content)
where
    R: Runtime,
{
    if line.is_comment {
        return;
    }

    app.clipboard().write_text(line.text).unwrap();

    send_key(&rdev::EventType::KeyPress(CTRL_KEY));
    send_key(&rdev::EventType::KeyPress(V_KEY));
    send_key(&rdev::EventType::KeyRelease(CTRL_KEY));
    send_key(&rdev::EventType::KeyRelease(V_KEY));
}
