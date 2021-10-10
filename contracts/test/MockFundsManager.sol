pragma solidity ^0.4.0;

import "../FundsManager.sol";

contract MockFundsManager is FundsManager {

    uint256 public testVar = 0;

    constructor() FundsManager(msg.sender) public {}

    function fundsOwner() public view returns (address) {
        return address(0);
    }

    function balance(address _token) public view returns (uint256) {
        return 0;
    }

    function transfer(address _token, address _beneficiary, uint256 _amount) public onlyFundsUser {
        testVar += 1;
    }
}
