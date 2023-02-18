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

    function reduceFirstAxis(anArray, f, init) {
        const initf1 = init === undef ? innerInit : init;
        const f1 = (accum, x) => accum === innerInit ? x : f(accum, x);

        return reduceDeep(anArray, f1, initf1);
    }

    function reduceAxis(anArray, f, depth, init) {
        return depth > 0
               ? anArray.map(x => reduceAxis(x, f, depth - 1, init))
               : reduceFirstAxis(anArray, f, init);
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

    function concatDeep(axis, ...arrays) {
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
                   ? [concatDeep(axis - 1, ...arrays.map(x => x[0]))].concat(concatDeep(axis, ...arrays.map(x => x.slice(1))))
                   : [].concat(...arrays);
        } else {
            return axis > 0
                   ? [concatDeep(axis - 1, ...arrays.map(x => x[0]))].concat(concatDeep(axis, ...arrays.map(x => x.slice(1))))
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

    function iota(n) {
        const result = [];

        for(let i = 0; i < n; i++) {
            result.push(i);
        }
        return result;
    }

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

    function take(anArray, aVector) {
        return aVector.length === 0
               ? anArray
               : !Array.isArray(anArray)
               ? error("Array required", anArray)
               : Number.isSafeInteger(aVector[0]) && aVector[0] >= 0 && aVector[0] <= anArray.length
               ? anArray.slice(0, aVector[0]).map(x => take(x, aVector.slice(1)))
               : Number.isSafeInteger(aVector[0]) && aVector[0] < 0 && anArray.length + aVector[0] >= 0
               ? anArray.slice(anArray.length + aVector[0], anArray.length).map(x => take(x, aVector.slice(1)))
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
        reduceDepth: reduceDepth,
        reduceAll: reduceAll,
        concatDeep: concatDeep,
        mapScalar: mapScalar,
        isEmpty: isEmpty,
        rank: rank,
        sortIndex: sortIndex,
        sortIndexDesc: sortIndexDesc,
        subarray: subarray,
        indexOfArray: indexOfArray,
        atArray: atArray,
        sliceDeep: sliceDeep,
        take: take,
        drop: drop
    };
    return mergeObject(me, expandable);
}

