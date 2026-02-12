import { describe, it, expect } from "vitest";
import { CONFIG } from "../../experiment/js/config.js";

describe("CONFIG – trial counts", () => {
  it("has trial counts that sum to N_MAIN_TRIALS", () => {
    const sum =
      CONFIG.N_RANDOM_TRIALS +
      CONFIG.N_CHECK_TRIALS +
      CONFIG.N_VALIDATION_TRIALS;
    expect(sum).toBe(CONFIG.N_MAIN_TRIALS);
  });
});

describe("CONFIG – timing", () => {
  it("has positive timing values", () => {
    expect(CONFIG.MIN_RT_MS).toBeGreaterThan(0);
    expect(CONFIG.MAX_LOAD_TIME_MS).toBeGreaterThan(0);
    expect(CONFIG.FIXATION_DURATION_MS).toBeGreaterThan(0);
    expect(CONFIG.POST_INSTRUCTION_GAP_MS).toBeGreaterThan(0);
    expect(CONFIG.POST_DEMOGRAPHIC_GAP_MS).toBeGreaterThan(0);
  });
});

describe("CONFIG – data pipeline", () => {
  it("has a non-empty experiment ID", () => {
    expect(CONFIG.EXPERIMENT_ID).toBeTruthy();
  });

  it("has a non-empty filename prefix", () => {
    expect(CONFIG.FILENAME_PREFIX).toBeTruthy();
  });
});

describe("CONFIG – SONA integration", () => {
  it("has SONA configuration", () => {
    expect(CONFIG.SONA_BASE_URL).toMatch(/^https:\/\//);
    expect(CONFIG.SONA_EXPERIMENT_ID).toBeTruthy();
    expect(CONFIG.SONA_CREDIT_TOKEN).toBeTruthy();
  });
});

describe("CONFIG – response mode", () => {
  it("RESPONSE_MODE is button or keyboard", () => {
    expect(["button", "keyboard"]).toContain(CONFIG.RESPONSE_MODE);
  });

  it("RESPONSE_KEYS has exactly 2 keys", () => {
    expect(CONFIG.RESPONSE_KEYS).toHaveLength(2);
  });

  it("RESPONSE_KEYS are single characters", () => {
    for (const key of CONFIG.RESPONSE_KEYS) {
      expect(key).toHaveLength(1);
    }
  });
});

describe("CONFIG – consent", () => {
  it("has a consent image path", () => {
    expect(CONFIG.CONSENT_IMAGE_PATH).toMatch(/\.png$/);
  });

  it("has consent button text", () => {
    expect(CONFIG.CONSENT_BUTTON_TEXT).toBeTruthy();
  });
});

describe("CONFIG – UI text", () => {
  it("has all required text fields", () => {
    expect(CONFIG.PAGE_TITLE).toBeTruthy();
    expect(CONFIG.PRELOAD_MESSAGE).toBeTruthy();
    expect(CONFIG.WELCOME_TEXT).toBeTruthy();
    expect(CONFIG.INSTRUCTIONS_HTML).toBeTruthy();
    expect(CONFIG.CONTINUE_BUTTON_TEXT).toBeTruthy();
    expect(CONFIG.SPEED_FEEDBACK_HTML).toBeTruthy();
    expect(CONFIG.CHECK_FEEDBACK_HTML).toBeTruthy();
    expect(CONFIG.FEEDBACK_CONTINUE_KEY).toBeTruthy();
    expect(CONFIG.DEMOGRAPHIC_INSTRUCTIONS_HTML).toBeTruthy();
    expect(CONFIG.GOODBYE_HTML).toBeTruthy();
    expect(CONFIG.SECRET_CODE_HTML).toBeTruthy();
    expect(CONFIG.COMPLETE_BUTTON_TEXT).toBeTruthy();
  });

  it("INSTRUCTIONS_HTML contains the N_MAIN_TRIALS placeholder", () => {
    expect(CONFIG.INSTRUCTIONS_HTML).toContain("{{N_MAIN_TRIALS}}");
  });

  it("SECRET_CODE_HTML contains the SECRET_CODE placeholder", () => {
    expect(CONFIG.SECRET_CODE_HTML).toContain("{{SECRET_CODE}}");
  });
});

describe("CONFIG – demographics", () => {
  it("has race/ethnicity options", () => {
    expect(CONFIG.RACE_ETHNICITY_OPTIONS.length).toBeGreaterThan(0);
    expect(CONFIG.RACE_ETHNICITY_PROMPT).toBeTruthy();
  });

  it("has age and gender prompts", () => {
    expect(CONFIG.AGE_PROMPT).toBeTruthy();
    expect(CONFIG.AGE_COLUMNS).toBeGreaterThan(0);
    expect(CONFIG.GENDER_PROMPT).toBeTruthy();
    expect(CONFIG.GENDER_COLUMNS).toBeGreaterThan(0);
  });
});

describe("CONFIG – participant feedback", () => {
  it("has a secret code", () => {
    expect(CONFIG.SECRET_CODE).toBeTruthy();
  });

  it("has a positive worker ID min length", () => {
    expect(CONFIG.WORKER_ID_MIN_LENGTH).toBeGreaterThan(0);
  });

  it("has a non-empty fixation symbol", () => {
    expect(CONFIG.FIXATION_SYMBOL).toBeTruthy();
  });
});
