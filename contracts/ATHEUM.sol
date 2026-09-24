// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {ERC20PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";

contract ATHEUM is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, ERC20PausableUpgradeable, ERC20PermitUpgradeable, Ownable2StepUpgradeable, UUPSUpgradeable {
    uint256 public constant INITIAL_SUPPLY = 999_999_999_999_999_999 * 10 ** 18;
    uint256 public constant FEE_BPS = 1_000;
    address private _feeRecipient;
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    error ZeroAddress();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address initialOwner) external initializer {
        if (initialOwner == address(0)) revert ZeroAddress();
        __ERC20_init(unicode"AŦHEUM", unicode"AŦH");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __ERC20Permit_init(unicode"AŦHEUM");
        __Ownable_init(initialOwner);
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        _feeRecipient = initialOwner;
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    function feeRecipient() external view returns (address) { return _feeRecipient; }
    function feeBps() external pure returns (uint256) { return FEE_BPS; }
    function maxSupply() external pure returns (uint256) { return INITIAL_SUPPLY; }
    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        emit FeeRecipientUpdated(_feeRecipient, newRecipient);
        _feeRecipient = newRecipient;
    }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    function _authorizeUpgrade(address) internal override onlyOwner {}
    function _update(address from, address to, uint256 value) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        if (from != address(0) && to != address(0) && from != _feeRecipient) {
            uint256 fee = (value * FEE_BPS) / 10_000;
            super._update(from, _feeRecipient, fee);
            super._update(from, to, value - fee);
        } else {
            super._update(from, to, value);
        }
    }
}
