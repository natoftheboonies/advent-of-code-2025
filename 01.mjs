import fs from "fs";

let sample = `L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`.split("\n");

let input = sample;
// read 01.txt for real input
// input = fs.readFileSync("01.txt", "utf8").trim().split("\n");

let moves = input.map((line) => {
  let [_, dir, dist] = line.match(/([LR])(\d+)/);
  return { dir, dist: Number(dist) };
});

let counter = 0;
let counter2 = 0;
let dial = 50;
console.log(`The dial starts by pointing at ${dial}.`);
moves.forEach((move) => {
  let thisMove = `${move.dir}${move.dist}`;
  let passesZero = 0;

  if (move.dir === "L") {
    // steps until next zero when moving left
    let next = dial % 100;
    if (next === 0) next = 100;
    if (move.dist >= next) {
      passesZero = 1 + Math.floor((move.dist - next) / 100);
    }
    dial -= move.dist;
  } else {
    // steps until next zero when moving right
    let next = (100 - dial) % 100;
    if (next === 0) next = 100;
    if (move.dist >= next) {
      passesZero = 1 + Math.floor((move.dist - next) / 100);
    }
    dial += move.dist;
  }

  while (dial < 0) {
    dial += 100;
  }
  dial %= 100;

  if (dial === 0) {
    // landing on zero counts for part1 but should not count as a pass-through
    counter++;
    passesZero = Math.max(0, passesZero - 1);
  }
  counter2 += passesZero;

  let suffix = "";
  if (passesZero > 0) {
    suffix =
      `during this rotation, it points at 0` +
      (passesZero > 1 ? ` ${passesZero} times.` : ` once.`);
  }
  console.log(
    `The dial is rotated ${thisMove} to point at ${dial}. ${suffix || ""}`
  );
});

console.log("part1:", counter);
console.log("part2:", counter + counter2);
// part2: 6581 too low
// part2: 7034 too high
// part2: 6880 too high
// part2: 6680 is also wrong
// part2: 6789 is correct!
