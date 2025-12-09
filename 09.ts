export {};

const sample = `7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3`;

let puzzle = sample;
const puzzleFile = Bun.file("09.txt");
const input = await puzzleFile.text();
puzzle = input;

const lines = puzzle.split("\n").filter(Boolean);
const points = lines.map((line) => line.split(",").map(Number));

let maxRectArea = 0;
for (let i = 0; i < points.length; i++) {
  for (let j = i + 1; j < points.length; j++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[j];
    const width = Math.abs(x2 - x1) + 1;
    const height = Math.abs(y2 - y1) + 1;
    const area = width * height;
    if (area > maxRectArea) {
      maxRectArea = area;
    }
  }
}
console.log("part1:", maxRectArea);

// part 2
// construct a list of rectangles and sort by area descending
type Rectangle = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  area: number;
};
let rectangles: Rectangle[] = [];
for (let i = 0; i < points.length; i++) {
  for (let j = i + 1; j < points.length; j++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[j];
    const width = Math.abs(x2 - x1) + 1;
    const height = Math.abs(y2 - y1) + 1;
    const area = width * height;
    rectangles.push({
      x1: Math.min(x1, x2),
      y1: Math.min(y1, y2),
      x2: Math.max(x1, x2),
      y2: Math.max(y1, y2),
      area,
    });
  }
}
rectangles.sort((a, b) => b.area - a.area);

// https://www.xjavascript.com/blog/check-if-polygon-is-inside-a-polygon/
function isPointInPolygon(point: number[], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// helper to check if point lies on segment
function isPointOnSegment(
  point: number[],
  segA: number[],
  segB: number[]
): boolean {
  const [px, py] = point;
  const [x1, y1] = segA;
  const [x2, y2] = segB;

  // Check if point is within the bounding box of the segment
  if (
    px >= Math.min(x1, x2) &&
    px <= Math.max(x1, x2) &&
    py >= Math.min(y1, y2) &&
    py <= Math.max(y1, y2)
  ) {
    // Check if the point is collinear with segA and segB
    const crossProduct = (px - x1) * (y2 - y1) - (py - y1) * (x2 - x1);
    return Math.abs(crossProduct) < 1e-10; // Collinear points have cross product ≈ 0
  }
  return false;
}

function isPointInPolygonInclusive(
  point: number[],
  polygon: number[][]
): boolean {
  // first check if point lies exactly on any polygon segment
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (isPointOnSegment(point, polygon[j], polygon[i])) return true;
  }
  // otherwise fall back to the ray-cast test
  return isPointInPolygon(point, polygon);
}

// Helper: orientation of ordered triplet (a, b, c)
// Returns 0 (collinear), 1 (clockwise), or 2 (counterclockwise)
function orientation(a: number[], b: number[], c: number[]): number {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const [x3, y3] = c;
  const val = (y2 - y1) * (x3 - x2) - (x2 - x1) * (y3 - y2);
  if (Math.abs(val) < 1e-10) return 0;
  return val > 0 ? 1 : 2;
}

// Helper: check if point p lies within the bounding box of segment (a, b)
function onSegment(a: number[], b: number[], p: number[]): boolean {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const [x, y] = p;
  return (
    x >= Math.min(x1, x2) - 1e-10 &&
    x <= Math.max(x1, x2) + 1e-10 &&
    y >= Math.min(y1, y2) - 1e-10 &&
    y <= Math.max(y1, y2) + 1e-10
  );
}

function segmentsIntersect(
  a1: number[],
  a2: number[],
  b1: number[],
  b2: number[]
): boolean {
  const o1 = orientation(a1, a2, b1);
  const o2 = orientation(a1, a2, b2);
  const o3 = orientation(b1, b2, a1);
  const o4 = orientation(b1, b2, a2);

  if (o1 !== o2 && o3 !== o4) return true;

  // Special cases: collinear
  if (o1 === 0 && onSegment(a1, a2, b1)) return true;
  if (o2 === 0 && onSegment(a1, a2, b2)) return true;
  if (o3 === 0 && onSegment(b1, b2, a1)) return true;
  if (o4 === 0 && onSegment(b1, b2, a2)) return true;

  return false;
}

// find the largest rectangle that is contained within the polygon formed by the points
let largestContainedArea = 0;
for (let rect of rectangles) {
  const rectPoints = [
    [rect.x1, rect.y1],
    [rect.x2, rect.y1],
    [rect.x2, rect.y2],
    [rect.x1, rect.y2],
  ];
  let allInside = true;
  // 1) all rectangle corners must be inside (or on edge of) the polygon
  for (let rp of rectPoints) {
    if (!isPointInPolygonInclusive(rp, points)) {
      allInside = false;
      break;
    }
  }
  if (!allInside) continue;

  // 2) rectangle edges may touch polygon boundary (corners or vertices) but cannot cross through it
  const rectEdges: Array<[number[], number[]]> = [];
  for (let i = 0; i < 4; i++) {
    rectEdges.push([rectPoints[i], rectPoints[(i + 1) % 4]]);
  }
  for (let [ra, rb] of rectEdges) {
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const pa = points[j];
      const pb = points[i];
      if (!segmentsIntersect(ra, rb, pa, pb)) continue;

      // allowed intersection if it's because a rectangle corner lies on the polygon edge
      // or if a polygon vertex lies on the rectangle edge (touching boundary allowed)
      const raOnPoly = isPointOnSegment(ra, pa, pb);
      const rbOnPoly = isPointOnSegment(rb, pa, pb);
      const polyVertexOnRect =
        isPointOnSegment(pa, ra, rb) || isPointOnSegment(pb, ra, rb);
      if (raOnPoly || rbOnPoly || polyVertexOnRect) {
        // touching the polygon boundary is allowed
        continue;
      }

      // otherwise this is an intersection in the interior of the rectangle edge => not contained
      allInside = false;
      break;
    }
    if (!allInside) break;
  }
  if (allInside) {
    console.log("found largest contained rectangle:", rect);
    largestContainedArea = Math.max(largestContainedArea, rect.area);
    break;
  }
}

console.log("part2:", largestContainedArea);
// not 4664572758
