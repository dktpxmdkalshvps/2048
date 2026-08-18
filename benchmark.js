import { performance } from 'perf_hooks';

function secureRandomOld() {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] / (0xffffffff + 1)
}

const sharedArray = new Uint32Array(1)
function secureRandomNew() {
  crypto.getRandomValues(sharedArray)
  return sharedArray[0] / (0xffffffff + 1)
}

const N = 1000000;

let start = performance.now();
for (let i = 0; i < N; i++) {
  secureRandomOld();
}
const timeOld = performance.now() - start;
console.log(`Old implementation took ${timeOld.toFixed(2)}ms`);

start = performance.now();
for (let i = 0; i < N; i++) {
  secureRandomNew();
}
const timeNew = performance.now() - start;
console.log(`New implementation took ${timeNew.toFixed(2)}ms`);
console.log(`Improvement: ${((timeOld - timeNew) / timeOld * 100).toFixed(2)}%`);
