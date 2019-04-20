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
const Rebalancer = artifacts.require("Rebalancer");
const UniSwapExchange = artifacts.require("uniswap_exchange");
const UniSwapFactory = artifacts.require("uniswap_factory");
const ERC20Token = artifacts.require("ERC20")

contract("Rebalancer", (accounts) => {
    const factory = accounts[0]
    const owner = accounts[1]
    const randomAddress = accounts[2]
    const uniSwapOwner = accounts[3]
    const tokenOwner = accounts[4]

    const weekDuration = 604800 //one week in seconds
    const monthDuration = 2628000000
    const deadline = 1742680400 //some point in the future

    //for this given reserve ratio the price of 1 dai in eth will be 0.01 eth/dai 
    // giving the value of 100 usd per eth. For mkr a price of  5 eth/mkr is set
    const ethReserve = web3.utils.toWei("1000", 'ether')
    const daiReserve = web3.utils.toWei("100000", 'ether')
    const mkrReserve = web3.utils.toWei("200", 'ether')
    const daiSupply = web3.utils.toWei("1000000", 'ether')


    before(async function () {
        //start by creating a template contract
        uniswapExchangeTemplate = await UniSwapExchange.new({
            from: uniSwapOwner
        })
        //then make the factory
        uniswapFactory = await UniSwapFactory.new({
            from: uniSwapOwner
        })
        //and assigne the template to the factory
        await uniswapFactory.initializeFactory(uniswapExchangeTemplate.address, {
            from: uniSwapOwner
        })
        //next, we need a token for our uniswap exchange. make a fake dai contract
        daiTokenContract = await ERC20Token.new(
            web3.utils.toHex("Dai Mock"),
            web3.utils.toHex("DAI"),
            18,
            daiSupply, {
                from: tokenOwner
            })
        //we can now make an exchange for the fake dai contract from the factory
        await uniswapFactory.createExchange(daiTokenContract.address, {
            from: tokenOwner
        })
        //grab the exchange address and make an instance of it so we can add liquidity and trade against it
        let mkrExchangeAddress = await uniswapFactory.getExchange(daiTokenContract.address)
        let uniswapDaiExchange = await UniSwapExchange.at(mkrExchangeAddress)

        //approve before we add liquidity
        await daiTokenContract.approve(mkrExchangeAddress,
            daiSupply, {
                from: tokenOwner
            })

        let amountAproved = await daiTokenContract.allowance(tokenOwner, mkrExchangeAddress)
        console.log("Aproved")
        console.log(amountAproved.toString())

        //add the liquidity. 100000 dai and 1000 ether gives a starting price of 100 usd/eth
        //the min_liquidity param does not matter for initial liquidity addition
        //set the deadline way into the future. 
        await uniswapDaiExchange.addLiquidity(0,
            daiReserve,
            deadline, {
                from: tokenOwner,
                value: ethReserve
            })

        let ethBalance = await web3.eth.getBalance(uniswapDaiExchange.address)
        console.log("Dai exchange ETH balance")
        console.log(ethBalance.toString())

        let tokenBalance = await daiTokenContract.balanceOf(uniswapDaiExchange.address)
        console.log("Dai exchange DAI balance")
        console.log(tokenBalance.toString())

        let currentEthPrice = tokenBalance / ethBalance

        console.log("Dai exchange ETH balance price per eth in dai")
        console.log(currentEthPrice.toString())

        //CREATE ANOTHER TOKEN FOR TESTING.
        mkrTokenContract = await ERC20Token.new(
            web3.utils.toHex("Mkr Mock"),
            web3.utils.toHex("MKR"),
            18,
            daiSupply, {
                from: tokenOwner
            })
        //we can now make an exchange for the fake dai contract from the factory
        await uniswapFactory.createExchange(mkrTokenContract.address, {
            from: tokenOwner
        })
        //grab the exchange address and make an instance of it so we can add liquidity and trade against it
        mkrExchangeAddress = await uniswapFactory.getExchange(mkrTokenContract.address)
        uniswapMkrExchange = await UniSwapExchange.at(mkrExchangeAddress)

        //approve before we add liquidity
        await mkrTokenContract.approve(mkrExchangeAddress,
            daiSupply, {
                from: tokenOwner
            })

        await uniswapMkrExchange.addLiquidity(0,
            mkrReserve,
            deadline, {
                from: tokenOwner,
                value: ethReserve
            })

        ethBalance = await web3.eth.getBalance(uniswapMkrExchange.address)
        console.log("Mkr exchange ETH balance")
        console.log(ethBalance.toString())

        tokenBalance = await mkrTokenContract.balanceOf(uniswapMkrExchange.address)
        console.log("Mkr exchange Mkr balance")
        console.log(tokenBalance.toString())

        currentEthPrice = tokenBalance / ethBalance

        console.log("Mkr exchange ETH balance price per eth in Mkr")
        console.log(currentEthPrice.toString())



        rebalancer = await Rebalancer.new(uniswapFactory.address, {
            from: owner
        });


        // //do a swap where we are going to ADD (INPUT) 20000 dai.
        // await uniswapExchange.tokenToEthSwapInput(web3.utils.toWei("20000", 'ether'), 1, deadline, {
        //     from: tokenOwner
        // })

        // ethBalance = await web3.eth.getBalance(uniswapExchange.address)
        // console.log("ETH BAL")
        // console.log(ethBalance.toString())

        // tokenBalance = await daiTokenContract.balanceOf(uniswapExchange.address)
        // console.log("dai ba")
        // console.log(tokenBalance.toString())

        // currentEthPrice = tokenBalance / ethBalance

        // console.log("Eth price in dai")
        // console.log(currentEthPrice.toString())



        // console.log("GETTING PRICE")
        // let contractPrice = await rebalancer.getTokenPriceUint.call(daiTokenContract.address)
        // console.log(contractPrice.toString())

        // console.log("getting value")
        // let array = daiTokenContract.address
        // let fundValue = await rebalancer.getFundValue.call([daiTokenContract.address], 1, {
        //     from: tokenOwner
        // })
        // console.log(fundValue.toString())


        // tokenBalance = await daiTokenContract.balanceOf(rebalancer.address)
        // console.log("~dai ba")
        // console.log(tokenBalance.toString())
        // // await daiTokenContract.transfer(rebalancer.address, web3.utils.toWei("1", 'ether'), {
        // //     from: tokenOwner
        // // })

        // tokenBalance = await daiTokenContract.balanceOf(randomAddress)
        // console.log("balanceBefore")
        // console.log(tokenBalance.toString())

        // await rebalancer.rebalanceFund(daiTokenContract.address, web3.utils.toWei("1", 'ether'), {
        //     from: randomAddress,
        //     value: web3.utils.toWei("1", 'ether')
        // })

        // // console.log("VA")
        // // console.log(valueWeiToSend.toString())

        // tokenBalance = await daiTokenContract.balanceOf(randomAddress)
        // console.log("balance after")
        // console.log(tokenBalance.toString())

    })

    beforeEach(async function () {


    })
    describe("Rebalancer", function () {
        context("Configuration", function () {
            it("should correctly deploy and set owner", async () => {
                let assignedOwner = await rebalancer.owner()
                assert.equal(assignedOwner, owner, "did not correctly assign owner");
            });
            it("should correctly set uniswap factory", async () => {
                let rebalancerFactory = await rebalancer.uniswapFactory()
                assert.equal(rebalancerFactory, uniswapFactory.address, "did not correctly assign uniswap factory");
            });
        })
        context("Evaluation Functions", function () {
            it("should correctly calculate the eth price based on balances of uniswap exchange", async () => {
                let contractPrice = await rebalancer.getTokenPriceUint.call(daiTokenContract.address)
                //starting values of uniswap should make the starting price 1/100th of an eth = 10000000000000000 wei. 
                //could not get .should.be.bignumber.equal to work so will hard code it for now....
                assert.equal(contractPrice.toString(), '10000000000000000', "did not correctly calculate price");
            })
            it("should correctly calculate the value of a fund of tokens", async () => {
                //send the randomAddress 100 tokens of dai, values at 1/100 eth per dai. 
                await daiTokenContract.transfer(randomAddress, web3.utils.toWei("100", 'ether'), {
                    from: tokenOwner
                })
                tokenArray = Array(100).fill(null).map((u, i) => '0x0000000000000000000000000000000000000000')
                tokenArray[0] = daiTokenContract.address
                //the balance of this position should be 1 eth @ 1/100dai per eth
                let walletValue = await rebalancer.getWalletValue.call(tokenArray, 1, {
                    from: randomAddress
                })
                assert.equal(walletValue.toString(), '1000000000000000000', "did not correctly calculate wallet value");
            })
        })
    })
});