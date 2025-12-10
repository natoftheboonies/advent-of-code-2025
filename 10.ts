export {};

const sample = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`;

let puzzle = sample;
const puzzleFile = Bun.file("10.txt");
const input = await puzzleFile.text();
//puzzle = input;

// parse input
const lines = puzzle.split("\n").filter(Boolean);
// each line has a grid, some operations in parentheses, and a set of numbers in curly braces
// for the grid, read it as reversed binary and parse into an integer.
// parse each operation into a reversed binary number where the indices in the parentheses are 1s and the rest are 0s.
// parse the numbers in curly braces into an array of integers.
type ParsedLine = {
  grid: number;
  operations: number[];
  numbers: number[];
};
const parsedLines: ParsedLine[] = lines.map((line) => {
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

// next, for each line we run a breadth-first search (BFS) starting from 0 with the goal of reaching the grid value.
// at each step, we can apply any of the operations (bitwise XOR) to the current value.
// we need to find the minimum number of steps to reach the grid value, or -1 if it's not possible.
let sumMinSteps = 0;
for (const { grid, operations } of parsedLines) {
  const queue: Array<{ value: number; steps: number }> = [
    { value: 0, steps: 0 },
  ];
  const visited = new Set<number>([0]);
  let foundSteps = -1;

  while (queue.length > 0) {
    const { value, steps } = queue.shift()!;
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

// part 2
// interpret the numbers in curly braces as goal values to reach.
// Solve system of linear equations using Gaussian elimination with integer arithmetic
function solveSystem(
  operations: number[],
  goals: number[]
): { solution: number[]; steps: number } {
  const numOps = operations.length;
  const numPositions = goals.length;

  // Build augmented matrix [A | b]
  // Each row is a position constraint, each column is an operation
  const matrix: number[][] = goals.map((goal, i) => [
    ...operations.map((op) => ((op & (1 << i)) !== 0 ? 1 : 0)),
    goal,
  ]);

  // Gaussian elimination to reduced row echelon form
  let currentRow = 0;
  const pivotCols: number[] = [];

  for (let col = 0; col < numOps && currentRow < numPositions; col++) {
    // Find pivot
    let pivotRow = -1;
    for (let row = currentRow; row < numPositions; row++) {
      if (matrix[row][col] !== 0) {
        pivotRow = row;
        break;
      }
    }

    if (pivotRow === -1) continue; // No pivot in this column

    // Swap rows
    [matrix[currentRow], matrix[pivotRow]] = [
      matrix[pivotRow],
      matrix[currentRow],
    ];

    pivotCols.push(col);

    // Normalize pivot row (divide by pivot element to make it 1)
    const pivot = matrix[currentRow][col];
    for (let j = 0; j <= numOps; j++) {
      matrix[currentRow][j] /= pivot;
    }

    // Eliminate above and below
    for (let row = 0; row < numPositions; row++) {
      if (row !== currentRow && matrix[row][col] !== 0) {
        const factor = matrix[row][col];
        for (let j = 0; j <= numOps; j++) {
          matrix[row][j] -= factor * matrix[currentRow][j];
        }
      }
    }

    currentRow++;
  }

  // Check for inconsistency: if any row has all zeros except the augmented column
  for (let row = currentRow; row < numPositions; row++) {
    let allZero = true;
    for (let col = 0; col < numOps; col++) {
      if (Math.abs(matrix[row][col]) > 1e-9) {
        allZero = false;
        break;
      }
    }
    // If all coefficients are zero but RHS is non-zero, inconsistent
    if (allZero && Math.abs(matrix[row][numOps]) > 1e-9) {
      return { solution: new Array(numOps).fill(0), steps: -1 }; // No solution
    }
  }

  // Identify free variables
  const isBoundColumn = new Set(pivotCols);
  const freeVars: number[] = [];
  for (let col = 0; col < numOps; col++) {
    if (!isBoundColumn.has(col)) {
      freeVars.push(col);
    }
  }

  // Try different values of free variables to find minimum solution
  const maxFreeVarValue = Math.max(
    100,
    goals.reduce((a, b) => a + b, 0)
  ); // Upper bound for search
  let bestSolution: number[] | null = null;
  let bestSum = Infinity;

  function tryFreeVarAssignment(assignment: number[]): void {
    const solution = new Array(numOps).fill(0);

    // Set free variables
    for (let i = 0; i < freeVars.length; i++) {
      solution[freeVars[i]] = assignment[i];
    }

    // For RREF, read off the values of pivot columns directly
    let valid = true;
    for (let i = 0; i < currentRow; i++) {
      const pivotCol = pivotCols[i];
      let val = matrix[i][numOps];

      // Subtract contributions from free variables (non-pivot columns)
      for (let col = 0; col < numOps; col++) {
        if (!isBoundColumn.has(col)) {
          val -= matrix[i][col] * solution[col];
        }
      }

      solution[pivotCol] = Math.round(val); // Round to handle floating point errors

      // Check if solution is non-negative
      if (solution[pivotCol] < -1e-6) {
        valid = false;
        break;
      }
    }

    if (valid) {
      const sum = solution.reduce((a, b) => a + b, 0);
      if (sum < bestSum) {
        bestSum = sum;
        bestSolution = solution;
      }
    }
  }

  // Generate all assignments of free variables up to a reasonable bound
  if (freeVars.length === 0) {
    // No free variables, just back-substitute
    const assignment: number[] = [];
    tryFreeVarAssignment(assignment);
  } else if (freeVars.length === 1) {
    // One free variable
    for (let v = 0; v <= maxFreeVarValue; v++) {
      tryFreeVarAssignment([v]);
    }
  } else if (freeVars.length === 2) {
    // Two free variables
    for (let v1 = 0; v1 <= maxFreeVarValue; v1++) {
      for (let v2 = 0; v2 <= maxFreeVarValue; v2++) {
        tryFreeVarAssignment([v1, v2]);
      }
    }
  } else {
    // More free variables - try limited search
    const limit = Math.min(20, maxFreeVarValue);
    for (let v1 = 0; v1 <= limit; v1++) {
      for (let v2 = 0; v2 <= limit; v2++) {
        const assignment = [v1, v2];
        for (let i = 2; i < freeVars.length; i++) {
          assignment.push(0);
        }
        tryFreeVarAssignment(assignment);
      }
    }
  }
  if (bestSolution === null) {
    return { solution: new Array(numOps).fill(0), steps: -1 };
  }

  return { solution: bestSolution, steps: bestSum };
}

function findMinimumSolution(
  operations: number[],
  goals: number[]
): { solution: number[]; steps: number } {
  // Try solving with Gaussian elimination first
  const result = solveSystem(operations, goals);
  if (result.steps !== -1) {
    return result;
  }

  return { solution: new Array(operations.length).fill(0), steps: -1 };
}

let sumMinStepsPart2 = 0;
for (const { numbers: goals, operations } of parsedLines) {
  const result = findMinimumSolution(operations, goals);
  console.log("solution for goals", goals, "=", result.solution);
  console.log("min steps to reach goals", goals, "=", result.steps);
  if (result.steps !== -1) {
    sumMinStepsPart2 += result.steps;
  }
}
console.log("part2:", sumMinStepsPart2);
// 15898 too low
