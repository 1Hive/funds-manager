pragma solidity ^0.4.24;

import "./FundsManager.sol";
import "@aragon/apps-vault/contracts/Vault.sol";

// This contract must be granted the permission to transfer funds on the Aragon Vault it accepts
contract AragonVaultFundsManager is FundsManager {

    Vault public aragonVault;

    constructor(Vault _aragonVault) FundsManager(msg.sender) public {
        aragonVault = _aragonVault;
    }

    function fundsOwner() public view returns (address) {
        return address(aragonVault);
    }

    function balance(address _token) public view returns (uint256) {
        return aragonVault.balance(_token);
    }

    function transfer(address _token, address _beneficiary, uint256 _amount) public onlyFundsUser {
        aragonVault.transfer(_token, _beneficiary, _amount);
    }
}
