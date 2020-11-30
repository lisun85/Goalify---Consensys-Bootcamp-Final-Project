// const web3 = require("@openzeppelin/test-helpers/src/config/web3");


App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
    
  },


  initContract: function() {
    $.getJSON('Goalify.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var GoalifyArtifact = data;
      App.contracts.Goalify = TruffleContract(GoalifyArtifact);

      // Set the provider for our contract
      App.contracts.Goalify.setProvider(App.web3Provider);
    });

    var accountMetaMask = web3.eth.accounts[0]
    document.getElementById('output').innerHTML = "MM Account:" + " " + accountMetaMask;

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', "#setgoal", App.handleCreateGoal);
    $(document).on('click', "#setSponsor", App.handleSetSponsor);
    $(document).on('click', "#setJudge", App.handleSetJudge);
    $(document).on('click', "#betStaker", App.handleBetStaker);
    $(document).on('click', "#betSponsor", App.handleBetSponsor);
    $(document).on('click', "#approveJudge", App.handleApproveJudge);
    $(document).on('click', "#rejectJudge", App.handleRejectJudge);
    $(document).on('click', "#claim", App.handleClaim);
  },

  handleCreateGoal: function(event) {
    console.log("fired-GoalCreation")
    
    event.preventDefault();

    var goalifyInstance;
    var goalName = $('#goalName').val();
    var goalBetSize = $('#goalBetSize').val();
    var goalDuration = $('#goalDuration').val();
    var BetSizeinEth = goalBetSize * 1000000000000000000;
    
    var accountMetaMask = web3.eth.accounts[0]
    document.getElementById('output').innerHTML = "MM Account:" + "  " + accountMetaMask;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var staker = accounts[0];
      
      App.contracts.Goalify.deployed().then(function(instance) {
        goalifyInstance = instance;
  
        return goalifyInstance.createGoal(goalName, BetSizeinEth, goalDuration, {from: staker});
      }).catch(function(err) {
        console.log(err.message);
      });

    });
    
    document.getElementById('outputGoalCreation').placeholder = "Your Goal is Created!";
    document.getElementById('outputTopBanner').innerText = "Your Goal is Set!"
  },

  handleSetSponsor: function(event) {
    console.log("fired-SetSponsor")
    
    event.preventDefault();

    var goalifyInstance;
    var accountMetaMask = web3.eth.accounts[0]
    document.getElementById('output').innerHTML = "MM Account:" + "  " + accountMetaMask;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var sponsor = web3.eth.accounts[1];      
      
      App.contracts.Goalify.deployed().then(function(instance) {
        goalifyInstance = instance;
  
        return goalifyInstance.setSponsor({from: sponsor});
      }).catch(function(err) {
        console.log(err.message);
      });

    });

    document.getElementById('outputSponsor').placeholder = "Sponsor is set";
    document.getElementById('outputTopBanner').innerText = "Sponsor is set!";

  },

  handleSetJudge: function(event) {
    console.log("fired-SetJudge")
    
    event.preventDefault();

    var goalifyInstance;
    var accountMetaMask = web3.eth.accounts[0]
    document.getElementById('output').innerHTML = "MM Account:" + "  " + accountMetaMask;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var staker = accounts[0];
      var sponsor = accounts[1];
      var judge = web3.eth.accounts[2];
      
      App.contracts.Goalify.deployed().then(function(instance) {
        goalifyInstance = instance;
  
        return goalifyInstance.setJudge({from: judge});
      }).catch(function(err) {
        console.log(err.message);
      });
    });

    document.getElementById('outputJudge').placeholder = "Judge is set";
    document.getElementById('outputTopBanner').innerText = "Judge is set!";
  },

  handleBetStaker: function(event) {
    console.log("fired-BetStaker")
    
    event.preventDefault();

    var goalifyInstance;
    var betInputStaker = $('#stakerBetInput').val();
    var betinEth1 = betInputStaker * 1000000000000000000;

    var accountMetaMask = web3.eth.accounts[0]
    document.getElementById('output').innerHTML = "MM Account:" + "  " + accountMetaMask;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var staker = accounts[0];
      
      App.contracts.Goalify.deployed().then(function(instance) {
        goalifyInstance = instance;
  
        return goalifyInstance.bet(0, {from: staker, value: betinEth1});
      }).then(function(){
        goalifyInstance.viewPot(0).then(function(pot) {
          totalPot = pot/1000000000000000000
        
          document.getElementById('outputTopBanner').innerText = "Total Pot =" + " " + totalPot + " " + "Ethers";
        })
      })
      .catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleBetSponsor: function(event) {
    console.log("fired-BetSponsor")
    
    event.preventDefault();

    var goalifyInstance;
    var betInputSponsor = $('#sponsorBetInput').val();
    var betinEth2 = betInputSponsor * 1000000000000000000;
    
    var accountMetaMask = web3.eth.accounts[0]
    document.getElementById('output').innerHTML = "MM Account:" + "  " + accountMetaMask;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var staker = accounts[0];
      var sponsor = accounts[1];
      
      App.contracts.Goalify.deployed().then(function(instance) {
        goalifyInstance = instance;
        
        return goalifyInstance.bet(0, {from: sponsor, value: betinEth2});
      }).then(function(){
        goalifyInstance.viewPot(0).then(function(pot) {
          totalPot = pot/1000000000000000000
        
          document.getElementById('outputTopBanner').innerText = "Total Pot =" + " " + totalPot + " " + "Ethers";
        })
      })
      .catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleApproveJudge: function(event) {
    console.log("fired-ApproveJudge");

    event.preventDefault();

    var goalifyInstance;
    var accountMetaMask = web3.eth.accounts[0]
    document.getElementById('output').innerHTML = "MM Account:" + "  " + accountMetaMask;

    web3.eth.getAccounts(function(error, accounts) {
      if(error) {
        console.log(error);
      }

      var judge = accounts[3];

      App.contracts.Goalify.deployed().then(function(instance) {
        goalifyInstance = instance;
        
        return goalifyInstance.approve(0, 1, {from: judge});
      }).catch(function(err) {
        console.log(err.message);
      });

      document.getElementById('outputTopBanner').innerText = "Success! You Have Achieved Your Goal!";
    });
  },

  handleRejectJudge: function(event) {
    console.log("fired-RejectJudge");

    event.preventDefault();

    var goalifyInstance;
    var accountMetaMask = web3.eth.accounts[0]
    document.getElementById('output').innerHTML = "MM Account:" + "  " + accountMetaMask;

    web3.eth.getAccounts(function(error, accounts) {
      if(error) {
        console.log(error);
      }

      var judge = accounts[3];

      App.contracts.Goalify.deployed().then(function(instance) {
        goalifyInstance = instance;
        
        return goalifyInstance.approve(0, 2, {from: judge});
      }).catch(function(err) {
        console.log(err.message);
      });

      document.getElementById('outputTopBanner').innerText = "Failed! Better Luck Next Time";
    });
  },

  handleClaim: function(event) {
    console.log("fired-Claimed")
    
    event.preventDefault();

    var goalifyInstance;
    // let betSize = web3.utils.toWei("1", "ether");

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var staker = accounts[0];
      var sponsor = accounts[1];
      
      App.contracts.Goalify.deployed().then(function(instance) {
        goalifyInstance = instance;
  
        return goalifyInstance.distribute(0);
      }).catch(function(err) {
        console.log(err.message);
      });
      document.getElementById('outputTopBanner').innerText = "Goalify is now closed. Thank you for playing";
    });
  },


};

$(function() {
  $(window).on('load',function() {
    App.init();
  });
});
