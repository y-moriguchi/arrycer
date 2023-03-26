/**
 * Arrycer
 *
 * Copyright (c) 2023 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
/*
 * This test case is described for Jasmine.
 */
describe("arrycer", function() {
    const A = Arrycer();
    const mulf = (accum, x) => accum * x;
    const addf = (accum, x) => accum + x;
    const subf = (accum, x) => accum - x;
    const condf = (x, y, z) => x ? y : z;
    const concatf = (x, y) => x.concat(y);
    const ok = (actual, expected) => expect(actual).toEqual(expected);
    const undef = void 0;

    function okMatrix(actual, expected) {
        if(!Array.isArray(actual) && !Array.isArray(expected)) {
            expect(actual).toBeCloseTo(expected, 7);
        } else if(Array.isArray(actual) && Array.isArray(expected) && actual.length === expected.length) {
            for(let i = 0; i < actual.length; i++) {
                okMatrix(actual[i], expected[i]);
            }
        } else {
            fail("Matrix shape is different");
        }
    }

    beforeEach(function() {
    });

    describe("testing arrycer", function() {
        it("inner", function() {
            ok(A.inner(2, 7, addf, mulf), 14);
            ok(A.inner(2, [[1, 2], [3, 4]], addf, mulf), [8, 12]);
            ok(A.inner([[1, 2], [3, 4]], 2, addf, mulf), [6, 14]);
            ok(A.inner([1, 2, 3], [4, 5, 6], addf, mulf), 32);
            ok(A.inner([1, 2, 3], [4, 5, 6], addf, mulf, 2, 2), 66);
            ok(A.inner([1, 2, 3], [4, 5, 6], subf, mulf), -24);
            ok(A.inner([[1, 2], [3, 4]], [[5, 6], [7, 8]], addf, mulf), [[19, 22], [43, 50]]);
            ok(A.inner(A.reshape([1, 2, 3], 2, 3, 4), A.reshape([2, 3, 4], 4, 3, 2), addf, mulf),
                [[[[14, 21], [28, 14], [21, 28]], [[16, 24], [32, 16], [24, 32]], [[18, 27], [36, 18], [27, 36]]],
                 [[[14, 21], [28, 14], [21, 28]], [[16, 24], [32, 16], [24, 32]], [[18, 27], [36, 18], [27, 36]]]]);
            ok(A.inner([[1, 2], [3, 4]], [[5, 6], [7, 8]], (accum, x) => accum.concat(x), (accum, x) => accum.concat(x), [], [], 1, 1), [1, 2, 5, 6, 3, 4, 7, 8]);
        });

        it("outer", function() {
            ok(A.outer(2, 7, mulf), 14);
            ok(A.outer([1, 2], [3, 4], mulf), [[3, 4], [6, 8]]);
            ok(A.outer([[1, 2], [3, 4]], [[5, 6], [7, 8]], mulf),
                [[[[5, 6], [7, 8]], [[10, 12], [14, 16]]], [[[15, 18], [21, 24]], [[20, 24], [28, 32]]]]);
            ok(A.outer([1, [2, 3]], [3, 4], mulf), [[3, 4], [[6, 8], [9, 12]]]);
            ok(A.outer([[1, 2], [3, 4]], [[5, 6], [7, 8]], concatf, 1),
                [[[1, 2, 5, 6], [1, 2, 7, 8]], [[3, 4, 5, 6], [3, 4, 7, 8]]]);
        });

        it("T", function() {
            ok(A.T(1), 1);
            ok(A.T([1, 2]), [1, 2]);
            ok(A.T([[1, 2], [3, 4]]), [[1, 3], [2, 4]]);
            ok(A.T([[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [2, 3, 4]]]), [[[1, 7], [4, 2]], [[2, 8], [5, 3]], [[3, 9], [6, 4]]]);
        });

        it("transpose", function() {
            ok(A.transpose([[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [2, 3, 4]]], 1, 2, 0), [[[1, 7], [2, 8], [3, 9]], [[4, 2], [5, 3], [6, 4]]]);
        });

        it("reduceAxis", function() {
            ok(A.reduceAxis(2, addf, 0), 2);
            ok(A.reduceAxis([], addf, 0), []);
            ok(A.reduceAxis([1, 2], addf, 0), 3);
            ok(A.reduceAxis([[], []], addf, 0), []);
            ok(A.reduceAxis([[1, 2], [3, 4]], addf, 0), [4, 6]);
            ok(A.reduceAxis([[[1, 2], [3, 4]], [[5, 6], [7, 8]]], addf, 0), [[6, 8], [10, 12]]);
            ok(A.reduceAxis([[[1, 2], [3, 4]], [[5, 6], [7, 8]]], addf, 1), [[4, 6], [12, 14]]);
            ok(A.reduceAxis([[[1, 2], [3, 4]], [[5, 6], [7, 8]]], addf, 0, 2), [[8, 10], [12, 14]]);
            ok(A.reduceAxis([[[1], [3]], [[5, 6], [7, 8]]], addf, 0, 0, 0), [[6, 6], [10, 8]]);
            ok(A.reduceAxis([[[1], [3, 4]], [[5, 6], [7]]], addf, 1, 0, 0), [[4, 4], [12, 6]]);
        });

        it("reduceDeep", function() {
            ok(A.reduceDeep(2, addf, 100), 2);
            ok(A.reduceDeep([1, 2], addf, 100), 3);
            ok(A.reduceDeep([[1, 2], [3, 4]], addf, 100), [3, 7]);
            ok(A.reduceDeep([[1, 2], [3, 4]], addf, 100, 2), [5, 9]);
            ok(A.reduceDeep([[[1, 2], [3, 4]], [[5, 6, 7], [8], []]], addf, 100), [[3, 7], [18, 8, null]]);
            ok(A.reduceDeep([[[1, 2], [3, 4]], [[5, 6, 7], [8], []]], addf, 100, 0), [[3, 7], [18, 8, 0]]);
        });

        it("reduceAll", function() {
            ok(A.reduceAll(2, addf, 0), 2);
            ok(A.reduceAll([2, 3], addf, 1), 6);
            ok(A.reduceAll([[2, 3], [4, [5, 6], 7], 8, [9, 10]], addf, 1), 55);
            ok(A.reduceAll([[2, 3], [4, [5, 6], 7], 8, [9, 10]], addf), 54);
            ok(A.reduceAll([], addf), undef);
            ok(A.reduceAll([[[]], [], []], addf), undef);
        });

        it("reverseAxis", function() {
            ok(A.reverseAxis(2, 0), 2);
            ok(A.reverseAxis([1, 2, 3], 0), [3, 2, 1]);
            ok(A.reverseAxis([[[1, 2], [3, 4], [1, 2]], [[3, 4], [1, 2], [3, 4]]], 0),
                [[[3, 4], [1, 2], [3, 4]], [[1, 2], [3, 4], [1, 2]]]);
            ok(A.reverseAxis([[[1, 2], [3, 4], [1, 2]], [[3, 4], [1, 2], [3, 4]]], 0, 2),
                [[[4, 3], [2, 1], [4, 3]], [[2, 1], [4, 3], [2, 1]]]);
        });

        it("rotateAxis", function() {
            ok(A.rotateAxis([1, 2, 3], 2, 0), [3, 1, 2]);
            ok(A.rotateAxis([[1, 2, 3], [4, 5, 6]], [2, 1], 1), [[3, 1, 2], [5, 6, 4]]);
            ok(A.rotateAxis([[1, 2], [3, 4], [5, 6]], [2, 1], 0), [[5, 4], [1, 6], [3, 2]]);
            ok(A.rotateAxis(A.reshape([1, 2, 3, 4, 5, 6, 7], 3, 3, 3), A.reshape([1, 2, -2], 3, 3), 1),
                [[[4, 1, 6], [7, 2, 2], [1, 5, 3]], [[6, 3, 1], [2, 4, 4], [3, 7, 5]], [[1, 5, 3], [4, 6, 6], [5, 2, 7]]]);
            ok(A.rotateAxis([1, 2, [3]], 2, 0), [[3], 1, 2]);
        });

        it("reverseDeep", function() {
            ok(A.reverseDeep(2, 1), 2);
            ok(A.reverseDeep([1, 2, 3], 100), [3, 2, 1]);
            ok(A.reverseDeep([[1, 2], 3, 4], 0), [4, 3, [1, 2]]);
            ok(A.reverseDeep([[1, 2], [3, 4]], 100), [[2, 1], [4, 3]]);
        });

        it("concatAxis", function() {
            ok(A.concatAxis(0, [1, 2, 3], [4, 5, 6]), [1, 2, 3, 4, 5, 6]);
            ok(A.concatAxis(1, [[1, 2], [3, 4]], [[5, 6, 7], [8, 9, 0]]), [[1, 2, 5, 6, 7], [3, 4, 8, 9, 0]]);
            ok(A.concatAxis(0.5, [[1, 2], [3, 4]], [[5, 6], [8, 9]]), [[[1, 2], [5, 6]], [[3, 4], [8, 9]]]);
            ok(A.concatAxis(-0.5, [1, 2, 3], [4, 5, 6]), [[1, 2, 3], [4, 5, 6]]);
            ok(A.concatAxis(0.5, [[1, 2], [3, 4]], [[5, 6], [8, 9]], [[1, 2], [3, 4]]),
                [[[1, 2], [5, 6], [1, 2]], [[3, 4], [8, 9], [3, 4]]]);
        });

        it("mapDeep", function() {
            ok(A.mapDeep(addf, 100, [1, 2, 3], [4, 5, 6]), [5, 7, 9]);
            ok(A.mapDeep(addf, 100), []);
            ok(A.mapDeep(concatf, 0, [1, 2, 3], [4, 5, 6]), [1, 2, 3, 4, 5, 6]);
            ok(A.mapDeep(addf, 100, 1, 2), 3);
            ok(A.mapDeep(addf, 100, [], [], []), [[], [], []]);
            ok(A.mapDeep(addf, 100, [[1, 2], [3, 4]], [[5, 6], [7, 8]]), [[6, 8], [10, 12]]);
            ok(A.mapDeep(addf, 100, [[1, 2]], [[3], [4]]), [[4, 5], [5, 6]]);
        });

        it("mapScalar", function() {
            ok(A.mapScalar(2, addf, 7), 9);
            ok(A.mapScalar([1, 2], (x, y) => x.concat([y]), 3, 0), [1, 2, 3])
            ok(A.mapScalar([[1, 2], [3, 4]], addf, 3), [[4, 5], [6, 7]]);
        });

        it("replicateAxis", function() {
            ok(A.replicateAxis([1, 2, 3], [1, 0, 1], 0), [1, 3]);
            ok(A.replicateAxis([1, 2, 3], [0, 2, 1], 0), [2, 2, 3]);
            ok(A.replicateAxis([1, 2, 3], [1, -2, 1], 0), [1, 0, 0, 3]);
            ok(A.replicateAxis([1, 2, 3], [1, 1, -2, 1], 0), [1, 2, 0, 0, 3]);
            ok(A.replicateAxis([[1, 2, 3], [4, 5, 6]], [0, 2, 1], 1), [[2, 2, 3], [5, 5, 6]]);
            ok(A.replicateAxis([[1, 2], [3, 4], [5, 6]], [0, 2, 1], 0), [[3, 4], [3, 4], [5, 6]]);
            ok(A.replicateAxis([[1, 2], [3, 4], [5, 6]], [1, -1, 1], 0), [[1, 2], [0, 0], [5, 6]]);
            ok(A.replicateAxis([1, 2, 3], 2, 0), [1, 1, 2, 2, 3, 3]);
            ok(A.replicateAxis([1, 2, 3], -2, 0), [0, 0, 0, 0, 0, 0]);
        });

        it("scanAxis", function() {
            ok(A.scanAxis([1, 2, 3], (accum, x) => accum + x, 0), [1, 3, 6]);
            ok(A.scanAxis([1, 2, 3], (accum, x) => accum - x, 0), [1, -1, -4]);
            ok(A.scanAxis([1, 2, 3], (accum, x) => accum - x, 0, 6), [5, 3, 0]);
            ok(A.scanAxis([[1, 2, 3], [4, 5, 6], [7, 8, 9]], (accum, x) => accum - x, 0), [[1, 2, 3], [-3, -3, -3], [-10, -11, -12]])
            ok(A.scanAxis([[1, 2, 3], [4, 5, 6], [7, 8, 9]], (accum, x) => accum - x, 1), [[1, -1, -4], [4, -1, -7], [7, -1, -10]])
            ok(A.scanAxis([[1, 2], [3, 4], [5, 6]], (accum, x) => accum.concat(x), 0, undef, 1), [[1, 2], [1, 2, 3, 4], [1, 2, 3, 4, 5, 6]]);
            ok(A.scanAxis([[[1, 2], [3, 4]], [[5, 6], [7, 8]]], (accum, x) => accum.concat(x), 0, undef, 2), [[[1, 2], [3, 4]], [[1, 2, 5, 6], [3, 4, 7, 8]]]);
            ok(A.scanAxis([[[1, 2], [3, 4]], [[5, 6], [7, 8]]], (accum, x) => accum.concat(x), 1, undef, 2), [[[1, 2], [1, 2, 3, 4]], [[5, 6], [5, 6, 7, 8]]]);
            ok(A.scanAxis([[1, 2], [3, 4], [5]], (accum, x) => accum.concat(x), 0, undef, 1), [[1, 2], [1, 2, 3, 4], [1, 2, 3, 4, 5]]);
        });

        it("scanAxisLast", function() {
            ok(A.scanAxisLast([1, 2, 3], (accum, x) => accum + x, 0), [6, 5, 3]);
            ok(A.scanAxisLast([1, 2, 3], (accum, x) => accum - x, 0), [0, 1, 3]);
            ok(A.scanAxisLast([1, 2, 3], (accum, x) => accum - x, 0, 6), [0, 1, 3]);
            ok(A.scanAxisLast([[1, 2, 3], [4, 5, 6], [7, 8, 9]], (accum, x) => accum - x, 0), [[2, 1, 0], [3, 3, 3], [7, 8, 9]]);
            ok(A.scanAxisLast([[1, 2, 3], [4, 5, 6], [7, 8, 9]], (accum, x) => accum - x, 1), [[0, 1, 3], [-3, 1, 6], [-6, 1, 9]]);
        });

        it("decode", function() {
            ok(A.decode([2, 2, 2, 2], [1, 1, 1, 1]), 15);
            ok(A.decode([2, 2, 2, 2], 1), 15);
            ok(A.decode(A.reshape([7, 6, 5], 2, 2, 2), [2, 7]), [[19, 21], [17, 19]]);
            ok(A.decode([7, 2], A.reshape([7, 6, 5], 2, 2, 2)), [[20, 17], [17, 20]]);
        });

        it("encode", function() {
            ok(A.encode([1760, 3, 12], 75), [2, 0, 3]);
            ok(A.encode([1760, 3, 12], 75.5), [2, 0, 3.5]);
            ok(A.encode([2, 2, 2], [1, 2, 3]), [[0, 0, 0], [0, 1, 1], [1, 0, 1]]);
            ok(A.encode(A.reshape([1, 2, 3], 3, 3), 15), [[0, 1, 1], [0, 1, 2], [0, 1, 0]]);
            ok(A.encode(A.reshape([7, 6, 5, 3, 4, 6, 2, 7], 3, 3, 3), 15),
                [[[2, 0, 0], [1, 2, 2], [1, 1, 1]], [[0, 0, 1], [2, 2, 0], [1, 1, 3]], [[0, 1, 0], [2, 0, 3], [1, 3, 0]]]);
            ok(A.encode(A.reshape([7, 6, 5, 3, 4, 6, 2, 7], 2, 2, 2, 2), 15), [[[[3, 5], [0, 0]], [[3, 2], [1, 1]]], [[[3, 5], [0, 0]], [[3, 2], [1, 1]]]]);
            ok(A.encode(A.reshape([7, 6, 5, 3, 4, 6, 2, 7], 2, 2, 2, 2), [15, 16]),
                [[[[[3, 3], [5, 5]], [[0, 1], [0, 1]]], [[[3, 0], [2, 2]], [[1, 0], [1, 2]]]],
                 [[[[3, 3], [5, 5]], [[0, 1], [0, 1]]], [[[3, 0], [2, 2]], [[1, 0], [1, 2]]]]]);
            ok(A.encode([2, 2, 2], A.reshape([3, 4, 6, 2, 7], 3, 3)), [[[0, 1, 1], [0, 1, 0], [1, 1, 0]], [[1, 0, 1], [1, 1, 1], [0, 1, 1]], [[1, 0, 0], [0, 1, 1], [0, 0, 0]]]);
            ok(A.encode(A.reshape([7, 6, 5], 3, 3), A.reshape([3, 4, 6, 2, 7], 3, 3)),
                [[[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]],
                    [[[0, 0, 0], [0, 1, 0], [0, 0, 0]], [[0, 0, 1], [0, 1, 0], [0, 1, 0]], [[0, 0, 1], [0, 1, 0], [0, 1, 0]]],
                    [[[3, 4, 6], [2, 0, 3], [4, 6, 2]], [[3, 4, 0], [2, 1, 3], [4, 0, 2]], [[3, 4, 1], [2, 2, 3], [4, 1, 2]]]]);
            ok(A.encode(A.reshape([7, 6, 5], 2, 2, 2), A.reshape([3, 4, 6], 2, 2, 2)),
                [[[[[[0, 0], [1, 0]], [[0, 1], [0, 0]]], [[[0, 0], [0, 0]], [[0, 0], [0, 0]]]],
                  [[[[3, 4], [1, 3]], [[4, 1], [3, 4]]], [[[3, 4], [6, 3]], [[4, 6], [3, 4]]]]],
                 [[[[[0, 0], [0, 0]], [[0, 0], [0, 0]]], [[[0, 0], [1, 0]], [[0, 1], [0, 0]]]],
                  [[[[3, 4], [6, 3]], [[4, 6], [3, 4]]], [[[3, 4], [0, 3]], [[4, 0], [3, 4]]]]]]);
        });

        it("equalsDeep", function() {
            ok(A.equalsDeep(), true);
            ok(A.equalsDeep([1, 2]), true);
            ok(A.equalsDeep([1, 2], [1, 2], [1, 2]), true);
            ok(A.equalsDeep([1, 2], [1, 2], [2, 2]), false);
            ok(A.equalsDeep([1, 2], [1, 2], [1, 2, 3]), false);
            ok(A.equalsDeep([[1, 2], [3, 4]], [[1, 2], [3, 4]], [[1, 2], [3, 4]]), true);
            ok(A.equalsDeep([[1, 2], [3, 4]], [[1, 2], [3, 4]], [[1, 2], [3, 5]]), false);
            ok(A.equalsDeep([[1, 2], [3, 4]], [[1, 2], [3, 4]], [[1, 2], [3, 4, 5]]), false);
            ok(A.equalsDeep([[1, 2], 3], [[1, 2], 3], [[1, 2], 3]), true);
            ok(A.equalsDeep(1, 1, 1), true);
            ok(A.equalsDeep(1, [1], 1), false);
        });

        it("reshape", function() {
            ok(A.reshape([[1, 2], [3, 4]], 3), [1, 2, 3]);
            ok(A.reshape([[1, 2], [3, 4], [5, 6]], 2, 3), [[1, 2, 3], [4, 5, 6]]);
            ok(A.reshape([[1, 2], [3, 4]], 2, 3), [[1, 2, 3], [4, 1, 2]]);
        });

        it("isEmpty", function() {
            ok(A.isEmpty([]), true);
            ok(A.isEmpty(2), false);
            ok(A.isEmpty([[], [[], []], []]), true);
            ok(A.isEmpty([[], [[], [2]], []]), false);
        });

        it("first", function() {
            ok(A.first([[[1], 2, [3, 4]]]), 1);
            ok(A.first(1), 1);
        });

        it("rank", function() {
            ok(A.rank(2), []);
            ok(A.rank([1, 2]), [2]);
            ok(A.rank([1]), [1]);
            ok(A.rank([]), [0]);
            ok(A.rank([[1, 2, 3], [4, 5, 6]]), [2, 3]);
            ok(A.rank([1, [2, 3]]), null);
            ok(A.rank([[1, 2], [3, [4, 5]]]), null);
            ok(A.rank([[1, 2], [3, [4, 5], 6]]), null);
            ok(A.rank([[1, 2, 3], [4, 5, 6, 7]]), null);
        });

        it("sortIndex", function() {
            const cover = [];
            const C = Arrycer({ cover: x => cover.push(x) });

            ok(C.sortIndex([83, 77, 72, 91, 85]), [2, 1, 0, 4, 3]);
            ok(C.sortIndexDesc([83, 77, 72, 91, 85]), [3, 4, 0, 1, 2]);
            ok(C.sortIndex([72, 77, 83, 85, 91]), [0, 1, 2, 3, 4]);
            ok(C.sortIndex([91, 85, 83, 77, 72]), [4, 3, 2, 1, 0]);
            ok(C.sortIndex([83, 85, 72, 91, 85]), [2, 0, 1, 4, 3]);
            ok(C.sortIndex([91, 85, 83, 72, 77]), [3, 4, 2, 1, 0]);
            ok(C.sortIndex([91]), [0]);
            ok(C.sortIndex([91, 72]), [1, 0]);
            ok(C.sortIndex([91, 72, 83]), [1, 2, 0]);

            expect(cover.indexOf(1) >= 0).toBeTruthy();
            expect(cover.indexOf(2) >= 0).toBeTruthy();
            expect(cover.indexOf(3) >= 0).toBeTruthy();
            expect(cover.indexOf(4) >= 0).toBeTruthy();
        });

        it("subarray", function() {
            ok(A.subarray([1, 2, 3], []), [1, 2, 3]);
            ok(A.subarray([[1, 2], [3, 4]], [null, 0]), [1, 3]);
            ok(A.subarray([[1, 2, 3], [4, 5, 6]], [(x, index) => index > 0, [1, 2]]), [[5, 6]]);
            ok(A.subarray([[1, 2], [3, 4]], [[1, 0], null]), [[3, 4], [1, 2]]);
        });

        it("indexOfArray", function() {
            ok(A.indexOfArray([1, 2, 3], [[0, 1], [2, 3]]), [[-1, 0], [1, 2]]);
        });

        it("generate", function() {
            ok(A.generate(x => 1, 3), [1, 1, 1]);
            ok(A.generate(x => 1, 3, 2, 2), [[[1, 1], [1, 1]], [[1, 1], [1, 1]], [[1, 1], [1, 1]]]);
        });

        it("iterate", function() {
            ok(A.iterate(x => x * 2, 1, 3), [1, 2, 4]);
            ok(A.iterate(x => x + 1, 1, 3, 2, 2), [[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[9, 10], [11, 12]]]);
        });

        it("atArray", function() {
            ok(A.atArray([1, 2, 3], [[0, 1], [2, -1]]), [[1, 2], [3, 3]]);
        });

        it("sliceDeep", function() {
            ok(A.sliceDeep([1, 2, 3], []), [1, 2, 3]);
            ok(A.sliceDeep([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, -2]), [[5, 6], [8, 9]]);
        });

        it("take", function() {
            ok(A.take([1, 2, 3], []), [1, 2, 3]);
            ok(A.take([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [-2, 2]), [[4, 5], [7, 8]]);
            ok(A.take([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [-4, 4], 0), [[0, 0, 0, 0], [1, 2, 3, 0], [4, 5, 6, 0], [7, 8, 9, 0]]);
            ok(A.take([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [4, -4], 0), [[0, 1, 2, 3], [0, 4, 5, 6], [0, 7, 8, 9], [0, 0, 0, 0]]);
            ok(A.take([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [-3, 3], 0), [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
            ok(A.take([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [0, 0]), []);
            ok(A.take([[1], [4, 5], [7, 8, 9]], [4, -4], 0), [[0, 0, 0, 1], [0, 0, 4, 5], [0, 7, 8, 9], [0, 0, 0, 0]]);
        });

        it("drop", function() {
            ok(A.drop([1, 2, 3], []), [1, 2, 3]);
            ok(A.drop([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, -1]), [[4, 5], [7, 8]]);
            ok(A.drop([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [2, -2]), [[7]]);
            ok(A.drop([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [3, -3]), []);
        });

        it("invertMatrix", function() {
            okMatrix(A.invertMatrix([[3, 1], [5, 2]]), [[2, -1], [-5, 3]]);
            okMatrix(A.invertMatrix([[3, 3, -5, -6], [1, 2, -3, -1], [2, 3, -5, -3], [-1, 0, 0, 1]]),
                [[-0.5, 0, 0.5, -1.5], [1.5, 5, -4.5, 0.5], [1, 3, -3, 0], [-0.5, 0, 0.5, -0.5]]);
            okMatrix(A.invertMatrix([[0, 2, 0], [0, 0, 1], [4, 0, 0]]), [[0, 0, 0.25], [0.5, 0, 0], [0, 1, 0]]);
        });

        it("solveMatrix", function() {
            okMatrix(A.solveMatrix([[3, 1], [5, 2]], [4, 5]), [3, -5]);
            okMatrix(A.solveMatrix([[0, 2, 0], [0, 0, 1], [4, 0, 0]], [1, 1, 1]), [0.25, 0.5, 1]);
            okMatrix(A.solveMatrix(A.reshape([2, 8, 3, 3, 1, 5], 9, 2), [7, 6, 5, 8, 7, 6, 3, 4, 6]), [1.26553672, 0.56497175]);
        });
    });

    describe("testing abnormal case", function() {
        it("inner", function() {
            expect(() => A.inner([1, [2, 3]], [4, 5], addf, mulf)).toThrow();
            expect(() => A.inner([1, 2], [1, [2, 3]], addf, mulf)).toThrow();
            expect(() => A.inner([1, 2], [2, 3], addf, mulf, undef, undef, 0, 1)).toThrow();
            expect(() => A.inner([1, 2], [2, 3], addf, mulf, undef, undef, 1.1, 1)).toThrow();
            expect(() => A.inner([1, 2], [2, 3], addf, mulf, undef, undef, 1, 0)).toThrow();
            expect(() => A.inner([1, 2], [2, 3], addf, mulf, undef, undef, 1, 1.1)).toThrow();
        });

        it("T", function() {
            expect(() => A.T([1, [2, 3]])).toThrow();
        });

        it("transpose", function() {
            expect(() => A.transpose([[1, 2], [3, 4]], 1, 2)).toThrow();
            expect(() => A.transpose([[1, 2], [3, 4]], 0, "1")).toThrow();
            expect(() => A.transpose([[1, 2], [3, 4]], 0)).toThrow();
            expect(() => A.transpose([[1, 2], [3, [4, 5]]], 1, 0)).toThrow();
        });

        it("reduceAxis", function() {
            expect(() => A.reduceAxis([1, [2, 3], 4], addf)).toThrow(); 
        });

        it("reduceDeep", function() {
            expect(() => A.reduceDeep([1, [2, 3], 4], addf)).toThrow(); 
        });

        it("reverseAxis", function() {
            expect(() => A.reverseAxis([[1, 2], [3, [4, 5]]], 0)).toThrow();
            expect(() => A.reverseAxis([[1, 2], [3, 4]], -1, 0)).toThrow();
            expect(() => A.reverseAxis([[1, 2], [3, 4]], 0, 0.1)).toThrow();
            expect(() => A.reverseAxis([[1, 2], [3, 4]], 0, "1")).toThrow();
            expect(() => A.reverseAxis([[1, 2], [3, 4]], 1, 2)).toThrow();
        });

        it("rotateAxis", function() {
            expect(() => A.rotateAxis(2, 1, 0)).toThrow();
        });

        it("reverseDeep", function() {
            expect(() => A.reverseDeep([1, 2, [3, 4]], 100)).toThrow();
        });

        it("concatAxis", function() {
            expect(() => A.concatAxis(1, [[1, 2], [3]], [4])).toThrow();
            expect(() => A.concatAxis(-1, [1, 2], [3, 4, 5])).toThrow();
        });

        it("mapDeep", function() {
            expect(() => A.mapDeep(addf, 100, [1, 2], [[3, 4], 5])).toThrow();
            expect(() => A.mapDeep(addf, 100, [1, 2], [3, 4, 5])).toThrow();
            expect(() => A.mapDeep(addf, 100, [[1, 2], [3, 4]], [[1, 2, 3], [4, 5]])).toThrow();
            expect(() => A.mapDeep(addf, 100, [1, 2], 3)).toThrow();
        });

        it("replicateAxis", function() {
            expect(() => A.replicateAxis([1, 2], [1, "a"], 0)).toThrow();
            expect(() => A.replicateAxis([1, 2], [1, 0.5], 0)).toThrow();
            expect(() => A.replicateAxis([1, 2], [1, 0, 0], 0)).toThrow();
            expect(() => A.replicateAxis([1, 2], [1, 1, 1], 0)).toThrow();
        });

        it("scanAxis", function() {
            expect(() => A.scanAxis([1, 2, 3], (accum, x) => accum + x, -1)).toThrow();
            expect(() => A.scanAxis([1, 2, 3], (accum, x) => accum + x, 0.2)).toThrow();
            expect(() => A.scanAxis([1, 2, 3], (accum, x) => accum + x, "1")).toThrow();
            expect(() => A.scanAxis([1, [2], 3], (accum, x) => accum + x, 0)).toThrow();
            expect(() => A.scanAxis([[1, 2], [2], [3, 4]], (accum, x) => accum + x, 0)).toThrow();
            expect(() => A.scanAxis([1, 2, 3], (accum, x) => accum + x, 0, 1, -1)).toThrow();
            expect(() => A.scanAxis([1, 2, 3], (accum, x) => accum + x, 0, 1, 1.2)).toThrow();
        });

        it("decode", function() {
            expect(() => A.decode(1, [1, 2], 0)).toThrow();
            expect(() => A.decode([1, [2]], [1, 1], 0)).toThrow();
            expect(() => A.decode([2, 2], [1, [1]], 0)).toThrow();
            expect(() => A.decode([2, 2], [1, 1, 1])).toThrow();
        });

        it("encode", function() {
            expect(() => A.encode([1, [2]], 3)).toThrow();
            expect(() => A.encode([1, 2], [1, [2]])).toThrow();
        });

        it("reshape", function() {
            expect(() => A.reshape(2, 1, 2)).toThrow();
            expect(() => A.reshape([], 1, 2)).toThrow();
        });

        it("first", function() {
            expect(() => A.first([[[[], [], []]]])).toThrow(); 
        });

        it("sortIndex", function() {
            expect(() => A.sortIndex(2)).toThrow();
        });

        it("subArray", function() {
            expect(() => A.subarray([1, 2], [1, 2])).toThrow();
            expect(() => A.subarray([1, 2], ["a"])).toThrow();
            expect(() => A.subarray([1, 2], [-1])).toThrow();
        });

        it("generate", function() {
            expect(() => A.generate(x => 1, -1)).toThrow();
            expect(() => A.generate(x => 1, 0.5)).toThrow();
            expect(() => A.generate(x => 1, "1", 2)).toThrow();
            expect(() => A.generate(x => 1, [1], 3)).toThrow();
            expect(() => A.generate(x => 1)).toThrow();
        });

        it("iterate", function() {
            expect(() => A.iterate(x => 1, -1)).toThrow();
            expect(() => A.iterate(x => 1, 0.5)).toThrow();
        });

        it("sliceDeep", function() {
            expect(() => A.sliceDeep(3, [1])).toThrow();
            expect(() => A.sliceDeep([[1, 2], [3, 4]], [1, {}])).toThrow();
        });

        it("take", function() {
            expect(() => A.take(3, [1])).toThrow();
            expect(() => A.take([[1, 2], [3, 4]], [1, [2, 3]])).toThrow();
        });

        it("drop", function() {
            expect(() => A.drop(3, [1])).toThrow();
            expect(() => A.drop([[1, 2], [3, 4]], [1, [2, 3]])).toThrow();
            expect(() => A.drop([[1, 2], [3, 4]], [3, 1])).toThrow();
            expect(() => A.drop([[1, 2], [3, 4]], [1, -3])).toThrow();
        });

        it("invertMatrix", function() {
            expect(() => A.invertMatrix(1)).toThrow();
            expect(() => A.invertMatrix([1, 2])).toThrow();
            expect(() => A.invertMatrix([1, [2]])).toThrow();
            expect(() => A.invertMatrix([[1, 2], [1, 2, 3]])).toThrow();
            expect(() => A.invertMatrix([[1, 2], [1, 2], [1, 2]])).toThrow();
            expect(() => A.invertMatrix([[1, 1], [1, 1]])).toThrow();
            expect(() => A.invertMatrix([[1, 1], [4, 4]])).toThrow();
        });

        it("solveMatrix", function() {
            expect(() => A.solveMatrix(1, [1, 2])).toThrow();
            expect(() => A.solveMatrix([1, 2], [1, 2])).toThrow();
            expect(() => A.solveMatrix([1, [2]], [1, 2])).toThrow();
            expect(() => A.solveMatrix([[1, 2], [1, 2, 3]], [1, 2])).toThrow();
            expect(() => A.solveMatrix([[1, 2], [1, 2], [1, 2]], [1, 2])).toThrow();
            expect(() => A.solveMatrix([[1, 1], [1, 1]], [1, 2])).toThrow();
            expect(() => A.solveMatrix([[1, 1], [4, 4]], [1, 2])).toThrow();
        });
    });
});

