# Contributing to ACiD

First off — you're here. That's the filter. Welcome.

This isn't a corporate open source project with 47-page contribution guidelines. We keep it simple.

---

## The Vibe

Before you write any code, understand the vibe:

```
- We ship, we don't hype
- We underpromise, occasionally deliver
- We're a meme that works
- We root for Base, not against them
- If you're not having fun, take a break
```

---

## How to Contribute

### 1. Find Something to Work On

Browse [Issues](../../issues) for tasks labeled:

| Label | Meaning |
|-------|---------|
| `good-first-issue` | Perfect for newcomers |
| `help-wanted` | We need hands on this |
| `protocol` | OP Stack / node work |
| `contracts` | Solidity |
| `frontend` | Bridge UI, explorer |
| `docs` | Documentation |
| `vibes` | Creative, branding, memes |

**Don't see something you want to work on?** Open an issue. Describe what you want to build. If it fits, we'll tag it.

### 2. Claim an Issue

Comment on the issue: "I'm on this."

That's it. No forms. No approval process. Just claim it and start.

If you go quiet for 2 weeks, we'll assume you got busy and unassign. No shame — life happens.

### 3. Do the Work

```bash
# Fork the repo
git clone https://github.com/[your-username]/acid.git
cd acid

# Create a branch
git checkout -b feature/your-thing

# Do your thing
# ...

# Commit with clear messages
git commit -m "Add bridge UI skeleton"

# Push and open a PR
git push origin feature/your-thing
```

### 4. Open a Pull Request

Use the PR template. Keep it simple:

- What does this do?
- How do I test it?
- Anything reviewers should know?

---

## Code Standards

### General

- **Keep it simple** — Don't over-engineer
- **Make it work first** — Optimize later (maybe never)
- **Match the existing style** — When in doubt, look at surrounding code
- **No unnecessary dependencies** — Every dep is a liability

### Commit Messages

Be clear. Be concise.

```
Good:
- "Add bridge deposit function"
- "Fix gas estimation for L1 batches"
- "Update README with testnet info"

Bad:
- "Fixed stuff"
- "WIP"
- "asdfasdf"
```

### Pull Requests

- One PR = one thing
- Keep diffs small when possible
- Include tests if you're touching critical paths
- Screenshots for UI changes

---

## What We're Looking For

### Protocol (Go, OP Stack)

- Experience running nodes
- Familiarity with op-node, op-geth, op-batcher
- Bonus: Contributed to Optimism/Base before

### Smart Contracts (Solidity)

- Bridge contract experience
- Understanding of L1 ↔ L2 messaging
- Security mindset

### Frontend (React/Next.js)

- Clean, functional UI
- Web3 integrations (wagmi, viem, etc.)
- Doesn't have to be pretty at first — functional > beautiful

### Design

This project was founded by someone with ~30 years in art/production. Visuals aren't an afterthought here.

- Psychedelic meets minimal
- The "i" in ACiD is a seeing eye 👁 or droplet 💧
- Read [BRANDING.md](./docs/BRANDING.md)
- We believe visual inspiration makes better builders

### Vibes

- Meme creation
- Community energy
- Twitter game
- If you've got reach, we've got content

---

## What We're NOT Looking For

- Mass refactors without discussion
- "Improvements" nobody asked for
- Token/airdrop/incentive suggestions
- Drama

---

## Communication

For now, keep it async:

- **Issues** — For tasks and bugs
- **PRs** — For code review
- **Discussions** — For ideas and questions

No Discord yet. Maybe Telegram later. We're keeping it lean.

---

## Recognition

Contributors will be recognized in:

- The README contributors section
- Git history (obviously)
- $ACiD allocation for early contributors (details TBD)

We don't forget the people who showed up early.

---

## Questions?

Open an issue with the `question` label. We'll get to it.

---

<p align="center">
  <i>The best code is written by people who get the joke.</i>
</p>
