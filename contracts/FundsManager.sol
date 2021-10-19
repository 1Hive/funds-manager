pragma solidity ^0.4.24;

contract FundsManager {

    address public owner;
    mapping(address => bool) public fundsUsers;

    modifier onlyOwner {
        require(msg.sender == owner, "ERR:NOT_OWNER");
        _;
    }

    modifier onlyFundsUser {
        require(fundsUsers[msg.sender] == true, "ERR:NOT_FUNDS_USER");
        _;
    }

    constructor (address _owner) public {
        owner = _owner;
    }

    function setOwner(address _owner) public onlyOwner {
        owner = _owner;
    }

    function addFundsUser(address _fundsUser) public onlyOwner {
        fundsUsers[_fundsUser] = true;
    }

    function revokeFundsUser(address _fundsUser) public onlyOwner {
        require(fundsUsers[_fundsUser] == true, "ERR:SHOULD_BE_FUNDS_USER");
        fundsUsers[_fundsUser] = false;
    }

    function fundsOwner() public view returns (address);

    function balance(address _token) public view returns (uint256);

    // This must revert if the transfer fails or returns false
    function transfer(address _token, address _beneficiary, uint256 _amount) public;
}
