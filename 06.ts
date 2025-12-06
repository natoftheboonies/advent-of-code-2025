export {};

let sample = `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  
`;

let puzzle = sample;

const puzzleFile = Bun.file("06.txt");
const input = await puzzleFile.text();
//puzzle = input;

let lines = puzzle
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

let equations = lines.map((line) =>
  line.split(" ").filter((token) => token.length > 0)
);

// rotate equations
equations = equations[0].map((_, colIndex) =>
  equations.map((row) => row[colIndex])
);

function evaluteEquations(equations: string[][]) {
  let grandTotal = 0;
  for (let eq of equations) {
    let operator = eq.slice(-1)[0];

    let total = eq
      .slice(0, -1)
      .map((v) => parseInt(v))
      .reduce(
        (a, b) => {
          if (operator === "+") {
            return a + b;
          } else if (operator === "*") {
            return a * b;
          }
          return 0;
        },
        operator === "+" ? 0 : 1
      );

    grandTotal += total;
  }
  return grandTotal;
}
console.log("part1:", evaluteEquations(equations));

// part 2: reinterpret numbers as right-to-left one column as digits
let part2Lines = puzzle.split("\n").filter((line) => line.length > 0);
let operatorLine = part2Lines.pop()!;
let operatorIndexes: number[] = [];
for (let i = 0; i < operatorLine.length; i++) {
  if (operatorLine[i] === "+" || operatorLine[i] === "*") {
    operatorIndexes.push(i);
  }
}

console.log("operatorIndexes:", operatorIndexes);
equations = [];
let lastIndex = 0;
for (let index of operatorIndexes) {
  if (lastIndex === index) {
    continue;
  }
  let equationLine = part2Lines
    .map((line) => line.slice(lastIndex, index))
    .filter((line) => line.length > 0);
  equations.push([...equationLine, operatorLine[lastIndex]]);
  lastIndex = index;
}
let lastLine = [
  ...part2Lines
    .map((line) => line.slice(lastIndex))
    .filter((line) => line.length > 0),
  operatorLine[lastIndex],
];

equations.push(lastLine);

console.log("Parsed equations:", equations.slice(-10));

function transformEquation(equation: string[]): string[] {
  console.debug("equation:", equation);
  let operator = equation?.pop();
  let transformedNumbers: string[] = [];
  for (let i = 0; i < equation!.length; i++) {
    let numStr = "";
    for (let j = equation!.length - 1; j >= 0; j--) {
      numStr += equation![j][i] || "";
    }
    numStr = numStr.split("").reverse().join("");
    if (isNaN(parseInt(numStr))) {
      continue;
    }
    console.debug("Reinterpreted number:", numStr, "from column", i);
    transformedNumbers.push(numStr);
  }
  transformedNumbers.push(operator!);
  return transformedNumbers;
}

equations = equations.map((eq) => transformEquation(eq));
let transformedNumbers = evaluteEquations(equations);
console.log("part2:", transformedNumbers);
