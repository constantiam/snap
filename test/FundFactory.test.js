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
const Erc20 = artifacts.require("./ERC20.sol");

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
    const tokenCreator = accounts[2]

    const fundDetails = {
        tokenAddresses: [
        ],
        tokenPercentages: [
        ],
        rebalancePeriod: 604800,
        newTokenAddresses: [
        ],
        newTokenPercentages: [
        ],
    };

    const eventSig = {
        CreatedFund: "CreatedFund(address,address,uint256)"
    }


    before(async function () {
        erc20One = await Erc20.new({ from: tokenCreator });
        erc20Two = await Erc20.new({ from: tokenCreator });
        erc20Three = await Erc20.new({ from: tokenCreator });
        erc20Four = await Erc20.new({ from: tokenCreator });
        fundDetails.tokenAddresses[0] = erc20One.address;
        fundDetails.newTokenAddresses[0] = erc20One.address;
        fundDetails.tokenPercentages[0] = 30;
        fundDetails.newTokenPercentages[0] = 20;
        fundDetails.tokenAddresses[1] = erc20Two.address;
        fundDetails.newTokenAddresses[1] = erc20Two.address;
        fundDetails.tokenPercentages[1] = 30;
        fundDetails.newTokenPercentages[1] = 30;
        fundDetails.tokenAddresses[2] = erc20Three.address;
        fundDetails.newTokenAddresses[2] = erc20Three.address;
        fundDetails.tokenPercentages[2] = 40;
        fundDetails.newTokenPercentages[2] = 40;
        fundDetails.newTokenAddresses[3] = erc20Four.address;
        fundDetails.newTokenPercentages[3] = 10;
        fundFactory = await FundFactory.new({ from: factoryOwner });
        await fundFactory.updateRebalancer( erc20Four.address, { from: factoryOwner });
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
        let ethReserve = web3.utils.toWei("10", 'ether')
        await fund.init( { from: fundOwner, value: ethReserve } );
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
        let ethReserve = web3.utils.toWei("10", 'ether')
        await fund.init( { from: fundOwner, value: ethReserve } );
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