//tests helpers
const {
    assertRevert
} = require('./helpers/assertRevert');
const {
    sendTransaction
} = require('./helpers/sendTransaction');
const advanceBlock = require("./helpers/advanceToBlock");
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
            { from: fundOwner }
        );
        let receivedFundOwner = fundReceipt.receipt.logs['0'].args['0'];
        let receivedFundAddress = fundReceipt.receipt.logs['0'].args['1'];
        let receivedFundUid = fundReceipt.receipt.logs['0'].args['2'];
        fund = await Fund.at(receivedFundAddress);

        assert.equal(receivedFundOwner, fundOwner, "Owner address incorrect");

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

    
    it("", async () => {

    });

    
    it("", async () => {

    });

    
    it("", async () => {

    });
});
