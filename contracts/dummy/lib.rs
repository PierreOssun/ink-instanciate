#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
pub mod dummy {

    #[derive(Default)]
    #[ink(storage)]
    pub struct Dummy {}

    impl Dummy {
        #[ink(constructor)]
        pub fn new() -> Self {Self {}}

        #[ink(message)]
        pub fn get(&self) -> u8 { 0 }
    }
}
