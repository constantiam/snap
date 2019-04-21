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
        //Creates ERC20s to use through testing
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
        let ethReserve = web3.utils.toWei("10", 'ether');

        //Spawning the fund
        let fundReceipt = await fundFactory.createFund(
            fundDetails.tokenAddresses,
            fundDetails.tokenPercentages,
            fundDetails.rebalancePeriod,
            { from: fundOwner,
            value: ethReserve }
        );

        //Gets various information from the receipt for testing 
        let receivedFundOwner = fundReceipt.receipt.logs['0'].args['0'];
        let receivedFundAddress = fundReceipt.receipt.logs['0'].args['1'];
        let receivedFundUid = fundReceipt.receipt.logs['0'].args['2'];
        
        //Links a fund to use in all the tests
        fund = await Fund.at(receivedFundAddress);
        
        //Checks the UID. Starts at one for mapping reasons 
            //(so every address that does not own a fund does 
            //not own the first one)
        assert.equal(receivedFundUid.toNumber(), 1, "First fund position error");
        
        //Checks the owner address in the receipt is correct
        assert.equal(receivedFundOwner, fundOwner, "Owner address incorrect");

        await advanceBlock();

        //Mints tokens in a modified ERC20 for the fund
        await erc20One.mint(fund.address, 100);
        await erc20Two.mint(fund.address, 1000);
        await erc20Three.mint(fund.address, 10000);
        await erc20Four.mint(fund.address, 3000);
        let balance = await erc20One.balanceOf(fund.address);

        //Checks that the balance of the fund is correct
        assert.equal(balance.toNumber(), 100, "Balance not set");
    });

    it("Fund created correctly", async () => {
        let receivedFundDetails = await fund.getTokens();
        for (let index = 0; index < 4; index++) {
            //Checks the fund information against the provided info
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

        //Checks the getOwner function is correct
        assert.equal(receivedOwnerAddress, fundOwner, "Owner address is incorrect")

        let receivedRebalance = await fund.getRebalancePeriod();
        //Checks the rebalance period against the provided one
        assert.equal(
            receivedRebalance, 
            fundDetails.rebalancePeriod, 
            "Rebalance period is incorrect"
        );
    });
    
    it("Checking the add tokens functionality works", async () => {
        await fund.addTokens(
            fundDetails.newTokenAddresses,
            fundDetails.newTokenPercentages,
            { from: fundOwner }
        );
        let receivedFundDetails = await fund.getTokens();
        for (let index = 0; index < 3; index++) {
            //Checks that the tokens have changed
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

    it("Negative tests, add tokens", async () => {
        //Checks a non admin account cant change tokens
        await assertRevert(fund.addTokens(
            fundDetails.newTokenAddresses,
            fundDetails.newTokenPercentages,
            { from: tokenCreator }
        ), EVMRevert);

        //Changes the Eth (pos[0]) percentage to 0
        fundDetails.newTokenPercentages[0] = 0;

        //Checks you cannot send a 0 Eth portion in fund
        await assertRevert(fund.addTokens(
            fundDetails.newTokenAddresses,
            fundDetails.newTokenPercentages,
            { from: fundOwner }
        ), EVMRevert);
        fundDetails.newTokenPercentages[0] = 10;
    });
    
    it("Set a new rebalance period", async () => {
        await fund.setNewRebalancePeriod(
            fundDetails.rebalancePeriod + 100,
            { from: fundOwner }
        );
        let receivedRebalance = await fund.getRebalancePeriod();
        
        //Checks the rebalance period has changed
        assert.notEqual(receivedRebalance, fundDetails.rebalancePeriod, "Rebalance period did not update");
        
        //Checks the rebalance period is correct
        assert.equal(receivedRebalance.toNumber(), fundDetails.rebalancePeriod + 100, "Rebalance period incorrect")
    });

    
    it("Rebalance period check", async () => {
        let ethReserve = web3.utils.toWei("10", 'ether');
        let receipt = await fundFactory.createFund(
            fundDetails.newTokenAddresses,
            fundDetails.newTokenPercentages,
            fundDetails.rebalancePeriod,
            { from: fundOwner,
            value: ethReserve }
        )
        let receivedFundAddress = receipt.receipt.logs['0'].args['1'];
        fund = await Fund.at(receivedFundAddress);
        let lastRebalance = await fund.getLastRebalance();
        let nextRebalance = await fund.getNextRebalance();
        let result = nextRebalance - lastRebalance
        
        //Checks the rebalance period has been updated
        assert.notEqual(
            lastRebalance.toNumber(), 
            nextRebalance.toNumber(), 
            "Rebalance amounts not correct"
        );

        //Checks the rebalance period was set on creation of fund
        assert.equal(
            result,
            fundDetails.rebalancePeriod,
            "Rebalance period does not match"
        );
    });

    it("Rebalance check", async () => {
        //TODO: check balances change
    });

    it("Manual rebalance check", async () => {
        //TODO: Check only admin can call
        //TODO: check balances change
    });

    it("Check kill fund moves tokens", async () => {
        await erc20One.mint(fund.address, 100);
        await erc20Two.mint(fund.address, 1000);
        await erc20Three.mint(fund.address, 10000);
        await erc20Four.mint(fund.address, 3000);
        let balanceBefore1 = await erc20One.balanceOf(fund.address);
        let balanceBefore2 = await erc20Two.balanceOf(fund.address);
        let balanceBefore3 = await erc20Three.balanceOf(fund.address);
        let balanceBefore4 = await erc20Four.balanceOf(fund.address);
        
        //Checks balances are correct
        assert.equal(balanceBefore1.toNumber(), 100, "Balance not set");
        assert.equal(balanceBefore2.toNumber(), 1000, "Balance not set");
        assert.equal(balanceBefore3.toNumber(), 10000, "Balance not set");
        assert.equal(balanceBefore4.toNumber(), 3000, "Balance not set");
        
        let receipt = await fund.killFund( { from: fundOwner } );
        
        //Checks event was emitted
        assert.equal(receipt.receipt.logs['0'].args.owner, fundOwner, "Fund death not emitted, owner incorrect");
        let balance1 = await erc20One.balanceOf(fund.address);
        let balance2 = await erc20Two.balanceOf(fund.address);
        let balance3 = await erc20Three.balanceOf(fund.address);
        let balance4 = await erc20Four.balanceOf(fund.address);

        //Checks balances have changed
        assert.notEqual(balanceBefore1.toNumber(), balance1.toNumber(), "Fund is not drained");
        assert.notEqual(balanceBefore2.toNumber(), balance2.toNumber(), "Fund is not drained");
        assert.notEqual(balanceBefore3.toNumber(), balance3.toNumber(), "Fund is not drained");
        assert.notEqual(balanceBefore4.toNumber(), balance4.toNumber(), "Fund is not drained");
        
        //Checks balances are 0
        assert.equal(balance1.toNumber(), 0, "Fund is not drained");
        assert.equal(balance2.toNumber(), 0, "Fund is not drained");
        assert.equal(balance3.toNumber(), 0, "Fund is not drained");
        assert.equal(balance4.toNumber(), 0, "Fund is not drained");
        
        //Checks notDisabled() is working
        await assertRevert(fund.addTokens(
            fundDetails.tokenAddresses,
            fundDetails.tokenPercentages,
            { from: fundOwner }
        ), EVMRevert);
        await assertRevert(fund.rebalance( { from: tokenCreator } ), EVMRevert);
    });
});
