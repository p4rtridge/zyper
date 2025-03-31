use tauri::ipc;
use tokio::fs;

#[tauri::command]
pub async fn read_file(path: String) -> Result<ipc::Response, u16> {
    match fs::read(path).await {
        Err(err) => {
            println!("{:?}", err);

            Err(500)
        }
        Ok(content) => Ok(ipc::Response::new(content)),
    }
}
