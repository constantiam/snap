pragma solidity 0.4.18;

contract {
    modifier isOwner() {
        require(msg.sender() == _owner, "Access Denied");
    }

    constructor(address[] _tokenAddresses, uint8[] _percentages) public payable;
    function addTokens(address[] _tokenAddresses, uint8[] _percentages) public isOwner();
    function rebalance() public isOwner();
    function manualRebalance() public isOwner();
    function killFund() public isOwner();
    
}