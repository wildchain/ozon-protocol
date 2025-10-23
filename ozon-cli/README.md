### Ozon-cli (PLEASE NOTE - We are currently in the development stage , so mainnet deployments are not live yet. Please stick to Devnet and have fun).


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

### Install from Source (Repo is private as of now - use the above option)

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

### 6. Opt Into AVS (Operator Registration)

Allow an operator to opt into an Actively Validated Service to start providing services.

**Syntax:**
```bash
ozon-cli opt-in-avs \
  --avs-owner <PUBKEY> \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>] \
  [--interactive]
```

**Parameters:**

- `--avs-owner`: The public key of the AVS owner you want to opt into
- `--cluster`: Network cluster [default: devnet]
- `--wallet`: Path to wallet file [default: ~/.config/solana/id.json]
- `--interactive`: Launch the Ozon AVS Selection dashboard in your browser [optional]

**Example:**
```bash
# Opt into an AVS using the AVS owner's public key
ozon-cli opt-in-avs \
  --avs-owner 8xYzAbCdEfGh1234567890qwertyuiopasdfghjklzxc \
  --cluster devnet

# Use interactive mode to browse and select AVS from the dashboard
ozon-cli opt-in-avs --interactive

# Opt in on mainnet with custom wallet
ozon-cli opt-in-avs \
  --avs-owner 8xYzAbCdEfGh1234567890qwertyuiopasdfghjklzxc \
  --cluster mainnet \
  --wallet /path/to/mainnet-wallet.json
```

**Output:**
```
🔍 Debug info:
  Operator: CLuH...btHN
  AVS Owner: 8xYz...zxc
  AVS Account: 4sWx...KlMn
  Registration PDA: 9pQw...XyZa
✅ Opted into AVS with tx 7mN8...5kL2
```

---

### 7. Run Operator Daemon

Run a local operator daemon that polls for active tasks and submits results automatically.

**Syntax:**
```bash
ozon-cli run-operator \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>] \
  [--poll-interval-seconds <SECONDS>]
```

**Parameters:**
- `--poll-interval-seconds`: Poll interval in seconds [default: 10]

**Example:**
```bash
ozon-cli run-operator \
  --cluster devnet \
  --wallet ./operator1.json \
  --poll-interval-seconds 10
```

---

### 8. Create Task (AVS Owner)

Create a new task under your AVS.

**Syntax:**
```bash
ozon-cli create-task \
  --task-id <U64> \
  --submission-deadline-slots <U64> \
  --verification-threshold-bps <U64> \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

**Example:**
```bash
ozon-cli create-task \
  --task-id 3 \
  --submission-deadline-slots 1200 \
  --verification-threshold-bps 200 \
  --cluster devnet \
  --wallet ~/.config/solana/avs-owner.json
```

---

### 9. Submit Task Result (Operator)

Submit a task result manually (the daemon usually handles this automatically).

**Syntax:**
```bash
ozon-cli submit-task-result \
  --task-pubkey <PUBKEY> \
  --submitted-price <I64_SCALED_1e8> \
  --confidence <U64> \
  --publish-time <I64_UNIX_S> \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

---

### 10. Verify Task (AVS Owner)

Verify an operator's submission and slash if incorrect.

**Syntax:**
```bash
ozon-cli verify-task \
  --task-pubkey <PUBKEY> \
  --operator-owner <PUBKEY> \
  --actual-price <I64_SCALED_1e8> \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

**Notes:**
- `--actual-price` must be an integer i64 scaled to 8 decimals (e.g., 67321.12 → 6732112000000000).

---

### 11. Close Task (AVS Owner)

Close a task after the submission window has passed.

**Syntax:**
```bash
ozon-cli close-task \
  --task-pubkey <PUBKEY> \
  [--cluster <CLUSTER>] \
  [--wallet <PATH>]
```

---

### 12. Get Task PDA (Helper)

Derive the task account PDA for a given `task_id` and `avs_owner`.

**Syntax:**
```bash
ozon-cli get-task-pda \
  --task-id <U64> \
  --avs-owner <PUBKEY>
