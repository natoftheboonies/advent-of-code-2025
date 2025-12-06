export {};

let sample = `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  
`;

let puzzle = sample;

const puzzleFile = Bun.file("06.txt");
const input = await puzzleFile.text();
puzzle = input;

let lines = puzzle
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

let equations = lines.map((line) =>
  line.split(" ").filter((token) => token.length > 0)
);

// transpose equations
equations = equations[0].map((_, colIndex) =>
  equations.map((row) => row[colIndex])
);

let part1 = 0;
for (let eq of equations) {
  let operator = eq.pop();

  let total = eq
    .map((v) => parseInt(v))
    .reduce(
      (acc, n) => (operator === "+" ? acc + n : acc * n),
      operator === "+" ? 0 : 1
    );
  part1 += total;
}

console.log("part1:", part1);

// part 2: reinterpret numbers as right-to-left with each column as digits
let part2Lines: string[] = puzzle.split("\n").filter((line) => line.length > 0);

// transpose columns
let part2Cols: string[] = part2Lines[0]
  .split("")
  .map((_, colIndex) => part2Lines.map((row) => row[colIndex]).join(""));

//console.log("part2Cols:", part2Cols);

let groups: string[][] = [];
let group: string[] = [];
for (let line of part2Cols) {
  if (line.trim().length === 0) {
    if (group.length > 0) {
      groups.push(group);
      group = [];
    }
    continue;
  }
  group.push(line);
}
if (group.length > 0) {
  groups.push(group);
}

//console.log("groups:", groups);
let part2 = 0;
for (const equation of groups) {
  const operator = equation[0].trim().slice(-1);
  part2 += equation
    .map((l) => parseInt(l.slice(0, -1).trim()))
    .reduce(
      (acc, n) => (operator === "+" ? acc + n : acc * n),
      operator === "+" ? 0 : 1
    );
}
console.log("part2:", part2);
