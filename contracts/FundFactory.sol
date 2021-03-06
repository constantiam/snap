pragma solidity 0.5.0;

import "./Fund.sol";
import "./IFund.sol";

contract FundFactory {
    address private _owner;
    address private _rebalancer;
    //Starts at one becuse mapping of owner to fund will default to 0
    uint256 private _fundNonce = 1;
    struct AFund {
        uint256 uid;
        address fundAddress;
        address owner;
    }
    mapping(uint256 => AFund) allFunds;
    mapping(address => uint256[]) fundOwner;

    event CreatedFund(address indexed owner, address indexed fund, uint256 indexed uid);
    event AllFundsDeath(address indexed owner, address indexed fund);
    event log(uint256 position);

    constructor() 
        public 
    {
        _owner = msg.sender;
    }

    /**
        @return uint8: The last UID of a fund.
        @notice The UIDs start at 1, not 0 because 0 is the 
            default value of mappings. 
     */
    function getAllFundUids() 
        public
        view
        returns(uint256)
    {
        return _fundNonce - 1;
    }

    /**
        @param _fundOwner : The address of the fund owner
        @return uint256[]: Array of UIDs of funds
     */
    function getFundForOwner(address _fundOwner)
        public
        view
        returns(uint256[] memory)
    {
        return fundOwner[_fundOwner];
    }

    function getFundDetails(uint256 _fundId)
        public
        view
        returns(address, address)
    {
        return(
            allFunds[_fundId].owner,
            allFunds[_fundId].fundAddress
        ); 
    }

    function getFactoryOwner()
        public
        view
        returns(address)
    {
        return(_owner);
    }

    function getRebabalncer()
        public
        view
        returns(address)
    {
        return _rebalancer;
    }

    function updateRebalancer(address _newRebalancer) 
        public
    {
        require(msg.sender == _owner, "Access Denied");
        _rebalancer = _newRebalancer;
    }

    /**
        @dev Creates a fund
     */
    function createFund(
        address[100] memory _tokenAddresses,
        int128[100] memory _percentages,
        uint256 _rebalancePeriod
    )
        public
        payable
        returns(address, uint256)
    {
        Fund fund = new Fund(
            _tokenAddresses,
            _percentages,
            msg.sender,
            _rebalancePeriod
        );
        fund.init.value(msg.value)();
        uint256 fundUid = _fundNonce;
        allFunds[fundUid] = AFund({
            uid: fundUid,
            fundAddress: address(fund),
            owner: msg.sender
        });
        fundOwner[msg.sender].push(fundUid);
        _fundNonce = _fundNonce + 1;
        emit CreatedFund(msg.sender, address(fund), fundUid);
        return(address(fund), fundUid);
    }

    function killFunds()
        public
    {
        require(msg.sender == _owner, "Access Denied");
        //TODO: add check for tx limits if huge for loop
        for(uint i = 1; i < _fundNonce; i++) {
            IFund(allFunds[i].fundAddress).killFund();
            emit AllFundsDeath(allFunds[i].owner, allFunds[i].fundAddress);
        }
    }
}