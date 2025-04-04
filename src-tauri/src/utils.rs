use crate::{
    commands::parser::{self, ParsedFile},
    settings,
};
use bytes::{BufMut, BytesMut};
use serde::Serialize;
use std::{io::ErrorKind, os::windows::process::CommandExt, path::Path, process::Command};
use tokio::fs;

static HASH_SEED: u32 = 564_485; // try google it

pub fn hash(path: &str) -> String {
    let mut hash = HASH_SEED;

    for byte in path.bytes() {
        hash = hash.wrapping_mul(33).wrapping_add(u32::from(byte));
    }

    hash.to_string()
}

pub async fn read_and_parse_file(
    path: impl AsRef<Path>,
    settings: &settings::Settings,
) -> Result<Vec<ParsedFile>, String> {
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

        if line.starts_with(&settings.detect_pagination) {
            if current_page.is_some() {
                curernt_index = 0;
            }

            current_page = line.strip_prefix(&settings.detect_pagination);
        } else if !line.is_empty() {
            curernt_index += 1;

            let mut content = match &settings.detect_comment {
                None => parser::Content {
                    is_comment: false,
                    color: None,
                    text: line.to_string(),
                },
                Some(comment_prefix) => {
                    if let Some(content_str) = line.strip_prefix(comment_prefix) {
                        curernt_index -= 1;

                        parser::Content {
                            is_comment: true,
                            color: None,
                            text: content_str.to_string(),
                        }
                    } else {
                        parser::Content {
                            is_comment: false,
                            color: None,
                            text: line.to_string(),
                        }
                    }
                }
            };

            if let Some((prefix, color)) = settings
                .special_line
                .iter()
                .find(|(prefix, _)| line.starts_with(*prefix))
            {
                let content_str = line.strip_prefix(prefix).unwrap();

                content = parser::Content {
                    is_comment: false,
                    color: Some(color.to_string()),
                    text: content_str.to_string(),
                }
            }

            out.push(parser::ParsedFile {
                page: current_page.map(std::string::ToString::to_string),
                index: curernt_index,
                content,
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

pub fn check_admin_privileges() -> bool {
    #[cfg(target_os = "windows")]
    {
        const CREATE_NO_WINDOWS: u32 = 0x0800_0000;

        let output = Command::new("whoami")
            .arg("/groups")
            .creation_flags(CREATE_NO_WINDOWS)
            .output();

        match output {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                stdout.contains("S-1-16-12288")
            }
            Err(err) => {
                eprintln!("[Bug] check admin error: {err:?}");
                false
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("groups").output();

        match output {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                stdout.contains("admin")
            }
            Err(err) => {
                eprintln!("[Bug] check admin error: {err:?}");
                false
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        unsafe { libc::geteuid() == 0 }
    }
}
