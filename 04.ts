export {};

const sample = `..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.`;

const parseInput = (input: string): string[][] => {
  return input.split("\n").map((line) => line.split(""));
};

let parsedPuzzle = parseInput(sample);

const puzzle = Bun.file("04.txt");
parsedPuzzle = parseInput(await puzzle.text());

const floor = new Set<string>();

for (const [y, line] of parsedPuzzle.entries()) {
  for (const [x, char] of line.entries()) {
    if (char === "@") {
      floor.add(`${x},${y}`);
    }
  }
}

function findSparseRolls(floor: Set<string>): Set<string> {
  const sparse = new Set<string>();
  for (const key of floor) {
    const [x, y] = key.split(",").map(Number);
    let neighborCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const neighborKey = `${x + dx},${y + dy}`;
        if (floor.has(neighborKey)) {
          neighborCount++;
        }
      }
    }
    if (neighborCount < 4) {
      sparse.add(key);
    }
  }
  return sparse;
}

let sparse = findSparseRolls(floor);

console.log("Number of sparse rolls:", sparse.size);

let recursiveSparse = sparse.size;
while (sparse.size > 0) {
  for (const key of sparse) {
    floor.delete(key);
  }
  sparse = findSparseRolls(floor);
  recursiveSparse += sparse.size;
}
console.log("Number of sparse rolls (recursive):", recursiveSparse);
