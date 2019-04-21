var FundFactory = artifacts.require("FundFactory");
var Fund = artifacts.require("Fund");
var IFund = artifacts.require("IFund");

module.exports = function(deployer, network) {
    if (network == "rinkeby") {
        deployer.deploy(IFund);
        deployer.link(IFund, FundFactory);
        deployer.deploy(FundFactory);
    } else {
    // Perform a different step otherwise.
    }
    // deployment steps
    
};