export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomCoords(maxIn: number): CoordSet {
  let randX = this.getRandomInt(0, maxIn);
  let randY = this.getRandomInt(0, maxIn);

  let coordSet = new CoordSet(randX, randY);

  return coordSet;
}

export var colorList: Array<string> = [
  "#CF2F2F",
  "#2FCF2F",
  "#2F2FCF",
  "#CFCF2F",
  "#2FCFCF",
  "#CF2FCF",
  "#2F2F2F"
];

export class CoordSet {
  readonly x: number;
  readonly y: number;

  constructor(xIn: number, yIn: number) {
    this.x = xIn;
    this.y = yIn;
  }
}

export function isObjInArray(obj: Object, arr: Array<Object>): boolean {
  for (let i: number = 0; i < arr.length; i++) {
    let arrElemKeys: Array<string> = Object.keys(arr[i]);
    let objKeys: Array<string> = Object.keys(obj);

    if (!this.arraysEqual(arrElemKeys, objKeys)) {
      continue;
    }

    let arrElemVals: Array<string> = Object.values(arr[i]);
    let objVals: Array<string> = Object.values(obj);

    if (!this.arraysEqual(arrElemVals, objVals)) {
      continue;
    }

    return true;
  }

  return false;
}

export function arraysEqual(arr1: Array<any>, arr2: Array<any>) {
  if (arr1.length !== arr2.length) return false;
  for (var i = arr1.length; i--; ) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}
