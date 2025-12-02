import fs from "fs";

let sample = `11-22,95-115,998-1012,1188511880-1188511890,222220-222224,
1698522-1698528,446443-446449,38593856-38593862,565653-565659,
824824821-824824827,2121212118-2121212124`.split(",");

let input = sample;
// read 02.txt for real input
input = fs.readFileSync("02.txt", "utf8").trim().split(",");

let ranges = input.map((line) => {
  let [start, end] = line.split("-").map(Number);
  return { start, end, range: end - start };
});

// console.log(ranges);

// within range, find numbers which are 2 repeated patterns
// for example, between 43918886-44100815 we have 44004400, 44014441, 44024442, ...
function findPatterns(start, end) {
  let patterns = [];
  for (let n = start; n <= end; n++) {
    let s = n.toString();
    if (s.length % 2 === 0) {
      let half = s.length / 2;
      let first = s.slice(0, half);
      let second = s.slice(half);
      if (first === second) {
        patterns.push(n);
      }
    }
  }
  return patterns;
}

// let foo = findPatterns(43918886, 44100815);
// console.log(foo);

let sum = ranges
  .map(({ start, end }) => {
    let patterns = findPatterns(start, end);
    return patterns.reduce((a, b) => a + b, 0);
  })
  .reduce((a, b) => a + b, 0);
console.log("part1:", sum);

// next, we find other patterns, like ABCABC, ABABAB, AAAAA etc.
// for example, 824824821-824824827 has 824824824.
function findOtherPatterns(start, end) {
  let patterns = [];
  for (let n = start; n <= end; n++) {
    let s = n.toString();
    let len = s.length;
    for (let size = 1; size <= Math.floor(len / 2); size++) {
      if (len % size === 0) {
        let times = len / size;
        let segment = s.slice(0, size);
        let candidate = segment.repeat(times);
        if (candidate === s) {
          patterns.push(n);
          break;
        }
      }
    }
  }
  return patterns;
}

let sum2 = ranges
  .map(({ start, end }) => {
    let patterns = findOtherPatterns(start, end);
    return patterns.reduce((a, b) => a + b, 0);
  })
  .reduce((a, b) => a + b, 0);
console.log("part2:", sum2);
