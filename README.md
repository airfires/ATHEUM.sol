# AŦHEUM Mainnet Deployer

A browser-wallet deployment console for the upgradeable AŦHEUM token on Ethereum Mainnet.

## Token behavior

- Fixed supply of `999,999,999,999,999,999 AŦH`, minted once to `0x624953da93414ddA6A137898bA36A4EdF2f952C3`
- 10% transfer fee, initially paid to that recipient (the fee-recipient wallet is exempt when sending)
- No public or owner minting function
- Pausable transfers and burn support
- EIP-2612 permit support
- UUPS upgrades authorized by the two-step owner

## Local development

```bash
npm install
npm run dev
```

`npm run build` compiles the contracts before building the static deployment console. The deployment page only accepts Ethereum Mainnet (chain ID 1) and requires two wallet transactions: the implementation followed by the initialized proxy. It only permits `0x624953da93414ddA6A137898bA36A4EdF2f952C3` to deploy, making that wallet the on-chain creator, owner, supply recipient, and initial fee recipient. The proxy address shown at completion is the canonical token address.

The console includes `0x45895179ef934fc08e5e3cc43b70cb32bbd6e3f2` as an existing-token reference. A new deployment does not reuse that address: Ethereum generates a new implementation address and a new canonical proxy address, which the console links on Etherscan after confirmation.

Review and independently audit the contracts before deploying production funds. Never enter a seed phrase or private key into this site.
