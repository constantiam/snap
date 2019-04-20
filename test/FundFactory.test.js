//tests helpers
const {
    EVMRevert
} = require('./helpers/EVMRevert');
const { 
    assertRevert 
} = require('./helpers/assertRevert');
const {
    sendTransaction
} = require('./helpers/sendTransaction');
const advanceBlock = require("./helpers/advanceToBlock");
const {
    increaseTimeTo,
    duration
} = require('./helpers/increaseTime');
const _ = require("lodash");
const BigNumber = web3.BigNumber;

//libraries
require("chai")
    .use(require("chai-as-promised"))
    .use(require("chai-bignumber")(BigNumber))
    .should();

//contracts
const FundFactory = artifacts.require("./FundFactory.sol");
const Fund = artifacts.require("./Fund.sol");

contract("FundFactory", (accounts) => {
    const factoryOwner = accounts[0]
    const fundOwner = accounts[1]

    const fundDetails = {
        tokenAddresses: [
            '0x9B913956036a3462330B0642B20D3879ce68b450',
            '0x93bB63aFe1E0180d0eF100D774B473034fd60C36',
            '0x93bB63aFe1E0180d0eF100D774B473034fd60C36',
            '0x93bB63aFe1E0180d0eF100D774B473034fd60C36'
        ],
        tokenPercentages: [
            20,
            20,
            20,
            40
        ],
        rebalancePeriod: 604800,
    };

    const eventSig = {
        CreatedFund: "CreatedFund(address,address,uint256)"
    }


    before(async function () {
        fundFactory = await FundFactory.new({ from: factoryOwner });
    });

    it("Should deploy correctly and set owner", async () => {
        let owner = await fundFactory.getFactoryOwner();
        assert.equal(owner, factoryOwner, "Owner address is incorrect");
    });

    it("Factory can deploy fund", async () => {
        let fundReceipt = await fundFactory.createFund(
            fundDetails.tokenAddresses,
            fundDetails.tokenPercentages,
            fundDetails.rebalancePeriod,
            { from: fundOwner }
        );
        let receivedFundOwner = fundReceipt.receipt.logs['0'].args['0'];
        let receivedFundAddress = fundReceipt.receipt.logs['0'].args['1'];
        let receivedFundUid = fundReceipt.receipt.logs['0'].args['2'];
        assert.equal(fundOwner, receivedFundOwner, "Owner address is incorrect");
        assert.notEqual(receivedFundOwner, factoryOwner, "Fund owner address is factory");
        assert.equal(receivedFundUid.toNumber(), 1, "The funds UID is incorrect")
        fund = await Fund.at(receivedFundAddress);
        let receivedFundOwnerFund = await fund.getOwner();
        assert.equal(fundOwner, receivedFundOwnerFund, "Funds owner is incorrect");
    });

    it("Can kill all funds", async () => {
        let fundReceipt = await fundFactory.createFund(
            fundDetails.tokenAddresses,
            fundDetails.tokenPercentages,
            fundDetails.rebalancePeriod,
            { from: fundOwner }
        );
        let receivedFundAddress = fundReceipt.receipt.logs['0'].args['1'];
        let fundReceipt2 = await fundFactory.createFund(
            fundDetails.tokenAddresses,
            fundDetails.tokenPercentages,
            fundDetails.rebalancePeriod,
            { from: fundOwner }
        );
        fund = await Fund.at(receivedFundAddress);
        let killReceipt = await fundFactory.killFunds( { from: factoryOwner } );
        let allEvents = killReceipt.receipt.logs.map(e => {
            return e.event;
        });//[ 'AllFundsDeath', 'AllFundsDeath', 'AllFundsDeath' ]
        let allFunds = await fundFactory.getAllFundUids();
        //TODO: implement selfdestruct and test contracts dont exist
    });

    it("Deploying the rebalancer", async () => {
        //TODO gets right uniswap address
        //TODO is deployed
    });

    it("Getting all funds", async () => {
        await fundFactory.createFund(
            fundDetails.tokenAddresses,
            fundDetails.tokenPercentages,
            fundDetails.rebalancePeriod,
            { from: fundOwner }
        );
        let allFunds = await fundFactory.getAllFundUids();
        assert.equal(allFunds.toNumber(), 4, "There are an incorrect number of funds");
    });

    it("Getting fund details", async () => {
        let fundReceipt = await fundFactory.createFund(
            fundDetails.tokenAddresses,
            fundDetails.tokenPercentages,
            fundDetails.rebalancePeriod,
            { from: fundOwner }
        );
        let receivedFundOwner = fundReceipt.receipt.logs['0'].args['0'];
        let receivedFundAddress = fundReceipt.receipt.logs['0'].args['1'];
        let receivedFundUid = fundReceipt.receipt.logs['0'].args['2'];
        let allFunds = await fundFactory.getAllFundUids();
        let receivedFundDetails = await fundFactory.getFundDetails(allFunds.toNumber());
        assert.notEqual(receivedFundDetails['0'], '0x0000000000000000000000000000000000000000', "Fund owner address is empty");
        assert.notEqual(receivedFundDetails['1'], '0x0000000000000000000000000000000000000000', "Fund address is empty");
        assert.equal(allFunds.toNumber(), receivedFundUid, "Fund UID is incorrect");
        assert.equal(receivedFundDetails['0'], fundOwner, "Fund owner is incorrect");
        assert.equal(receivedFundDetails['0'], receivedFundOwner, "Fund owner is incorrect");
        assert.equal(receivedFundDetails['1'], receivedFundAddress, "Fund address is incorrect");
    });
});