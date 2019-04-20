pragma solidity 0.5.0;

contract IRebalancer {
    function rebalanceFund(address[100] _tokenAddress, int128[100] _weightings, int128 _numberOfTokens) public payable;
}