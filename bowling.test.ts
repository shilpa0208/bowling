import assert from "node:assert/strict";
import test from "node:test";
import { scoreBowling } from "./bowling.ts";
import type { FrameScore, Roll } from "./bowling.ts";

type Case = { name: string; rolls: Roll[]; expected: FrameScore[] };

const cases: Case[] = [
  { name: "empty game", rolls: [], expected: [] },
  { name: "first roll only", rolls: [4], expected: [null] },
  { name: "zero is a real roll", rolls: [0], expected: [null] },
  { name: "gutter frame", rolls: [0, 0], expected: [0] },
  { name: "open frame", rolls: [4, 5], expected: [9] },
  { name: "open frame then partial frame", rolls: [4, 5, 8], expected: [9, null] },
  { name: "strike awaiting both bonuses", rolls: ["X"], expected: [null] },
  { name: "strike awaiting second bonus", rolls: ["X", 8], expected: [null, null] },
  { name: "strike with zero bonuses", rolls: ["X", 0, 0], expected: [10, 0] },
  { name: "strike with numeric bonuses", rolls: ["X", 8, 1], expected: [19, 9] },
  { name: "first supplied example", rolls: [4, 5, "X", 8], expected: [9, null, null] },
  { name: "second supplied example", rolls: [4, 5, "X", 8, 1], expected: [9, 19, 9] },
  { name: "spare awaiting bonus", rolls: [7, "/"], expected: [null] },
  { name: "spare resolved while next frame is incomplete", rolls: [7, "/", 4], expected: [14, null] },
  { name: "spare then open frame", rolls: [7, "/", 4, 2], expected: [14, 6] },
  { name: "spare followed by strike", rolls: [7, "/", "X"], expected: [20, null] },
  { name: "zero bonus resolves a spare", rolls: [7, "/", 0], expected: [10, null] },
  { name: "zero then spare clears ten pins", rolls: [0, "/", 0, 0], expected: [10, 0] },
  { name: "numeric pair totaling ten is a spare", rolls: [5, 5, 4, 2], expected: [14, 6] },
  { name: "consecutive spares", rolls: [5, "/", 3, "/", 4, 2], expected: [13, 14, 6] },
  { name: "strike followed by spare", rolls: ["X", 7, "/"], expected: [20, null] },
  { name: "strike followed by spare and open frame", rolls: ["X", 7, "/", 4, 2], expected: [20, 14, 6] },
  { name: "two unresolved strikes", rolls: ["X", "X"], expected: [null, null] },
  { name: "two strikes then one roll", rolls: ["X", "X", 8], expected: [28, null, null] },
  { name: "consecutive strikes", rolls: ["X", "X", 8, 1], expected: [28, 19, 9] },
  { name: "three strikes", rolls: ["X", "X", "X"], expected: [30, null, null] },
  { name: "earlier consecutive-strike example", rolls: [4, 5, "X", "X", 8, 1], expected: [9, 28, 19, 9] },
];

for (const { name, rolls, expected } of cases) {
  test(name, () => assert.deepEqual(scoreBowling(rolls), expected));
}

// Nine complete gutter frames make the final frame's behavior easy to see.
const nineGutterFrames: Roll[] = Array(18).fill(0);
const nineZeroScores: FrameScore[] = Array(9).fill(0);
const tenthCases: { name: string; rolls: Roll[]; score: FrameScore }[] = [
  { name: "first roll only", rolls: [7], score: null },
  { name: "open frame", rolls: [7, 2], score: 9 },
  { name: "spare awaits bonus", rolls: [7, "/"], score: null },
  { name: "spare with numeric bonus", rolls: [7, "/", 4], score: 14 },
  { name: "spare with strike bonus", rolls: [7, "/", "X"], score: 20 },
  { name: "spare with zero bonus", rolls: [7, "/", 0], score: 10 },
  { name: "numeric spare with bonus", rolls: [5, 5, 4], score: 14 },
  { name: "strike awaits both bonuses", rolls: ["X"], score: null },
  { name: "strike awaits second bonus", rolls: ["X", 8], score: null },
  { name: "two strikes await final roll", rolls: ["X", "X"], score: null },
  { name: "strike with open bonus rack", rolls: ["X", 8, 1], score: 19 },
  { name: "strike with spare bonus rack", rolls: ["X", 8, "/"], score: 20 },
  { name: "strike with numeric spare bonus rack", rolls: ["X", 5, 5], score: 20 },
  { name: "strike followed by zero and spare", rolls: ["X", 0, "/"], score: 20 },
  { name: "strike with zero bonuses", rolls: ["X", 0, 0], score: 10 },
  { name: "two strikes and numeric last roll", rolls: ["X", "X", 8], score: 28 },
  { name: "three strikes", rolls: ["X", "X", "X"], score: 30 },
];

for (const { name, rolls, score } of tenthCases) {
  test(`tenth frame: ${name}`, () => {
    assert.deepEqual(scoreBowling([...nineGutterFrames, ...rolls]), [...nineZeroScores, score]);
  });
}

