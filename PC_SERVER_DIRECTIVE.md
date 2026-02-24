# ACiD Server PC — Claude Directive

> **This file is the source of truth for any Claude session running on the ACiD server PC.**
> Read this ENTIRELY before touching ANYTHING.

**Last updated:** 2026-02-24
**Written by:** Claude Opus (Mac session) + Ryan

---

## Hardware

| Component | Spec | Notes |
|-----------|------|-------|
| CPU | Intel i7-2700k (Sandy Bridge) | 4C/8T, 3.5GHz base / 3.9GHz turbo. Old but sufficient. |
| RAM | 32 GB DDR3 | Shared between OS, ACiD node, and LLM/TTS agent |
| GPU | NVIDIA RTX 5060 Ti (16 GB VRAM) | CUDA. For LLM inference + TTS. NOT for blockchain. |
| OS | Windows 10 (ESA via Microsoft) | Use WSL2 for Linux workloads OR Docker Desktop |
| Role | **Dedicated 24/7 server** — ACiD backbone + AI TTS agent |

**This is NOT a development machine. This is production infrastructure. Treat it accordingly.**

---

## What Runs On This PC

This machine runs TWO independent workloads that use different hardware resources:

### Workload 1: ACiD L2 Node (CPU + System RAM)

The backbone of the ACiD blockchain. This is the sequencer — the single node that processes all transactions until the network grows.

| Component | What It Does | Expected RAM |
|-----------|-------------|-------------|
| **op-geth** | Execution client — processes transactions, maintains state | 2-4 GB |
| **op-node** | Consensus client — derives L2 chain from L1 (Sepolia) data | 1-2 GB |
| **op-batcher** | Compresses and submits L2 data to L1 | ~500 MB |
| **op-proposer** | Proposes L2 state roots to L1 | ~500 MB |
| **Blockscout + PostgreSQL** | Block explorer | 2-4 GB |
| **Subtotal** | | **~6-10 GB** |

### Workload 2: TTS Agent + LLM (GPU VRAM + some System RAM)

A 24/7 AI-powered TTS agent that will sell SaaS to enterprise. Runs entirely on the GPU.

| Component | System RAM | VRAM |
|-----------|-----------|------|
| LLM server (llama.cpp / vLLM) | 2-4 GB | 8-14 GB (model dependent) |
| TTS engine | 1-3 GB | 1-4 GB (if GPU-accelerated) |
| Agent orchestration | ~500 MB | — |
| **Subtotal** | **~4-7 GB** | **~10-16 GB** |

### Resource Budget

```
SYSTEM RAM (32 GB):
├── Windows + WSL2 overhead    ~3-4 GB
├── ACiD node stack            ~6-10 GB
├── LLM/TTS agent (CPU side)   ~4-7 GB
├── TOTAL USED                 ~13-21 GB
└── HEADROOM                   ~11-19 GB ✅ Comfortable

GPU VRAM (16 GB):
├── LLM model (quantized)      ~5-10 GB (pick model carefully)
├── TTS model                   ~1-4 GB
├── TOTAL USED                  ~6-14 GB
└── HEADROOM                    ~2-10 GB (depends on model choice)
```

**Why this works:** The blockchain stack (CPU-bound) and AI stack (GPU-bound) live in different hardware lanes. They don't compete for resources.

---

## ACiD Network Configuration

**DO NOT CHANGE THESE VALUES.** They are deployed and live on Sepolia.

| Parameter | Value |
|-----------|-------|
| **Chain ID** | `1714` |
| **Chain Name** | ACiD Testnet |
| **Block Time** | 2 seconds |
| **Gas Limit** | 60,000,000 |
| **L1 Network** | Sepolia (`11155111`) |
| **Batch Inbox** | `0x0056f135b647ee0107935f102ea36da530ed084f` |

### L1 Contract Addresses (Sepolia) — DEPLOYED 2026-01-06

```
OptimismPortalProxy:              0x6f567a4640d5826165f5f962f2af38e0384e6944
SystemConfigProxy:                0x57326a91c6a14af4bfcf1eee72bb7143a756b14b
L1StandardBridgeProxy:            0x0695e4b6632844a871a8ffdc693cb3e2b5563743
L1CrossDomainMessengerProxy:      0xd03af6399bdb060e7689e5e15a6368513d5817f2
L1ERC721BridgeProxy:              0x346312a1a2aa1922c0595041b4d7dff3547ff781
OptimismMintableERC20FactoryProxy: 0x7734534786cd54311566de669a1a7e39020e9a0f
DisputeGameFactoryProxy:          0xc9b61359a4825f73b2729bc95b31dc37b11d7458
AnchorStateRegistryProxy:         0xc59e2c333d846586cbb4c86dba8f267da2633ea5
AddressManager:                   0xc402eef0e66b4efd800e414f2b6754f5775b9e88
```

