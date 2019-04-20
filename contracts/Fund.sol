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
    address payable _owner;
    address private _factory;
    address[100] private _tokens;
    int128[100] private _distribution;
    uint256 private _rebalancePeriod;
    uint256 private _lastRebalance;
    bool private _disabled = false;

    modifier notDisabled() {
        require(
            !_disabled, 
            "The fund is disabled. If you are the owner you can re-enable the fund at your own risk"
        );
        _;
    }

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
        address[100] memory _tokenAddresses, 
        int128[100] memory _percentages, 
        address payable _fundOwner,
        uint256 _rebalance
    ) 
        public
    {
        _factory = msg.sender;
        _owner = _fundOwner;
        _rebalancePeriod = _rebalance;
        _tokens = _tokenAddresses;
        _distribution = _percentages;
    }

    function init()
        public
        payable
        isAdmin()
    {
        addTokens(
            _tokens,
            _distribution
        );
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

    function getLastRebalance()
        public
        view
        returns(uint256)
    {
        return _lastRebalance;
    }

    function getNextRebalance()
        public
        view
        returns(uint256)
    {
        return _lastRebalance + _rebalancePeriod;
    }

    function getBalanceOfToken(uint256 _tokenPosition) 
        public
        view
        returns(uint256)
    {
        return IERC20(_tokens[_tokenPosition]).balanceOf(address(this));
    }

    function setNewRebalancePeriod(uint256 _newPeriod)
        public
        notDisabled()
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
        address[100] memory _tokenAddresses, 
        int128[100] memory _percentages
    ) 
        public
        notDisabled()
        isAdmin()
    {
        _tokens = _tokenAddresses;
        _distribution = _percentages;
        manualRebalance();
        //TODO call the rebalance function and forward all eth
        _lastRebalance = now;
    }

    function rebalance()
        public
        notDisabled()
    {
        require(_lastRebalance + _rebalancePeriod < now, "Rebalance period has not passed");
        for(uint i = 0; i < _tokens.length; i++) {
            if(_tokens[i] == address(0x0) && i != 0) {
                break;
            }
            uint256 balance = IERC20(_tokens[i]).balanceOf(address(this));
            IERC20(_tokens[i]).transfer(FundFactory(_factory).getRebabalncer(), balance);
        } 
        //TODO make all arrays 100 length 
        //TODO: Call rebalancer with all eth
    }

    function manualRebalance()
        public
        notDisabled()
        isAdmin()
    {
        for(uint i = 0; i < _tokens.length; i++) {
            if(_tokens[i] == address(0x0) && i != 0) {
                break;
            }
            uint256 balance = IERC20(_tokens[i]).balanceOf(address(this));
            IERC20(_tokens[i]).transfer(FundFactory(_factory).getRebabalncer(), balance);
        } 
        
        //TODO make all arrays 100 length 
        //TODO: Call rebalancer with all eth
    }

    function killFund()
        public
        isAdmin()
    {
        for(uint i = 0; i < _tokens.length; i++) {
            if(_tokens[i] == address(0x0) && i != 0) {
                break;
            }
            uint256 balance = IERC20(_tokens[i]).balanceOf(address(this));
            IERC20(_tokens[i]).transfer(_owner, balance);
            uint256 balanceAfter = IERC20(_tokens[i]).balanceOf(address(this));
            require(balanceAfter == 0, "Sending funds failed");
        } 
        uint256 amount = address(this).balance;
        _owner.transfer(amount);
        emit FundDeath(_owner);
        _disabled = !_disabled;
    }

    function() 
        external 
        payable 
    { 
        //TODO: 
    }
}