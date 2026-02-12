/**
 * Experiment configuration constants.
 *
 * Update these values when creating a new experiment version.
 */

export const CONFIG = {
  // Trial counts
  N_RANDOM_TRIALS: 550,
  N_CHECK_TRIALS: 20,
  N_VALIDATION_TRIALS: 50,
  N_MAIN_TRIALS: 620, // sum of above

  // Timing (milliseconds)
  MIN_RT_MS: 900,
  MAX_LOAD_TIME_MS: 120000,
  POST_INSTRUCTION_GAP_MS: 2000,
  FIXATION_DURATION_MS: 500,

  // Data pipeline
  EXPERIMENT_ID: "FywDeGGEu5T3",
  FILENAME_PREFIX: "fpo_mixed_domain_fullSet",

  // SONA integration (UW-Madison)
  SONA_BASE_URL:
    "https://uwmadison.sona-systems.com/webstudy_credit.aspx",
  SONA_EXPERIMENT_ID: "2226",
  SONA_CREDIT_TOKEN: "a9411967764b499caa53a0ecccabe0a1",

  // Participant feedback
  SECRET_CODE: "C119H2OR",
};
