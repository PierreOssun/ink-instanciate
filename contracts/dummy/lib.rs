#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
pub mod dummy {
    #[derive(Default)]
    #[ink(storage)]
    pub struct Dummy {
        value: bool,
    }

    impl Dummy {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { value: true }
        }

        #[ink(message)]
        pub fn flip(&mut self) {
            self.value = !self.value;
        }

        #[ink(message)]
        pub fn get_value(&self) -> bool {
            self.value
        }
    }
}