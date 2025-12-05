export {};
const sample = `3-5
10-14
16-20
12-18

1
5
8
11
17
32`;

let puzzle = sample;

const puzzleFile = Bun.file("05.txt");
const input = await puzzleFile.text();
puzzle = input;

let [rangeInput, ingredientsInput] = puzzle.split("\n\n");

function parseRanges(input: string): [number, number][] {
  return input.split("\n").map((line) => {
    const [start, end] = line.split("-").map(Number);
    return [start, end];
  });
}

const ranges = parseRanges(rangeInput);
const ingredients = ingredientsInput.split("\n").map(Number);
const isFreshIngredient = (
  ingredient: number,
  ranges: [number, number][]
): boolean => {
  for (const [start, end] of ranges) {
    if (ingredient >= start && ingredient <= end) {
      return true;
    }
  }
  return false;
};

let validCount = 0;
for (const ingredient of ingredients) {
  if (isFreshIngredient(ingredient, ranges)) {
    validCount += 1;
  }
}
console.log("Count of fresh ingredients:", validCount);

// sort ranges so we can merge them
ranges.sort((a, b) => a[0] - b[0]);
let mergedRanges: [number, number][] = [];

for (const range of ranges) {
  if (mergedRanges.length === 0) {
    mergedRanges.push(range);
  } else {
    const lastRange = mergedRanges[mergedRanges.length - 1];
    if (range[0] <= lastRange[1]) {
      lastRange[1] = Math.max(lastRange[1], range[1]);
    } else {
      mergedRanges.push(range);
    }
  }
}
// console.log("Merged Ranges:", mergedRanges);

let sumOfRanges = 0;
for (const [start, end] of mergedRanges) {
  sumOfRanges += end - start + 1; // inclusive range
}
console.log("Total range coverage:", sumOfRanges);
