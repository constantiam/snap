#each component of the fund has a token address and the desirned weighting

# struct FundComponent:
#   tokenWeight: int128
#   tokenAddress: address

# fundComponents: public(map(int128, FundComponent))
components: address[100]
weightings: int128[100]

numberOfComponents: public(int128)
factory: public(address)
owner: public(address)
rebalancePeriod: public(timestamp)
lastRebalance: public(timestamp)

@public
def __init__(_owner: address, _rebalancePeriod: timestamp, _components : address[100], _weightings: int128[100], _numberOfComponents: int128):
  self.factory = msg.sender
  self.owner = _owner
  self.rebalancePeriod = _rebalancePeriod
  self.components = _components
  self.weightings = _weightings

@public
def setRebalancePeriod(_newPeriod: timestamp):
  assert msg.sender == self.owner
  self.rebalancePeriod = _newPeriod

@public
def updateFundComponents(_components : address[100], _weightings: int128[100]):
  assert msg.sender == self.owner
  # self.fundComponents[self.numberOfComponents].tokenWeight = _tokenWeight
  # self.fundComponents[self.numberOfComponents].tokenAddress = _tokenAddress

# @private
# def SetFundComponents():