## 🚧 Avoiding Common Attacks
A summary of steps taken to mitigate attacks commonly found on open blockchain platforms.

## Integer Over/Underflow Example
Given that there are no limit / cap for minimum betsize, an attacker can technically set the minimum betSize to a very large number that can overflow our smart contract. Thus, SafeMath is used when betSize is being multiplied - in modifier `refundExcess` and modifer `capBet`

Also, since there is no limit to setting the duration of the goal, stakers can technically set a near "infinite" time for goal completion. Just to be safe, SafeMath is used whenever time variables `now` is used, e.g. `now.sub(goal.start)`

## Reentrancy
To prevent an attacker from calling `distribute` multiple times before contract execution is over (thereby draining the contract's fund), internal accounting work is finalized before the .`transfer()` is executed.