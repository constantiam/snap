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
const Erc20 = artifacts.require("./ERC20.sol");

contract("FundFactory", (accounts) => {
    const factoryOwner = accounts[0]
    const fundOwner = accounts[1]
    const tokenCreator = accounts[2]

    const fundDetails = {
        tokenAddresses: Array(100).fill(null).map((u, i) => '0x0000000000000000000000000000000000000000'),
        tokenPercentages: Array(100).fill(null).map((u, i) => '0'),
        rebalancePeriod: 604800,
        newTokenAddresses: Array(100).fill(null).map((u, i) => '0x0000000000000000000000000000000000000000'),
        newTokenPercentages: Array(100).fill(null).map((u, i) => '0'),
    };

    const eventSig = {
        CreatedFund: "CreatedFund(address,address,uint256)"
    }

    before(async function () {
        //Creates ERC20s to use in testing
        erc20One = await Erc20.new({ from: tokenCreator });
        erc20Two = await Erc20.new({ from: tokenCreator });
        erc20Three = await Erc20.new({ from: tokenCreator });
        erc20Four = await Erc20.new({ from: tokenCreator });

        //Sets the test arrays to have the addresses of the 
            //created ERC20s
        fundDetails.tokenAddresses[1] = erc20One.address;
        fundDetails.newTokenAddresses[1] = erc20One.address;
        fundDetails.tokenAddresses[2] = erc20Two.address;
        fundDetails.newTokenAddresses[2] = erc20Two.address;
        fundDetails.tokenAddresses[3] = erc20Three.address;
        fundDetails.newTokenAddresses[3] = erc20Three.address;
        fundDetails.newTokenAddresses[4] = erc20Four.address;

        // Sets the initial test arrays to have decimal 
            //percentages equal to 100
        fundDetails.tokenPercentages[0] = 20; 
        fundDetails.tokenPercentages[1] = 20;
        fundDetails.tokenPercentages[2] = 20;
        fundDetails.tokenPercentages[3] = 40;

        //Sets the secondary test array to have decimal 
            //percentages equal to 100
        fundDetails.newTokenPercentages[0] = 10;
        fundDetails.newTokenPercentages[1] = 30;
        fundDetails.newTokenPercentages[2] = 40;
        fundDetails.newTokenPercentages[3] = 10;
        fundDetails.newTokenPercentages[4] = 10;

        //Creating a fund factory
        fundFactory = await FundFactory.new({ from: factoryOwner });
        
        //Setting the address of the rebalancer
        //TODO: spawn a real rebalancer
        await fundFactory.updateRebalancer( erc20Four.address, { from: factoryOwner });
    });

    it("Should deploy correctly and set owner", async () => {
        let owner = await fundFactory.getFactoryOwner();
        let allFunds = await fundFactory.getAllFundUids();
        let rebalancer = await fundFactory.getRebabalncer();

        //Checks various aspects of fund
        assert.equal(rebalancer, erc20Four.address, "Rebalancer address incorrect");
        assert.equal(allFunds.toNumber(), 0, "Fund UIDs are incorrect");
        assert.equal(owner, factoryOwner, "Owner address is incorrect");
    });

    it("Factory can deploy fund", async () => {
        let ethReserve = web3.utils.toWei("10", 'ether');
        let fundReceipt = await fundFactory.createFund(
            fundDetails.tokenAddresses,
            fundDetails.tokenPercentages,
            fundDetails.rebalancePeriod,
            { from: fundOwner,
            value: ethReserve }
        );
        let receivedFundOwner = fundReceipt.receipt.logs['0'].args['0'];
        let receivedFundAddress = fundReceipt.receipt.logs['0'].args['1'];
        let receivedFundUid = fundReceipt.receipt.logs['0'].args['2'];
        
        //Checks the fund is set up correctly
        assert.equal(fundOwner, receivedFundOwner, "Owner address is incorrect");
        assert.notEqual(receivedFundOwner, factoryOwner, "Fund owner address is factory");
        assert.equal(receivedFundUid.toNumber(), 1, "The funds UID is incorrect")
        
        fund = await Fund.at(receivedFundAddress);
        let receivedFundOwnerFund = await fund.getOwner();
        let fundEthBalanceInWei = await web3.eth.getBalance(fund.address);

        //Checks the fund was correctly set up, and received eth.
        assert.equal(fundEthBalanceInWei, 10000000000000000000, "Fund did not recive Ether");
        assert.equal(fundOwner, receivedFundOwnerFund, "Funds owner is incorrect");
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
        assert.equal(allFunds.toNumber(), 2, "There are an incorrect number of funds");
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
        });

        //TODO: check you cant interact with funds
        //TODO: implement disabled pattern 
    });
});