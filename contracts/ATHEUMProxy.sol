// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
contract ATHEUMProxy is ERC1967Proxy {
    constructor(address implementation, bytes memory initialization) ERC1967Proxy(implementation, initialization) {}
}
