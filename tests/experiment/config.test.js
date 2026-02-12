import { describe, it, expect } from "vitest";
import { CONFIG } from "../../experiment/js/config.js";

describe("CONFIG", () => {
  it("has trial counts that sum to N_MAIN_TRIALS", () => {
    const sum =
      CONFIG.N_RANDOM_TRIALS +
      CONFIG.N_CHECK_TRIALS +
      CONFIG.N_VALIDATION_TRIALS;
    expect(sum).toBe(CONFIG.N_MAIN_TRIALS);
  });

  it("has positive timing values", () => {
    expect(CONFIG.MIN_RT_MS).toBeGreaterThan(0);
    expect(CONFIG.MAX_LOAD_TIME_MS).toBeGreaterThan(0);
    expect(CONFIG.FIXATION_DURATION_MS).toBeGreaterThan(0);
    expect(CONFIG.POST_INSTRUCTION_GAP_MS).toBeGreaterThan(0);
  });

  it("has a non-empty experiment ID", () => {
    expect(CONFIG.EXPERIMENT_ID).toBeTruthy();
    expect(CONFIG.EXPERIMENT_ID.length).toBeGreaterThan(0);
  });

  it("has SONA configuration", () => {
    expect(CONFIG.SONA_BASE_URL).toMatch(/^https:\/\//);
    expect(CONFIG.SONA_EXPERIMENT_ID).toBeTruthy();
    expect(CONFIG.SONA_CREDIT_TOKEN).toBeTruthy();
  });
});
