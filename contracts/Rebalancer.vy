#each component of the fund has a token address and the desirned weighting

contract Factory():
  def getExchange(token_addr: address) -> address: constant

contract Exchange():
  def getEthToTokenOutputPrice(tokens_bought: uint256) -> uint256(wei): constant
  def ethToTokenTransferInput(min_tokens: uint256, deadline: timestamp, recipient: address) -> uint256: modifying
  def ethToTokenTransferOutput(tokens_bought: uint256, deadline: timestamp, recipient: address) -> uint256(wei): modifying
  def ethToTokenSwapOutput(tokens_bought: uint256, deadline: timestamp) -> uint256(wei): modifying
  def tokenToEthSwapInput(tokens_sold: uint256, min_eth: uint256(wei), deadline: timestamp) -> uint256(wei): modifying

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

@payable
@public
def rebalanceFund(_tokenAddress: address[100], _weightings: int128[100], _numberOfTokens: int128) -> int128:
  totalFundValue: uint256 = self.getWalletValue(_tokenAddress, _numberOfTokens, msg.sender)
  for i in range(0,100):
    if i == _numberOfTokens:
      break
    # self.token = _tokenAddress[i]
    # numberOfTokens: uint256 = self.token.balanceOf(msg.sender)
    
    tokenValueInWallet: uint256 = self.getTokenValueInWallet(_tokenAddress[i], msg.sender)
    tokenPrice: uint256 = self.getTokenPrice(_tokenAddress[i])    
    currentRatio: decimal = (convert(tokenValueInWallet,decimal) / convert(totalFundValue,decimal))
    deltaRatio: decimal = convert(_weightings[i], decimal)/100.0 - currentRatio
    requiredTradeInEth: decimal = (convert(totalFundValue,decimal) * deltaRatio)
    requiredTredeInToken: decimal = (requiredTradeInEth * convert(10**18,decimal)) / convert(tokenPrice, decimal)
    #we only want to do the sell orders now (if we are exiting a position) and will do the buys
    #after with the ether gained 
    


    return floor(requiredTredeInToken)

    # self.token.
    # tokenRatio: uint256 = 
  
  return 10
  # return self.exchange.ethToTokenTransferOutput(_tokens, block.timestamp + 10, msg.sender, value = msg.value)
  
  # self.token.approve(exchange_addr, _tokens)
  # return self.exchange.tokenToEthSwapInput(_tokens, 1, block.timestamp + 10)
  # return True


@public
@payable
def __default__():
  log.Payment()