```

**Interactive Mode:**
When using --interactive, the command will open the Ozon AVS Selection dashboard in your default browser, where you can:

Browse available AVS services
View AVS metadata and requirements
Select an AVS to opt into
Complete the opt-in process through a user-friendly interface

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

# 4. Browse available AVS services interactively
ozon-cli opt-in-avs --interactive

# 5. Or opt into a specific AVS directly
ozon-cli opt-in-avs \
  --avs-owner 8xYzAbCdEfGh1234567890qwertyuiopasdfghjklzxc \
  --cluster devnet

# 6. Verify transaction on explorer
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

# 5. Share your AVS owner pubkey with operators
solana address
```
## 🔍 Finding AVS to Opt Into

There are two methods to find and opt into an AVS:

### Method 1: Interactive Dashboard (Recommended)

The easiest way to discover and opt into AVS services is through the interactive web dashboard:
```bash
# Launch the Ozon AVS Selection dashboard in your browser
ozon-cli opt-in-avs --interactive
```

**What you'll see:**
- Browse all registered AVS services
- View detailed service descriptions
- Check AVS requirements and status
- Select and opt-in with one click
- Visual interface for easier navigation

**Dashboard URL**: https://ozon-operator-avs-registy.netlify.app/

---

### Method 2: Get AVS Owner Pubkey Directly

If you already know which AVS you want to join, you can opt in directly using the AVS owner's public key:

**Ways to obtain the AVS owner pubkey:**

1. **Ask the AVS provider directly**
   - Contact the AVS team through their official channels
   - They will provide their wallet public key

2. **Check the AVS registry on Solana Explorer**
   - Visit: https://explorer.solana.com/?cluster=devnet
   - Search for AVS account addresses
   - Verify the owner field

3. **Use the AVS provider's documentation**
   - Check their official website or GitHub
   - Look for integration guides
   - Find published wallet addresses

**Example:**
```bash
# Once you have the AVS owner pubkey, opt in directly
ozon-cli opt-in-avs \
  --avs-owner 8xYzAbCdEfGh1234567890qwertyuiopasdfghjklzxc \
  --cluster devnet
```

---

## 👥 Managing Multiple Operators/AVS

You can run multiple operators and have them opt into different AVS services using separate wallets.

### Setting Up Multiple Operators
```bash
# Create and fund separate wallets for each operator
solana-keygen new --outfile ~/operator1-wallet.json
solana-keygen new --outfile ~/operator2-wallet.json

# Fund each wallet (on devnet)
solana airdrop 10 ~/operator1-wallet.json --url devnet
solana airdrop 10 ~/operator2-wallet.json --url devnet

# Register first operator
ozon-cli initialize-operator \
  --bond-amount 5000000000 \
  --metadata "Operator Node 1 - Oracle Services" \
  --cluster devnet \
  --wallet ~/operator1-wallet.json

# Register second operator
ozon-cli initialize-operator \
  --bond-amount 5000000000 \
  --metadata "Operator Node 2 - Bridge Services" \
  --cluster devnet \
  --wallet ~/operator2-wallet.json
```

### Opting Multiple Operators into Different AVS
```bash
# Operator 1 opts into Oracle AVS
ozon-cli opt-in-avs \
  --avs-owner 8xYzAbCdEfGh1234567890qwertyuiopasdfghjklzxc \
  --cluster devnet \
  --wallet ~/operator1-wallet.json

# Operator 2 opts into Bridge AVS
ozon-cli opt-in-avs \
  --avs-owner 9aWxBcDeFgHi2345678901zxcvbnmasdfghjklqwert \
  --cluster devnet \
  --wallet ~/operator2-wallet.json

# One operator can also opt into multiple AVS
ozon-cli opt-in-avs \
  --avs-owner <ANOTHER_AVS_OWNER_PUBKEY> \
  --cluster devnet \
  --wallet ~/operator1-wallet.json
```

### Organizing Your Wallets

**Best practices:**
- Use descriptive names for wallet files: `oracle-operator.json`, `bridge-operator.json`
- Keep a spreadsheet tracking which operator is in which AVS
- Store mainnet wallets separately and securely
- Test all configurations on devnet first

**Example directory structure:**
```
~/solana-wallets/
├── devnet/
│   ├── operator-1-oracle.json
│   ├── operator-2-bridge.json
│   └── operator-3-backup.json
└── mainnet/
    ├── production-operator-1.json
    └── production-operator-2.json
```

---

## 📋 Command Quick Reference

