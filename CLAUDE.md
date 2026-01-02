# ACiD

> Bringing balance to web3. If there's Base, there must be Acid.

## Project Overview

ACiD is an Ethereum Layer 2 blockchain forked from the OP Stack - the same foundation that powers Base (Coinbase's L2). The name plays on pH chemistry: Base chain exists, so ACiD restores equilibrium.

**Backronym:** Artificial Crypto intelligence Development

## Tech Stack

- **Foundation**: OP Stack (MIT licensed, same as Base)
- **Consensus**: Optimistic Rollup with fraud proofs
- **Execution**: EVM-compatible (op-geth)
- **Data Availability**: Ethereum L1 (with option for Celestia)
- **Block Time**: 2 seconds (target: 200ms with Flashblocks-style upgrade)

## Repository Structure

```
/contracts      # L1 bridge and system contracts
/op-node        # Consensus client
/op-geth        # Execution client
/op-batcher     # Batch submitter
/op-proposer    # State proposer
/ops            # Infrastructure and deployment
/docs           # Documentation
```

## Development Commands

```bash
# Build all components
make build

# Run local devnet
make devnet-up

# Run tests
make test

# Deploy contracts
make deploy-contracts
```

## Vibe

- We're a meme that works
- Underpromise, occasionally deliver
- No roadmap, no whitepaper, no promises
- Ship first, hype never
- The lowercase `i` in ACiD is intentional (seeing eye / droplet)

## Contributing

1. Read the [PRD](./PRD.md)
2. Check [CONTRIBUTING.md](./CONTRIBUTING.md)
3. Find an issue that speaks to you
4. Ship it

## Resources

- [OP Stack Documentation](https://docs.optimism.io/stack/getting-started)
- [Optimism GitHub](https://github.com/ethereum-optimism/optimism)
- [Base Architecture Reference](https://www.coinbase.com/developer-platform/discover/protocol-guides/guide-to-base)
