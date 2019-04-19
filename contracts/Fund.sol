pragma solidity 0.4.18;

import "./IFund.sol";

contract Fund is IFund {
    address private _owner;
    address[] private _tokens;
    uint8[] private _distribution;

    modifier isOwner() {
        require(msg.sender() == _owner, "Access Denied");
    }

    constructor(address[] _tokenAddresses, uint8[] _percentages) 
        public
        payable
    {
        _owner = msg.sender();
        _tokens = _tokenAddresses;
        _distribution = _percentages;
    }

    function addTokens(address[] _tokenAddresses, uint8[] _percentages) 
        public
        isOwner()
    {
        _tokens = _tokenAddresses;
        _distribution = _percentages;
        //TODO for loop approving the rebalancer to spend tokens
    }

    function rebalance()
        public
        isOwner()
    {
        //TODO: 
    }

    function manualRebalance()
        public
        isOwner()
    {
        //TODO: 
    }

    function killFund()
        public
        isOwner()
    {
        //TODO: 
    }

    function() 
        public 
        payable 
    { 
        
    }
}