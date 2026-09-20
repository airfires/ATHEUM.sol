// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract ATHEUM is ERC20, ERC20Burnable, ERC20Capped, ERC20Pausable, ERC20Permit, Ownable2Step {
    uint256 private constant INITIAL_SUPPLY = 999_999_999_999_999_999 * 10 ** 18;
    uint256 private constant MAX_SUPPLY = 1_000_000_000_000_000_000 * 10 ** 18;
    uint256 public constant MAX_FEE_BPS = 300;
    uint256 private _feeBps;
    address private _feeRecipient;

    event Mint(address indexed to, uint256 amount);
    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);

    error ZeroAddress();
    error FeeTooHigh(uint256 provided, uint256 max);
    error ExceedsMaxSupply(uint256 requested, uint256 remaining);

    constructor(address initialOwner)
        ERC20(unicode"AŦHEUM", unicode"AŦH")
        ERC20Capped(MAX_SUPPLY)
        ERC20Permit(unicode"AŦHEUM")
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
        _feeRecipient = initialOwner;
        _feeBps = 0;
    }

    function feeBps() external view returns (uint256) { return _feeBps; }
    function feeRecipient() external view returns (address) { return _feeRecipient; }
    function maxSupply() external pure returns (uint256) { return MAX_SUPPLY; }
    function remainingMintableSupply() external view returns (uint256) { return cap() - totalSupply(); }

    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        if (to == address(0)) revert ZeroAddress();
        _mint(to, amount);
        emit Mint(to, amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh(newFeeBps, MAX_FEE_BPS);
        emit FeeUpdated(_feeBps, newFeeBps);
        _feeBps = newFeeBps;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        emit FeeRecipientUpdated(_feeRecipient, newRecipient);
        _feeRecipient = newRecipient;
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Capped, ERC20Pausable)
    {
        if (from != address(0) && to != address(0) && _feeBps > 0) {
            uint256 fee = (value * _feeBps) / 10_000;
            uint256 net = value - fee;
            super._update(from, _feeRecipient, fee);
            super._update(from, to, net);
        } else {
            super._update(from, to, value);
        }
    }
}