### Superchain Contracts

```
SuperchainConfigProxy:   0xc2be75506d5724086deb7245bd260cc9753911be
ProtocolVersionsProxy:   0x79add5713b383daa0a138d3c4780c7a1804a8090
OPContractsManager:      0xc69e4c24db479191676611a25d977203c3bdca62
```

### Operator Roles (Keys)

```
Deployer:            0xb03884A8c5bB132379173E459dDBD7cfE3f93eFbd
L1 Proxy Admin:      0x874F4b715E849A0Ae44Ea618494b4E6785c21ec0
L2 Proxy Admin:      0x7792B6Cb5d04Fe2aF4814564bc062Cd68Eba07Ea
System Config Owner: 0x73f3955dF7328Fc8f182dd0d8117E34fD3B72DC6
Challenger:          0x777be39eaFabf7Cb231CA343860405C6b7AA308f
Batcher:             0xBc6964904D146025BDE841B456A5366E242246F8
Proposer:            0x3DfF14508Daf6655926f8AE768aA88CD8D9c33E4
Unsafe Block Signer: 0xd491A633ad0CA497460CC8564d0f820db3CE9623
```

### Rollup Config

Full rollup config is in the ACiD repo at `network-config/rollup.json`. Copy it to this machine. Do not modify it.

---

## Architecture: Two Machines, One Ecosystem

```
┌──────────────────────────────────────┐
│  Mac Mini M4 Pro (48 GB)             │
│  ─────────────────────────           │
│  • Development + Claude sessions     │
│  • MLX models (GLM, Qwen3-VL)       │
│  • NoClaw (digital twin)             │
│  • All web apps (PM2)                │
│  • YouTube livestream (ffmpeg)        │
│  • ACiD frontend development         │
│  • Bridge UI, landing page           │
└──────────────┬───────────────────────┘
               │ Local network / CF Tunnel
┌──────────────▼───────────────────────┐
│  ACiD Server PC (32 GB + 5060 Ti)    │
│  ─────────────────────────           │
│  • op-geth (execution)          CPU  │
│  • op-node (consensus)          CPU  │
│  • op-batcher (batch submit)    CPU  │
│  • op-proposer (state roots)    CPU  │
│  • Blockscout + PostgreSQL      CPU  │
│  • LLM inference server         GPU  │
│  • TTS engine                   GPU  │
│  • AI TTS Agent orchestration   CPU  │
└──────────────────────────────────────┘

Also in the fleet (separate machine):
┌──────────────────────────────────────┐
│  Image Gen PC (3070 Ti 8 GB)         │
│  ─────────────────────────           │
│  • FLUX batch image generation       │
│  • Claw game asset pipeline          │
│  • DO NOT run ACiD or TTS here       │
└──────────────────────────────────────┘
```

---

## Rules for Claude on This PC

### Memory Safety

1. **CHECK RAM before starting anything heavy:** `wmic OS get FreePhysicalMemory` (Windows) or `free -h` (WSL2)
2. **If free RAM < 4 GB → STOP.** Tell Ryan. Do not proceed.
3. **NEVER load a second LLM model while one is already loaded** — 16 GB VRAM is a hard ceiling
4. **NEVER restart op-geth and the LLM server at the same time** — stagger by 60 seconds minimum
5. **Monitor GPU memory:** `nvidia-smi` — if VRAM usage > 14 GB, something is wrong

### Blockchain Safety

6. **NEVER modify deployed contract addresses** — they are on-chain and immutable
7. **NEVER change rollup.json parameters** — mismatches will fork the chain or halt it
8. **NEVER expose private keys in logs, configs, or committed files**
9. **op-geth data directory is SACRED** — losing it means resyncing from genesis
10. **If op-geth crashes, check disk space FIRST** — state growth eats storage over time

### General

