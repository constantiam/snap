pragma solidity 0.5.0;

contract IExchange {
    function getEthToTokenOutputPrice(uint256 tokens_bought) public view returns(uint256);
    function ethToTokenTransferInput(uint256 min_tokens, uint256 deadline, address recipient) public returns(uint256);
    
    function getOwner() public view returns(address);
    function addTokens(
        address[100] memory _tokenAddresses, 
        int128[100] memory _percentages) public;
    function rebalance() public;
    function manualRebalance() public;
    function killFund() public;
}