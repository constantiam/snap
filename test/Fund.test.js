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
        ]
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
        
    });

    
    it("", async () => {

    });

    
    it("", async () => {

    });

    
    it("", async () => {

    });

    
    it("", async () => {

    });
});
