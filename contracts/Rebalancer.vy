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

@payable
@public
def rebalanceFund(_tokenAddress: address[100], _weightings: uint256[100], _numberOfTokens: int128) -> uint256(wei):
  totalFundValue: uint256
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
def getTokenPrice(_tokenAddress: address) -> uint256(wei):
  self.token = _tokenAddress
  exchange_addr: address = self.uniswapFactory.getExchange(_tokenAddress)
  self.exchange = exchange_addr
  exchangeTokenBalance: uint256 = self.token.balanceOf(exchange_addr)
  exchangeTokenBalanceDecimal: decimal = decimal(exchangeTokenBalance,'wei')
  exchangeEtherBalance: uint256(wei) = exchange_addr.balance
  # exchangeEtherBalanceDecimal: decimal = convert(exchangeEtherBalance, decimal)
  currentTokenPrice: uint256(wei) = as_wei_value(exchangeTokenBalanceDecimal / exchangeEtherBalance, 'wei')
  return currentTokenPrice

@public
@payable
def __default__():
  log.Payment()

