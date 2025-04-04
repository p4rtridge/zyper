use crate::commands::parser::{self, ParsedFile};
use bytes::{BufMut, BytesMut};
use serde::Serialize;
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

pub async fn read_and_parse_file(path: impl AsRef<Path>) -> Result<Vec<ParsedFile>, String> {
    let content = match fs::read_to_string(path).await {
        Ok(content) => content,
        Err(err) => match err.kind() {
            ErrorKind::NotFound => return Err(String::from("fileNotFoundError")),
            ErrorKind::PermissionDenied => return Err(String::from("permissionDeniedError")),
            _ => {
                eprintln!("[Error] Read file error: {err:?}");
                return Err(format!("[BUG] Internal Error: {err}"));
            }
        },
    };

    let mut out = Vec::with_capacity(1024);

    let mut current_page = None;
    let mut curernt_index = 0u32;

    let lines = content.split('\n');
    for line in lines {
        let line = line.trim();

        if line.starts_with("//") {
            if current_page.is_some() {
                curernt_index = 0;
            }

            current_page = line.strip_prefix("//");
        } else if !line.is_empty() {
            curernt_index += 1;

            out.push(parser::ParsedFile {
                page: current_page.map(std::string::ToString::to_string),
                index: curernt_index,
                content: line.to_string(),
            });
        }
    }

    Ok(out)
}

pub fn serialize_simd<T>(value: &T) -> Result<Vec<u8>, String>
where
    T: Serialize,
{
    let mut buf = BytesMut::with_capacity(128).writer();
    if let Err(err) = serde_json::to_writer(&mut buf, value) {
        eprintln!("[Error] Serialize error: {err:?}");
        return Err(format!("[BUG] Internal Error: {err}"));
    }

    Ok(buf.into_inner().freeze().into())
}
