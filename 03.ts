export {};

let sample = `987654321111111
811111111111119
234234234234278
818181911112111`;

let input = sample;


// read 03.txt for real input
const inputFile = Bun.file("03.txt");
input = (await inputFile.text());

let parsedInput = input
  .trim()
  .split("\n")
  .map((line) => line.split("").map(Number));

function maxTwoDigits(arr: number[]): number {
    let max1 = Math.max(...arr.slice(0,-1));
    let pos1 = arr.indexOf(max1);
    let max2 = Math.max(...arr.slice(pos1 + 1));
    return max1*10 + max2;
}

let sumOfMaxes = 0;
parsedInput.forEach((line) => {
    let maxDigits = maxTwoDigits(line);
    sumOfMaxes += maxDigits;
});

console.log(`part 1: ${sumOfMaxes}`);



function maxTwelveDigits(arr: number[]): number {
    let maxDigits: number[] = [];
    for (let i = 12; i > 0; i--) {
        let search = arr.slice(0, arr.length - i + 1);
        // console.log(`Searching in ${search.join("")}`); 
        let max1 = Math.max(...search);
        // console.log(`Found max digit: ${max1}`);
        maxDigits.push(max1);
        arr = arr.slice(arr.indexOf(max1) + 1);
        // console.log(`Remaining array: ${arr.join("")}`);
    }
    return parseInt(maxDigits.join(""));
}

sumOfMaxes = 0;
parsedInput.forEach((line) => {
    let maxDigits = maxTwelveDigits(line);
    sumOfMaxes += maxDigits;
});

console.log(`part 2: ${sumOfMaxes}`);
