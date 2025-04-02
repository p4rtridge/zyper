use crate::settings::Settings;
use moka::future::Cache;
use std::sync::Mutex;

pub struct AppState {
    pub read_lock: tokio::sync::Mutex<()>,
    pub cache: Cache<String, Vec<u8>>,
    pub settings: Mutex<Settings>,
}
