use argon2::password_hash::SaltString;
use argon2::{Argon2, Params, PasswordHasher, Version, ARGON2ID_IDENT};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn derive_key(password: &str, salt: &[u8]) -> Vec<u8> {
    let argon2 = Argon2::default();
    let salt_string = SaltString::encode_b64(salt).expect("invalid salt");

    let hash = argon2
        .hash_password_customized(
            password.as_bytes(),
            Some(ARGON2ID_IDENT),
            Some(Version::V0x13.into()),
            Params::new(65536, 3, 1, Some(32)).expect("invalid params"),
            salt_string.as_salt(),
        )
        .expect("argon2 failed");

    hash.hash.expect("missing hash").as_bytes().to_vec()
}
