export type Roll = number | "X" | "/";
export type FrameScore = number | null;

type Frame = {
  startIndex: number;
  rollsNeeded: 2 | 3;
};

type RollReader = {
  rolls: readonly Roll[];
  pins: number[];
  cursor: number;
};

const MAX_PINS_PER_RACK = 10;
const MAX_FRAMES = 10;
const MAX_GAME_ROLLS = 21;

// Convert a roll to pins knocked down, using the previous roll to validate and resolve spares.
function normalizeRoll(roll: unknown, previous: number | null, index: number): number {
  if (roll === "X" && previous === null) return MAX_PINS_PER_RACK;
  if (roll === "/" && previous !== null) return MAX_PINS_PER_RACK - previous;

  if (
    typeof roll === "number" &&
    Number.isInteger(roll) &&
    roll >= 0 &&
    roll <= 9 &&
    (previous === null || previous + roll <= MAX_PINS_PER_RACK)
  ) {
    return roll;
  }

  throw new Error(`Invalid roll at index ${index}: ${String(roll)}`);
}

// Convert the next roll and advance the shared parser state.
function readRoll(reader: RollReader, previous: number | null = null): number {
  const { rolls, cursor } = reader;
  const value = normalizeRoll(rolls[cursor], previous, cursor);

  reader.cursor += 1;
  reader.pins.push(value);
  return value;
}

// The tenth frame owns its earned bonus rolls (unlike earlier frames, which use later frames' rolls),
// so handle its spare/strike rules and rack transitions separately.
function parseTenthFrame(reader: RollReader, frame: Frame, firstRollPins: number): void {
  if (firstRollPins === MAX_PINS_PER_RACK) {
    frame.rollsNeeded = 3;

    if (reader.cursor < reader.rolls.length) {
      const bonus = readRoll(reader);
      if (reader.cursor < reader.rolls.length) {
        readRoll(reader, bonus === MAX_PINS_PER_RACK ? null : bonus);
      }
    }
    return;
  }

  if (reader.cursor === reader.rolls.length) return;

  const secondRollPins = readRoll(reader, firstRollPins);
  if (firstRollPins + secondRollPins === MAX_PINS_PER_RACK) {
    frame.rollsNeeded = 3;
    if (reader.cursor < reader.rolls.length) readRoll(reader);
  }
}

// Parse one started frame, recording its position and how many rolls are needed to score it.
function parseFrame(reader: RollReader, isTenth: boolean): Frame {
  const frame: Frame = { startIndex: reader.pins.length, rollsNeeded: 2 };
  const firstRollPins = readRoll(reader);

  if (isTenth) {
    parseTenthFrame(reader, frame, firstRollPins);
    return frame;
  }

  if (firstRollPins === MAX_PINS_PER_RACK || reader.cursor === reader.rolls.length) {
    if (firstRollPins === MAX_PINS_PER_RACK) frame.rollsNeeded = 3;
    return frame;
  }

  const secondRollPins = readRoll(reader, firstRollPins);
  if (firstRollPins + secondRollPins === MAX_PINS_PER_RACK) frame.rollsNeeded = 3;
  return frame;
}

/**
 * Validates rolls, converts them to pin counts, and records each started frame's scoring window.
 * For example, [4, 5, "X", 8, 1] returns:
 * { pins: [4, 5, 10, 8, 1], frames: [
 *   { startIndex: 0, rollsNeeded: 2 },
 *   { startIndex: 2, rollsNeeded: 3 },
 *   { startIndex: 3, rollsNeeded: 2 }
 * ] }
 */
function validateAndParseRolls(rolls: readonly Roll[]): { pins: number[]; frames: Frame[] } {
  if (!Array.isArray(rolls)) {
    throw new TypeError("Expected an array of rolls.");
  }

  if (rolls.length > MAX_GAME_ROLLS) {
    throw new Error(`Game exceeds the maximum possible roll count (${MAX_GAME_ROLLS}).`);
  }

  const reader: RollReader = { rolls, pins: [], cursor: 0 };
  const frames: Frame[] = [];

  // Frames 1–9 consume only their own rolls; the tenth frame also consumes any earned bonuses.
  while (reader.cursor < rolls.length && frames.length < MAX_FRAMES) {
    frames.push(parseFrame(reader, frames.length === MAX_FRAMES - 1));
  }

  if (reader.cursor < rolls.length) {
    throw new Error("Unexpected rolls after the tenth frame.");
  }

  return { pins: reader.pins, frames };
}

// Sum each frame's rolls and leave its score unresolved until all required bonus rolls are present.
function scoreFrames(pins: number[], frames: Frame[]): FrameScore[] {
  return frames.map(({ startIndex, rollsNeeded }) => {
    if (pins.length - startIndex < rollsNeeded) return null;
    return pins
      .slice(startIndex, startIndex + rollsNeeded)
      .reduce((total, value) => total + value, 0);
  });
}

/**
 * Returns one score per started frame, including unfinished frames as null.
 * Accepts valid prefixes of a game; throws for impossible rolls or extra rolls.
 * Numeric pairs totaling 10 are accepted as spares, just like `7, "/"`.
 */
export function scoreBowling(rolls: readonly Roll[]): FrameScore[] {
  const { pins, frames } = validateAndParseRolls(rolls);
  return scoreFrames(pins, frames);
}
