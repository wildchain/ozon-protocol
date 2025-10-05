Ozone-cli testing in local machine 

Command to install ozon-cli(locally)

cargo install --path ozon-cli --locked

Command to register operator by communicating with solana-programs(devnet).

ozon-cli initialize-operator --bond-amount 20000000000 --metadata "my-operator" --cluster devnet   

