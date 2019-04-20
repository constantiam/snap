pragma solidity 0.5.0;

import "./IFund.sol";
import "./FundFactory.sol";
import "./IERC20.sol";

/**
    @author nicca42
    This contract stores the token addresses and percentages. 
    This contract allows for a fund rebalance by calling the 
    `rebalancer` vyper contract, which will take in the token
    addresses and percentages and execute the needed trades to
    re-balance the fund.
*/
contract Fund is IFund {
    address private _owner;
    address private _factory;
    address[] private _tokens;
    uint8[] private _distribution;
    uint256 private _rebalancePeriod;
    uint256 private _lastRebalance;

    modifier isOwner() {
        require(msg.sender == _owner, "Access Denied");
        _;
    }

    modifier isAdmin() {
        require(msg.sender == _owner || msg.sender == _factory, "Access Denied");
        _;
    }

    event AddTokens();
    event FundDeath(address indexed owner);

    constructor(
        address[] memory _tokenAddresses, 
        uint8[] memory _percentages, 
        address _fundOwner,
        uint256 _rebalance
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
        _rebalancePeriod = _rebalance;
    }

    /**
        @return address: The owner of the fund
     */
    function getOwner()
        public
        view
        returns(address)
    {
        return _owner;
    }

    /**
        @return address[] uint8[]: The array of token addresses
            and token percentages as decimals.
     */
    function getTokens()
        public
        view
        returns(address[] memory, uint8[] memory)
    {
        return(_tokens, _distribution);
    }

    function getRebalancePeriod()
        public
        view
        returns(uint256)
    {
        return _rebalancePeriod;
    }

    function setNewRebalancePeriod(uint256 _newPeriod)
        public
        isOwner()
    {
        _rebalancePeriod = _newPeriod;
    }

    /**
        param _tokenAddresses: The array of token addresses.
        param _percentages: The array of percentages as decimals.
        @notice This function will overried all previously 
            listed tokens, so should you want to add or remove 
            a token, simply omit or add the address and decimal 
            percentage to the array.
        @dev Overrieds previous storage. Can only be called by fund
            owner.
     */
    function addTokens(
        address[] memory _tokenAddresses, 
        uint8[] memory _percentages
    ) 
        public
        isAdmin()
    {
        _tokens = _tokenAddresses;
        _distribution = _percentages;
        // for(uint8 i = 0; i < _tokens.length; i++) {
        //     uint256 balance = IERC20(_tokens[i]).balanceOf(address(this));
        //     IERC20(_tokens[i]).approve(FundFactory(_factory).getRebabalncer(), balance);
        // } 

        //TODO call the rebalance function and forward all eth
        _lastRebalance = now;
    }

    function rebalance()
        public
    {
        require(_lastRebalance + _rebalancePeriod < now, "Rebalance period has not passed");
        for(uint i = 0; i < _tokens.length; i++) {
            uint256 balance = IERC20(_tokens[i]).balanceOf(address(this));
            IERC20(_tokens[i]).approve(FundFactory(_factory).getRebabalncer(), balance);
        } 
        //TODO: Call rebalancer with all eth
    }

    function manualRebalance()
        public
        isOwner()
    {
        for(uint i = 0; i < _tokens.length; i++) {
            uint256 balance = IERC20(_tokens[i]).balanceOf(address(this));
            IERC20(_tokens[i]).approve(FundFactory(_factory).getRebabalncer(), balance);
        } 
        //TODO: Call rebalancer with all eth
    }

    function killFund()
        public
        isAdmin()
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