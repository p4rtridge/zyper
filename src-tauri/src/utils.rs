use std::{io::ErrorKind, path::Path};
use tokio::fs;

static HASH_SEED: u32 = 564_485; // try google it

pub fn hash(path: &str) -> String {
    let mut hash = HASH_SEED;

    for byte in path.bytes() {
        hash = hash.wrapping_mul(33).wrapping_add(u32::from(byte));
    }

    hash.to_string()
}

pub async fn read_file_utf8(path: impl AsRef<Path>) -> Result<Vec<u8>, &'static str> {
    match fs::read(path).await {
        Ok(content) => Ok(content),
        Err(err) => match err.kind() {
            ErrorKind::NotFound => Err("fileNotFoundError"),
            ErrorKind::PermissionDenied => Err("permissionDeniedError"),
            _ => {
                eprintln!("[Error] Read file error: {err:?}");
                Err("internalError")
            }
        },
    }
}
