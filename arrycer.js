/**
 * Arrycer
 *
 * Copyright (c) 2023 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
function Arrycer(option) {
    const cover = option && option.cover ? option.cover : () => {};

    const undef = void 0;
    const innerInit = {};

    function error(message, anObject) {
        if(anObject === undef) {
            throw new Error(message);
        } else {
            throw new Error(message + ": " + anObject);
        }
    }

    function reduceDeep(anArray, f, init, depth) {
        if(!Array.isArray(anArray)) {
            return anArray;
        } else if(anArray.length === 0) {
            return [];
        } else if(anArray.every(x => !Array.isArray(x))) {
            return anArray.reduce(f, init);
        } else if(anArray.every(x => x.length === 0)) {
            return [];
        } else if(anArray.every(x => Array.isArray(x))) {
            const heads = anArray.map(x => x[0]);
            const tails = anArray.map(x => x.slice(1));

            if(depth === 0 || !Array.isArray(heads) || !Array.isArray(heads[0])) {
                return [heads.reduce(f, init)].concat(reduceDeep(tails, f, init, depth));
            } else {
                return [reduceDeep(heads, f, init, depth - 1)].concat(reduceDeep(tails, f, init, depth));
            }
        } else {
            error("Invalid array", anArray);
        }
    }

    function inner(array1, array2, f, g, initf, initg) {
        const initf1 = initf === undef ? innerInit : initf;
        const initg1 = initg === undef ? innerInit : initg;
        const f1 = (accum, x) => accum === innerInit ? x : f(accum, x);
        const g1 = (accum, x) => accum === innerInit ? x : g(accum, x);
        const depth1 = Number.MAX_SAFE_INTEGER;

        function innerArray1(anArray, cols, d) {
            return d !== 0 && anArray.every(x => Array.isArray(x))
                   ? anArray.map(x => innerArray1(x, cols, d - 1))
                   : d === 0 || anArray.every(x => !Array.isArray(x))
                   ? innerArray2(anArray, cols, depth1)
                   : error("Invalid array", anArray);
        }

        function innerArray2(singleArray1, anArray, d) {
            return d !== 0 && anArray.every(x => Array.isArray(x))
                   ? anArray.map(x => innerArray2(singleArray1, x, d - 1))
                   : d === 0 || anArray.every(x => !Array.isArray(x))
                   ? reduceDeep([singleArray1, anArray], g1, initg1).reduce(f1, initf1)
                   : error("Invalid array", anArray);
        }

        function innerScalar(anArray, scalar, d, gx) {
            return d !== 0 && anArray.every(x => Array.isArray(x))
                   ? anArray.map(x => innerScalar(x, scalar, d - 1, gx))
                   : d === 0 || anArray.every(x => !Array.isArray(x))
                   ? anArray.map(x => gx(scalar, x)).reduce(f1, initf1)
                   : error("Invalid array", anArray);
        }

        if(!Array.isArray(array1) && !Array.isArray(array2)) {
            return inner([array1], array2, f, g, initf, initg);
        } else if(!Array.isArray(array1)) {
            const cols = reduceDeep(array2, (accum, x) => accum.concat([x]), []);

            return innerScalar(cols, array1, depth1, g1);
        } else if(!Array.isArray(array2)) {
            return innerScalar(array1, array2, depth1, (x, y) => g1(y, x));
        } else {
            const cols = reduceDeep(array2, (accum, x) => accum.concat([x]), []);

            return innerArray1(array1, cols, depth1);
        }
    }

    function outer(array1, array2, f, depth) {
        function outerArray(vs, d, objects) {
            return objects.length === 0
                   ? f(...vs)
                   : d !== 0 && Array.isArray(objects[0])
                   ? objects[0].map(x => outerArray(vs, d - 1, [x].concat(objects.slice(1))))
                   : outerArray(vs.concat([objects[0]]), depth, objects.slice(1));
        }
        return outerArray([], depth, [array1, array2]);
    }

    function T(anArray) {
        const fn = (accum, x) => accum.concat([x]);

        function inner(anArray, f, init, axis) {
            function isEnd(anArray, axis) {
                return axis === 0
                       ? anArray.length === 0
                       : isEnd(anArray[0], axis - 1);
            }

            function getHeads(anArray, axis) {
                return axis <= 1
                       ? anArray.map(x => x[0]).reduce(f, [])
                       : anArray.map(x => getHeads(x, axis - 1));
            }

            function getTails(anArray, axis) {
                return axis <= 1
                       ? anArray.map(x => x.slice(1)).reduce(f, [])
                       : anArray.map(x => getTails(x, axis - 1));
            }

            return axis === 1
                   ? reduceDeep(anArray, f, init)
                   : isEnd(anArray, axis)
                   ? []
                   : [inner(getHeads(anArray, axis), f, init, axis - 1)].concat(inner(getTails(anArray, axis), f, init, axis));
        }

        const arrayRank = rank(anArray);

        return arrayRank === null
               ? error("proper array required", anArray)
               : arrayRank.length <= 1
               ? anArray
               : inner(anArray, fn, [], arrayRank.length - 1);
    }

    function transpose(anArray, ...axes) {
        const result = [];

        function setArray(a, result, indices, i) {
            if(i === indices.length - 1) {
                result[indices[axes[i]]] = a;
            } else {
                if(result[indices[axes[i]]] === undef) {
                    result[indices[axes[i]]] = [];
                }
                setArray(a, result[indices[axes[i]]], indices, i + 1);
            }
        }

        function inner(a, indices) {
            return Array.isArray(a)
                   ? a.map((x, i) => inner(x, indices.concat([i])))
                   : setArray(a, result, indices, 0)
        }

        if(axes.some(x => typeof x !== "number")) {
            error("illegal argument", axes);
        }

        const sorted = axes.slice().sort();

        for(let i = 0; i < axes.length; i++) {
            if(sorted[i] !== i) {
                error("illegal argument", axes);
            }
        }

        const arrayRank = rank(anArray);

        if(arrayRank === null || arrayRank.length !== axes.length) {
            error("illegal array");
        } else {
            inner(anArray, []);
            return result;
        }
    }

    function reduceFirstAxis(anArray, f, init, pad) {
        const initf1 = init === undef ? innerInit : init;
        const f1 = (accum, x) => {
            const x1 = x === undef ? pad : x;

            return accum === innerInit ? x1 : f(accum, x1);
        };

        return reduceDeep(anArray, f1, initf1);
    }

    function reduceAxis(anArray, f, depth, init, pad) {
        return depth > 0
               ? anArray.map(x => reduceAxis(x, f, depth - 1, init, pad))
               : reduceFirstAxis(anArray, f, init, pad);
    }

    const lastMark = {};

    function reduceDepth(anArray, f, depth, init) {
        const initf1 = init === undef ? innerInit : init;
        const f1 = (accum, x) => accum === innerInit ? x : f(accum, x);

        function inner(anArray, d) {
            if(d === 0 || !Array.isArray(anArray)) {
                return lastMark;
            } else if(anArray.length === 0) {
                return initf1 === innerInit ? null : init;
            } else {
                const mapped = anArray.map(x => inner(x, depth));

                if(mapped.every(x => x === lastMark)) {
                    return anArray.reduce(f1, initf1);
                } else if(mapped.some(x => x === lastMark)) {
                    error("Invalid array", anArray);
                } else {
                    return mapped;
                }
            }
        }

        return depth === 0 || !Array.isArray(anArray)
               ? anArray
               : inner(anArray, depth);
    }

    function reduceAll(anArray, f, init) {
        const initf1 = init === undef ? innerInit : init;
        const f1 = (accum, x) => accum === innerInit ? x : f(accum, x);

        function inner(anArray, value) {
            if(Array.isArray(anArray)) {
                let result = value;

                for(let i = 0; i < anArray.length; i++) {
                    result = inner(anArray[i], result);
                }
                return result;
            } else {
                return f1(value, anArray);
            }
        }

        const result = inner(anArray, initf1);

        return result === innerInit ? undef : result;
    }

    function reverseAxis(array1, ...axes) {
        function rev(array0, level) {
            const result = [];

            if(!Array.isArray(array0)) {
                return array0;
            } else if(axes.indexOf(level) >= 0) {
                for(let i = 0; i < array0.length; i++) {
                    result[array0.length - i - 1] = rev(array0[i], level + 1);
                }
            } else {
                for(let i = 0; i < array0.length; i++) {
                    result[i] = rev(array0[i], level + 1);
                }
            }
            return result;
        }

        if(axes.some(x => !Number.isSafeInteger(x) || x < 0)) {
            error("Axis must be non-negative integer", axis)
        } else if(!Array.isArray(array1)) {
            return array1;
        } else {
            const rhoVector = rank(array1);

            return rhoVector === null
                   ? error("Invalid array")
                   : axes.some(x => x >= rhoVector.length)
                   ? error("Invalid axis", axis)
                   : rev(array1, 0);
        }
    }

    function rotateAxis(array1, rotate, axis) {
        function inner(array1, rotate, level) {
            if(!Array.isArray(array1)) {
                error("Invalid array");
            } else if(axis !== level) {
                return array1.map((x, i) => inner(x, rotate[i], level + 1));
            } else if(Array.isArray(rotate)) {
                return array1.map((x, i) => x.map((y, j) => array1[(i + rotate[j] + array1.length) % array1.length][j]));
            } else {
                return array1.map((x, i) => array1[(i + rotate + array1.length) % array1.length]);
            }
        }
        return inner(array1, rotate, 0);
    }

    function reverseDeep(anArray, depth) {
        return !Array.isArray(anArray)
               ? anArray
               : depth === 0 || anArray.every(x => !Array.isArray(x))
               ? anArray.slice().reverse()
               : anArray.every(x => Array.isArray(x))
               ? anArray.map(x => reverseDeep(x, depth - 1))
               : error("Invalid array");
    }

    function concatAxis(axis, ...arrays) {
        function innerLayer(...arrays) {
            if(arrays.every(x => x.length === 0)) {
                return arrays;
            } else if(arrays.every(x => x.length > 0)) {
                return map((h, t) => h.concat(t),
                    map((...xs) => xs.map(x => x[0]), arrays),
                    innerLayer(...map((...xs) => xs.flatMap(x => x.slice(1)), arrays)));
            } else {
                error("Invalid arrays", arrays);
            }
        }

        if(arrays.some(x => !Array.isArray(x))) {
            error("Invalid argument", arrays);
        } else if(arrays.every(x => x.length === 0)) {
            return [];
        } else if(axis >= 0 && Number.isSafeInteger(axis)) {
            return axis > 0
                   ? [concatAxis(axis - 1, ...arrays.map(x => x[0]))].concat(concatAxis(axis, ...arrays.map(x => x.slice(1))))
                   : [].concat(...arrays);
        } else {
            return axis > 0
                   ? [concatAxis(axis - 1, ...arrays.map(x => x[0]))].concat(concatAxis(axis, ...arrays.map(x => x.slice(1))))
                   : innerLayer(...arrays);
        }
    }

    function mapDeep(f, depth, ...arrays) {
        function canBroadcast(length, arrays) {
            return arrays.length === 0
                   ? length > 1
                   : arrays[0].length === 0
                   ? error("Invalid array", arrays)
                   : arrays[0].length === 1
                   ? canBroadcast(length, arrays.slice(1))
                   : length > 1
                   ? error("Invalid array", arrays)
                   : canBroadcast(arrays[0].length, arrays.slice(1));
        }

        function getHeads(arrays) {
            return arrays.length === 0
                   ? []
                   : arrays[0].length === 0
                   ? error("Invalid array", arrays)
                   : [arrays[0][0]].concat(getHeads(arrays.slice(1)));
        }

        function getTails(arrays) {
            return arrays.length === 0
                   ? []
                   : arrays[0].length === 0
                   ? error("Invalid array", arrays)
                   : arrays[0].length > 1
                   ? [arrays[0].slice(1)].concat(getTails(arrays.slice(1)))
                   : [arrays[0]].concat(getTails(arrays.slice(1)));
        }

        if(arrays.length === 0) {
            return [];
        } else if(depth === 0 || arrays.every(x => !Array.isArray(x))) {
            return f(...arrays);
        } else if(depth !== 0 && arrays.every(x => x.length === 0)) {
            return arrays;
        } else if(depth !== 0 && arrays.every(x => Array.isArray(x) && x.length === arrays[0].length)) {
            const result = [];

            for(let i = 0; i < arrays[0].length; i++) {
                result.push(mapDeep(f, depth - 1, ...(j => arrays.map(x => x[j]))(i)));
            }
            return result;
        } else if(depth !== 0 && canBroadcast(-1, arrays)) {
            const heads = getHeads(arrays);
            const tails = getTails(arrays);

            return [mapDeep(f, depth - 1, ...heads)].concat(mapDeep(f, depth, ...tails));
        } else {
            error("illegal depth of arrays");
        }
    }

    function map(f, ...arrays) {
        return mapDeep(f, 1, ...arrays);
    }

    function mapScalar(anObject, f, scalar, depth) {
        return depth !== 0 && Array.isArray(anObject)
               ? anObject.map(x => mapScalar(x, f, scalar, depth - 1))
               : f(anObject, scalar);
    }

    const deepCopyF = (array1, f) => Array.isArray(array1) ? array1.map(x => deepCopyF(x, f)) : f(array1);
    const deepcopy = array => deepCopyF(array, x => x);

    function replicateAxis(array1, vector, axis, pad) {
        const padF = pad === undef ? 0 : pad;
        const fill = (array1, times) => deepCopyF(array1, times > 0 ? x => x : x => padF);

        function checkLength(array1, vector) {
            return vector.length === array1.length
                   ? true
                   : vector.filter(x => x >= 0).length === array1.length
                   ? false
                   : error("Invalid array");
        }

        function inner(array1, level) {
            if(!Array.isArray(array1)) {
                error("Invalid array");
            } else if(axis !== level) {
                return array1.map(x => inner(x, level + 1));
            } else if(Array.isArray(vector)) {
                const isReplace = checkLength(array1, vector);
                const result = [];

                for(let i = 0, k = 0; i < vector.length; i++, k += isReplace || array1[i] >= 0 ? 1 : 0) {
                    for(let j = 0; j < Math.abs(vector[i]); j++) {
                        result.push(fill(array1[k], vector[i]));
                    }
                }
                return result;
            } else {
                return vector === 0
                       ? error("invalid scalar", vector)
                       : array1.flatMap(x => iota(Math.abs(vector)).map(y => fill(x, vector)));
            }
        }
        return Array.isArray(vector) && vector.some(x => !Number.isSafeInteger(x))
               ? error("Invalid replicate parameter", vector)
               : inner(array1, 0);
    }

    const reduceDeepArray = a => reduceDeep(a, (accum, x) => accum.concat([x]), []);

    function decode(array1, array2) {
        const isScalar = !Array.isArray(array2);

        function inner1(array1, array2) {
            return !Array.isArray(array1)
                   ? error("array required", array1)
                   : array1.every(x => !Array.isArray(x))
                   ? inner2(array1, array2)
                   : array1.every(x => Array.isArray(x) && x.length > 0)
                   ? array1.map(x => inner1(x, array2))
                   : error("Invalid array");
        }

        function inner2(array1, array2) {
            return isScalar || array2.every(x => !Array.isArray(x))
                   ? decode1(array1, array2)
                   : array2.every(x => Array.isArray(x) && x.length > 0)
                   ? array2.map(x => inner2(array1, x))
                   : error("Invalid array");
        }

        function decode1(array1, array2) {
            const first = isScalar ? array2 : array2[0];
            const maxRepeat = isScalar || array1.length === array2.length
                              ? array1.length
                              : error("length must be equal", array1.length);
            let fold1 = first, val = first, base;

            for(let i = 1; i < maxRepeat; i++) {
                if(i < array1.length) {
                    base = array1[i];
                }
                if(isScalar || i < array2.length) {
                    val = isScalar ? array2 : array2[i];
                }
                fold1 = fold1 * base + val;
            }
            return fold1;
        }
        return inner1(array1, isScalar ? array2 : reduceDeepArray(array2));
    }

    function equalsDeepF(f, ...arrays) {
        if(arrays.length <= 1) {
            return true;
        } else if(arrays.every(x => !Array.isArray(x))) {
            return arrays.every(x => f(x, arrays[0]));
        } else if(arrays.every(x => Array.isArray(x))) {
            if(arrays.some(x => x.length !== arrays[0].length)) {
                return false;
            } else {
                for(let i = 0; i < arrays[0].length; i++) {
                    if(!equalsDeep(...arrays.map(x => x[i]))) {
                        return false;
                    }
                }
                return true;
            }
        } else {
            return false;
        }
    }

    const equalsDeep = (...arrays) => equalsDeepF((x, y) => x === y, ...arrays);

    function reshape(anArray, ...shape) {
        function* walkArray(anArray) {
            if(Array.isArray(anArray)) {
                for(let i = 0; i < anArray.length; i++) {
                    yield* walkArray(anArray[i]);
                }
            } else {
                yield anArray;
            }
        }

        function makeGenerator(anArray) {
            let walk = null;

            function* inner() {
                while(true) {
                    if(walk === null) {
                        walk = walkArray(anArray);
                    } else {
                        const result = walk.next();

                        if(result.done) {
                            walk = null;
                        } else {
                            yield result.value;
                        }
                    }
                }
            };
            return inner();
        }

        const generateObject = makeGenerator(anArray);
        const genf = () => generateObject.next().value;

        function inner(shape) {
            function repeat(times, f) {
                return times > 0
                       ? [f()].concat(repeat(times - 1, f))
                       : [];
            }

            return shape.length > 1
                   ? repeat(shape[0], () => inner(shape.slice(1)))
                   : repeat(shape[0], genf);
        }

        if(!Array.isArray(anArray) || isEmpty(anArray)) {
            error("Array must not be empty", anArray);
        } else {
            return inner(shape);
        }
    }

    function isEmpty(anArray) {
        if(!Array.isArray(anArray)) {
            return false;
        } else {
            for(let i = 0; i < anArray.length; i++) {
                if(!isEmpty(anArray[i])) {
                    return false;
                }
            }
            return true;
        }
    }

    function rank(anObject) {
        function concatIsNotNull(a1, obj1) {
            return obj1 === null ? null : a1.concat(obj1);
        }

        function isProper(anObject) {
            return !Array.isArray(anObject) ||
                   anObject.every(x => !Array.isArray(x)) ||
                   anObject.every(x => Array.isArray(x) && isProper(x));
        }

        return !isProper(anObject)
               ? null
               : !Array.isArray(anObject)
               ? []
               : anObject.length === 0
               ? [0]
               : anObject.every(x => !Array.isArray(x))
               ? [anObject.length]
               : anObject.every(x => Array.isArray(x) && x.length === anObject[0].length)
               ? concatIsNotNull([anObject.length], rank(anObject[0]))
               : null;
    }

    const iota = n => iterate(x => x + 1, 0, n);

    function sortIndex(anArray, cmp) {
        const cf = cmp ? cmp : (x, y) => x < y ? -1 : x > y ? 1 : 0;
        let indices;

        function swap(lo, hi) {
            const t = indices[lo];

            indices[lo] = indices[hi]
            indices[hi] = t;
        }

        function partition(base, n) {
            let lo = base;
            let hi = n + base - 1;
            let m = Math.floor((hi - lo) / 2) + base;

            while(true) {
                while(cf(anArray[indices[lo]], anArray[indices[m]]) < 0) {
                    cover(2);
                    lo++;
                }

                while(cf(anArray[indices[m]], anArray[indices[hi]]) < 0) {
                    cover(3);
                    hi--;
                }

                if(lo >= hi) {
                    cover(4);
                    return hi + 1;
                } else {
                    swap(lo, hi);
                    if(lo === m) {
                        cover(5);
                        m = hi;
                    } else if(hi === m) {
                        cover(6);
                        m = lo;
                    }
                    lo++;
                    hi--;
                }
            }
        }

        function step(base, n) {
            if(n <= 1) {
                return;
            } else {
                const p = partition(base, n);

                step(base, p - base);
                step(p, base + n - p);
            }
        }

        if(!Array.isArray(anArray)) {
            error("Array required", anArray);
        } else {
            indices = iota(anArray.length);
            step(0, anArray.length);
            return indices;
        }
    }

    function sortIndexDesc(anArray) {
        return sortIndex(anArray, (x, y) => x > y ? -1 : x < y ? 1 : 0);
    }

    function subarray(anArray, indices) {
        if(indices.length === 0) {
            return anArray;
        } else if(!Array.isArray(anArray)) {
            error("array required", anArray);
        } else if(indices[0] === null) {
            return anArray.map(x => subarray(x, indices.slice(1)));
        } else if(Array.isArray(indices[0])) {
            const result = [];

            for(let i = 0; i < indices[0].length; i++) {
                result.push(subarray(anArray[indices[0][i]], indices.slice(1)));
            }
            return result;
        } else if(typeof indices[0] === "function") {
            return anArray.filter((x, index, a) => indices[0](x, index, a)).map(x => subarray(x, indices.slice(1)));
        } else if(Number.isSafeInteger(indices[0]) && indices[0] >= 0) {
            return subarray(anArray[indices[0]], indices.slice(1));
        } else {
            error("Invalid argument", indices[0]);
        }
    }

    function indexOfArray(aVector, anArray) {
        return mapDeep(x => aVector.indexOf(x), Number.MAX_SAFE_INTEGER, anArray);
    }

    function generate(g, ...axes) {
        if(!Array.isArray(axes) || axes.length === 0 || axes.some(x => typeof x !== "number" || x < 1 || !Number.isSafeInteger(x))) {
            error("Invalid axes", axes);
        } else {
            const result = [];

            for(let i = 0; i < axes[0]; i++) {
                result.push(axes.length > 1 ? generate(g, ...axes.slice(1)) : g());
            }
            return result;
        }
    }

    function iterate(f, seed, ...axes) {
        function getvalue() {
            let now = seed;

            return () => {
                const result = now;

                now = f(now);
                return result;
            };
        }
        return generate(getvalue(), ...axes);
    }

    function atArray(aVector, anArray) {
        return mapDeep(x => aVector.at(x), Number.MAX_SAFE_INTEGER, anArray);
    }

    function sliceDeep(anArray, aVector) {
        return aVector.length === 0
               ? anArray
               : !Array.isArray(anArray)
               ? error("Array required", anArray)
               : Number.isSafeInteger(aVector[0])
               ? anArray.slice(aVector[0]).map(x => sliceDeep(x, aVector.slice(1)))
               : Array.isArray(aVector[0])
               ? anArray.slice(aVector[0][0], aVector[0][1]).map(x => sliceDeep(x, aVector.slice(1)))
               : error("Invalid argument", aVector[0]);
    }

    function slicePad(anArray, start, end, anVector, pad) {
        function padLevel(anVector) {
            if(anVector.length === 0) {
                return pad;
            } else {
                const result = [];

                for(let i = 0; i < Math.abs(anVector[0]); i++) {
                    result[i] = padLevel(anVector.slice(1));
                }
                return result;
            }
        }

        if(start >= 0 && end < anArray.length) {
            return anArray.slice(start, end);
        } else {
            const result = [];

            for(let i = start; i < end; i++) {
                result[i - start] = i >= 0 && i < anArray.length ? anArray[i] : padLevel(anVector);
            }
            return result;
        }
    }

    function take(anArray, aVector, pad) {
        return aVector.length === 0
               ? anArray
               : !Array.isArray(anArray)
               ? error("Array required", anArray)
               : Number.isSafeInteger(aVector[0]) && aVector[0] >= 0
               ? slicePad(anArray, 0, aVector[0], aVector.slice(1), pad).map(x => take(x, aVector.slice(1), pad))
               : Number.isSafeInteger(aVector[0]) && aVector[0] < 0
               ? slicePad(anArray, anArray.length + aVector[0], anArray.length, aVector.slice(1), pad).map(x => take(x, aVector.slice(1), pad))
               : error("Invalid argument", aVector[0]);
    }

    function drop(anArray, aVector) {
        return aVector.length === 0
               ? anArray
               : !Array.isArray(anArray)
               ? error("Array required", anArray)
               : Number.isSafeInteger(aVector[0]) && aVector[0] >= 0 && aVector[0] <= anArray.length
               ? anArray.slice(aVector[0], anArray.length).map(x => drop(x, aVector.slice(1)))
               : Number.isSafeInteger(aVector[0]) && aVector[0] < 0 && anArray.length + aVector[0] >= 0
               ? anArray.slice(0, anArray.length + aVector[0]).map(x => drop(x, aVector.slice(1)))
               : error("Invalid argument", aVector[0]);
    }

    const matrixLib = {
        makeZero: (sizeI, sizeJ) => reshape([0], sizeI, sizeJ),
        makeUnit: x => outer(iota(x), iota(x), (x, y) => x === y),

        invertPermutation: function(matrix, permutation) {
            const result = [];

            for(let i = 0; i < permutation.length; i++) {
                result[permutation[i]] = matrix[i];
            }
            return result;
        },

        columnPermutation: function(matrix, permutation) {
            const source = deepcopy(matrix);
            const result = [];

            for(let i = 0; i < permutation.length; i++) {
                result[i] = [];
                for(let j = 0; j < permutation.length; j++) {
                    result[i][permutation[j]] = source[i][j];
                }
            }
            return result;
        },

        factorizeLU: function(matrix) {
            const P = iota(matrix.length);
            const A = deepcopy(matrix);
            const L = matrixLib.makeZero(matrix.length, matrix.length);
            const U = matrixLib.makeZero(matrix.length, matrix.length);

            for(let k = 0; k < A.length; k++) {
                if(A[k][k] === 0) {
                    let m;

                    for(m = 0; m < A.length; m++) {
                        if(A[k][m] !== 0) {
                            const tmp = P[m]; P[m] = P[k]; P[k] = tmp;

                            for(let n = 0; n < A.length; n++) {
                                const t2 = A[n][m]; A[n][m] = A[n][k]; A[n][k] = t2;
                            }
                            break;
                        }
                    }

                    if(m >= matrix.length) {
                        error("Matrix cannot solve");
                    }
                }

                for(let i = 0; i < A[0].length; i++) {
                    if(i < k) {
                        L[i][k] = U[k][i] = 0;
                    } else if(i === k) {
                        L[i][k] = 1;
                        U[k][i] = A[k][k];
                    } else {
                        L[i][k] = A[i][k] / A[k][k];
                        U[k][i] = A[k][i];
                    }
                }

                const tA = deepcopy(A);

                for(let i = 0; i < A.length; i++) {
                    A[i][k] = A[k][i] = 0;
                }

                for(let i = k + 1; i < A.length; i++) {
                    for(let j = k + 1; j < A[0].length; j++) {
                        A[i][j] = tA[i][j] - L[i][k] * U[k][j];
                    }
                }
            }
            return { P: P, L: L, U: U };
        },

        solve: function(matrix, vector) {
            const y = [];
            const result = [];
            const lu = matrixLib.factorizeLU(matrix);
            const V = vector.slice();

            for(let i = 0; i < matrix.length; i++) {
                y[i] = 0;
                for(let j = 0; j < i; j++) {
                    y[i] += lu.L[i][j] * y[j];
                }
                y[i] = (V[i] - y[i]);
            }

            for(let i = matrix.length - 1; i >= 0; i--) {
                result[i] = 0;
                for(let j = i; j < V.length; j++) {
                    result[i] += lu.U[i][j] * result[j];
                }
                result[i] = (y[i] - result[i]) / lu.U[i][i];
            }
            return matrixLib.invertPermutation(result, lu.P);
        },

        solveGaussJordan: function(matrix, source) {
            const permutation = iota(matrix.length);
            const m = deepcopy(matrix);
            const v = deepcopy(source);

            for(let i = 0; i < m.length; i++) {
                let val = m[i][i];

                if(val === 0) {
                    let j;

                    for(j = 0; j < matrix.length; j++) {
                        if(matrix[permutation[j]][i] !== 0) {
                            const tmp = permutation[j];
                            permutation[j] = permutation[i];
                            permutation[i] = tmp;

                            const t2 = m[j];
                            m[j] = m[i];
                            m[i] = t2;
                            val = m[i][i];
                            break;
                        }
                    }
                }

                for(let j = 0; j < m[i].length; j++) {
                    if(i !== j) {
                        const elm = m[j][i] / val;

                        for(let k = 0; k < m.length; k++) {
                            m[j][k] = m[j][k] - (m[i][k] * elm);
                        }

                        if(Array.isArray(v[0])) {
                            for(let k = 0; k < v.length; k++) {
                                v[j][k] = v[j][k] - (v[i][k] * elm);
                            }
                        } else {
                            v[j] = v[j] - (v[i] * elm);
                        }
                    }
                }

                for(let j = 0; j < m[i].length; j++) {
                    if(i === j) {
                        for(let k = 0; k < m.length; k++) {
                            m[j][k] = i === k ? 1 : m[j][k] / val;
                        }

                        if(Array.isArray(v[0])) {
                            for(let k = 0; k < v.length; k++) {
                                v[j][k] = v[j][k] / val;
                            }
                        } else {
                            v[j] = v[j] / val;
                        }
                    }
                }
            }

            if(!m.every((x, i) => x.every((y, j) => y === (i === j ? 1 : 0)))) {
                error("Matrix cannot invert");
            }
            return matrixLib.columnPermutation(v, permutation);
        },

        leastSquare: function(matrix, vector) {
            const normalMatrix = [];
            const normalVector = [];

            for(let i = 0; i < matrix[0].length; i++) {
                normalMatrix[i] = [];
                for(let j = 0; j < matrix[0].length; j++) {
                    normalMatrix[i][j] = 0;
                    for(let k = 0; k < matrix.length; k++) {
                        normalMatrix[i][j] += matrix[k][i] * matrix[k][j];
                    }
                }
            }

            for(let i = 0; i < matrix[0].length; i++) {
                normalVector[i] = 0;
                for(let k = 0; k < matrix.length; k++) {
                    normalVector[i] += matrix[k][i] * vector[k];
                }
            }
            return matrixLib.solve(normalMatrix, normalVector);
        }
    };

    function invertMatrix(matrix) {
        const rankm = rank(matrix);

        if(rankm === null || rankm.length !== 2 || rankm[0] !== rankm[1]) {
            error("Diagonal matrix required");
        }
        return matrixLib.solveGaussJordan(matrix, matrixLib.makeUnit(matrix.length));
    }

    function solveMatrix(matrix, vector) {
        const rankm = rank(matrix);
        const rankv = rank(vector);

        if(rankm === null || rankv === null || rankm.length !== 2 || rankv.length !== 1 || rankm[0] !== rankv[0]) {
            error("Invalid matrix shape");
        }
        return rankm[0] === rankm[1] ? matrixLib.solve(matrix, vector) : matrixLib.leastSquare(matrix, vector);
    }

    function expandObject(a, b, f) {
        for(let i in b) {
            if(b.hasOwnProperty(i)) {
                a[i] = f(b[i]);
            }
        }
        return a;
    }

    function mergeObject(a, b) {
        const result = {};

        for(let i in a) {
            if(a.hasOwnProperty(i)) {
                result[i] = a[i];
            }
        }
        return expandObject(result, b, x => x);
    }

    const me = {
        error: error,
        mapDeep: mapDeep,
        map: map,
        reshape: reshape,
        generate: generate,
        iterate: iterate
    };

    const expandable = {
        inner: inner,
        outer: outer,
        T: T,
        transpose: transpose,
        reduceAxis: reduceAxis,
        reduceDeep: reduceDepth,
        reduceAll: reduceAll,
        reverseAxis: reverseAxis,
        reverseDeep: reverseDeep,
        rotateAxis: rotateAxis,
        concatAxis: concatAxis,
        mapScalar: mapScalar,
        replicateAxis: replicateAxis,
        decode: decode,
        equalsDeepF: equalsDeepF,
        equalsDeep: equalsDeep,
        isEmpty: isEmpty,
        rank: rank,
        sortIndex: sortIndex,
        sortIndexDesc: sortIndexDesc,
        subarray: subarray,
        indexOfArray: indexOfArray,
        atArray: atArray,
        sliceDeep: sliceDeep,
        take: take,
        drop: drop,
        invertMatrix: invertMatrix,
        solveMatrix: solveMatrix
    };
    return mergeObject(me, expandable);
}

