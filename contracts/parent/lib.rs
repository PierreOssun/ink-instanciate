#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod parent {
    use dummy::dummy::Dummy;
    use ink_env::DefaultEnvironment;
    use ink_lang::ToAccountId;
    use scale::Encode;

    #[derive(Default)]
    #[ink(storage)]
    pub struct Parent {
        dummy: Dummy,
    }

    impl Parent {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { dummy: Default::default() }
        }

        #[ink(message)]
        pub fn child_instance(&mut self, child_code_hash: Hash) {
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
            self.dummy = dummy_instance;
        }

        #[ink(message)]
        pub fn child_address(&self) -> AccountId {
            self.dummy.to_account_id()
        }
    }
}
