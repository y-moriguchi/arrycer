/**
 * Arrycer
 *
 * Copyright (c) 2023 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
/*
 * Arrycer samples
 */

const A = Arrycer();

// compute prime numbers
function prime(n) {
    const r = A.iterate(x => x + 1, 2, n - 1);

    return A.replicateAxis(r, A.member(r, A.outer(r, r, (x, y) => x * y)).map(x => x ? 0 : 1), 0);
}

// compute prime numbers (another version)
function primeto(n) {
    const s = Math.sqrt(n);
    let m = A.reshape(A.take([1], [n], 0).map(x => x ? 0 : 1), n, 1);

    for(let np = 2; np <= s; np += A.lastIndexOfArray(A.subarray(m, [1, null]), 1) + 1) {
        m = A.reshape(m, Math.ceil(n / np), np);
        A.set(m, [A.iterate(x => x + 1, 1, m.length - 1), np - 1], 0);
    }
    return A.replicateAxis(A.iterate(x => x + 1, 1, n), A.reshape(m, n), 0);
}

// plot level by characters
const plot1 = (matrix, level, chars) =>
    A.atArray(chars, A.reduceDeep(A.outer(matrix, level, (x, y) => x >= y ? 1 : 0), (accum, x) => accum + x, 100, -1));

// compute Fibonacci sequence
const fib = nth => A.first(
    A.drop(
        A.replicateAxis([{ e: A.reshape([1, 1, 1, 0], 2, 2) }], [nth], 0, 0)
        .reduce(
            (accum, x) => ({ e: A.inner(accum.e, x.e, (accum, x) => accum + x, (accum, x) => accum * x) })).e,
        [0, 1]));

// create Hilbert matrix and compute error
function hilbert(b) {
    const h = A.outer(A.iterate(x => x + 1, 1, b.length), A.iterate(x => x + 1, 1, b.length), (x, y) => 1 / (x + y - 1));

    return A.map((x, y) => x - y, b, A.inner(h, A.solveMatrix(h, b), (accum, x) => accum + x, (accum, x) => accum * x));
}

// Conway's game of life
function life(p) {
    return A.inner(
        [3, 4].map(x => A.map((y, z) => y === z, A.reduceAxis(A.reduceAxis(
            A.outer([-1, 0, 1].map(x => A.rotateAxis(p, x, 1)), [-1, 0, 1],
                (x, y) => A.rotateAxis(x, y, 0), 1), (accum, x) => accum + x, 0, 0), (accum, x) => accum + x, 0), [[x]])),
        [[[1]], p],
        (x, y) => A.map((z, w) => z || w ? 1 : 0, x, y),
        (x, y) => A.map((z, w) => z && w ? 1 : 0, x, y), void 0, void 0, 1, 1);
}

// Conway's game of life (another version)
function life2(p) {
    return A.inner(
        [3, 4].map(x => A.map((y, z) => y === z, A.vectorize(
            A.outer([-1, 0, 1].map(x => A.rotateAxis(p, x, 1)), [-1, 0, 1],
                (x, y) => A.rotateAxis(x, y, 0), 1), 2).reduce((accum, x) => A.map((x, y) => x + y, accum, x)), [[x]])),
        [[[1]], p],
        (x, y) => A.map((z, w) => z || w ? 1 : 0, x, y),
        (x, y) => A.map((z, w) => z && w ? 1 : 0, x, y), void 0, void 0, 1, 1);
}

// solve linear equation by Jacobi method
function jacobi(a, b) {
    const d = A.transpose(a, 0, 0);
    let x = A.reshape([0], b.length);

    for(let i = 0; i < 100; i++) {
        const xx = A.map((x, y) => x + y,
            A.map((x, y) => x / y, A.map((x, y) => x - y, b, A.inner(a, x, (accum, x) => accum + x, (accum, x) => accum * x)), d),
            x);

        if(Math.sqrt(A.map((x, y) => x - y, xx, x).reduce((accum, x) => accum + x * x) / xx.reduce((accum, x) => accum + x * x)) < 1e-5) {
            x = xx;
            break;
        } else {
            x = xx;
        }
    }
    return x;
}

// remove HTML tags
function removeTag(txt) {
    const t = txt.split("");

    return A.replicateAxis(t, (x => A.map1((x, y) => x || y ? 1 : 0, A.scanAxis(x, (accum, x) => accum !== x ? 1 : 0, 0), x))
        (A.member(t, ["<", ">"])).map(x => !x ? 1 : 0), 0).join("");
}

// moving average method
function movingAverage(x) {
    const ix = A.outer(A.iterate(x => x + 1, 0, x.length - 11), A.iterate(x => x + 1, 1, 12), (x, y) => x + y - 1);

    return A.reduceAxis(A.atArray(x, ix), (accum, x) => accum + x, 1).map(x => x / 12);
}

// draw 1D cell automaton
function cell(init, rule, i) {
    if(i > 0) {
        const a2 = init[0];
        const a1 = A.shiftAxis(a2, -1, 0);
        const a3 = A.shiftAxis(a2, 1, 0);
        const calculated = A.map(rule, a1, a2, a3);
        const shifted = A.shiftAxis(init, -1, 0);

        shifted[0] = calculated;
        return cell(shifted, rule, i - 1);
    } else {
        return A.reverseAxis(init, 0);
    }
}

function generateRule(rule) {
    return (a1, a2, a3) =>
        !a1 && !a2 && !a3
        ? rule & 1
        : !a1 && !a2 && a3
        ? rule & 2
        : !a1 && a2 && !a3
        ? rule & 4
        : !a1 && a2 && a3
        ? rule & 8
        : a1 && !a2 && !a3
        ? rule & 16
        : a1 && !a2 && a3
        ? rule & 32
        : a1 && a2 && !a3
        ? rule & 64
        : rule & 128;
}

// draw Prime Complex Integer
function isPrime(x) {
    if(x < 2) {
        return false;
    } else {
        for(let i = 2; i < Math.sqrt(x); i++) {
            if(x % i === 0) {
                return false;
            }
        }
        return true;
    }
}

function complexInteger() {
    const a = A.outer(A.iterate(x => x + 1, -200, 401), A.iterate(x => x + 1, -200, 401), (x, y) => x * x + y * y);
    const result = A.map(x => isPrime(x) ? 1 : 0, a);

    return result;
}

