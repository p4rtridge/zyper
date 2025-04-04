use crate::{commands::parser, settings};
use arc_swap::ArcSwapAny;
use std::sync::Arc;

pub struct AppState {
    pub read_lock: tokio::sync::Mutex<()>,
    pub cache: moka::future::Cache<String, Vec<parser::ParsedFile>>,
    pub settings: Arc<ArcSwapAny<Arc<settings::Settings>>>,
}
