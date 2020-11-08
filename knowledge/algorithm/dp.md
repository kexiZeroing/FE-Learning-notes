## Dynamic programming
DP is the method of storing values that were already calculated and using those values to avoid any recalculations, and this is referred to as memoization. It is useful for solving problems in which there are many repeated subproblems. This method can be applied only to those problems with **overlapping subproblems** and **optimal substructure**.

Optimal substructure means that any optimal solution to a problem of size `n`, is based on an optimal solution to the same problem when considering `n' < n` elements. That means, when building your solution for a problem of size `n`, you split the problem to smaller problems, one of them of size `n'`. Now you need only to consider the optimal solution to `n'` instead of all the possible solutions to it.

### DP and greedy algorithm
A greedy solution makes choices only using local information. It iteratively makes one greedy choice after another and never reconsiders its choices. As a result greedy solutions may "get stuck" at a local optimum instead of the global one. 

Dynamic programming is exhaustive and is guaranteed to find the solution. It makes decisions based on all the decisions made in the previous stage, and then combine the results from the subproblems to obtain the result for the initial problem.

### Classical Dynamic Programming Examples
```js
/*
  You are climbing a stair case. It takes n steps to reach to the top.
  Each time you can either climb 1 or 2 steps. 
  How many distinct ways can you climb to the top?
*/ 
let climbStairs = function(n) {
  const dp = Array(n+1).fill(0);
  dp[1] = 1;
  dp[2] = 2;
  
  for (let i = 3; i < dp.length; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  
  return dp[n];
};
```

```js
/*
  Given a list of non-negative integers representing the amount of money of each house, and the adjacent houses have security system,
  determine the maximum amount of money you can rob without alerting the police.
*/
let rob = function(nums) {
  const dp = Array(nums.length).fill(0);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);

  for (let i = 2; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 2] + nums[i], dp[i - 1]);
  }

  return dp[nums.length - 1];
};
```

```js
// Compute the fewest number of coins that you need to make up that amount.
let coinChange = function(coins, amount) {
  if (amount === 0) {
    return 0;
  }
  const dp = Array(amount + 1).fill(Number.MAX_VALUE)
  dp[0] = 0;

  for (let i = 1; i < dp.length; i++) {
    for (let j = 0; j < coins.length; j++) {
      if (i - coins[j] >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coins[j]] + 1);
      }
    }
  }

  return dp[dp.length - 1] === Number.MAX_VALUE ? -1 : dp[dp.length - 1];
};
```
