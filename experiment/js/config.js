/**
 * Experiment configuration constants.
 *
 * Update these values when creating a new experiment version.
 * Every researcher-facing setting lives here — index.html should
 * contain only structural experiment logic.
 */

/* eslint-disable no-unused-vars */
var CONFIG = {

  // ── Page ────────────────────────────────────────────────
  PAGE_TITLE: "Triadic Judgment Task",

  // ── Response mode ───────────────────────────────────────
  // "button"   – participants click image buttons
  // "keyboard" – participants press keys (see RESPONSE_KEYS)
  RESPONSE_MODE: "button",

  // Keys used when RESPONSE_MODE is "keyboard" (left / right)
  RESPONSE_KEYS: ["f", "j"],

  // ── Trial counts ────────────────────────────────────────
  N_RANDOM_TRIALS: 550,
  N_CHECK_TRIALS: 20,
  N_VALIDATION_TRIALS: 50,
  N_MAIN_TRIALS: 620, // sum of above

  // ── Timing (milliseconds) ──────────────────────────────
  MIN_RT_MS: 900,
  MAX_LOAD_TIME_MS: 120000,
  POST_INSTRUCTION_GAP_MS: 2000,
  POST_DEMOGRAPHIC_GAP_MS: 1000,
  FIXATION_DURATION_MS: 500,

  // ── Fixation ────────────────────────────────────────────
  FIXATION_SYMBOL: "+",

  // ── Data pipeline ──────────────────────────────────────
  EXPERIMENT_ID: "FywDeGGEu5T3",
  FILENAME_PREFIX: "fpo_mixed_domain_fullSet",

  // ── SONA integration (UW-Madison) ─────────────────────
  SONA_BASE_URL:
    "https://uwmadison.sona-systems.com/webstudy_credit.aspx",
  SONA_EXPERIMENT_ID: "2226",
  SONA_CREDIT_TOKEN: "a9411967764b499caa53a0ecccabe0a1",

  // ── Participant feedback ───────────────────────────────
  SECRET_CODE: "C119H2OR",
  WORKER_ID_MIN_LENGTH: 7,

  // ── Consent ────────────────────────────────────────────
  CONSENT_IMAGE_PATH: "assets/consent/kc_lab_consent_prolific.png",
  CONSENT_BUTTON_TEXT: "Consent & Continue",

  // ── UI text / messages ─────────────────────────────────
  PRELOAD_MESSAGE: "Loading experiment files...",

  WELCOME_TEXT: "Welcome to the experiment. Press any key to begin.",

  INSTRUCTIONS_HTML:
    "<p>In each trial of this task, you will see three images: " +
    "one target item on top, and two choices beneath the target item.</p>" +
    "<p>For each trial, <strong>please select the item that is most " +
    "similar to the target item USING ANY CRITERIA.</strong></p>" +
    "<p>There will be {{N_MAIN_TRIALS}} trials.</p>" +
    "<p>Click 'Continue' to begin the test.</p>",

  CONTINUE_BUTTON_TEXT: "Continue",

  SPEED_FEEDBACK_HTML:
    "<p><strong>You're going too fast.</strong></p>" +
    "Please slow down and assess each triplet." +
    "<p>Press 'y' to continue.</p>",

  CHECK_FEEDBACK_HTML:
    "<p><strong>Incorrect!</strong></p>" +
    "That was an attention check. Please pay attention while completing this task." +
    "<p>Press 'y' to continue.</p>",

  FEEDBACK_CONTINUE_KEY: "y",

  DEMOGRAPHIC_INSTRUCTIONS_HTML:
    "<p>Awesome!</p>" +
    "<p>For this last part of the experiment, please provide us " +
    "with information about yourself.</p>",

  GOODBYE_HTML:
    "Woohoo! You have finished the experiment.<br>" +
    "Click the button below to complete the experiment.<br><br>",

  SECRET_CODE_HTML:
    "<strong> Here is your secret code: {{SECRET_CODE}} </strong><br>",

  COMPLETE_BUTTON_TEXT: "Complete Experiment",

  // ── Demographic questions ──────────────────────────────
  RACE_ETHNICITY_PROMPT:
    "Which categories describe you? Select all that apply to you:",

  RACE_ETHNICITY_OPTIONS: [
    "American Indian or Alaska Native - For example, Navajo Nation, Mayan",
    "Asian - For example, Chinese, Asian Indian",
    "Black or African American - For example, Jamaican, Ethiopian",
    "Hispanic or Latino - For example, Mexican or Mexican American, Puerto Rican, Salvadoran",
    "Middle Eastern or North African - For example, Lebanese, Iranian, Moroccan",
    "Native Hawaiian or Other Pacific Islander - For example, Somoan, Fijian",
    "White - For example, German, Irish",
    "Some other race, ethnicity, or origin",
    "I prefer not to answer",
  ],

  AGE_PROMPT: "Please enter your age (in years):",
  AGE_COLUMNS: 6,

  GENDER_PROMPT:
    "How do you currently describe your gender identity? Please specify.",
  GENDER_COLUMNS: 60,
};

// Export for testing (Node.js / vitest)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONFIG };
}
