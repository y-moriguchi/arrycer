# Arrycer

Arrycer is an array library. Arrycer can munipulate arrays by axis like APL or NumPy.

## Example

```javascript
const A = Arrycer();

// multiply matrices
A.inner([[1, 2], [3, 4]], [[5, 6], [7, 8]], (accum, x) => accum + x, (accum, x) => accum * x);
// -> [[19, 23], [43, 50]]

// calculate times table
A.outer([1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9], (x, y) => x * y);
// -> [[1, 2, 3, 4, 5, 6, 7, 8, 9],
//     [2, 4, 6, 8, 10, 12, 14, 16, 18],
//     [3, 6, 9, 12, 15, 18, 21, 24, 27],
//     ...]

// transpose
A.T([[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [2, 3, 4]]]);
// -> [[[1, 7], [4, 2]], [[2, 8], [5, 3]], [[3, 9], [6, 4]]]

// concatenate arrays by axis
A.concatDeep(1, [[1, 2], [3, 4]], [[5, 6, 7], [8, 9, 0]]);
// -> [[1, 2, 5, 6, 7], [3, 4, 8, 9, 0]]
A.concatDeep(0.5, [[1, 2], [3, 4]], [[5, 6], [8, 9]]);
// -> [[[1, 2], [5, 6]], [[3, 4], [8, 9]]]

// map arrays
A.mapDeep((accum, x) => accum + x, 100, [[1, 2], [3, 4]], [[5, 6], [7, 8]]);
// [[6, 8], [10, 12]]
A.mapDeep((accum, x) => accum + x, 100, [[1, 2]], [[3], [4]]);  // broadcasting like NumPy
// [[4, 5], [5, 6]]

// reshape array
A.reshape([[1, 2], [3, 4]], 2, 3);
// -> [[1, 2, 3], [4, 1, 2]]

// take and drop array
A.take([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [-2, 2]);
// -> [[4, 5], [7, 8]]
A.drop([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, -1]);
// -> [[4, 5], [7, 8]]
```

