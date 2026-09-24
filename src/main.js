import { BrowserProvider, ContractFactory, Interface } from "ethers";
import tokenArtifact from "./artifacts/contracts/ATHEUM.sol/ATHEUM.json";
import proxyArtifact from "./artifacts/contracts/ATHEUMProxy.sol/ATHEUMProxy.json";
import "./style.css";

const MAINNET = 1n;
const TOKEN_OWNER = "0x624953da93414ddA6A137898bA36A4EdF2f952C3";
const EXISTING_TOKEN = "0x45895179ef934fc08e5e3cc43b70cb32bbd6e3f2";
document.querySelector("#app").innerHTML = `
<main><nav class="masthead"><a class="wordmark" href="#">AŦH<span>—01</span></a><div class="network"><i></i> ETHEREUM MAINNET</div></nav>
<section class="hero"><div class="eyebrow">GENESIS DEPLOYMENT / FIXED SUPPLY</div><h1>A TOKEN<br><em>CAST IN</em><br>PUBLIC.</h1><p class="lede">Deploy AŦHEUM from your own wallet. Ownership and the complete supply go directly to the designated recipient. No keys leave the browser.</p><svg class="orbit" viewBox="0 0 420 420" aria-hidden="true"><circle cx="210" cy="210" r="162"/><circle cx="210" cy="210" r="104"/><path d="M48 210h324M210 48v324"/><text x="210" y="228">AŦH</text></svg></section>
<section class="console"><div class="console-head"><p>DEPLOYMENT CONSOLE</p><span>PROTOCOL 01</span></div><div class="console-grid"><div><h2>One deliberate act.</h2><p class="explain">Your wallet deploys an implementation, then its initialized UUPS proxy. A new canonical token address is generated automatically.</p><ol class="steps"><li data-step="wallet"><b>01</b><span>Connect deployer</span><small>Signs & pays gas</small></li><li data-step="implementation"><b>02</b><span>Deploy logic</span><small>Wallet confirmation</small></li><li data-step="proxy"><b>03</b><span>Initialize proxy</span><small>New token address</small></li></ol></div><aside><dl><div><dt>Supply</dt><dd>999,999,999,999,999,999</dd></div><div><dt>Owner / recipient</dt><dd>0x6249…52C3</dd></div><div><dt>Transfer tax</dt><dd>10%</dd></div><div><dt>Minting</dt><dd>Disabled</dd></div><div><dt>Upgrade pattern</dt><dd>UUPS</dd></div><div><dt>Existing token</dt><dd><a class="inline-link" href="https://etherscan.io/address/${EXISTING_TOKEN}#code" target="_blank" rel="noopener noreferrer">0x4589…e3f2 ↗</a></dd></div></dl><button id="deploy">CONNECT WALLET</button><p id="status" class="status" role="status">Ready to generate a new contract address.</p><a id="result" class="result" target="_blank" rel="noopener noreferrer"></a></aside></div></section>
<footer><span>VERIFY BEFORE YOU SIGN</span><p>Production deployment is irreversible. Confirm the network, bytecode, gas estimate, and wallet prompts.</p></footer></main>`;

const button = document.querySelector("#deploy"), status = document.querySelector("#status"), result = document.querySelector("#result");
let busy = false;
const setStatus = (message, tone = "") => { status.textContent = message; status.dataset.tone = tone; };
const mark = step => document.querySelector(`[data-step="${step}"]`)?.classList.add("done");

button.addEventListener("click", async () => {
  if (busy) return;
  if (!window.ethereum) return setStatus("No browser wallet found. Install a compatible Ethereum wallet.", "error");
  busy = true; button.disabled = true; result.textContent = "";
  try {
    const provider = new BrowserProvider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    if ((await provider.getNetwork()).chainId !== MAINNET) {
      setStatus("Switching wallet to Ethereum Mainnet…");
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x1" }] });
      if ((await provider.getNetwork()).chainId !== MAINNET) throw new Error("Ethereum Mainnet is required.");
    }
    const signer = await provider.getSigner();
    const deployer = await signer.getAddress();
    if (deployer.toLowerCase() !== TOKEN_OWNER.toLowerCase()) {
      throw new Error(`Connect the designated creator wallet ${TOKEN_OWNER}.`);
    }
    mark("wallet");
    setStatus("Confirm implementation deployment in your wallet…");
    const implementation = await new ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, signer).deploy();
    setStatus("Waiting for implementation confirmation…"); await implementation.waitForDeployment(); mark("implementation");
    const initialization = new Interface(tokenArtifact.abi).encodeFunctionData("initialize", [TOKEN_OWNER]);
    setStatus("Confirm proxy deployment and initialization…");
    const proxy = await new ContractFactory(proxyArtifact.abi, proxyArtifact.bytecode, signer).deploy(await implementation.getAddress(), initialization);
    setStatus("Waiting for the mainnet proxy confirmation…");
    const receipt = await proxy.deploymentTransaction().wait(), address = await proxy.getAddress(); mark("proxy");
    setStatus(`Deployed in block ${receipt.blockNumber}.`, "success");
    result.href = `https://etherscan.io/address/${address}`; result.textContent = `VIEW ${address.slice(0, 8)}…${address.slice(-6)} ON ETHERSCAN ↗`; button.textContent = "DEPLOYED";
  } catch (error) {
    setStatus((error?.shortMessage || error?.reason || error?.message || "Deployment was cancelled.").replace(/^execution reverted: /, ""), "error");
    button.disabled = false; button.textContent = "TRY AGAIN";
  } finally { busy = false; }
});
