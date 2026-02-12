import { describe, it, expect, vi } from "vitest";
import {
  shuffle,
  getUniqueRandomImages,
  generateRandomTrial,
  generateCheckTrial,
  createTrialSequence,
} from "../../experiment/js/utils.js";

// A deterministic mock for sampleFn: returns the first `n` items.
const mockSampleFn = (arr, n) => arr.slice(0, n);

describe("shuffle", () => {
  it("returns the same array reference", () => {
    const arr = [1, 2, 3];
    const result = shuffle(arr);
    expect(result).toBe(arr);
  });

  it("preserves all elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr);
    expect(arr.sort()).toEqual(copy.sort());
  });

  it("does not change a single-element array", () => {
    const arr = [42];
    shuffle(arr);
    expect(arr).toEqual([42]);
  });

  it("handles an empty array", () => {
    const arr = [];
    shuffle(arr);
    expect(arr).toEqual([]);
  });
});

describe("getUniqueRandomImages", () => {
  const paths = ["a.png", "b.png", "c.png", "d.png"];

  it("returns n images", () => {
    const result = getUniqueRandomImages(paths, 2, [], mockSampleFn);
    expect(result).toHaveLength(2);
  });

  it("excludes specified images", () => {
    const result = getUniqueRandomImages(paths, 2, ["a.png"], mockSampleFn);
    expect(result).not.toContain("a.png");
  });

  it("returns null when not enough images available", () => {
    const result = getUniqueRandomImages(paths, 10, [], mockSampleFn);
    expect(result).toBeNull();
  });

  it("returns null when exclusions reduce pool below n", () => {
    const result = getUniqueRandomImages(
      paths,
      4,
      ["a.png", "b.png"],
      mockSampleFn
    );
    expect(result).toBeNull();
  });
});

describe("generateRandomTrial", () => {
  const paths = ["img1.png", "img2.png", "img3.png", "img4.png"];

  it("returns a trial with type 'random'", () => {
    const trial = generateRandomTrial(paths, mockSampleFn);
    expect(trial.type).toBe("random");
  });

  it("returns three distinct images", () => {
    const trial = generateRandomTrial(paths, mockSampleFn);
    const images = [trial.stimulus, trial.choice1, trial.choice2];
    expect(new Set(images).size).toBe(3);
  });
});

describe("generateCheckTrial", () => {
  const paths = ["img1.png", "img2.png", "img3.png"];

  it("returns a trial with type 'check'", () => {
    const trial = generateCheckTrial(paths, mockSampleFn);
    expect(trial.type).toBe("check");
  });

  it("has the target as one of the choices", () => {
    const trial = generateCheckTrial(paths, mockSampleFn);
    const choices = [trial.choice1, trial.choice2];
    expect(choices).toContain(trial.stimulus);
  });

  it("correct_choice is 0 or 1", () => {
    const trial = generateCheckTrial(paths, mockSampleFn);
    expect([0, 1]).toContain(trial.correct_choice);
  });

  it("correct_choice points to the matching stimulus", () => {
    const trial = generateCheckTrial(paths, mockSampleFn);
    const chosen = trial.correct_choice === 0 ? trial.choice1 : trial.choice2;
    expect(chosen).toBe(trial.stimulus);
  });
});

describe("createTrialSequence", () => {
  const paths = ["a.png", "b.png", "c.png", "d.png", "e.png"];
  const validationTrials = [
    { type: "validation", stimulus: "a.png", choice1: "b.png", choice2: "c.png" },
    { type: "validation", stimulus: "d.png", choice1: "a.png", choice2: "e.png" },
    { type: "validation", stimulus: "b.png", choice1: "c.png", choice2: "d.png" },
  ];

  it("returns the correct total number of trials", () => {
    const trials = createTrialSequence(5, 2, 3, paths, validationTrials, mockSampleFn);
    expect(trials).toHaveLength(10); // 5 + 2 + 3
  });

  it("contains the right count of each trial type", () => {
    const trials = createTrialSequence(5, 2, 3, paths, validationTrials, mockSampleFn);
    const counts = { random: 0, check: 0, validation: 0 };
    for (const t of trials) counts[t.type]++;
    expect(counts.random).toBe(5);
    expect(counts.check).toBe(2);
    expect(counts.validation).toBe(3);
  });
});
