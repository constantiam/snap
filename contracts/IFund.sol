pragma solidity 0.5.0;

contract IFund {
    function init() public payable;
    function getOwner() public view returns(address);
    function addTokens(
        address[100] memory _tokenAddresses, 
        int128[100] memory _percentages) public;
    function rebalance() public;
    function manualRebalance() public;
    function killFund() public;
}