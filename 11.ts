export {};

const sample = `aaa: you hhh
you: bbb ccc
bbb: ddd eee
ccc: ddd eee fff
ddd: ggg
eee: out
fff: out
ggg: out
hhh: ccc fff iii
iii: out
`;
let puzzle = sample;
const puzzleFile = Bun.file("11.txt");
const input = await puzzleFile.text();
puzzle = input;

// parse input
const lines = puzzle.split("\n").filter(Boolean);
// input lines specify a directed graph where each line is a node and its children
type Graph = Record<string, string[]>;
const graph: Graph = {};
lines.forEach((line) => {
  const [node, childrenStr] = line.split(":").map((s) => s.trim());
  const children = childrenStr
    ? childrenStr.split(" ").map((s) => s.trim())
    : [];
  graph[node] = children;
});

// perform BFS from 'you' to find all paths to 'out'
const start = "you";
const end = "out";
let countPaths = 0;
const queue: [string, string[], Set<string>][] = [[start, [], new Set()]];
while (queue.length > 0) {
  const [current, path, visited] = queue.shift()!;
  if (current === end) {
    console.log("Found path:", [...path, current]);
    countPaths++;
    continue;
  }
  if (visited.has(current)) continue;
  const newVisited = new Set(visited);
  newVisited.add(current);
  for (const neighbor of graph[current] || []) {
    queue.push([neighbor, [...path, current], newVisited]);
  }
}

console.log("Total paths from 'you' to 'out':", countPaths);
