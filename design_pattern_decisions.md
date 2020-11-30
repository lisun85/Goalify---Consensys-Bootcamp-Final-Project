## 💡 Design Pattern Decisions
A summary of design pattern decisions and smart contract best practices taken into account for the Goalify contract.

### Circuit Breaker
The circuit breaker pattern allows the admin to pause the contract in the event that it is being abused or a bug is found and the contract needs to be upgraded. The `contractIsActive` modifier runs before each function and checks if the contract variable `isStopped` is false. If the `isStopped` is true, the contract will throw an error if that function is called. The admin can toggle paused using `toggleCircuitBreaker`

### Restricting Access
Goalify smart contract have various access restrictions for its functions:
- only staker's or sponsor's address are allowed to call the `bet` function
- only judge's address is allowed to call the `approve` function
- `onlyAdmin` modifier restrict access to the `toggleCircuitBreaker` function to allow only the owner/admin of the Goalify contract to call, thereby preventing non-admin users from pausing the contract in the event of bugs, hacks, etc.

### Withdrawal Pattern
Goalify uses the Pull Over Push pattern. Notice that `bet` function will not allow withdraw of funds and only serve to store the incoming bets. The `approve` function will also not engage in any withdraw of funds. Only in the `distribute` function that withdraws can be called based on the goal's outcome. I made sure to finalize the internal accounting work and update available balances before calling the external transfer function.

### Auto Deprecation
In the `bet` function, an auto deprecation is built in where if no bets are placed within 24 hours (86400 seconds) of goal creation, then the goal will expire and self-delete.
