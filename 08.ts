export {};

const sample = `162,817,812
57,618,57
906,360,560
592,479,940
352,342,300
466,668,158
542,29,236
431,825,988
739,650,466
52,470,668
216,146,977
819,987,18
117,168,530
805,96,715
346,949,466
970,615,88
941,993,340
862,61,35
984,92,344
425,690,689`;

let puzzle = sample;
let threshold = 10;
const puzzleFile = Bun.file("08.txt");
const input = await puzzleFile.text();
puzzle = input;
threshold = 1000;

class Junction {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  distance(other: Junction): number {
    let dx = Math.abs(this.x - other.x);
    let dy = Math.abs(this.y - other.y);
    let dz = Math.abs(this.z - other.z);
    return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
  }
  equals(other: Junction): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }
}

const parsed = puzzle
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split(",").map(Number))
  .map((coords) => new Junction(coords[0], coords[1], coords[2]));

// compute all pairwise distances
let pairs: { coordsA: Junction; coordsB: Junction; distance: number }[] = [];
for (let i = 0; i < parsed.length; i++) {
  for (let j = i + 1; j < parsed.length; j++) {
    const coordsA = parsed[i];
    const coordsB = parsed[j];
    const distance = coordsA.distance(coordsB);
    pairs.push({ coordsA, coordsB, distance });
  }
}
pairs.sort((a, b) => a.distance - b.distance);

function addPairToConstellations(
  constellations: Set<Junction>[],
  coordsA: Junction,
  coordsB: Junction
) {
  let foundConstellation = false;
  for (let constellation of constellations) {
    if (constellation.has(coordsA) || constellation.has(coordsB)) {
      constellation.add(coordsA);
      constellation.add(coordsB);
      foundConstellation = true;
      break;
    }
  }
  if (!foundConstellation) {
    constellations.push(new Set([coordsA, coordsB]));
  }
}

function mergeConstellations(constellations: Set<Junction>[]) {
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < constellations.length; i++) {
      for (let j = i + 1; j < constellations.length; j++) {
        let constellationA = constellations[i];
        let constellationB = constellations[j];
        if (
          Array.from(constellationA).some((point) => constellationB.has(point))
        ) {
          // merge
          constellations[i] = new Set([...constellationA, ...constellationB]);
          constellations.splice(j, 1);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  }
}

// group into constellations
let constellations: Set<Junction>[] = [];
for (const pair of pairs.slice(0, threshold)) {
  const { coordsA, coordsB } = pair;
  addPairToConstellations(constellations, coordsA, coordsB);
}

mergeConstellations(constellations);

constellations.sort((a, b) => b.size - a.size);

const part1 =
  constellations[0].size * constellations[1].size * constellations[2].size;

console.log("part1:", part1);

// part 2: continue until all points are connected
for (const pair of pairs.slice(threshold)) {
  const { coordsA, coordsB } = pair;
  addPairToConstellations(constellations, coordsA, coordsB);
  mergeConstellations(constellations);

  if (constellations.length === 1 && constellations[0].size === parsed.length) {
    console.log("part2:", pair.coordsA.x * pair.coordsB.x);
    break;
  }
}
