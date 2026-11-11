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

**Prompt summary:** Implement a bowling score calculator in Typescript. It accepts an array of rolls, where numeric values 0–9 represent pins knocked down, "X" represents a strike, and "/" represents a spare. Return an array containing the score for each frame the player has started, using null when a frame’s score cannot yet be calculated because it needs future rolls.Follow standard ten-pin bowling rules: a strike scores 10 plus the next two rolls; a spare scores 10 plus the next roll; an open frame scores the sum of its two rolls. A roll used as a strike or spare bonus must still count toward its own frame. The 10th frame has its standard bonus-roll rules.

The assumptions are:
The input contains all rolls so far, in chronological order. Future rolls are omitted.
Every starting frame appears in the result. A frame awaiting its second roll or bonuses returns null. An empty game returns [].
Frame 10 gets one bonus roll after a spare or two after a strike. These stay in frame 10 and cannot earn further rolls.
Invalid symbols, impossible pin totals, misplaced strikes or spares, and rolls after a completed game throw an error.
Numeric pairs totaling 10, such as [5, 5], are accepted as spares too.

The prompt then clarified the assumptions about incomplete games, the 10th frame, and invalid input; an explanation of the parsing and scoring approach; walkthroughs of `[4, 5, "X", 8]` and `[4, 5, "X", 8, 1]`; and tests for strikes, spares, consecutive strikes, incomplete games, and 10th-frame bonuses. Follow-up prompts explored complexity and bowling terminology.

**How AI was used and evaluated:** ChatGPT helped clarify scoring rules for bowling and produce an initial implementation, tests, and documentation. Follow-up discussion worked through examples and informed the README's bowling glossary. I then used Copilot in VS Code and workspace tools to inspect and refine the solution, including adding graceful error reporting in the runner, extracting `readRoll`, `parseFrame`, and `parseTenthFrame` from `validateAndParseRolls` to make frame parsing easier to follow, and renaming variables such as `first` and `second` to `firstRollPins` and `secondRollPins` and `start` to `startIndex`. I also added comments and documented the `score` script. I used terminal commands to run the automated tests and TypeScript typecheck during refinement; both passed. For example, I kept parsing helpers private and extracted a dedicated 10th-frame helper because its bonus-roll and rack rules differ from earlier frames. I verified those behaviors through the public scoring API rather than exposing internal helpers just for testing.
