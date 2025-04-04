use crate::state::AppState;
use serde::Serialize;
use std::{collections::VecDeque, sync::Mutex};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Clone, Debug, Serialize)]
enum TriggerEvent {
    NextLine,
    PrevLine,
}

#[inline]
fn push_and_take_recent_keys(
    pressed_keys: &mut VecDeque<rdev::Key>,
    key: rdev::Key,
) -> Vec<rdev::Key> {
    pressed_keys.push_front(key);

    pressed_keys.iter().take(2).copied().rev().collect()
}

#[inline]
fn handle_key_release(pressed_keys: &mut VecDeque<rdev::Key>, key: rdev::Key) {
    pressed_keys.retain(|&k| k != key);
}

pub fn handle_shortcut(app_handle: AppHandle) {
    let settings = app_handle.state::<AppState>().settings.clone();

    std::thread::spawn(move || {
        let intercept_input = { settings.load().intercept_input };

        if intercept_input {
            let pressed_key = Mutex::new(VecDeque::<rdev::Key>::with_capacity(128));

            let err = rdev::grab(move |event| -> Option<rdev::Event> {
                let mut pressed_keys = pressed_key.lock().unwrap();

                match event.event_type {
                    rdev::EventType::KeyPress(key) => {
                        if !pressed_keys.contains(&key) {
                            let settings = settings.load();
                            let next_line_shortcut = &settings.next_line_key;
                            let prev_line_shortcut = &settings.prev_line_key;

                            let recent_keys = push_and_take_recent_keys(&mut pressed_keys, key);

                            if recent_keys == *next_line_shortcut {
                                app_handle
                                    .emit("key_trigger", TriggerEvent::NextLine)
                                    .unwrap();

                                return None;
                            }

                            if recent_keys == *prev_line_shortcut {
                                app_handle
                                    .emit("key_trigger", TriggerEvent::PrevLine)
                                    .unwrap();

                                return None;
                            }
                        }

                        Some(event)
                    }
                    rdev::EventType::KeyRelease(key) => {
                        handle_key_release(&mut pressed_keys, key);
                        Some(event)
                    }
                    _ => Some(event),
                }
            });

            if let Err(err) = err {
                panic!("[ERROR] Failed to listen keyboard event: {err:?}");
            }
        } else {
            let mut settings_cache = arc_swap::Cache::new(settings.clone());
            let mut pressed_keys = VecDeque::<rdev::Key>::with_capacity(128);

            let err = rdev::listen(move |event| match event.event_type {
                rdev::EventType::KeyPress(key) => {
                    if !pressed_keys.contains(&key) {
                        let settings = settings_cache.load();
                        let next_line_shortcut = &settings.next_line_key;
                        let prev_line_shortcut = &settings.prev_line_key;

                        let recent_keys = push_and_take_recent_keys(&mut pressed_keys, key);

                        if recent_keys == *next_line_shortcut {
                            app_handle
                                .emit("key_trigger", TriggerEvent::NextLine)
                                .unwrap();
                        }

                        if recent_keys == *prev_line_shortcut {
                            app_handle
                                .emit("key_trigger", TriggerEvent::PrevLine)
                                .unwrap();
                        }
                    }
                }
                rdev::EventType::KeyRelease(key) => {
                    handle_key_release(&mut pressed_keys, key);
                }
                _ => {}
            });

            if let Err(err) = err {
                panic!("[ERROR] Failed to listen keyboard event: {err:?}");
            }
        }
    });
}
