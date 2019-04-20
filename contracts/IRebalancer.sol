pragma solidity 0.5.0;

contract IRebalancer {
    function rebalanceFund(address[100] memory _tokenAddress, int128[100] memory _weightings, int128 _numberOfTokens) public payable;
}