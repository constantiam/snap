pragma solidity 0.5.0;

import "./IFund.sol";
import "./FundFactory.sol";
import "./IERC20.sol";
import "./IRebalancer.sol";

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

    /**
        @notice Allows the fund to recive Ether on creation and 
            adds the tokens. Only callable by owner or factory.
        @dev Adds the tokesn through the add token, which triggers
            a rebalance.
     */
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
        @return address[] int128[]: The array of token addresses
            and token percentages as decimals.
     */
    function getTokens()
        public
        view
        returns(address[100] memory, int128[100] memory)
    {
        return(_tokens, _distribution);
    }

    /**
        @return uint256: The rebalance period.
        @dev Unix time.
     */
    function getRebalancePeriod()
        public
        view
        returns(uint256)
    {
        return _rebalancePeriod;
    }

    /**
        @return uint256: The time of the last rebalance
     */
    function getLastRebalance()
        public
        view
        returns(uint256)
    {
        return _lastRebalance;
    }

    /**
        @return uint256: The time of the next rebalance
     */
    function getNextRebalance()
        public
        view
        returns(uint256)
    {
        return _lastRebalance + _rebalancePeriod;
    }

    /**
        @param _tokenPosition : The position of the token in the
            array.
        @return uint256: Returns the balance of the fund of the
            token.
     */
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
            The first position in the array should be a 0x0 address
            as this position represents Ether.
        param _percentages: The array of percentages as decimals.
            The first position (pos[0]) in the array represents 
            the Eth percentage the fund will hold.
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
        require(_percentages[0] != 0, "Eth amount in fund cannot be 0");
        _tokens = _tokenAddresses;
        _distribution = _percentages;
        manualRebalance();
        _lastRebalance = now;
    }

    function rebalance()
        public
        notDisabled()
    {
        require(_lastRebalance + _rebalancePeriod < now, "Rebalance period has not passed");
        //TODO: call rebalancer for trade orders
        //TODO: call uniswap and make trades
    }

    function manualRebalance()
        public
        notDisabled()
        isAdmin()
    {
        //TODO: call rebalancer for trade orders
        //TODO: call uniswap and make trades 
    }

    /**
        @notice Allows admins (the owner and factory) to disable the
            fund. This function sends all the owned tokens (that the fund 
            knows of) to the owner, then sends all the Eth the fund owns.
        @dev Sends the balanceOf all listed tokens to owner. Emits FundDeath.
            The factory is emabled to use this function incase of 
            vulnrability.
     */
    function killFund()
        public
        isAdmin()
    {
        for(uint i = 1; i < _tokens.length; i++) {
            if(_tokens[i] == address(0x0)) {
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

    /**
        @notice Allows for Eth to be deposited to the fund
     */
    function() 
        external 
        payable 
        notDisabled()
    { 
        
    }
}