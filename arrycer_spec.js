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

    function ok(actual, expected) {
        expect(actual).toEqual(expected);
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
            ok(A.inner(A.reshape([2, 3, 4], [1, 2, 3]), A.reshape([4, 3, 2], [2, 3, 4]), addf, mulf),
                [[[[14, 21], [28, 14], [21, 28]], [[16, 24], [32, 16], [24, 32]], [[18, 27], [36, 18], [27, 36]]],
                 [[[14, 21], [28, 14], [21, 28]], [[16, 24], [32, 16], [24, 32]], [[18, 27], [36, 18], [27, 36]]]]);
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
        });

        it("reduceDepth", function() {
            ok(A.reduceDepth(2, addf, 100), 2);
            ok(A.reduceDepth([1, 2], addf, 100), 3);
            ok(A.reduceDepth([[1, 2], [3, 4]], addf, 100), [3, 7]);
            ok(A.reduceDepth([[1, 2], [3, 4]], addf, 100, 2), [5, 9]);
            ok(A.reduceDepth([[[1, 2], [3, 4]], [[5, 6, 7], [8], []]], addf, 100), [[3, 7], [18, 8, null]]);
            ok(A.reduceDepth([[[1, 2], [3, 4]], [[5, 6, 7], [8], []]], addf, 100, 0), [[3, 7], [18, 8, 0]]);
        });

        it("concatDeep", function() {
            ok(A.concatDeep(0, [1, 2, 3], [4, 5, 6]), [1, 2, 3, 4, 5, 6]);
            ok(A.concatDeep(1, [[1, 2], [3, 4]], [[5, 6, 7], [8, 9, 0]]), [[1, 2, 5, 6, 7], [3, 4, 8, 9, 0]]);
            ok(A.concatDeep(0.5, [[1, 2], [3, 4]], [[5, 6], [8, 9]]), [[[1, 2], [5, 6]], [[3, 4], [8, 9]]]);
            ok(A.concatDeep(-0.5, [1, 2, 3], [4, 5, 6]), [[1, 2, 3], [4, 5, 6]]);
            ok(A.concatDeep(0.5, [[1, 2], [3, 4]], [[5, 6], [8, 9]], [[1, 2], [3, 4]]),
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

        it("reshape", function() {
            ok(A.reshape([3], [[1, 2], [3, 4]]), [1, 2, 3]);
            ok(A.reshape([2, 3], [[1, 2], [3, 4], [5, 6]]), [[1, 2, 3], [4, 5, 6]]);
            ok(A.reshape([2, 3], [[1, 2], [3, 4]]), [[1, 2, 3], [4, 1, 2]]);
        });

        it("isEmpty", function() {
            ok(A.isEmpty([]), true);
            ok(A.isEmpty(2), false);
            ok(A.isEmpty([[], [[], []], []]), true);
            ok(A.isEmpty([[], [[], [2]], []]), false);
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
            ok(C.sortIndex([83, 85, 72, 91, 85]), [2, 0, 4, 1, 3]);
            ok(C.sortIndex([91, 85, 83, 72, 77]), [3, 4, 2, 1, 0]);
            ok(C.sortIndex([91]), [0]);
            ok(C.sortIndex([91, 72]), [1, 0]);
            ok(C.sortIndex([91, 72, 83]), [1, 2, 0]);

            expect(cover.indexOf(2) >= 0).toBeTruthy();
            expect(cover.indexOf(3) >= 0).toBeTruthy();
            expect(cover.indexOf(4) >= 0).toBeTruthy();
            expect(cover.indexOf(5) >= 0).toBeTruthy();
            expect(cover.indexOf(6) >= 0).toBeTruthy();
        });

        it("subarray", function() {
            ok(A.subarray([1, 2, 3], []), [1, 2, 3]);
            ok(A.subarray([[1, 2], [3, 4]], [null, 0]), [1, 3]);
            ok(A.subarray([[1, 2, 3], [4, 5, 6]], [(x, index) => index > 0, [1, 2]]), [[5, 6]]);
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
        });

        it("drop", function() {
            ok(A.drop([1, 2, 3], []), [1, 2, 3]);
            ok(A.drop([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, -1]), [[4, 5], [7, 8]]);
        });
    });

    describe("testing abnormal case", function() {
        it("inner", function() {
            expect(() => A.inner([1, [2, 3]], [4, 5], addf, mulf)).toThrow();
            expect(() => A.inner([1, 2], [1, [2, 3]], addf, mulf)).toThrow();
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

        it("reduceDepth", function() {
            expect(() => A.reduceDepth([1, [2, 3], 4], addf)).toThrow(); 
        });

        it("concatDeep", function() {
            expect(() => A.concatDeep(1, [[1, 2], [3]], [4])).toThrow();
            expect(() => A.concatDeep(-1, [1, 2], [3, 4, 5])).toThrow();
        });

        it("mapDeep", function() {
            expect(() => A.mapDeep(addf, 100, [1, 2], [[3, 4], 5])).toThrow();
            expect(() => A.mapDeep(addf, 100, [1, 2], [3, 4, 5])).toThrow();
            expect(() => A.mapDeep(addf, 100, [[1, 2], [3, 4]], [[1, 2, 3], [4, 5]])).toThrow();
            expect(() => A.mapDeep(addf, 100, [1, 2], 3)).toThrow();
        });

        it("reshape", function() {
            expect(() => A.reshape([1, 2], 2)).toThrow();
            expect(() => A.reshape([1, 2], [])).toThrow();
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
        });
    });
});

