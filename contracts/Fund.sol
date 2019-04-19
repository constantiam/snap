pragma solidity 0.5.0;

import "./IFund.sol";

contract Fund is IFund {
    address private _owner;
    address private _factory;
    address[] private _tokens;
    uint8[] private _distribution;

    modifier isOwner() {
        require(msg.sender == _owner || msg.sender == _factory, "Access Denied");
        _;
    }

    constructor(
        address[] memory _tokenAddresses, 
        uint8[] memory _percentages, 
        address _fundOwner
    ) 
        public
        payable
    {
        _factory = msg.sender;
        _owner = _fundOwner;
        _tokens = _tokenAddresses;
        _distribution = _percentages;
    }

    function addTokens(
        address[] memory _tokenAddresses, 
        uint8[] memory _percentages
    ) 
        public
        isOwner()
    {
        _tokens = _tokenAddresses;
        _distribution = _percentages;
        /**
        for(uint i = 0; i < allUsers.length; i++) {
            if(allUsers[i] == _addressToCheck) {
                pass = true;
                break;
            }
        } */
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
        //TODO: send all tokens to owner and self destruct
        selfdestruct(_owner);
    }

    function() 
        external 
        payable 
    { 
        //TODO: 
    }
}