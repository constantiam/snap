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
def getTokenPrice(_tokenAddress: address) -> decimal:
  self.token = _tokenAddress
  exchange_addr: address = self.uniswapFactory.getExchange(_tokenAddress)
  self.exchange = exchange_addr
  exchangeTokenBalance: uint256 = self.token.balanceOf(exchange_addr)
  exchangeTokenBalanceDecimal: decimal = convert(exchangeTokenBalance, decimal)
  exchangeEtherBalance: uint256(wei) = exchange_addr.balance
  exchangeEtherBalanceUint: uint256 = as_unitless_number(exchangeEtherBalance)
  exchangeEtherBalanceDecimal: decimal = convert(exchangeEtherBalanceUint, decimal)
  return exchangeEtherBalanceDecimal / exchangeTokenBalanceDecimal

@public
def getTokenPriceUint(_tokenAddress: address) -> uint256:
  self.token = _tokenAddress
  exchange_addr: address = self.uniswapFactory.getExchange(_tokenAddress)
  self.exchange = exchange_addr
  exchangeTokenBalance: uint256 = self.token.balanceOf(exchange_addr)
  exchangeEtherBalance: uint256(wei) = exchange_addr.balance
  exchangeEtherBalanceUint: uint256 = as_unitless_number(exchangeEtherBalance)
  return (exchangeEtherBalanceUint*10**18) / exchangeTokenBalance
  
@public
def getWalletValue(_tokenAddress: address[100], _numberOfTokens: int128) -> uint256:
  totalWalletValue: uint256
  for i in range(0,100):
    if i == _numberOfTokens:
      break
    self.token = _tokenAddress[i]
    tokenPrice: uint256 = self.getTokenPriceUint(_tokenAddress[i])
    numberOfTokens: uint256 = self.token.balanceOf(msg.sender)
    totalWalletValue += tokenPrice * numberOfTokens
  return totalWalletValue / 10**18



@payable
@public
def rebalanceFund(_tokenAddress: address[100], _weightings: uint256[100], _numberOfTokens: int128) -> uint256(wei):
  totalFundValue: uint256 = self.getWalletValue(_tokenAddress, _numberOfTokens)
  for i in range(0,100):
    if i == _numberOfTokens:
      break
    self.token = _tokenAddress[i]
    exchange_addr: address = self.uniswapFactory.getExchange(_tokenAddress[i])
    self.exchange = exchange_addr
    exchangeTokenBalance: uint256 = self.token.balanceOf(exchange_addr)
    exchangeTokenBalanceDecimal: uint256(wei) = as_wei_value(exchangeTokenBalance,'wei')
    exchangeEtherBalance: uint256(wei) = exchange_addr.balance
    # exchangeEtherBalanceDecimal: decimal = convert(exchangeEtherBalance, decimal)
    currentTokenPrice: uint256(wei) = as_wei_value(exchangeTokenBalanceDecimal / exchangeEtherBalance,'wei')
  
    totalFundValue += self.token.balanceOf(msg.sender)
  
  return 10
  # return self.exchange.ethToTokenTransferOutput(_tokens, block.timestamp + 10, msg.sender, value = msg.value)
  
  # self.token.approve(exchange_addr, _tokens)
  # return self.exchange.tokenToEthSwapInput(_tokens, 1, block.timestamp + 10)
  # return True


@public
@payable
def __default__():
  log.Payment()

