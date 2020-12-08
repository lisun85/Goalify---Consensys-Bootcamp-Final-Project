# :star2: Goalify 

 Welcome to Goalify, the Dapp that allows you to bet on yourself to achieve your own goals. Goalify utilizes smart contracts on the Ethereum blockchain to enforce goal-getters (aka stakers) to put "their money where their mouth is" and hold you accountable for the goals they intend to achieve. 
 
 ## 🎮 The Game

The game is very simple. You, the staker, will have a goal you intend to achieve. You will use the app to 1) input your goal, 2) declare a minimum amount to bet on yourself, and 3) set a duration of how long you will give yourself to achieve this goal. 

If you achieved your goal during this period of time, you will get your staked Eth back in full and perhaps win some more money (more on that below). But if you fail, you will lose your staked bet. 

This DAPP intends to use smart contract to reinforce behavior through programmable incentives (digital money / Eth)

## 👩🏻‍💻 The Players

1. Staker - the goal-setter / person who intend to use the Dapp to achieve their goal. That should be you.
2. Sponsor - someone who is willing to provide extra incentive for the stakers to achieve their goals. Sponsors are typically interested in the staker's success and are willing to reward the staker if the goal is achieved. For example, a staker may be an overweight person setting a goal to lose 10 lbs in a month, the sponsor could be his/her parent or spouse who is also interested in the staker's weight loss and are willing to reward the staker for such outcome.
3. Judge - an objective arbitrator that evaluates the outcome of the goal and approves the bet in the smart contract Dapp.

### 📜 The Rules

- Staker can bet 1 goal (for simplicity, only 1 goal allowed in this version of the Dapp)
- Each goal must have a mininum duration of 2 minutes (120 seconds). In reality, a goal should take days+ (86400+ seconds), but for demonstration purposes, we'll set the goal much shorter (in minutes).
- After the goal is set, the sponsor and judge both have 30 seconds to declar themselves. 
- After the goal is set, both staker and sponsor will have 2 minutes (120 seconds) to bet. They can bet once or string bet multiple times during the 2 minute window. Their bets will accumulate into the "pot".
- If there are no bets placed in 24 hours (86,400 seconds), the goal will self destruct and become deleted.
- There is a maximum cap on the goal's "pot" - cumulative bets from staker and sponsor cannot exceed 10 times the minimum betting size. For example, if the minimum bet is 1 Eth, max pot is capped at 10 Eth.
- If staker or sponsor bets more than the pot allowed max, then the incremental amount over the cap will be refunded to them.
- Judge does not have timeline to approve or reject results.
- Once judge made decision to approve (success) or reject (failure), payments may be claimed. If goal is achieved successfully, the staker will get his bet back + win the sponsor's bet. If goal resulted in failure, staker will lose his bet and sponsor will get fully refunded.

### 📖 How to Play

1. You, as staker, will input your goal's name, the minimum betting size, and the duration to achieve this goal (for demo / testing purposes, enter 120 - 240 seconds) then click "Set Goal!" Make sure you are on "Account 1" in your MetaMask. Betting size is in Eth, so if you enter "1" in the input textbox that's 1 Eth.
2. You must now set the sponsor and judge for your goal. For setting sponsor, move your MetaMask account to "Account 2" and then click "SET" just below the sponsor photo in web browser. For Judge, move your MetaMask account to "Account 3" and then click "SET" just below the Judge photo in web browser.
- 💡 IMPORTANT 💡 You must set both sponsor and judge within 30 seconds! otherwise your game will need to restart
3. Now it's time to bet, switch your MetaMask back to "Account 1" (as staker), input the amount to bet, and click "BET". Your input amount is automatically set in Eth, i.e. if you enter "2" in the input textbox and click "BET", MetaMask will prompt you to bet 2 Ethers.
4. Switch your MetaMask to "Account 2" (as sponsor) and bet. 
5. After goal's duration ended, the switch your MetaMask to "Account 3" (judge). The judge can now either approve (by clicking "Yes") meaning that goal is achieved, or reject (by clicking "No") meaning failure to achieve.
6. Post judge's decision, you can click on "Claim Eth1" button at the bottom of the browser. If goal is achieved, the staker will win sponsor's bet and get his own bet refunded. If goal is lost, then staker loses his bet and sponsor get fully refunded. The balances in MetaMask "Account 1" and "Account 2" will reflect the resulted winnings.

## 🛠 Technology
- Game logic is open-source and is an Ethereum smart contract written in Solidity
- Tools and libraries used: Truffle, Openzeppelin, NodeJS, Bootstrap

## 🚀‍ Development

### Prerequisites
- Node v10.5.0
- Solidity v0.5.0
- Truffle v5.0.7

### Setup
- Clone the git repo  
- Have a local blockchain running on port 8545 (e.g. using [Ganache](https://www.trufflesuite.com/ganache))
- Run `npm install`
- Run `npm run dev`
- Open up your browser and the project should be up on localhost:3000

### Contract interaction on a local blockchain
- Ensure your browser has a plugin (e.g. [Metamask](https://metamask.io/)) that allows you to interact with the Ethereum blockchain
- Ensure you have a local blockchain running (e.g. on Ganache)
- Select *Localhost:8545* or *Custom RPC* depending on which port your Ganache blockchain is running on
- Interact with the web interface

## ✅ Testing
- You can run the tests by running `truffle test` from the Goalify main directory