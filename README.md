# AŦHEUM Mainnet Deployer

A browser-wallet deployment console for the upgradeable AŦHEUM token on Ethereum Mainnet.

## Token behavior

- Fixed supply of `999,999,999,999,999,999 AŦH`, minted once to the deployer
- 10% transfer fee, initially paid to the deployer (the fee-recipient wallet is exempt when sending)
- No public or owner minting function
- Pausable transfers and burn support
- EIP-2612 permit support
- UUPS upgrades authorized by the two-step owner

## Local development

```bash
npm install
npm run dev
```

`npm run build` compiles the contracts before building the static deployment console. The deployment page only accepts Ethereum Mainnet (chain ID 1) and requires two wallet transactions: the implementation followed by the initialized proxy. The proxy address shown at completion is the canonical token address.

Review and independently audit the contracts before deploying production funds. Never enter a seed phrase or private key into this site.
