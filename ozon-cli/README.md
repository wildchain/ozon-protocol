### Ozon-cli (PLEASE NOTE - We are currently in the development stage , So mainnet deployments are not live yet. please stick to our Devnet and have fun).


[![Crates.io](https://img.shields.io/crates/v/ozon-cli.svg)](https://crates.io/crates/ozon-cli)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

Command-line interface for interacting with the Ozon restaking protocol on Solana. Manage operators and AVS (Actively Validated Services) registrations directly from your terminal.

## 🚀 Features

- **Operator Management**: Register, update, and de-register operators with bond staking
- **AVS Management**: Register and manage Actively Validated Services
- **Multi-Cluster Support**: Works with Solana devnet, testnet, and mainnet
- **Flexible Wallet Options**: Use default or custom wallet configurations
- **Transaction Verification**: Get detailed transaction signatures for all operations

## 📦 Installation

### Install from crates.io (Recommended)

```bash
cargo install ozon-cli
```

### Install from Source(Repo is private as of now - use the above option)

```bash
git clone https://github.com/wildchain/ozon_contract.git
cd ozon_contract/ozon-cli
cargo install --path .
```

### Verify Installation

```bash
ozon-cli --version
ozon-cli --help
```

## 🔧 Prerequisites

Before using ozon-cli, ensure you have:

1. **Rust and Cargo** installed ([rustup](https://rustup.rs/))
2. **Solana CLI tools** installed ([Solana Docs](https://docs.solana.com/cli/install-solana-cli-tools))
3. **A Solana wallet** configured

### Setting Up Your Solana Wallet

```bash
# Create a new wallet (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# Set cluster to devnet for testing
solana config set --url devnet

# Check your wallet address
solana address

# Get devnet SOL for testing (devnet only)
solana airdrop 2
```

## 📖 Usage

### Basic Command Structure

```bash
ozon-cli <COMMAND> [OPTIONS]
```

### Global Options

- `--cluster <CLUSTER>`: Specify Solana cluster (devnet, testnet, mainnet) [default: devnet]
- `--wallet <PATH>`: Path to wallet keypair file [default: ~/.config/solana/id.json]
- `--help`: Display help information
- `--version`: Display version information

---

## 🎯 Commands

### 1. Initialize Operator

Register a new operator with the Ozon protocol by staking a bond amount.

**Syntax:**
```bash
ozon-cli initialize-operator \
  --bond-amount <LAMPORTS> \
  --metadata <STRING> \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

**Parameters:**
- `--bond-amount`: Amount of SOL to bond in lamports (minimum: 2 SOL = 2,000,000,000 lamports)
- `--metadata`: Metadata describing your operator (e.g., "My Operator Node")
- `--cluster`: Network cluster (devnet, testnet, mainnet) [default: devnet]
- `--wallet`: Path to wallet file [default: ~/.config/solana/id.json]

**Example:**
```bash
# Register operator with 5 SOL bond on devnet
ozon-cli initialize-operator \
  --bond-amount 5000000000 \
  --metadata "Acme Validator Services" \
  --cluster devnet

# Register on mainnet with custom wallet
ozon-cli initialize-operator \
  --bond-amount 10000000000 \
  --metadata "Production Operator" \
  --cluster mainnet \
  --wallet /path/to/mainnet-wallet.json
```

**Output:**
```
🔍 Debug info:
  Program ID: 6UqcKJ3U7zfr5JkhzjDZQsunbJeFBxgCKYbuMw8Scv6B
  Operator key: 8xYz...AbCd
  Operator account PDA: 9pQw...XyZa
  Vault PDA: 7mNb...LmNo
  Bond amount: 5000000000
  Metadata: Acme Validator Services
✅ Operator initialized with tx 3kL9...8fH2
```

---

### 2. De-register Operator

Remove your operator registration and reclaim your bonded SOL.

**Syntax:**
```bash
ozon-cli de-register-operator \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

**Parameters:**
- `--cluster`: Network cluster [default: devnet]
- `--wallet`: Path to wallet file [default: ~/.config/solana/id.json]

**Example:**
```bash
# De-register operator on devnet
ozon-cli de-register-operator --cluster devnet

# De-register on mainnet with custom wallet
ozon-cli de-register-operator \
  --cluster mainnet \
  --wallet /path/to/mainnet-wallet.json
```

**Output:**
```
🔍 Debug info:
  Program ID: 6UqcKJ3U7zfr5JkhzjDZQsunbJeFBxgCKYbuMw8Scv6B
  Operator key: 8xYz...AbCd
  Operator account PDA: 9pQw...XyZa
  Vault PDA: 7mNb...LmNo
✅ Operator de-registered with tx 2jK8...9gI1
```

---

### 3. Register AVS

Register a new Actively Validated Service (AVS) with the protocol.

**Syntax:**
```bash
ozon-cli register-avs \
  --name <STRING> \
  --registration-fee <LAMPORTS> \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

**Parameters:**
- `--name`: Name/metadata for your AVS
- `--registration-fee`: Registration fee in lamports (minimum: 3 SOL = 3,000,000,000 lamports)
- `--cluster`: Network cluster [default: devnet]
- `--wallet`: Path to wallet file [default: ~/.config/solana/id.json]

**Example:**
```bash
# Register AVS on devnet
ozon-cli register-avs \
  --name "Oracle Price Feeds" \
  --registration-fee 3000000000 \
  --cluster devnet

# Register on mainnet
ozon-cli register-avs \
  --name "Cross-Chain Bridge Service" \
  --registration-fee 5000000000 \
  --cluster mainnet \
  --wallet /path/to/mainnet-wallet.json
```

**Output:**
```
🔍 Debug info:
  Program ID: 6UqcKJ3U7zfr5JkhzjDZQsunbJeFBxgCKYbuMw8Scv6B
  AVS owner: 8xYz...AbCd
  AVS account PDA: 4sWx...KlMn
  Treasury PDA: 6tRy...PqRs
  Registration fee: 3000000000
  Avs Name: Oracle Price Feeds
✅ Avs registered with tx 5nM7...3pQ9
```

---

### 4. Update AVS Metadata

Update the metadata/name of your registered AVS.

**Syntax:**
```bash
ozon-cli update-avs-metadata \
  --name <STRING> \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

**Parameters:**
- `--name`: New name/metadata for your AVS
- `--cluster`: Network cluster [default: devnet]
- `--wallet`: Path to wallet file [default: ~/.config/solana/id.json]

**Example:**
```bash
# Update AVS metadata
ozon-cli update-avs-metadata \
  --name "Oracle Price Feeds v2.0" \
  --cluster devnet

# Update on mainnet
ozon-cli update-avs-metadata \
  --name "Enhanced Oracle Service" \
  --cluster mainnet \
  --wallet /path/to/mainnet-wallet.json
```

**Output:**
```
🔍 Debug info:
  Program ID: 6UqcKJ3U7zfr5JkhzjDZQsunbJeFBxgCKYbuMw8Scv6B
  AVS owner: 8xYz...AbCd
  AVS account PDA: 4sWx...KlMn
  New Avs Name: Oracle Price Feeds v2.0
✅ AVS metadata updated with tx 7oL6...4rH8
```

---

### 5. De-register AVS

Remove your AVS registration from the protocol.

**Syntax:**
```bash
ozon-cli de-register-avs \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

**Parameters:**
- `--cluster`: Network cluster [default: devnet]
- `--wallet`: Path to wallet file [default: ~/.config/solana/id.json]

**Example:**
```bash
# De-register AVS on devnet
ozon-cli de-register-avs --cluster devnet

# De-register on mainnet(comming soon)
ozon-cli de-register-avs \
  --cluster mainnet \
  --wallet /path/to/mainnet-wallet.json
```

**Output:**
```
🔍 Debug info:
  Program ID: 6UqcKJ3U7zfr5JkhzjDZQsunbJeFBxgCKYbuMw8Scv6B
  AVS owner: 8xYz...AbCd
  AVS account PDA: 4sWx...KlMn
✅ AVS de-registered with tx 9kP4...2sG7
```

---

## 💡 Common Workflows

### Setting Up as an Operator

```bash
# 1. Check your balance
solana balance

# 2. Request airdrop if on devnet
solana airdrop 10

# 3. Register as operator
ozon-cli initialize-operator \
  --bond-amount 2000000000 \
  --metadata "My Operator Node" \
  --cluster devnet

# 4. Verify transaction on explorer
# Visit: https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
```

### Setting Up an AVS

```bash
# 1. Ensure you have enough SOL
solana balance

# 2. Register your AVS
ozon-cli register-avs \
  --name "My Validation Service" \
  --registration-fee 3000000000 \
  --cluster devnet

# 3. Update name later if needed
ozon-cli update-avs-metadata \
  --name "My Validation Service v2" \
  --cluster devnet
```

### Switching Between Clusters

```bash
# Development/Testing on devnet
ozon-cli initialize-operator \
  --bond-amount 2000000000 \
  --metadata "Test Operator" \
  --cluster devnet

# Production on mainnet
ozon-cli initialize-operator \
  --bond-amount 10000000000 \
  --metadata "Production Operator" \
  --cluster mainnet \
  --wallet /secure/mainnet-wallet.json
```

---

## 🔐 Security Best Practices

1. **Protect Your Wallet**: Never share your private key file
2. **Test on Devnet First**: Always test operations on devnet before mainnet
3. **Use Hardware Wallets**: Consider using Ledger for mainnet operations
4. **Backup Your Keys**: Store wallet backups in secure locations
5. **Verify Transactions**: Always check transaction signatures on Solana Explorer

---

## 🐛 Troubleshooting

### Issue: "Command not found"

```bash
# Ensure cargo bin is in your PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Add to your shell profile (~/.bashrc, ~/.zshrc)
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc
```

### Issue: "Insufficient funds"

```bash
# Check your balance
solana balance

# On devnet, request airdrop
solana airdrop 5

# On mainnet, ensure you have enough SOL
```

### Issue: "Invalid cluster"

Supported clusters are:
- `devnet` (default)
- `testnet`
- `mainnet` or `mainnet-beta` (`coming soon`)

### Issue: "Unauthorized action"

Ensure you're using the correct wallet that owns the operator/AVS you're trying to modify.

---

## 📊 Transaction Verification

After each command, you'll receive a transaction signature. Verify it on Solana Explorer:

**Devnet:**
```
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
```

**Mainnet:**
```
https://explorer.solana.com/tx/<SIGNATURE>
```

---

## 🔗 Program Information

- **Program ID**: `6UqcKJ3U7zfr5JkhzjDZQsunbJeFBxgCKYbuMw8Scv6B`
- **Network**: Solana (devnet, testnet, mainnet)
- **Repository**: [`we will share this once we make our repo public`]

---

## 📚 Resources

- [Solana Documentation](https://docs.solana.com/)
- [Solana CLI Tools](https://docs.solana.com/cli)
- [Solana Explorer](https://explorer.solana.com/)


## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/wildchain/ozon_contract/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wildchain/ozon_contract/discussions)

---

## 🎉 Acknowledgments

Built with:
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana](https://solana.com/)
- [Rust](https://www.rust-lang.org/)

---

**Made with ❤️ by the Ozon Team**

