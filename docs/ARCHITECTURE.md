# ACiD Architecture

This doc explains how ACiD works under the hood. If you're contributing, start here.

---

## Overview

ACiD is an Ethereum Layer 2 built on the [OP Stack](https://github.com/ethereum-optimism/optimism). We're a fork, not a fork with heavy modifications. The goal is to stay close to upstream while adding our own flavor.

```
┌─────────────────────────────────────────────────────────┐
│                    Ethereum L1                          │
│                   (Settlement Layer)                    │
└─────────────────────────┬───────────────────────────────┘
                          │
                          │ Batch submissions
                          │ State commitments
                          │ Fraud proofs
                          │
┌─────────────────────────▼───────────────────────────────┐
│                      ACiD L2                            │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   op-node   │  │   op-geth   │  │  op-batcher │     │
│  │ (consensus) │  │ (execution) │  │  (submitter)│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │ op-proposer │  │   Bridge    │                      │
│  │   (state)   │  │  Contracts  │                      │
│  └─────────────┘  └─────────────┘                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Core Components

### op-node (Consensus Client)

The brain. Derives the L2 chain from L1 data.

- Reads L1 blocks for deposit transactions
- Produces L2 block payloads
- Communicates with op-geth via Engine API

**Key files:**
```
op-node/
├── rollup/      # Core derivation logic
├── node/        # Node implementation
└── p2p/         # Peer-to-peer networking
```

### op-geth (Execution Client)

Modified go-ethereum for L2 execution.

- Executes transactions
- Maintains state
- Processes blocks from op-node

**Key files:**
```
op-geth/
├── core/        # Block processing
├── eth/         # Ethereum protocol
└── miner/       # Block building (sequencer mode)
```

### op-batcher (Batch Submitter)

Compresses and submits L2 data to L1.

- Batches transactions
- Compresses with zlib/brotli
- Submits to L1 as calldata (or blobs post-Dencun)

**Key files:**
```
op-batcher/
├── batcher/     # Batching logic
└── compressor/  # Compression
```

### op-proposer (State Proposer)

Proposes L2 state roots to L1.

- Submits output roots periodically
- Enables withdrawals after challenge period

**Key files:**
```
op-proposer/
└── proposer/    # Proposal logic
```

### Bridge Contracts

L1 contracts that enable deposits/withdrawals.

- `OptimismPortal` — Entry point for deposits
- `L2OutputOracle` — Stores state roots
- `CrossDomainMessenger` — Message passing

---

## Data Flow

### Deposits (L1 → L2)

```
User → L1 OptimismPortal → L1 Block → op-node derives → L2 Transaction
```

1. User calls `depositTransaction()` on L1
2. Event emitted in L1 block
3. op-node reads L1, includes deposit in L2 block
4. op-geth executes the deposit

### Withdrawals (L2 → L1)

```
User → L2 Transaction → Batch to L1 → Wait for finality → Prove → Claim
```

1. User initiates withdrawal on L2
2. op-batcher includes in L1 batch
3. Wait for challenge period (~7 days)
4. User proves withdrawal on L1
5. User claims funds

### Transaction Flow

```
User → Sequencer (op-geth) → op-node → op-batcher → L1
```

1. User submits tx to sequencer RPC
2. op-geth executes, includes in block
3. op-node validates block
4. op-batcher batches and submits to L1

---

## ACiD-Specific Modifications

We keep modifications minimal:

| Component | Modification | Reason |
|-----------|--------------|--------|
| Chain ID | Custom chain ID | Identity |
| Genesis | Custom genesis config | Network params |
| Branding | Names, logos in explorer | Vibes |
| (Future) | AI agent endpoints | x402 thesis |

**Philosophy:** Stay close to upstream. Don't fork and diverge. Pull updates easily.

---

## Directory Structure

```
acid/
├── .github/              # CI, templates
├── docs/                 # Documentation
├── contracts/            # L1 bridge contracts (submodule or fork)
├── op-node/              # Consensus client (submodule or fork)
├── op-geth/              # Execution client (submodule or fork)
├── op-batcher/           # Batch submitter
├── op-proposer/          # State proposer
├── packages/
│   ├── bridge-ui/        # Frontend for bridging
│   └── explorer/         # Block explorer customization
├── ops/
│   ├── docker/           # Docker configurations
│   ├── kubernetes/       # K8s manifests (if needed)
│   └── scripts/          # Deployment scripts
└── configs/
    ├── devnet/           # Local development
    ├── testnet/          # Sepolia testnet
    └── mainnet/          # Production (eventually)
```

---

## Running Locally

### Prerequisites

- Go 1.21+
- Node.js 18+
- Docker
- Make

### Quick Start

```bash
# Clone with submodules
git clone --recursive https://github.com/[org]/acid.git
cd acid

# Build everything
make build

# Start local devnet
make devnet-up

# Check logs
make devnet-logs

# Stop
make devnet-down
```

### Manual Setup

```bash
# 1. Start L1 (local Ethereum)
make l1-up

# 2. Deploy contracts
make deploy-contracts

# 3. Start op-geth
make op-geth-up

# 4. Start op-node
make op-node-up

# 5. Start batcher
make batcher-up
```

---

## Configuration

### Chain Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Chain ID | TBD | Unique identifier |
| Block Time | 2s | Same as Base |
| Gas Limit | 30M | Per block |
| Base Fee | 1 gwei | Minimum |

### Environment Variables

```bash
# L1 Connection
L1_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/xxx
L1_CHAIN_ID=1

# Sequencer
SEQUENCER_PRIVATE_KEY=0x...
SEQUENCER_L2_RPC=http://localhost:8545

# Batcher
BATCHER_PRIVATE_KEY=0x...
BATCH_INBOX_ADDRESS=0x...
```

---

## Security Model

### Optimistic Rollup

- All transactions assumed valid by default
- 7-day challenge window for fraud proofs
- If fraud proven, state reverts

### Trust Assumptions

| Component | Trust Level | Notes |
|-----------|-------------|-------|
| Sequencer | Trusted | Can censor, not steal |
| Batcher | Trusted | Must submit batches |
| L1 | Trustless | Ethereum security |
| Fraud Proofs | Trustless | Anyone can challenge |

### Upgrade Paths

Initially: Multisig controlled upgrades
Future: Security council → DAO governance

---

## Resources

### OP Stack Docs
- [Getting Started](https://docs.optimism.io/stack/getting-started)
- [Rollup Protocol](https://docs.optimism.io/stack/protocol/overview)
- [Fault Proofs](https://docs.optimism.io/stack/protocol/fault-proofs/overview)

### Codebases
- [optimism monorepo](https://github.com/ethereum-optimism/optimism)
- [op-geth](https://github.com/ethereum-optimism/op-geth)

### Base (Reference)
- [Base Docs](https://docs.base.org/)
- [Base Architecture](https://www.coinbase.com/developer-platform/discover/protocol-guides/guide-to-base)

---

## Questions?

Open an issue with the `architecture` or `question` label.

---

<p align="center">
  <i>Simple systems are reliable systems.</i>
</p>
