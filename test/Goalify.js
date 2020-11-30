const { expectRevert, time } = require('@openzeppelin/test-helpers');
const balance = require('@openzeppelin/test-helpers/src/balance');
const { assertion } = require('@openzeppelin/test-helpers/src/expectRevert');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const Goalify = artifacts.require('Goalify.sol');

contract('Goalify', (accounts) => {
let contract;
const [staker, sponsor, judge] = [accounts[1], accounts[2], accounts[3]];
const [suc, fail] = [1, 2];
const betSize = 100;
const duration = 180;

before(async () => {
    contract = await Goalify.new();
    const originalStakerBalance = web3.utils.toBN(await web3.eth.getBalance(staker));
    const originalSponsorBalance = web3.utils.toBN(await web3.eth.getBalance(sponsor));
});

it('should NOT create goal if duration of the goal is less than two minutes', async() => {
    await expectRevert(
        contract.createGoal("goal1", betSize, 119, {from: staker}),
        "Goal must be at least 120 seconds long"
    );
});

it('should have created goal', async() => {
    await contract.createGoal("goal1", betSize, duration, {from: staker});
    await contract.setSponsor({from: sponsor});
    await contract.setJudge({from: judge});

    const goal = await contract.goals(0);
    assert(goal.id.toNumber() === 0);
    assert(goal.goalStatement.toString() == "goal1");
    assert(goal.state.toNumber() === 0);
    assert(goal.judge.toString() === judge);
    assert(goal.staker.toString() === staker);
});

it('should NOT allow staker to set himself as sponsor', async() => {
    await expectRevert(
        contract.setSponsor({from: staker}),
        "sponsor must be different from staker"
    );
});

it('should NOT allow staker to set himself as judge', async() => {
    await expectRevert(
        contract.setJudge({from: staker}),
        "judge must be different from staker"
    );
});

it('should NOT allow sponsor or judget to set after 30 seconds of goal creation', async() => {
    await time.increase(time.duration.seconds(31));
    await expectRevert(
        contract.setJudge({from: judge}),
        "you must set your judge within 30 seconds after goal is created"
    );
});

it('should NOT allow bet to occur if caller is not staker or sponsor', async () => {
    await expectRevert(
        contract.bet(0, {from: judge, value: 100}),
        "only staker and sponsor can bet"
    );
});

it('should NOT allow bet to be less than betSize', async () => {
    await expectRevert(
        contract.bet(0, {from: staker, value: 99}),
        "staker and sponsor must bet amount greater than or equal to betSize"
    );
})

it('made a bet from staker', async () => {
    await contract.bet(0, {from: staker, value: 100});

    const goal = await contract.goals(0);
    assert(goal.pot.toNumber() === 100);
    assert(goal.state.toNumber() === 1);
    assert(goal.duration.toNumber() === 180);
})

it('made a bet from sponsor', async () => {
    await contract.bet(0, {from: sponsor, value: 100});

    const goal = await contract.goals(0);
    assert(goal.sponsorBetBalance.toNumber() === 100);
    assert(goal.pot.toNumber() === 200);
})

it('should NOT allow more bets if cap (10x betsize) is reached', async () => {
    await contract.bet(0, {from: sponsor, value: 800});

    await expectRevert(
        contract.bet(0, {from: staker, value: 100}),
        "cannot bet more than 10x betSize"
    );
})

it('should NOT approve if duration has not ended', async() => {
    await expectRevert(
        contract.approve(0, 1, {from: judge}),
        "must wait until goal duration has ended"
    );
});

it('should NOT allow anyone other than judge to approve', async () => {
    await time.increase(time.duration.seconds(duration + 1));
    await expectRevert(
        contract.approve(0, 1, {from: staker}),
        "only judge can approve"
    )
})

it('should NOT allow more than two deicsion outcomes', async () => {
    await expectRevert(
        contract.approve(0, 3, {from: judge}),
        "decision is either 1 for SUCCEESS or 2 for FAILURE"
    )
})

it('should approve and distribute correctly', async () => {    
    await contract.approve(0, 1, {from: judge});
    
    const goal = await contract.goals(0);
    const amountWon = goal.pot;
    
    assert(goal.outcome.toNumber() === 0);
    assert(goal.state.toNumber() === 2);

    const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(staker));
    
    await contract.distribute(0, {from: judge});

    const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(staker));

    const goalAfterDistribution = await contract.goals(0);

    assert(goalAfterDistribution.pot.toNumber() === 0);
    assert(balanceAfter.sub(balanceBefore).eq(amountWon));
})

it('should NOT allow approval unless state is in BETTING', async () => {
    await expectRevert(
        contract.approve(0, 1, {from: judge}),
        "state must be in BETTING"
    )
})

});