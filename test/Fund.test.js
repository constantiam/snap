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
const latestTime = require("./helpers/latestTime");
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

contract("Fund", (accounts) => {
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
        let fundReceipt = await fundFactory.createFund(
            fundDetails.tokenAddresses,
            fundDetails.tokenPercentages,
            fundDetails.rebalancePeriod,
            { from: fundOwner }
        );
        let receivedFundOwner = fundReceipt.receipt.logs['0'].args['0'];
        let receivedFundAddress = fundReceipt.receipt.logs['0'].args['1'];
        let receivedFundUid = fundReceipt.receipt.logs['0'].args['2'];
        fund = await Fund.at(receivedFundAddress);
        let ethReserve = web3.utils.toWei("10", 'ether')
        await fund.init( { from: fundOwner, value: ethReserve } );
        assert.equal(receivedFundOwner, fundOwner, "Owner address incorrect");

        await advanceBlock();
        await erc20One.mint(fund.address, 100);
        await erc20Two.mint(fund.address, 1000);
        await erc20Three.mint(fund.address, 10000);
        await erc20Four.mint(fund.address, 3000);
        let balance = await erc20One.balanceOf(fund.address);
        assert.equal(balance.toNumber(), 100, "Balance not set");
    });

    it("Fund created correctly", async () => {
        let receivedFundDetails = await fund.getTokens();
        for (let index = 0; index < 4; index++) {
            assert.equal(
                fundDetails.tokenAddresses[index],
                receivedFundDetails[0][index],
                "Fund token addresses incorrect"
            );
            assert.equal(
                fundDetails.tokenPercentages[index],
                receivedFundDetails[1][index],
                "Fund token addresses incorrect"
            );
        }

        let receivedOwnerAddress = await fund.getOwner();
        assert.equal(receivedOwnerAddress, fundOwner, "Owner address is incorrect")

        let receivedRebalance = await fund.getRebalancePeriod();
        assert.equal(receivedRebalance, fundDetails.rebalancePeriod, "Rebalance period is incorrect");
    });

    
    it("Checking the add tokens functionality works", async () => {
        await fund.addTokens(
            fundDetails.newTokenAddresses,
            fundDetails.newTokenPercentages,
            { from: fundOwner }
        );
        let receivedFundDetails = await fund.getTokens();
        for (let index = 0; index < 3; index++) {
            assert.equal(
                fundDetails.newTokenAddresses[index],
                receivedFundDetails[0][index],
                "Fund token addresses incorrect"
            );
            assert.equal(
                fundDetails.newTokenPercentages[index],
                receivedFundDetails[1][index].toNumber(),
                "Fund token addresses incorrect"
            );
        }
    });
    
    it("Set a new rebalance period", async () => {
        await fund.setNewRebalancePeriod(
            fundDetails.rebalancePeriod + 100,
            { from: fundOwner }
        );
        let receivedRebalance = await fund.getRebalancePeriod();
        assert.notEqual(receivedRebalance, fundDetails.rebalancePeriod, "Rebalance period did not update");
        assert.equal(receivedRebalance.toNumber(), fundDetails.rebalancePeriod + 100, "Rebalance period incorrect")
    });

    
    it("Rebalance check", async () => {
        let receipt = await fundFactory.createFund(
            fundDetails.newTokenAddresses,
            fundDetails.newTokenPercentages,
            fundDetails.rebalancePeriod,
            { from: fundOwner }
        )
        let receivedFundAddress = receipt.receipt.logs['0'].args['1'];
        fund = await Fund.at(receivedFundAddress);
        let ethReserve = web3.utils.toWei("10", 'ether')
        await fund.init( { from: fundOwner, value: ethReserve } );
        let lastRebalance = await fund.getLastRebalance();
        let nextRebalance = await fund.getNextRebalance();
        let result = nextRebalance - lastRebalance
        assert.notEqual(
            lastRebalance.toNumber(), 
            nextRebalance.toNumber(), 
            "Rebalance amounts not correct"
        );
        assert.equal(
            result,
            fundDetails.rebalancePeriod,
            "Rebalance period does not match"
        );
    });

    
    it("Manual rebalance check", async () => {
        // await assertRevert(fund.manualRebalance( { from: fundOwner } ), EVMRevert);
        // await increaseTimeTo(fundDetails.rebalancePeriod + 100);
        // await assertRevert(fund.manualRebalance( { from: factoryOwner } ), EVMRevert);
        // let receipt = await fund.manualRebalance( { from: fundOwner } );
        // console.log(receipt);
    });

    it("When fund is created rebalance happens", async () => {
        
        //TODO: check tokens get bought 
    });

    it("Check kill fund moves tokens", async () => {
        await fund.killFund( { from: fundOwner } );
        let balance1 = await erc20One.balanceOf(fund.address);
        let balance2 = await erc20Two.balanceOf(fund.address);
        let balance3 = await erc20Three.balanceOf(fund.address);
        let balance4 = await erc20Four.balanceOf(fund.address);
        assert.equal(balance1.toNumber(), 0, "Fund is not drained");
        assert.equal(balance2.toNumber(), 0, "Fund is not drained");
        assert.equal(balance3.toNumber(), 0, "Fund is not drained");
        assert.equal(balance4.toNumber(), 0, "Fund is not drained");
        await assertRevert(fund.addTokens(
            fundDetails.tokenAddresses,
            fundDetails.tokenPercentages,
            { from: fundOwner }
        ), EVMRevert);
    });
});
