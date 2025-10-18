# AVS Oracle CLI

[![Crates.io](https://img.shields.io/crates/v/avs-oracle-cli.svg)](https://crates.io/crates/avs-oracle-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-devnet-blue)](https://solana.com)

Command-line tool for AVS (Actively Validated Service) owners to create, manage, and monitor oracle validation tasks on Solana. Part of the [Ozon Restaking Protocol](https://github.com/yourusername/ozon).

## 📖 Overview

AVS Oracle CLI enables AVS owners to:
- ✅ Create price oracle validation tasks with configurable parameters
- 📊 Monitor task submissions from operators in real-time
- 🔍 View detailed submission data and verification status
- 🔒 Manage task lifecycle (create, list, verify, close)

Operators run validation nodes that automatically fetch Pyth Network price feeds and submit results for tasks created through this CLI.

## 🎯 Key Features

- **Simple Task Creation**: Create oracle validation tasks with one command
- **Real-time Monitoring**: Track operator submissions as they happen
- **Pyth Integration**: Leverages Pyth Network for reliable price feeds
- **Configurable Thresholds**: Set custom verification thresholds per task
- **Beautiful CLI Output**: Color-coded, formatted output for easy reading
- **Multi-cluster Support**: Works on devnet, testnet, and mainnet-beta

## 📦 Installation

### From crates.io (Recommended)
```bash
cargo install avs-oracle-cli
```

### From Source
```bash
git clone https://github.com/yourusername/ozon
cd ozon/avs/ozon-oracle-sdk
cargo install --path .
```

### Prerequisites

- Rust 1.70+ and Cargo
- Solana CLI tools (for wallet management)
- Active Solana wallet with SOL for transactions

## 🚀 Quick Start

### 1. Setup Your Wallet
```bash
# Use your existing Solana wallet
export SOLANA_KEYPAIR=~/.config/solana/id.json

# Or create a new one
solana-keygen new -o avs-owner-keypair.json

# Airdrop SOL on devnet
solana airdrop 2 --url devnet
```

### 2. Register as AVS Owner

First, register your AVS using the main [Ozon CLI](https://crates.io/crates/ozon-cli):
```bash
ozon-cli register-avs \
  --metadata "oracle:BTC/USD Price Feed" \
  --registration-fee 3000000000 \
  --cluster devnet
```

### 3. Create Your First Task
```bash
avs-oracle create-task \
  --task-id 1 \
  --pyth-feed-id e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43 \
  --deadline-slots 1000 \
  --threshold-bps 100 \
  --cluster devnet
```

### 4. Monitor Submissions
```bash
# List all your tasks
avs-oracle list-tasks --cluster devnet

# View submissions for a specific task
avs-oracle get-submissions --task-id 1 --cluster devnet
```

## 📚 Command Reference

### `create-task`

Create a new oracle validation task.
```bash
avs-oracle create-task \
  --task-id <ID> \
  --pyth-feed-id <FEED_ID> \
  --deadline-slots <SLOTS> \
  --threshold-bps <BPS> \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

**Options:**
- `--task-id`: Unique task identifier (incrementing number)
- `--pyth-feed-id`: Pyth Network price feed ID (32-byte hex string)
- `--deadline-slots`: Task deadline in slots from now (default: 1000)
- `--threshold-bps`: Verification threshold in basis points (default: 100 = 1%)
- `--cluster`: Solana cluster (devnet/testnet/mainnet-beta, default: devnet)
- `--wallet`: Path to keypair file (default: ~/.config/solana/id.json)

**Example:**
```bash
avs-oracle create-task \
  --task-id 1 \
  --pyth-feed-id e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43 \
  --deadline-slots 2000 \
  --threshold-bps 50 \
  --cluster devnet
```

### `list-tasks`

List all tasks for your AVS.
```bash
avs-oracle list-tasks [--cluster <CLUSTER>] [--wallet <PATH>] [--active-only]
```

**Options:**
- `--cluster`: Solana cluster (default: devnet)
- `--wallet`: Path to keypair file
- `--active-only`: Show only active tasks

**Example:**
```bash
avs-oracle list-tasks --active-only --cluster devnet
```

### `get-submissions`

View all submissions for a specific task.
```bash
avs-oracle get-submissions --task-id <ID> [--cluster <CLUSTER>] [--wallet <PATH>]
```

**Options:**
- `--task-id`: Task ID to view submissions for
- `--cluster`: Solana cluster (default: devnet)
- `--wallet`: Path to keypair file

**Example:**
```bash
avs-oracle get-submissions --task-id 1 --cluster devnet
```

### `verify-submission`

View verification details for a specific submission.
```bash
avs-oracle verify-submission \
  --task-id <ID> \
  --operator <PUBKEY> \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

**Options:**
- `--task-id`: Task ID
- `--operator`: Operator's public key
- `--cluster`: Solana cluster (default: devnet)
- `--wallet`: Path to keypair file

**Example:**
```bash
avs-oracle verify-submission \
  --task-id 1 \
  --operator CLuHUKKF2nUiBFNQCUAxKqJHbEiDiSrphsrYzJ12btHN \
  --cluster devnet
```

### `close-task`

Close an expired task.
```bash
avs-oracle close-task --task-id <ID> [--cluster <CLUSTER>] [--wallet <PATH>]
```

**Options:**
- `--task-id`: Task ID to close
- `--cluster`: Solana cluster (default: devnet)
- `--wallet`: Path to keypair file

**Example:**
```bash
avs-oracle close-task --task-id 1 --cluster devnet
```

## 🔮 Pyth Price Feed IDs

Common Pyth Network price feed IDs (mainnet):

| Asset | Feed ID |
|-------|---------|
| BTC/USD | `e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43` |
| ETH/USD | `ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace` |
| SOL/USD | `ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d` |
| USDC/USD | `eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a` |
| USDT/USD | `2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b` |

Find more feeds at [Pyth Network Price Feeds](https://pyth.network/price-feeds).

## 🛠️ How It Works

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    AVS Owner (You)                       │
│              Uses: avs-oracle-cli                        │
├─────────────────────────────────────────────────────────┤
│  1. Create tasks with price feed validation params       │
│  2. Monitor operator submissions                         │
│  3. Verify and close tasks                              │
└─────────────────────────────────────────────────────────┘
                            ↓
                 Creates tasks on-chain
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Solana Blockchain                      │
│         Program: avs-oracle (On-chain)                   │
├─────────────────────────────────────────────────────────┤
│  • Task accounts store validation parameters             │
│  • Submission accounts store operator results            │
│  • Integrates with Pyth Network for verification        │
└─────────────────────────────────────────────────────────┘
                            ↓
                 Operators fetch tasks
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Operators                             │
│              Uses: ozon-cli run-operator                 │
├─────────────────────────────────────────────────────────┤
│  1. Discover active tasks                               │
│  2. Fetch Pyth price feeds                              │
│  3. Submit results on-chain                             │
│  4. Get slashed if wrong!                               │
└─────────────────────────────────────────────────────────┘
```

### Task Lifecycle

1. **Creation**: AVS owner creates task with deadline and threshold
2. **Submission**: Operators fetch price data and submit results
3. **Verification**: Submissions are verified against Pyth on-chain data
4. **Slashing**: Incorrect submissions result in operator bond slashing
5. **Closure**: Expired tasks can be closed to clean up state

## 🎯 Use Cases

### Decentralized Price Oracles
Create tasks for operators to validate price feeds for DeFi protocols.

### Data Validation Services
Verify external data sources with multiple operators providing redundancy.

### Decentralized Monitoring
Monitor blockchain or off-chain metrics with operator consensus.

## 🔧 Configuration

### Custom Wallet
```bash
avs-oracle create-task \
  --wallet ./my-avs-keypair.json \
  --task-id 1 \
  --pyth-feed-id <FEED_ID>
```

### Mainnet Deployment
```bash
avs-oracle create-task \
  --cluster mainnet-beta \
  --task-id 1 \
  --pyth-feed-id <FEED_ID>
```

### Higher Verification Threshold
```bash
avs-oracle create-task \
  --task-id 1 \
  --pyth-feed-id <FEED_ID> \
  --threshold-bps 500  # 5% threshold instead of 1%
```

## 🐛 Troubleshooting

### "Account not initialized"

**Problem**: AVS account doesn't exist.

**Solution**: Register your AVS first using `ozon-cli`:
```bash
ozon-cli register-avs --metadata "oracle:My Oracle" --registration-fee 3000000000
```

### "Task account already exists"

**Problem**: Task ID is already used.

**Solution**: Use a different task ID:
```bash
avs-oracle create-task --task-id 2 ...
```

### "Insufficient funds"

**Problem**: Not enough SOL in wallet.

**Solution**: Airdrop more SOL (devnet):
```bash
solana airdrop 2 --url devnet
```

### "Invalid Pyth feed ID"

**Problem**: Feed ID is not 32 bytes (64 hex characters).

**Solution**: Ensure you're using the correct format without `0x` prefix or use it with prefix:
```bash
--pyth-feed-id e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43
```

## 📖 Related Tools

- **[ozon-cli](https://crates.io/crates/ozon-cli)**: Operator node management
- **[Pyth Network](https://pyth.network)**: Price feed provider
- **[Solana CLI](https://docs.solana.com/cli)**: Wallet and cluster management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/ozon
cd ozon/avs/ozon-oracle-sdk

# Build
cargo build

# Run tests
cargo test

# Run locally
cargo run -- create-task --help
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🔗 Links

- **Documentation**: [Coming soon]
- **GitHub**: https://github.com/yourusername/ozon
- **Discord**: [Your Discord invite]
- **Twitter**: [@YourHandle]

## 💡 Support

- Open an issue on [GitHub](https://github.com/yourusername/ozon/issues)
- Join our [Discord community]
- Follow us on [Twitter]

## 🙏 Acknowledgments

- Built on [Solana](https://solana.com)
- Powered by [Pyth Network](https://pyth.network)
- Built with [Anchor Framework](https://www.anchor-lang.com/)

---

**Made with ❤️ for the Solana ecosystem**