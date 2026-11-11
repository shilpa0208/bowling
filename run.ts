import { scoreBowling } from "./bowling.ts";
import type { Roll } from "./bowling.ts";

// Edit these rolls to try a different game, then run: npm run score
const rolls: Roll[] = [4, 5, "X", 8, 1];

try {
  console.log(scoreBowling(rolls));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to score game: ${message}`);
  process.exitCode = 1;
}
