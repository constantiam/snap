pragma solidity 0.5.0;

contract IFund {
    function getOwner() public view returns(address);
    function addTokens(
        address[] memory _tokenAddresses, 
        uint8[] memory _percentages) public;
    function rebalance() public;
    function manualRebalance() public;
    function killFund() public;
}