use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct Settings {
    pub cache_cap: u64,
    pub cache_ttl: u64,
    pub detect_pagination: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            cache_cap: 16,
            cache_ttl: 10,
            detect_pagination: String::from("//"),
        }
    }
}