| Command | Purpose | Minimum Requirement |
|---------|---------|---------------------|
| `initialize-operator` | Register as an operator | 2 SOL bond |
| `de-register-operator` | Unregister operator | Must be registered |
| `register-avs` | Register an AVS | 3 SOL registration fee |
| `update-avs-metadata` | Update AVS information | Must own AVS |
| `de-register-avs` | Unregister AVS | Must own AVS |
| `opt-in-avs` | Operator joins an AVS | Must be registered operator |
| `initialize-reward-treasury` | Setup reward system | Protocol authority only |
| `run-operator` | Run operator daemon to auto-submit tasks | Registered operator |
| `create-task` | Create a new task | AVS owner |
| `submit-task-result` | Manually submit result | Operator opted into AVS |
| `verify-task` | Verify submission and slash if wrong | AVS owner |
| `close-task` | Close an expired task | AVS owner |
| `get-task-pda` | Derive task PDA | None |

---

## 🔄 State Transitions

### Operator Lifecycle
```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ Initialize Operator │ ◄── Bond 2+ SOL
└──────────┬──────────┘
           │
           ▼
     ┌──────────────┐
     │Active Operator│
     └──────┬───────┘
            │
            ▼
      ┌─────────────┐
      │Opt Into AVS │ ◄── Join one or more services
      └──────┬──────┘
             │
             ▼
     ┌────────────────┐
     │Providing Services│
     └────────┬────────┘
              │
              ▼
    ┌──────────────────────┐
    │ De-register Operator │ ◄── Reclaim bond
    └──────────┬───────────┘
               │
               ▼
           ┌─────┐
           │ End │
           └─────┘
```

### AVS Lifecycle
```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌─────────────────────┐
│Initialize Treasury  │ ◄── Protocol setup (once)
└──────────┬──────────┘
           │
           ▼
     ┌─────────────┐
     │Register AVS │ ◄── Pay 3+ SOL fee
     └──────┬──────┘
            │
            ▼
       ┌──────────┐
       │Active AVS│
       └────┬─────┘
            │
            ▼
     ┌──────────────┐
     │Update Metadata│ ◄── Optional updates
     └──────┬───────┘
            │
            ▼
     ┌───────────────┐
     │Accept Operators│ ◄── Operators opt in
     └───────┬────────┘
             │
             ▼
      ┌──────────────┐
      │De-register AVS│ ◄── Close service
      └──────┬───────┘
             │
             ▼
         ┌─────┐
         │ End │
         └─────┘
```

---

## 💼 Real-World Scenarios

### Scenario 1: Single Operator, Multiple AVS

**Use case:** You run one operator node that provides multiple services.
```bash
# 1. Initialize your operator once
ozon-cli initialize-operator \
  --bond-amount 5000000000 \
  --metadata "Multi-Service Operator Node" \
  --cluster devnet

# 2. Opt into multiple AVS services
ozon-cli opt-in-avs --avs-owner <ORACLE_AVS_OWNER>
ozon-cli opt-in-avs --avs-owner <BRIDGE_AVS_OWNER>
ozon-cli opt-in-avs --avs-owner <DATA_AVS_OWNER>
```

### Scenario 2: Multiple Operators, Specialized Services

**Use case:** You run separate operators for different service types.
```bash
# Oracle-specialized operator
ozon-cli initialize-operator \
  --bond-amount 10000000000 \
  --metadata "Oracle Specialist Node" \
  --wallet ~/oracle-operator.json

ozon-cli opt-in-avs \
  --avs-owner <ORACLE_AVS_OWNER> \
  --wallet ~/oracle-operator.json

# Bridge-specialized operator
ozon-cli initialize-operator \
  --bond-amount 10000000000 \
  --metadata "Bridge Specialist Node" \
  --wallet ~/bridge-operator.json

ozon-cli opt-in-avs \
  --avs-owner <BRIDGE_AVS_OWNER> \
  --wallet ~/bridge-operator.json
```

### Scenario 3: Testing Before Production

**Use case:** Test your setup on devnet before going live on mainnet.
```bash
# Test on devnet first
ozon-cli initialize-operator \
  --bond-amount 2000000000 \
  --metadata "Test Operator" \
  --cluster devnet \
  --wallet ~/test-wallet.json

# Once confident, deploy to mainnet
ozon-cli initialize-operator \
  --bond-amount 20000000000 \
  --metadata "Production Operator" \
  --cluster mainnet \
  --wallet ~/prod-wallet.json
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

