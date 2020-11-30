const Goalify = artifacts.require("Goalify.sol");

module.exports = function (deployer) {
  deployer.deploy(Goalify);
};