test("nine frames do not create an unstarted tenth frame", () => {
  assert.deepEqual(scoreBowling(nineGutterFrames), nineZeroScores);
});

test("perfect game has ten frame scores totaling 300", () => {
  const scores = scoreBowling(Array<Roll>(12).fill("X"));
  assert.deepEqual(scores, Array(10).fill(30));
  assert.equal(scores.reduce<number>((sum, score) => sum + (score ?? 0), 0), 300);
});

test("all spares with five-pin bonuses score 150", () => {
  const rolls: Roll[] = Array.from({ length: 10 }, (): Roll[] => [5, "/"]).flat();
  assert.deepEqual(scoreBowling([...rolls, 5]), Array(10).fill(15));
});

test("a game of gutters has ten zero scores", () => {
  assert.deepEqual(scoreBowling(Array(20).fill(0)), Array(10).fill(0));
});

test("every prefix of a perfect game waits for exactly the necessary rolls", () => {
  for (let rollCount = 0; rollCount <= 12; rollCount++) {
    const startedFrames = Math.min(rollCount, 10);
    const resolvedFrames = Math.min(Math.max(rollCount - 2, 0), 10);
    const expected = [
      ...Array(resolvedFrames).fill(30),
      ...Array(startedFrames - resolvedFrames).fill(null),
    ];
    assert.deepEqual(scoreBowling(Array<Roll>(rollCount).fill("X")), expected);
  }
});

test("ninth-frame strike can resolve before tenth-frame spare bonus arrives", () => {
  const firstEight: Roll[] = Array(16).fill(0);
  assert.deepEqual(scoreBowling([...firstEight, "X", 7, "/"]), [...Array(8).fill(0), 20, null]);
  assert.deepEqual(scoreBowling([...firstEight, "X", 7, "/", "X"]), [...Array(8).fill(0), 20, 20]);
});

test("a tenth-frame bonus also completes the ninth frame", () => {
  const firstEight: Roll[] = Array(16).fill(0);
  assert.deepEqual(scoreBowling([...firstEight, "X", "X", 8]), [...Array(8).fill(0), 28, null]);
  assert.deepEqual(scoreBowling([...firstEight, "X", "X", 8, 1]), [...Array(8).fill(0), 28, 19]);
});

test("input is not mutated and repeated calls are independent", () => {
  const rolls = Object.freeze([4, 5, "X", 8, 1] as const);
  assert.deepEqual(scoreBowling(rolls), [9, 19, 9]);
  assert.deepEqual(scoreBowling([]), []);
  assert.deepEqual(scoreBowling(rolls), [9, 19, 9]);
  assert.deepEqual(rolls, [4, 5, "X", 8, 1]);
});

const invalidCases: { name: string; rolls: unknown }[] = [
  { name: "non-array input", rolls: null },
  { name: "too many rolls for a legal game", rolls: Array(22).fill(0) },
  { name: "spare on a fresh rack", rolls: ["/"] },
  { name: "second-roll strike", rolls: [3, "X"] },
  { name: "second-roll strike after zero", rolls: [0, "X"] },
  { name: "too many pins", rolls: [8, 3] },
  { name: "negative pins", rolls: [-1] },
  { name: "numeric ten", rolls: [10] },
  { name: "fractional pins", rolls: [1.5] },
  { name: "NaN", rolls: [NaN] },
  { name: "infinite pins", rolls: [Infinity] },
  { name: "numeric string", rolls: ["4"] },
  { name: "unknown symbol", rolls: ["x"] },
  { name: "undefined is not an incomplete roll", rolls: [undefined] },
  { name: "null is not an incomplete roll", rolls: [null] },
  { name: "sparse array", rolls: Array(1) },
  { name: "bonus after open tenth frame", rolls: [...nineGutterFrames, 8, 1, 2] },
  { name: "two bonuses after tenth-frame spare", rolls: [...nineGutterFrames, 8, "/", 2, 1] },
  { name: "too many rolls after tenth-frame strike", rolls: [...nineGutterFrames, "X", 8, 1, 0] },
  { name: "tenth-frame first strike bonus is a spare", rolls: [...nineGutterFrames, "X", "/"] },
  { name: "tenth-frame spare bonus is a spare", rolls: [...nineGutterFrames, 8, "/", "/"] },
  { name: "strike on remaining bonus pins", rolls: [...nineGutterFrames, "X", 8, "X"] },
  { name: "strike notation after zero bonus", rolls: [...nineGutterFrames, "X", 0, "X"] },
  { name: "spare after two strikes", rolls: [...nineGutterFrames, "X", "X", "/"] },
  { name: "bonus rack has too many pins", rolls: [...nineGutterFrames, "X", 8, 3] },
  { name: "thirteenth strike", rolls: Array<Roll>(13).fill("X") },
];

for (const { name, rolls } of invalidCases) {
  test(`rejects ${name}`, () => {
    // Deliberately bypass compile-time types to exercise runtime validation.
    assert.throws(() => scoreBowling(rolls as readonly Roll[]));
  });
}
