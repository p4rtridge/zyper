static HASH_SEED: u32 = 564_485; // try google it

pub fn hash(path: &str) -> String {
    let mut hash = HASH_SEED;

    for byte in path.bytes() {
        hash = hash.wrapping_mul(33).wrapping_add(u32::from(byte));
    }

    hash.to_string()
}
