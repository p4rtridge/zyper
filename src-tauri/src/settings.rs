use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct Settings {
    pub cache_cap: u64,
    pub cache_ttl: u64,
    pub detect_pagination: String,
    pub intercept_input: bool,
    pub next_line_key: Vec<rdev::Key>,
    pub prev_line_key: Vec<rdev::Key>,
    pub detect_comment: Option<String>,
    pub special_line: HashMap<String, String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            cache_cap: 16,
            cache_ttl: 10,
            detect_pagination: String::from("//"),
            intercept_input: false,
            next_line_key: vec![rdev::Key::Tab],
            prev_line_key: vec![rdev::Key::ShiftLeft, rdev::Key::Tab],
            detect_comment: None,
            special_line: HashMap::new(),
        }
    }
}
