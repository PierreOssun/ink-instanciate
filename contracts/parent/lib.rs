#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
pub mod parent {
    use ink_env::DefaultEnvironment;
    use ink_lang::ToAccountId;
    use dummy::dummy::Dummy;

    #[derive(Default)]
    #[ink(storage)]
    pub struct Parent {
        dummy: Option<Dummy>,
    }

    impl Parent {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { dummy: None }
        }

        #[ink(constructor)]
        pub fn instanciate_constructor(child_code_hash: Hash) -> Self {
            let dummy_instance = Dummy::new()
                .endowment(Self::env().balance() / 4)
                .code_hash(child_code_hash)
                .salt_bytes(
                    ink_env::random::<DefaultEnvironment>(&Self::env().block_timestamp().to_le_bytes())
                        .unwrap()
                        .0
                )
                .instantiate()
                .expect("Could not instantiate Dummy contract");
            Self {
                dummy: Some(dummy_instance)
            }
        }

        #[ink(message)]
        pub fn instanciate_dummy(&mut self, child_code_hash: Hash) {
            let dummy_instance = Dummy::new()
                .endowment(Self::env().balance() / 4)
                .code_hash(child_code_hash)
                .salt_bytes(
                    ink_env::random::<DefaultEnvironment>(&Self::env().block_timestamp().to_le_bytes())
                        .unwrap()
                        .0
                )
                .instantiate()
                .expect("Could not instantiate Dummy contract");
            self.dummy = Some(dummy_instance);
        }

        #[ink(message)]
        pub fn flip(&mut self) {
            self.dummy.clone().unwrap().flip()
        }

        #[ink(message)]
        pub fn flip_value(&self) -> bool {
            self.dummy.clone().unwrap().get_value()
        }

        #[ink(message)]
        pub fn dummy_account_id(&self) -> AccountId {
            self.dummy.clone().unwrap().to_account_id()
        }
    }
}
