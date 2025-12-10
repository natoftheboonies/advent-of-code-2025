export {};

const sample = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`;

let puzzle = sample;
const puzzleFile = Bun.file("10.txt");
const input = await puzzleFile.text();
puzzle = input;

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
