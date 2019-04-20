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

contract("Fund", (accounts) => {
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
        newTokenAddresses: [
            '0x9B913956036a3462330B0642B20D3879ce68b450',
            '0x93bB63aFe1E0180d0eF100D774B473034fd60C36',
            '0x93bB63aFe1E0180d0eF100D774B473034fd60C36'
        ],
        newTokenPercentages: [
            30,
            30,
            40
        ],
    };

    const eventSig = {
        CreatedFund: "CreatedFund(address,address,uint256)"
    }


    before(async function () {
        fundFactory = await FundFactory.new({ from: factoryOwner });
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
        assert.equal(receivedFundOwner, fundOwner, "Owner address incorrect");

        await advanceBlock();
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
                receivedFundDetails[1][index].toNumber(),
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
        await assertRevert(fund.rebalance( { from: fundOwner } ), EVMRevert);
        await increaseTimeTo(fundDetails.rebalancePeriod + 100);
        let receipt = await fund.rebalance( { from: fundOwner } );
        console.log(receipt);
    });

    
    it("Manual rebalance check", async () => {
        console.log("0");
        await assertRevert(fund.manualRebalance( { from: fundOwner } ), EVMRevert);
        await increaseTimeTo(fundDetails.rebalancePeriod + 100);
        console.log("0");
        await assertRevert(fund.manualRebalance( { from: factoryOwner } ), EVMRevert);
        console.log("0");
        let receipt = await fund.manualRebalance( { from: fundOwner } );
        console.log(receipt);
    });
});
