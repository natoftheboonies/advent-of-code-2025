export {};

let sample = `.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............`;

let puzzle = sample;

const puzzleFile = Bun.file("07.txt");
const input = await puzzleFile.text();
puzzle = input;

let hats: Set<number>[] = [];
let row = 0;
for (let line of puzzle.split("\n")) {
  if (hats[row] === undefined) {
    hats[row] = new Set<number>();
  }
  for (let i = 0; i < line.length; i++) {
    let char = line[i];

    if (char === "^") {
      hats[row].add(i);
    }
  }
  row++;
}

//console.log("hats:", hats);

let start = puzzle.indexOf("S");
console.log("start:", start);
let splitCount = 0;
let stream = new Set<number>([start]);
for (let row = 0; row < hats.length; row++) {
  let newStream = new Set<number>();
  for (let col of stream) {
    if (hats[row].has(col)) {
      newStream.add(col + 1);
      newStream.add(col - 1);
      splitCount++;
    } else {
      newStream.add(col);
    }
  }
  stream = newStream;
}

console.log("part1:", splitCount);

const memo = new Map<string, number>();
function countTimelines(row: number, col: number): number {
  const key = `${row},${col}`;
  if (memo.has(key)) return memo.get(key)!;

  if (row >= hats.length) {
    memo.set(key, 1);
    return 1;
  }

  let timelines = 0;
  if (hats[row].has(col)) {
    timelines += countTimelines(row + 1, col - 1);
    timelines += countTimelines(row + 1, col + 1);
  } else {
    timelines += countTimelines(row + 1, col);
  }

  memo.set(key, timelines);
  return timelines;
}

let part2 = countTimelines(0, start);
console.log("part2:", part2);
