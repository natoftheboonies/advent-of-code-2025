export {};

const sample = `0:
###
##.
##.

1:
###
##.
.##

2:
.##
###
##.

3:
##.
###
##.

4:
###
#..
###

5:
###
.#.
###

4x4: 0 0 0 0 2 0
12x5: 1 0 1 0 2 2
12x5: 1 0 1 0 3 2
`;

let puzzle = sample;
const puzzleFile = Bun.file("12.txt");
const input = await puzzleFile.text();
puzzle = input;

// parse input
const sections = puzzle.split("\n\n").filter(Boolean);

// 3x3 polyomino definitions first.  translate these to list of relative points, with 0,0 as center
type Polyomino = { id: string; shape: [number, number][] };
const polyominos: Polyomino[] = [];
for (const section of sections) {
  const lines = section.split("\n").filter(Boolean);
  if (lines[0].includes("x")) break; // stop at layout definitions
  const id = lines[0].replace(":", "").trim();
  const shape: [number, number][] = [];
  for (let r = 0; r < lines.length; r++) {
    for (let c = 0; c < lines[r].length; c++) {
      if (lines[r][c] === "#") {
        shape.push([r - 1, c - 1]); // center at (1,1)
      }
    }
  }
  polyominos.push({ id, shape });
}
console.log("Parsed polyominos:", polyominos.length);
// example
console.log("First polyomino:", polyominos[0]);

// remaining input is bucket size and polyomino counts
type Layout = { width: number; height: number; counts: Record<string, number> };
const layouts: Layout[] = [];
for (const section of sections) {
  const lines = section.split("\n").filter(Boolean);
  if (!lines[0].includes("x")) continue; // skip polyomino definitions
  for (const line of lines) {
    const [sizePart, ...countParts] = line.split(" ");
    const [widthStr, heightStr] = sizePart.replace(":", "").trim().split("x");
    const width = parseInt(widthStr);
    const height = parseInt(heightStr);
    const counts: Record<string, number> = {};
    let idx = 0;
    for (const countPart of countParts) {
      const polyRequired = parseInt(countPart);
      if (polyRequired > 0) {
        const polyId = polyominos[idx].id;
        counts[polyId] = polyRequired;
      }
      idx++;
    }
    layouts.push({ width, height, counts });
  }
}

console.log(layouts.length, "layouts parsed.");
console.log("First layout:", layouts[0]);

// first let's filter out layouts which ask for more squares than available
function countPolyominoSquares(counts: Record<string, number>): number {
  let total = 0;
  for (const [id, count] of Object.entries(counts)) {
    const poly = polyominos.find((p) => p.id === id);
    if (poly) {
      total += poly.shape.length * count;
    }
  }
  return total;
}

const validLayouts = layouts.filter((layout) => {
  const totalSquares = countPolyominoSquares(layout.counts);
  return totalSquares <= layout.width * layout.height;
});

console.log("Valid layouts:", validLayouts.length);

// and that's all we need to do :joy:
