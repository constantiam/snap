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

    //for this given reserve ratio the price/eth will be 100 dai
    const ethReserve = web3.utils.toWei("1000", 'ether')
    const daiReserve = web3.utils.toWei("100000", 'ether')
    const daiSupply = web3.utils.toWei("1000000", 'ether')

    before(async function () {
        //start by creating a template contract
        let uniswapExchangeTemplate = await UniSwapExchange.new({
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
        let erc20Token = await ERC20Token.new(
            web3.utils.toHex("Dai Mock"),
            web3.utils.toHex("DAI"),
            18,
            daiSupply, {
                from: tokenOwner
            })
        //we can now make an exchange for the fake dai contract from the factory
        await uniswapFactory.createExchange(erc20Token.address, {
            from: tokenOwner
        })
        //grab the exchange address and make an instance of it so we can add liquidity and trade against it
        let exchangeAddress = await uniswapFactory.getExchange(erc20Token.address)
        let uniswapExchange = await UniSwapExchange.at(exchangeAddress)

        //approve before we add liquidity
        await erc20Token.approve(exchangeAddress,
            daiSupply, {
                from: tokenOwner
            })

        let amountAproved = await erc20Token.allowance(tokenOwner, exchangeAddress)
        console.log("Aproved")
        console.log(amountAproved.toString())

        //add the liquidity. 100000 dai and 1000 ether gives a starting price of 100 usd/eth
        //the min_liquidity param does not matter for initial liquidity addition
        //set the deadline way into the future. 
        await uniswapExchange.addLiquidity(0,
            daiReserve,
            deadline, {
                from: tokenOwner,
                value: ethReserve
            })

        let ethBalance = await web3.eth.getBalance(uniswapExchange.address)
        console.log("ETH BAL")
        console.log(ethBalance.toString())

        let tokenBalance = await erc20Token.balanceOf(uniswapExchange.address)
        console.log("dai ba")
        console.log(tokenBalance.toString())

        let currentEthPrice = tokenBalance / ethBalance

        console.log("Eth price in dai")
        console.log(currentEthPrice.toString())




        //do a swap where we are going to ADD (INPUT) 20000 dai.
        await uniswapExchange.tokenToEthSwapInput(web3.utils.toWei("20000", 'ether'), 1, deadline, {
            from: tokenOwner
        })

        ethBalance = await web3.eth.getBalance(uniswapExchange.address)
        console.log("ETH BAL")
        console.log(ethBalance.toString())

        tokenBalance = await erc20Token.balanceOf(uniswapExchange.address)
        console.log("dai ba")
        console.log(tokenBalance.toString())

        currentEthPrice = tokenBalance / ethBalance

        console.log("Eth price in dai")
        console.log(currentEthPrice.toString())

        rebalancer = await Rebalancer.new(uniswapFactory.address, {
            from: owner
        });

        console.log("GETTING PRICE")
        let contractPrice = await rebalancer.getTokenPrice.call(erc20Token.address)
        console.log(contractPrice.toString())
        
        // tokenBalance = await erc20Token.balanceOf(rebalancer.address)
        // console.log("~dai ba")
        // console.log(tokenBalance.toString())
        // // await erc20Token.transfer(rebalancer.address, web3.utils.toWei("1", 'ether'), {
        // //     from: tokenOwner
        // // })

        // tokenBalance = await erc20Token.balanceOf(randomAddress)
        // console.log("balanceBefore")
        // console.log(tokenBalance.toString())

        // await rebalancer.rebalanceFund(erc20Token.address, web3.utils.toWei("1", 'ether'), {
        //     from: randomAddress,
        //     value: web3.utils.toWei("1", 'ether')
        // })
        
        // // console.log("VA")
        // // console.log(valueWeiToSend.toString())

        // tokenBalance = await erc20Token.balanceOf(randomAddress)
        // console.log("balance after")
        // console.log(tokenBalance.toString())

    })

    beforeEach(async function () {


    })
    describe("Initial Fund Setup", function () {
        context("Configuration", function () {
            it("should correctly deploy and set owner", async () => {
                let assignedOwner = await rebalancer.owner()
                assert.equal(assignedOwner, owner, "did not correctly assign owner");
            });
            it("should correctly set uniswap factory", async () => {
                let rebalancerFactory = await rebalancer.uniswapFactory()
                assert.equal(rebalancerFactory, uniswapFactory.address, "did not correctly assign owner");
            });


            // it("should correctly allow rebalancing period to be set", async () => {
            //     await fund.setRebalancePeriod(weekDuration, {
            //         from: owner
            //     })
            //     let rebalancePeriod = await fund.rebalancePeriod()
            //     assert.equal(rebalancePeriod, weekDuration, "did not set the new rebalance period");

            //     // check that changing the duration reverts if not owner
            //     await assertRevert(
            //         fund.setRebalancePeriod(weekDuration + 1, {
            //             from: randomAddress
            //         })
            //     )
            //     assert.equal(rebalancePeriod, weekDuration, "did not revert invalid change of rebalance period");
            // });
        })
    })
});