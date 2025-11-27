# Ozon Protocol

A decentralized restaking protocol built on Solana that enables users to restake their tokens while operators provide validation services for Actively Validated Services (AVS).

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Components](#components)
  - [Smart Contracts](#smart-contracts)
  - [Backend API](#backend-api)
  - [Frontend Client](#frontend-client)
  - [CLI Tool](#cli-tool)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Ozon Protocol is a restaking platform on Solana that allows users to:

- **Restake tokens**: Deposit tokens and receive restaked tokens representing their position
- **Earn rewards**: Generate additional yield through restaking while maintaining liquidity
- **Operate nodes**: Register as operators to provide validation services for AVS
- **Register AVS**: Create and manage Actively Validated Services

The protocol consists of:
- **Solana Programs**: On-chain smart contracts handling restaking logic, operator management, and AVS registration
- **Backend API**: NestJS server providing transaction tracking, authentication, and data aggregation
- **Frontend Dashboard**: React application for users to interact with the protocol
- **CLI Tool**: Command-line interface for operators and AVS managers

## 🏗️ Architecture

```
┌─────────────────┐
│  Frontend (UI)  │ React + Vite + Solana Wallet Adapter
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌─────▼──────────┐
│  Backend API    │  │  Solana Chain  │
│  (NestJS)       │  │  (Smart        │
│                 │  │   Contracts)   │
└────────┬────────┘  └────────────────┘
         │
         │
┌────────▼────────┐
│  Database       │ SQLite (Transaction History)
└─────────────────┘
```

### Key Components

1. **Restaking Program** (`restaking-programs`): Core Solana program handling token deposits, minting restaked tokens, unstaking requests, and reward distribution
2. **AVS Oracle Program** (`avs-oracle`): Program for managing Actively Validated Services and operator participation
3. **API Server**: Tracks on-chain transactions, provides endpoints for frontend, handles JWT authentication
4. **Frontend**: User interface for restaking operations, dashboard, and operator management
5. **CLI**: Tools for operators to register, manage AVS participation, and run operator daemons

## ✨ Features

### For Users (Restakers)
- ✅ Deposit tokens and receive restaked tokens
- ✅ Track restaking positions and rewards
- ✅ Request unstaking with cooldown period
- ✅ Claim unstaked tokens after cooldown
- ✅ Claim rewards from staking activities
- ✅ View transaction history
- ✅ Real-time dashboard with statistics

### For Operators
- ✅ Register as operator with bond staking (minimum 2 SOL)
- ✅ Opt into multiple AVS services
- ✅ Automatic task submission via operator daemon
- ✅ View operator performance and slash status
- ✅ De-register and reclaim bond

### For AVS Owners
- ✅ Register AVS with registration fee (minimum 3 SOL)
- ✅ Create and manage validation tasks
- ✅ Verify operator submissions
- ✅ Slash operators for incorrect submissions
- ✅ Update AVS metadata

## 📁 Project Structure

```
ozon-protocol/
├── api/                          # Backend NestJS API
│   ├── src/
│   │   ├── auth/                 # JWT authentication
│   │   ├── restaking/            # Restaking module (transactions, listeners)
│   │   ├── restaker/             # Restaker service
│   │   ├── config/               # Environment configuration
│   │   └── lib/                  # Database, Solana utilities
│   ├── package.json
│   └── Dockerfile
│
├── client/                       # Frontend React Application
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── features/             # Feature modules
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── restaker-dashboard/  # Restaker dashboard
│   │   │   └── account/          # Account management
│   │   ├── hooks/                # React hooks
│   │   ├── contracts/            # Contract utilities
│   │   └── lib/                  # Utilities
│   └── package.json
│
├── Ozon_web3_contract/           # Solana Smart Contracts
│   ├── programs/
│   │   ├── restaking-programs/   # Main restaking program
│   │   └── avs-oracle/           # AVS oracle program
│   ├── ozon-cli/                 # CLI tool for operators
│   ├── operator-nodes-client/    # Operator node client
│   ├── scripts/                  # Deployment scripts
│   ├── Anchor.toml               # Anchor configuration
│   └── Cargo.toml                # Rust workspace
│
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 16.x and npm/yarn
- **Rust** >= 1.70 and Cargo ([rustup.rs](https://rustup.rs/))
- **Solana CLI** >= 1.18 ([Installation Guide](https://docs.solana.com/cli/install-solana-cli-tools))
- **Anchor Framework** >= 0.31.1 ([Installation Guide](https://www.anchor-lang.com/docs/installation))
- **pnpm** (for client) - `npm install -g pnpm`
- **SQLite3** (usually comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ozon-protocol
   ```

2. **Install Backend Dependencies**
   ```bash
   cd api
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   pnpm install
   ```

4. **Build Smart Contracts**
   ```bash
   cd ../Ozon_web3_contract
   anchor build
   ```

5. **Install CLI Tool** (Optional)
   ```bash
   cd ozon-cli
   cargo install --path .
   ```

### Configuration

#### Backend API Configuration

Create a `.env` file in the `api/` directory:

```env
# Required
WALLET_KEY_PAIR='["your","wallet","keypair","array"]'
RESTAKED_TOKEN_MINT_ADDRESS=YourRestakedTokenMintAddress

# Optional
PORT=8080
APPLICATION_ENVIRONMENT=development
```

#### Frontend Configuration

The frontend reads configuration from environment variables. Create a `.env` file in the `client/` directory if needed:

```env
VITE_API_URL=http://localhost:8080
VITE_SOLANA_CLUSTER=devnet
```

#### Solana Configuration

Set up your Solana wallet:

```bash
# Create a new wallet (if needed)
solana-keygen new --outfile ~/.config/solana/id.json

# Set cluster to devnet for testing
solana config set --url devnet

# Get devnet SOL
solana airdrop 2
```

#### Anchor Configuration

The `Anchor.toml` file contains program IDs. Ensure they match your deployed programs:

```toml
[programs.devnet]
restaking_programs = "2Wvo8b4oF63csMU45z6qHCN9EZ1qV2ifBb3dwnWow6Ub"
avs_oracle = "CmusrUV5ChdfHdTFqHuCHQW8hzqjoawd5YbDQ7km7BS7"
```

## 📦 Components

### Smart Contracts

#### Restaking Program

The core program (`restaking-programs`) handles:

- **Restaking**: Users deposit tokens, receive restaked tokens at an exchange rate
- **Unstaking**: Users request unstake, wait for cooldown, then claim tokens
- **Rewards**: Claim staking rewards from treasury
- **Vault Management**: Track total deposits and manage token vaults

**Key Instructions:**
- `restake(amount)` - Deposit tokens and mint restaked tokens
- `request_unstake(restaked_amount)` - Request unstaking with cooldown
- `claim_unstake()` - Claim unstaked tokens after cooldown
- `claim_rewards()` - Claim accumulated rewards

**Program ID (Devnet):** `2Wvo8b4oF63csMU45z6qHCN9EZ1qV2ifBb3dwnWow6Ub`

#### AVS Oracle Program

Manages Actively Validated Services and operator participation:

- **Operator Registration**: Register operators with bond staking
- **AVS Registration**: Register and manage AVS services
- **Task Management**: Create, submit, verify, and close validation tasks
- **Operator Opt-in**: Operators join AVS services

**Program ID (Devnet):** `CmusrUV5ChdfHdTFqHuCHQW8hzqjoawd5YbDQ7km7BS7`

### Backend API

NestJS-based REST API providing:

**Endpoints:**

- `GET /token-address-config-map` - Get token configuration
- `GET /transactions` - Get transaction history (with pagination)
- `GET /transactions/unstaked-unclaimed/:address` - Get unstaked/unclaimed transactions for an address
- `POST /auth/login` - JWT authentication (if implemented)

**Features:**
- SQLite database for transaction tracking
- Solana transaction listener for real-time updates
- JWT authentication support
- CORS enabled for frontend integration

**Running the API:**

```bash
cd api

# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Frontend Client

React + Vite application with Solana wallet integration.

**Key Features:**
- Wallet connection (Phantom, Solflare, etc.)
- Restaking interface
- Dashboard with statistics
- Transaction history
- Operator dashboard (for operators)
- Real-time updates

**Running the Frontend:**

```bash
cd client

# Development mode
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

**Technology Stack:**
- React 19
- Vite
- TypeScript
- Tailwind CSS
- @solana/wallet-adapter
- @coral-xyz/anchor
- React Router
- TanStack Query

### CLI Tool

The `ozon-cli` provides command-line tools for operators and AVS managers.

**Installation:**

```bash
cd Ozon_web3_contract/ozon-cli
cargo install --path .
```

**Key Commands:**

```bash
# Operator Management
ozon-cli initialize-operator --bond-amount 2000000000 --metadata "My Operator"
ozon-cli de-register-operator

# AVS Management
ozon-cli register-avs --metadata "My AVS" --registration-fee 3000000000
ozon-cli opt-in-avs --avs-owner <AVS_OWNER_PUBKEY>

# Task Management (AVS Owners)
ozon-cli create-task --task-id 1 --submission-deadline-slots 1200
ozon-cli verify-task --task-pubkey <TASK_PUBKEY> --operator-owner <OPERATOR>

# Operator Daemon
ozon-cli run-operator --poll-interval-seconds 10
```

For detailed CLI documentation, see [Ozon CLI README](Ozon_web3_contract/ozon-cli/README.md)

## 💻 Development

### Running Locally

1. **Start the API server**
   ```bash
   cd api
   npm run start:dev
   ```

2. **Start the frontend**
   ```bash
   cd client
   pnpm dev
   ```

3. **Deploy contracts to localnet** (if testing contracts)
   ```bash
   cd Ozon_web3_contract
   anchor localnet
   anchor build
   anchor deploy
   ```

### Testing

**Backend Tests:**
```bash
cd api
npm run test
npm run test:e2e
npm run test:cov
```

**Contract Tests:**
```bash
cd Ozon_web3_contract
anchor test
```

### Database

The API uses SQLite for transaction storage. The database is initialized automatically on first run via `src/lib/init-db.ts`.

**Location:** `api/restaking.db` (created automatically)

## 🚢 Deployment

### Smart Contracts

**Deploy to Devnet:**
```bash
cd Ozon_web3_contract
anchor build
anchor deploy --provider.cluster devnet
```

**Deploy to Mainnet:**
⚠️ **Warning**: Mainnet deployments are not live yet. Test thoroughly on devnet first.

```bash
anchor deploy --provider.cluster mainnet
```

### Backend API

**Using Docker:**
```bash
cd api
docker build -t ozon-api .
docker run -p 8080:8080 --env-file .env ozon-api
```

**Manual Deployment:**
```bash
cd api
npm run build
npm run start:prod
```

### Frontend

Build and deploy to your hosting provider:

```bash
cd client
pnpm build
# Deploy the 'dist' folder to your hosting service
```

## 🔐 Security Considerations

- **Wallet Security**: Never commit private keys or keypairs to version control
- **Environment Variables**: Use secure environment variable management in production
- **Rate Limiting**: Implement rate limiting on API endpoints in production
- **Input Validation**: All user inputs are validated on both frontend and backend
- **Smart Contract Audits**: Contracts should be audited before mainnet deployment

## 📚 Additional Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- [Solana Explorer](https://explorer.solana.com/)
- [Ozon CLI Documentation](Ozon_web3_contract/ozon-cli/README.md)
- [Operator Nodes Client README](Ozon_web3_contract/operator-nodes-client/README.md)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache-2.0 License - see the LICENSE file for details.


## ⚠️ Disclaimer

**This project is currently in active development. Mainnet deployments are not live yet. Please use devnet for testing and development purposes only.**

## 🆘 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact: bristin@wildventures.games

---

**Made with ❤️ by the Ozon Team**


