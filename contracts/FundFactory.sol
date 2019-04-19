pragma solidity 0.5.0;

import "./Fund.sol";
import "./IFund.sol";

contract FundFactory {
    address private _owner;
    uint256 private _fundNonce = 0;
    struct AFund {
        uint256 uid;
        address fundAddress;
        address owner;
    }
    mapping(uint256 => AFund) allFunds;

    constructor() 
        public 
    {
        _owner = msg.sender;
    }

    function createFund(
        address[] memory _tokenAddresses,
        uint8[] memory _percentages
    )
        public
        payable
        returns(address, uint256)
    {
        Fund fund = new Fund(
            _tokenAddresses,
            _percentages,
            msg.sender
        );
        uint256 fundUid = _fundNonce;
        allFunds[fundUid] = AFund({
            uid: fundUid,
            fundAddress: address(fund),
            owner: msg.sender
        });
        _fundNonce = _fundNonce + 1;
        return(address(fund), fundUid);
    }

    function killFunds()
        public
    {
        require(msg.sender == _owner, "Access Denied");
        for(uint i = 0; i < _fundNonce; i++) {
            IFund(allFunds[i].fundAddress).killFund();
        }
    }

    //TODO: intergrate : deploying the rebalancer, updating the rebalancer
}