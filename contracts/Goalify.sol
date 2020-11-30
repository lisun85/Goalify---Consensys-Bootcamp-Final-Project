// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.8.0;

import "./SafeMath.sol";
import "./Ownable.sol";

    /// @author Li Sun
    /// @title the Dapp that allows you to bet on yourself to achieve your own goals.

    /*** 
    The game is very simple:
    - You, the staker, will have a goal you intend to achieve. 
    - You will use the app to 1) input your goal, 2) declare a minimum amount to bet on yourself, and 3) set a duration of how long you will give yourself to achieve this goal. 
    - You and your sponsor will bet. After duration passes, the judge will arbitrate the outcome (success for failure)
    - If you achieved your goal during this period of time, you will get your staked Eth back in full and also win the sponsor's bet. 
    - But if you fail, you will lose your staked bet. 
    */


contract Goalify {
    using SafeMath for uint256;
    
    ///@notice This enum is used to toggle contract state.
    enum State {CREATED, BETTING, APPROVED, CLOSED}

    ///@notice This enum is used to dictate outcome which can either be 1) successful (goal achieved) or 2) failed (goal failed). Useful for Judge to approve / arbitrate goal's outcome
    enum Outcome {SUCCEESS, FAILURE}

    uint dappFee; // This is fee that players will need to pay to the Dapp. For simplicity purposes, this fee will not be used.
    address public admin; // Setting admin / owner 
    
    bool isStopped = false; // This variable is specifically created for the Circuit Breaker design pattery. Bool must be false in order for contract to work.
    
    //Struct 
    struct Goal {
        uint8 id;
        uint256 betSize;
        uint256 pot;
        uint256 start;
        uint256 duration;
        uint256 end;
        string goalStatement;
        address payable staker;
        address payable sponsor;
        address payable judge;
        State state;
        Outcome outcome;
        uint8 tries;
        uint256 sponsorBetBalance;
    }
    
    mapping(uint8 => Goal) public goals; // Mapping to keep track goals set. For simplicity, this contract will only have 1 goal.
    uint8 public goalId; //  Label for each goal set. defualt will be "0", so first goal set wiill be ID "0". For simplicity, this contract will only have 1 goal
    
    constructor() payable public {
        // require(fee > 0 && fee < 100, "fee is a percentage that should be between 1% to 99%");
        dappFee = 5; // Dapp will take 5% of the pot, which is the sum of both stake and sponsor's bet. For simplicity purposes, this contract will not include the Dapp fee.
        admin = msg.sender;
    }
    
    /// @notice This is a function that if called will toggle the circuit breaker and halt entire contract from progressing. Only admin can call this function.
    function toggleCircuitBreaker() external onlyAdmin() {
        isStopped = !isStopped;
    }

    ///@notice This is where the staker creates the goal
    ///@param _statement The name and description of the goal
    ///@param _betSize The minimum size bet
    ///@param _duration The lengthn of time allowed for the goal to complete. For simplicity and demonstration purposes, duration should be in minutes.
    function createGoal(string calldata _statement, uint256 _betSize, uint256 _duration) external payable contractIsActive() {
        require(_duration >= 120, "Goal must be at least 120 seconds long");
        Goal storage goal = goals[goalId];
        goal.goalStatement = _statement;
        goal.betSize = _betSize;
        goal.duration = _duration;
        goal.start = now;
        goal.end = now + _duration;

        goal.staker = msg.sender;
        goal.state = State.CREATED;
    }

    ///@notice There is a 30 seconds window for sponsor to set himself as sponsor
    function setSponsor() external contractIsActive() {
        Goal storage goal = goals[goalId];
        require((now.sub(goal.start)) < 30, 'you must set your sponsor within 30 seconds after goal is created');
        require(msg.sender != goal.staker, 'sponsor must be different from staker');
        goal.sponsor = msg.sender;
    }

    ///@notice There is a 30 seconds window for judge to set himself as judge
    function setJudge() external contractIsActive() {
        Goal storage goal = goals[goalId];
        require((now.sub(goal.start)) < 30, 'you must set your judge within 30 seconds after goal is created');
        require(msg.sender != goal.staker, 'judge must be different from staker');
        goal.judge = msg.sender;
    }
    
    ///@notice There 120 second windown to bet. Betters must be staker or sponsor. Each bet must be > than betSize. Contract State can be in both CREATED and BETTING.
    ///@param _goalId This is the lable of the goal in the mapping "goals". This should always be "0", as we will only have 1 goal set.
    ///@notice If total betting amount exceeds the max pot (10x minimum betSize), then excess will be refunded and no more bet is allowed (reflected through two modifers).
    function bet(uint8 _goalId) external payable capBet(_goalId) refundExcess(_goalId) contractIsActive() {
        Goal storage goal = goals[_goalId];
        require((now.sub(goal.start)) < 121, 'your 120 seconds for betting on your goal has ended'); 
        require(msg.sender == goal.staker || msg.sender == goal.sponsor, "only staker and sponsor can bet");
        require(msg.value >= goal.betSize, "staker and sponsor must bet amount greater than or equal to betSize");
        require(goal.state == State.CREATED || goal.state == State.BETTING, "state must be in CREATED or BETTING");
        
        // Specifically used to track staker's bet balance. If goal results in "failure", then only staker will get refunded
        if(msg.sender == goal.sponsor) {goal.sponsorBetBalance += msg.value;}
        
        goal.pot += msg.value;
        goal.state = State.BETTING;
        
        // Staker and sponsor must bet within 24 hours of goal creation, otherwise goal will self delete and bets will be refunded. This mechanism is similiar to Auto Deprecation, goals are deleted if no one bets after 24 hours.
        if(now > (goal.start + 86400) && goal.pot == 0) {
            msg.sender.transfer(msg.value); //caller get refund back
            delete goals[_goalId];
        } 
    }
    
    ///@notice Function can only be called if goal's entire duration has passed. Only judge can approve / call this function. Decsion is binary (success or fail). State must be at Betting for this function to be called.
    ///@param decision This is a binary decision the judge must make. "1" is success and "2" is failure
    ///@return The decision has been made if true.
    function approve(uint8 _goalId, uint80 decision) external contractIsActive() returns(bool){
        Goal storage goal = goals[_goalId];
        require((now.sub(goal.start)) > goal.duration, "must wait until goal duration has ended");
        require(msg.sender == goal.judge, "only judge can approve");
        require(decision == 1 || decision == 2, 'decision is either 1 for SUCCEESS or 2 for FAILURE');
        require(goal.state == State.BETTING, "state must be in BETTING");
        
        // Staker wins his deposit + sponsor deposit. Actualy withdraw of funding reward to staker is contructected in seperate "distribute" function (Withdraw Pattern / Pull Over Push Payment Design Pattern)
        if(decision == 1) {
            goal.outcome = Outcome.SUCCEESS; 
            goal.state = State.APPROVED;
        }

        // Sponsor get his money back. This failed try will be journalized, and State now changes to Approved.
        // For simplicity of this project, staker will lose his entire stake if failed on first try. In future verisions of Goalify, I will code in a feature where stakers will have 2 more tries to win his/her money back.
        // Actual withdraw of refund to sponsor is contructected in a seperate "distribute" function (Withdraw Pattern / Pull Over Push Payment Design Pattern) 
        if(decision == 2) {
            goal.outcome = Outcome.FAILURE; 
            goal.state = State.APPROVED;
            goal.tries++; 
        }
        
        return true;
    }
    
    ///@notice This is the seperate withdraw function ("Pull over Push" Design Pattern). All internal accounting work is finalized before calling the external "transfer" function.
    function distribute(uint8 _goalId) external contractIsActive() {
        Goal storage goal = goals[_goalId];
        require(goal.outcome == Outcome.SUCCEESS || goal.outcome == Outcome.FAILURE, "judge must have given approval for SUCCEESS or FAILURE");
        require(goal.state == State.APPROVED, "state must be in APPROVED");
        require(msg.sender == goal.staker || msg.sender == goal.sponsor || msg.sender == goal.judge, "staker, judge, sponsor can distribute / claim reward (if any)");
        
        if(goal.outcome == Outcome.SUCCEESS) {
            uint256 amountWon = goal.pot; // For simplicity purposes, contract will not charge fees and reward staker the entire pot, in future versions, Goalify will take 5% fee calculated: goal.pot * (100 - dappFee) / 100);
            goal.pot = 0;
            goal.sponsorBetBalance = 0;
            goal.staker.transfer(amountWon); // Contract will withdraw staker's original deposit + sponsor's deposit 
        } 
        
        if(goal.outcome == Outcome.FAILURE) {
            uint256 amountRefund = goal.sponsorBetBalance;
            goal.pot -= goal.sponsorBetBalance;
            goal.sponsorBetBalance = 0;
            goal.sponsor.transfer(amountRefund);
        } //contract will withdraw sponsor's deposit back to the sponsor
        
        goal.state = State.CLOSED;
    }

    ///@return The balance of the pot. This is a view function.
    function viewPot(uint8 _goalId) public view contractIsActive() returns(uint256) {
        Goal storage goal = goals[_goalId];
        return goal.pot;
    }

    //modifers

    ///@notice If total betting amount exceeds the max pot (10x minimum betSize), then the excess from overbettting will be refunded back to msg.sender.
    modifier refundExcess(uint8 _goalId) {
        _;
        Goal storage goal = goals[_goalId];
        if(goal.pot > (SafeMath.mul(goal.betSize, 10))) { /***Note, using SafeMath here in case betSize is set to be huge number */
        uint256 refund = (goal.pot - (SafeMath.mul(goal.betSize, 10)));
        goal.pot -= refund;
        if(msg.sender == goal.sponsor) {goal.sponsorBetBalance -= refund;}
        msg.sender.transfer(refund);
        }
    }

    ///@notice If max pot is reached, no more bet is allowed
    modifier capBet(uint8 _goalId) {
        require(goals[_goalId].pot < (SafeMath.mul(goals[_goalId].betSize, 10)), "cannot bet more than 10x betSize"); /***Note, using SafeMath here in case betSize is set to be huge number */
        _;
    }
    
    modifier contractIsActive() {
        require(isStopped == false);
        _;
    }

    modifier onlyAdmin() {
        require(admin == msg.sender);
        _;
    }

}