import { init } from "z3-solver";
import fs from "fs/promises";

const sample = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`;

let puzzle = sample;
try {
  const input = await fs.readFile("10.txt", "utf-8");
  puzzle = input;
} catch (e) {
  console.log("Using sample input");
}

// parse input
const lines = puzzle.split("\n").filter(Boolean);

const parsedLines = lines.map((line) => {
  const gridMatch = line.match(/^\[([.#]+)\]/);
  const operationsMatch = line.match(/\(([^)]+)\)/g);
  const numbersMatch = line.match(/\{([^}]+)\}/);

  if (!gridMatch || !operationsMatch || !numbersMatch) {
    throw new Error("Invalid line format");
  }

  const gridStr = gridMatch[1];
  const grid = parseInt(
    gridStr
      .split("")
      .reverse()
      .map((c) => (c === "#" ? "1" : "0"))
      .join(""),
    2
  );

  const operations = operationsMatch.map((op) => {
    const indices =
      op
        .match(/\d+/g)
        ?.map(Number)
        .filter((n) => !isNaN(n)) ?? [];
    // set bit i for each index i (bit 0 is least-significant), e.g. (1,3) -> 1<<1 | 1<<3 = 0b1010 = 10
    return indices.reduce((mask, i) => mask | (1 << i), 0);
  });
  const numbers = numbersMatch[1]
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n));
  return { grid, operations, numbers };
});

console.log(parsedLines);

// Part 1: BFS to find minimum steps to reach grid value
let sumMinSteps = 0;
for (const { grid, operations } of parsedLines) {
  const queue = [{ value: 0, steps: 0 }];
  const visited = new Set([0]);
  let foundSteps = -1;

  while (queue.length > 0) {
    const { value, steps } = queue.shift();
    if (value === grid) {
      foundSteps = steps;
      break;
    }
    for (const op of operations) {
      const newValue = value ^ op;
      if (!visited.has(newValue)) {
        visited.add(newValue);
        queue.push({ value: newValue, steps: steps + 1 });
      }
    }
  }

  console.log("min steps to reach grid", grid, "=", foundSteps);
  sumMinSteps += foundSteps;
}
console.log("part1:", sumMinSteps);

// Part 2: Use z3 solver for linear equations
async function solvePart2() {
  const { Context } = await init();
  let sumMinStepsPart2 = 0;

  for (const { numbers: goals, operations } of parsedLines) {
    // Create a new context for each line to avoid threading issues
    const ctx = Context("main");
    const { Int, Optimize } = ctx;
    const solver = new Optimize();
    const variables = [];

    // Create integer variables for each operation
    for (let i = 0; i < operations.length; i++) {
      const value = Int.const(String.fromCharCode(97 + i)); // a, b, c, ...
      solver.add(value.ge(0)); // All variables must be non-negative
      variables.push(value);
    }

    // Add constraints for each goal position
    for (let i = 0; i < goals.length; i++) {
      let condition = Int.val(0);
      for (let j = 0; j < operations.length; j++) {
        // Check if bit i is set in operation j
        if ((operations[j] & (1 << i)) !== 0) {
          condition = condition.add(variables[j]);
        }
      }
      // Constraint: sum of operations affecting position i must equal goal i
      solver.add(condition.eq(Int.val(goals[i])));
    }

    // Minimize the sum of all variables
    let sum = Int.val(0);
    for (const v of variables) {
      sum = sum.add(v);
    }
    solver.minimize(sum);

    // Check if satisfiable
    if ((await solver.check()) === "sat") {
      const resultSum = parseInt(solver.model().eval(sum).toString());
      console.log("solution for goals", goals, "= min steps:", resultSum);
      sumMinStepsPart2 += resultSum;
    } else {
      console.log("No solution found for goals", goals);
    }
  }

  console.log("part2:", sumMinStepsPart2);
}

solvePart2().catch(console.error);
