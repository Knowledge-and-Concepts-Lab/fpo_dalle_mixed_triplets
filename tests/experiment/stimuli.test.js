import { describe, it, expect } from "vitest";
import { IMAGE_PATHS, VALIDATION_TRIALS } from "../../experiment/js/stimuli.js";

describe("IMAGE_PATHS", () => {
  it("contains 96 images", () => {
    expect(IMAGE_PATHS).toHaveLength(96);
  });

  it("all paths start with assets/stimuli/", () => {
    for (const path of IMAGE_PATHS) {
      expect(path).toMatch(/^assets\/stimuli\//);
    }
  });

  it("all paths end with .png", () => {
    for (const path of IMAGE_PATHS) {
      expect(path).toMatch(/\.png$/);
    }
  });

  it("contains no duplicates", () => {
    const unique = new Set(IMAGE_PATHS);
    expect(unique.size).toBe(IMAGE_PATHS.length);
  });

  it("has both urban and rural images", () => {
    const hasUrban = IMAGE_PATHS.some((p) => p.includes("urban_"));
    const hasRural = IMAGE_PATHS.some((p) => p.includes("rural_"));
    expect(hasUrban).toBe(true);
    expect(hasRural).toBe(true);
  });

  it("has both day and eve images", () => {
    const hasDay = IMAGE_PATHS.some((p) => p.includes("_day_"));
    const hasEve = IMAGE_PATHS.some((p) => p.includes("_eve_"));
    expect(hasDay).toBe(true);
    expect(hasEve).toBe(true);
  });
});

describe("VALIDATION_TRIALS", () => {
  it("contains 50 trials", () => {
    expect(VALIDATION_TRIALS).toHaveLength(50);
  });

  it("all trials have required fields", () => {
    for (const trial of VALIDATION_TRIALS) {
      expect(trial).toHaveProperty("type", "validation");
      expect(trial).toHaveProperty("stimulus");
      expect(trial).toHaveProperty("choice1");
      expect(trial).toHaveProperty("choice2");
    }
  });

  it("all stimulus paths reference images in IMAGE_PATHS", () => {
    const pathSet = new Set(IMAGE_PATHS);
    for (const trial of VALIDATION_TRIALS) {
      expect(pathSet.has(trial.stimulus)).toBe(true);
      expect(pathSet.has(trial.choice1)).toBe(true);
      expect(pathSet.has(trial.choice2)).toBe(true);
    }
  });

  it("no trial has duplicate images", () => {
    for (const trial of VALIDATION_TRIALS) {
      const images = [trial.stimulus, trial.choice1, trial.choice2];
      const unique = new Set(images);
      expect(unique.size).toBe(3);
    }
  });
});
