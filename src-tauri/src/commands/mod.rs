use tauri::{Runtime, ipc::Invoke};

pub mod parser;
pub mod settings;

pub fn prepare_handlers<R>() -> impl Fn(Invoke<R>) -> bool + Send + Sync + 'static
where
    R: Runtime,
{
    tauri::generate_handler![
        parser::process_file,
        parser::remove_file,
        parser::get_file,
        settings::create_new_window,
        settings::get_settings,
        settings::set_settings
    ]
}
