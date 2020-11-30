const Goalify = artifacts.require("Goalify.sol");
const SafeMath = artifacts.require("SafeMath.sol");

module.exports = function (deployer) {
  deployer.deploy(Goalify);
  deployer.deploy(SafeMath);
};