11. **This machine runs 24/7.** Restarts must be coordinated with Ryan.
12. **WSL2 is the preferred environment** for all Linux tooling (Go, Docker, etc.)
13. **Use CUDA/llama.cpp for inference** — NOT MLX (that's Apple Silicon only)
14. **GGUF format is acceptable here** (banned on Mac because MLX native is faster there — CUDA uses GGUF natively)
15. **Quantization: 4-bit is OK for VRAM-constrained setups on this machine** (banned on Mac for quality — here it's a practical necessity to fit in 16 GB)

### Networking

16. **The Mac connects to this PC's services via local network or Cloudflare tunnel**
17. **Each service gets its own tunnel** (per Ryan's global rules — never jam multiple hostnames into one tunnel config)
18. **Expose RPC endpoint for public testnet via tunnel** — this is how external users interact with ACiD
19. **Blockscout gets its own tunnel and subdomain**

---

## Startup Order

When booting or restarting the server, follow this order:

```
1. PostgreSQL                    (Blockscout dependency)
2. op-geth                       (execution — needs time to initialize)
   └── Wait 30s, verify with: curl -s http://localhost:8545 -X POST \
       -H "Content-Type: application/json" \
       -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
       → Should return 0x6b2 (1714 in hex)
3. op-node                       (consensus — connects to op-geth + Sepolia L1)
   └── Wait 30s, check logs for "Syncing" or "Sequencing"
4. op-batcher                    (batch submission — needs op-node healthy)
5. op-proposer                   (state proposals — needs op-node healthy)
6. Blockscout                    (explorer — needs op-geth RPC + PostgreSQL)
7. LLM server (llama.cpp/vLLM)  (GPU — check nvidia-smi after loading)
   └── Wait 30s, verify VRAM usage
8. TTS engine                    (GPU — only after LLM is stable)
9. Agent orchestration           (last — needs both LLM and TTS ready)
```

**NEVER skip the waits. NEVER start steps 7-9 before 2-6 are healthy.**

---

## Model Selection Guide (16 GB VRAM Budget)

For the TTS agent's LLM, pick models that leave room for TTS:

| Model | VRAM | Quality | Leaves for TTS |
|-------|------|---------|----------------|
| Qwen3-8B Q4_K_M | ~5 GB | Good | ~11 GB |
| Qwen3-14B Q4_K_M | ~9 GB | Great | ~7 GB |
| Qwen3-8B Q8_0 | ~9 GB | Better than Q4 | ~7 GB |
| Qwen3-14B Q8_0 | ~16 GB | Best | **0 GB — won't fit with TTS** |

**Recommendation:** Qwen3-8B Q8_0 or Qwen3-14B Q4_K_M. Both leave ~7 GB for TTS which is plenty.

**Banned on Mac, allowed here:**
- GGUF format ✅ (CUDA native)
- 4-bit quantization ✅ (VRAM necessity)

---

## Sepolia L1 RPC

op-node needs a Sepolia RPC to derive the L2 chain. Options:

1. **Alchemy free tier** — 300M compute units/month (usually enough for low-traffic testnet)
2. **Infura free tier** — 100K requests/day
3. **QuickNode free tier** — reasonable limits
4. **Self-hosted Sepolia node** — overkill for testnet, save for mainnet

Set via environment variable: `L1_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

---

## Disaster Recovery

| Scenario | Action |
|----------|--------|
| op-geth won't start | Check disk space. Check if port 8545 is occupied. Check data dir integrity. |
| Chain halted (no new blocks) | Check op-node logs → is it connected to L1? Check Sepolia RPC quota. |
| Batches not posting | Check op-batcher logs → batcher wallet needs Sepolia ETH for gas. |
| GPU OOM | `nvidia-smi` → check what's loaded. Kill and restart one model at a time. |
| Full system freeze | Hard reboot. Follow startup order above. Check op-geth data dir integrity. |
| L1 RPC rate limited | Switch to backup RPC provider. Keep 2-3 configured. |

---

## What This PC Does NOT Do

- **NOT for development** — develop on the Mac, deploy here
- **NOT for image generation** — that's the 3070 Ti machine
- **NOT for MLX anything** — MLX is Apple Silicon only
- **NOT for running NoClaw** — NoClaw lives on the Mac
- **NOT disposable** — this machine holds the chain state and the sequencer keys

---

## Connection to the Bigger Picture

ACiD is an L2 that exists because Base exists. This PC is the beating heart of that chain.

The TTS agent running alongside it is a SaaS product that sells to enterprise. Both workloads coexist because they use different hardware — blockchain on CPU, AI on GPU.

Eventually, the claw game (running FLUX on the 3070 Ti machine) will deploy on ACiD too — full circle. But that's future state. Right now: keep the chain alive, keep the agent running, keep it stable.

**Ryan's vision:** Humans and AI building together. This server is proof of concept — an AI agent and a blockchain running side by side on a single machine, both serving real users. That's the thesis made physical.

---

*If you're a Claude reading this: you are operating production infrastructure. Be careful. Be precise. Ask Ryan before making changes. A question is always better than a crash.*
