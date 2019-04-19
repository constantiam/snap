pragma solidity 0.5.0;

import "./Fund.sol";

contract FundFactory {
    address private _owner;
    uint256 private _fundNonce;
    struct Fund {
        uint256 uid;
        address fundAddress;
        address owner;
    }
    mapping(uint256 => Fund) allFunds;
    
    constructor() 
        public 
    {
        _owner = msg.sender();
    }

    function createFund(
        address[] _tokenAddresses,
        uint8[] _percentages
    )
        public
        payable
        returns(address)
    {
        address fund = new Fund(
            _tokenAddresses,
            _percentages,
            msg.sender()
        );
        allFunds.push(Fund({
            uid: _fundNonce,
            fundAddress: fund,
            owner: msg.sender()
        });
        _fundNonce = _fundNonce + 1;
    }
}