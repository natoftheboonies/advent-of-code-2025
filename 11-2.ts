export {};

const sample = `svr: aaa bbb
aaa: fft
fft: ccc
bbb: tty
tty: ccc
ccc: ddd eee
ddd: hub
hub: fff
eee: dac
dac: fff
fff: ggg hhh
ggg: out
hhh: out
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

// Count paths using simple memoization (assumes DAG - no cycles)
function countPathsDAG(
  from: string,
  to: string,
  graph: Graph,
  memo: Map<string, number> = new Map()
): number {
  if (from === to) return 1;

  if (memo.has(from)) return memo.get(from)!;

  let count = 0;
  for (const neighbor of graph[from] || []) {
    count += countPathsDAG(neighbor, to, graph, memo);
  }

  memo.set(from, count);
  return count;
}

// Count paths: svr -> fft
console.log("Counting paths svr → fft...");
const pathsSvrToFft = countPathsDAG("svr", "fft", graph);
console.log("Paths svr → fft:", pathsSvrToFft);

// Count paths: fft -> dac
console.log("Counting paths fft → dac...");
const pathsFftToDac = countPathsDAG("fft", "dac", graph);
console.log("Paths fft → dac:", pathsFftToDac);

// Count paths: dac -> out
console.log("Counting paths dac → out...");
const pathsDacToOut = countPathsDAG("dac", "out", graph);
console.log("Paths dac → out:", pathsDacToOut);

// Total paths that visit both fft and dac
const totalPaths = pathsSvrToFft * pathsFftToDac * pathsDacToOut;
console.log("\nTotal paths svr → fft → dac → out:", totalPaths);
