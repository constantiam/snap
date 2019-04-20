pragma solidity 0.5.0;

import "./IFund.sol";
import "./FundFactory.sol";
import "./IERC20.sol";

contract Fund is IFund {
    address private _owner;
    address private _factory;
    address[] private _tokens;
    uint8[] private _distribution;

    modifier isOwner() {
        require(msg.sender == _owner || msg.sender == _factory, "Access Denied");
        _;
    }

    event AddTokens();
    event FundDeath(address indexed owner);

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
        addTokens(
            _tokenAddresses,
            _percentages
        );
    }

    function getOwner()
        public
        view
        returns(address)
    {
        return _owner;
    }

    function getTokens()
        public
        view
        returns(address[] memory, uint8[] memory)
    {
        return(_tokens, _distribution);
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
        for(uint i = 0; i < _tokens.length; i++) {
            uint256 balance = IERC20(_tokens[i]).balanceOf(address(this));
            IERC20(_tokens[i]).approve(FundFactory(_factory).getRebabalncer(), balance);
        } 
        
        //TODO for loop approving the rebalancer to spend tokens
        //TODO call the rebalance function
        /**
        for(uint i = 0; i < allUsers.length; i++) {
            if(allUsers[i] == _addressToCheck) {
                pass = true;
                break;
            }
        } */
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
        // isOwner()
    {
        //TODO: send all tokens to owner
        emit FundDeath(_owner);
        /**
            TypeError: Invalid type for argument in function call. 
            Invalid implicit conversion from address to address 
            payable requested. 
        
        selfdestruct(_owner);
        */
    }

    function() 
        external 
        payable 
    { 
        //TODO: 
    }
}