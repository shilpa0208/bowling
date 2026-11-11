# Bowling score calculator

`scoreBowling(rolls)` returns a score for each started frame. A score is `null` until enough rolls are available to resolve it.

```ts
import { scoreBowling } from "./bowling.ts";

scoreBowling([4, 5, "X", 8]);          // [9, null, null]
scoreBowling([4, 5, "X", 8, 1]);       // [9, 19, 9]
scoreBowling([4, 5, "X", "X", 8, 1]); // [9, 28, 19, 9]
```

## Bowling terms

- **Roll:** One delivery; each input element represents one roll.
- **Frame:** One of the game's 10 scoring turns.
- **Rack:** The set of 10 pins. A fresh rack is reset before a new attempt.
- **Strike (`X`):** All 10 pins cleared on the first roll at a fresh rack.
- **Spare (`/`):** All remaining pins cleared on the second roll at the same rack.

## Two racks in the 10th frame

After a strike in frame 10, the first bonus roll starts at a fresh rack. For `X, 8, /`, the `8` leaves two pins and `/` clears them:

| Roll | Rack | Pins |
| --- | --- | ---: |
| `X` | First | 10 |
| `8` | Second | 8 |
| `/` | Second | 2 |

This is one frame, three rolls, and a score of 20. If the first bonus roll is a strike, the final roll starts at a fresh rack too.

## Scoring bonus vs. extra roll

In frames 1–9, rolls in later frames provide the strike or spare scoring bonus. For example, in `X, 8, 1`, the `8` and `1` count in frame 2 and also complete frame 1's strike score, yielding `[19, 9]`.

Frame 10 earns actual extra rolls because there is no later frame to supply its scoring bonus. Those rolls belong to frame 10 and cannot earn more rolls.

## Input and scoring

- Pass the rolls so far in chronological order. Any valid game prefix is accepted; omit rolls that have not happened.
- Numeric rolls must be integers from 0 to 9. Numeric pairs totaling 10, such as `[5, 5]`, are accepted as spares. Use `"X"` or `"/"` rather than numeric `10`.
- In frame 10, an open frame has two rolls total, a spare three, and a strike three.
- Empty input returns `[]`; unresolved started frames return `null`. Invalid input—including non-arrays, invalid roll values or symbols, impossible pin totals, misplaced strikes or spares, and too many or extra rolls—throws an error.

## Run

Use Node.js 24 or later. From the project directory:

```sh
npm run score
```

The script scores the sample rolls in `run.ts`. Edit that array to try another game. Invalid input prints an error and exits with a nonzero status.

## Tests and typecheck

```sh
npm test
npm install
npm run typecheck
```

## AI assistance

### Prompt summary

Implement a TypeScript bowling score calculator that accepts an array of rolls:

- Numbers `0–9` represent pins knocked down.
- `"X"` represents a strike, and `"/"` represents a spare.
- Return a score for every started frame, using `null` when more rolls are needed.
- A strike scores 10 plus the next two rolls; a spare scores 10 plus the next roll; an open frame scores the sum of its two rolls.
- Rolls used as bonuses still count toward their own frame.
- Apply standard 10th-frame bonus-roll rules.

#### Input assumptions

- Rolls are supplied in chronological order; future rolls are omitted.
- Every started frame appears in the result. Incomplete frames return `null`, and empty input returns `[]`.
- The 10th frame earns one bonus roll after a spare or two after a strike. Bonus rolls stay in that frame and cannot earn further rolls.
- Invalid symbols, impossible pin totals, misplaced strikes or spares, and rolls after a completed game throw an error.
- Numeric pairs totaling 10, such as `[5, 5]`, are accepted as spares.

#### Follow-up prompts

The prompt was refined to clarify incomplete-game behavior, 10th-frame rules, and invalid input. It also requested an explanation of the parsing and scoring approach, walkthroughs of `[4, 5, "X", 8]` and `[4, 5, "X", 8, 1]`, and tests covering strikes, spares, consecutive strikes, incomplete games, and 10th-frame bonuses. Further discussion explored complexity and bowling terminology.

### AI use and evaluation

- ChatGPT helped clarify bowling rules and produce an initial implementation, tests, and documentation. Follow-up discussion worked through examples and informed the bowling glossary.
- Copilot in VS Code and workspace tools were used to inspect and refine the solution:
  - Added graceful error reporting in the runner.
  - Extracted `readRoll`, `parseFrame`, and `parseTenthFrame` from `validateAndParseRolls` to make frame parsing easier to follow.
  - Renamed variables such as `first` and `second` to `firstRollPins` and `secondRollPins`, and `start` to `startIndex`.
  - Added comments and documented the `score` script.
- Automated tests and the TypeScript typecheck were run during refinement; both passed.
- Parsing helpers remain private. A dedicated 10th-frame helper handles its distinct bonus-roll and rack rules, and those behaviors were verified through the public scoring API rather than exposing internal helpers for testing.
