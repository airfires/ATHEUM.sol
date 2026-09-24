require("@nomicfoundation/hardhat-ethers");
module.exports = { solidity: { version: "0.8.22", settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "paris" } }, paths: { sources: "./contracts", artifacts: "./src/artifacts", cache: "./.hardhat-cache" } };
