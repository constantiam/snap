#each component of the fund has a token address and the desirned weighting



contract Factory():
  def getExchange(token_addr: address) -> address: constant

contract Exchange():
  def getEthToTokenOutputPrice(tokens_bought: uint256) -> uint256(wei): constant
  def ethToTokenTransferInput(min_tokens: uint256, deadline: timestamp, recipient: address) -> uint256: modifying
  def ethToTokenTransferOutput(tokens_bought: uint256, deadline: timestamp, recipient: address) -> uint256(wei): modifying
  def ethToTokenSwapOutput(tokens_bought: uint256, deadline: timestamp) -> uint256(wei): modifying
  def tokenToEthSwapInput(tokens_sold: uint256, min_eth: uint256(wei), deadline: timestamp) -> uint256(wei): modifying
  def tokenToEthTransferInput(tokens_sold: uint256, min_eth: uint256(wei), deadline: timestamp, recipient: address) -> uint256(wei): modifying


Payment: event()

owner: public(address)
uniswapFactory: public(Factory)
exchange: Exchange
token: address(ERC20)

@public
def __init__(_uniswapFactory: address):
  self.owner = msg.sender
  self.uniswapFactory = _uniswapFactory

@public
def getTokenPrice(_tokenAddress: address) -> uint256:
  self.token = _tokenAddress
  exchange_addr: address = self.uniswapFactory.getExchange(_tokenAddress)
  self.exchange = exchange_addr
  exchangeTokenBalance: uint256 = self.token.balanceOf(exchange_addr)
  exchangeEtherBalance: uint256(wei) = exchange_addr.balance
  exchangeEtherBalanceUint: uint256 = as_unitless_number(exchangeEtherBalance)
  return (exchangeEtherBalanceUint*10**18) / exchangeTokenBalance
    
@public
def getWalletValue(_tokenAddress: address[100], _numberOfTokens: int128, _wallet: address) -> uint256:
  totalWalletValue: uint256
  for i in range(0,100):
    if i == _numberOfTokens:
      break
    self.token = _tokenAddress[i]
    tokenPrice: uint256 = self.getTokenPrice(_tokenAddress[i])
    numberOfTokens: uint256 = self.token.balanceOf(_wallet)
    totalWalletValue += tokenPrice * numberOfTokens
  return totalWalletValue / 10**18

@public
def getTokenValueInWallet(_tokenAddress: address, _wallet: address) -> uint256:
  self.token = _tokenAddress
  numberOfTokens: uint256 = self.token.balanceOf(_wallet)
  tokenPrice: uint256 = self.getTokenPrice(_tokenAddress)
  return (numberOfTokens * tokenPrice) / 10**18


# @private
# def makeSellTrade(_tradeValue: uint256, _tradeExchange: address):
#   self.exchange = _tradeExchange

@private
def executeRebalanceSellTrades(_tradeValues: uint256[100], _tradeExchanges: address[100], _numberOfTrades: int128) -> bool:
# self.exchange.tokenToEthSwapInput(requiredTradeValue, minimum, block.timestamp + 10)
  minimum: uint256(wei) = 1 #improve this to be the minimum amount of the trade expected
  for i in range(0,100):
    if i == _numberOfTrades:
      break
    self.exchange = _tradeExchanges[i]
    # self.makeSellTrade(_tradeValues[i],_tradeExchanges[i])
    # self.exchange.tokenToEthSwapInput(_tradeValues[i], minimum, block.timestamp + 10)
  return True

@payable
@public
def rebalanceFund(_tokenAddress: address[100], _weightings: int128[100], _numberOfTokens: int128):
  totalFundValue: uint256 = self.getWalletValue(_tokenAddress, _numberOfTokens, self)
  # return totalFundValue
  buyOrdersValues: uint256[100]
  buyOrdersExchanges: address[100]
  buyOrderCount: int128 = 0
  
  sellOrdersValues: uint256[100]
  sellOrdersExchanges: address[100]
  sellOrderCount: int128 = 0
  
  for i in range(0,100):
    if i == _numberOfTokens:
      break  
    tokenValueInWallet: uint256 = self.getTokenValueInWallet(_tokenAddress[i], self)
    tokenPrice: uint256 = self.getTokenPrice(_tokenAddress[i])    
    currentRatio: decimal = (convert(tokenValueInWallet,decimal) / convert(totalFundValue,decimal))
    deltaRatio: decimal = convert(_weightings[i], decimal)/100.0 - currentRatio
    requiredTradeInEth: decimal = (convert(totalFundValue,decimal) * deltaRatio)
    requiredTredeInToken: decimal = (requiredTradeInEth * convert(10**18,decimal)) / convert(tokenPrice, decimal)
    
    exchange_addr: address = self.uniswapFactory.getExchange(_tokenAddress[i])
    #we only want to do the sell orders now (if we are exiting a position) and will do the buys
    #after with the ether gained 
    if requiredTredeInToken < 0.0:
      requiredTradeValue: uint256 = convert(floor(as_unitless_number(requiredTredeInToken*-1.0)),uint256)
      
      sellOrdersValues[sellOrderCount] = requiredTradeValue
      sellOrdersExchanges[sellOrderCount] = exchange_addr
      sellOrderCount = sellOrderCount + 1
      minimum: uint256(wei) = 1 #improve this to be the minimum amount of the trade expected
      #!!!!! self.exchange.tokenToEthSwapInput(requiredTradeValue, minimum, block.timestamp + 10)
    if requiredTredeInToken > 0.0:
      requiredTradeValue: uint256 = convert(floor(as_unitless_number(requiredTredeInToken)),uint256)
      buyOrdersValues[buyOrderCount] = requiredTradeValue
      buyOrdersExchanges[buyOrderCount] = exchange_addr
      buyOrderCount = buyOrderCount + 1

    
      # self.exchange = buyOrders[j].exchange_addr
      #!!!!! self.exchange.ethToTokenSwapOutput(buyOrders[j].requiredTradeValue, block.timestamp + 10, value = self.balance)
    

    # self.token.
    # tokenRatio: uint256 = 
  
  # return 10
  # return self.exchange.ethToTokenTransferOutput(_tokens, block.timestamp + 10, msg.sender, value = msg.value)
  
  # self.token.approve(exchange_addr, _tokens)
  # return self.exchange.tokenToEthSwapInput(_tokens, 1, block.timestamp + 10)
  # return True


@public
@payable
def __default__():
  log.Payment()

