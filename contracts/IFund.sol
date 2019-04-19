pragma solidity 0.5.0;

contract {
    constructor(
        address[] _tokenAddresses, 
        uint8[] _percentages,
        address _fundOwner
    ) public payable;
    function addTokens(address[] _tokenAddresses, uint8[] _percentages) public;
    function rebalance() public;
    function manualRebalance() public;
    function killFund() public;
}