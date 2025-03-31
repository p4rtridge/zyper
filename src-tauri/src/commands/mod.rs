use tauri::{Runtime, ipc::Invoke};

pub mod parser;

pub fn prepare_handlers<R>() -> impl Fn(Invoke<R>) -> bool + Send + Sync + 'static
where
    R: Runtime,
{
    tauri::generate_handler![parser::read_file]
}
