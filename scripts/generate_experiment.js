#!/usr/bin/env node
/**
 * Generates experiment/js/config.js and experiment/js/stimuli.js
 * from experiment.yaml.
 *
 * Usage:
 *   node scripts/generate_experiment.js
 *   npm run setup
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const PROJECT_ROOT   = path.resolve(__dirname, "..");
const EXPERIMENT_DIR = path.join(PROJECT_ROOT, "experiment");
const YAML_PATH      = path.join(PROJECT_ROOT, "experiment.yaml");
const CONFIG_OUT     = path.join(EXPERIMENT_DIR, "js", "config.js");
const STIMULI_OUT    = path.join(EXPERIMENT_DIR, "js", "stimuli.js");

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg"]);

// Ordered list of [yaml_key, CONFIG_KEY, js_type].
// All keys in this list are required in experiment.yaml.
const FIELD_DEFS = [
  ["page_title",                    "PAGE_TITLE",                    "string"],
  ["response_mode",                 "RESPONSE_MODE",                 "string"],
  ["response_keys",                 "RESPONSE_KEYS",                 "array"],
  ["n_random_trials",               "N_RANDOM_TRIALS",               "number"],
  ["n_check_trials",                "N_CHECK_TRIALS",                "number"],
  ["n_validation_trials",           "N_VALIDATION_TRIALS",           "number"],
  ["n_main_trials",                 "N_MAIN_TRIALS",                 "number"],
  ["min_rt_ms",                     "MIN_RT_MS",                     "number"],
  ["max_load_time_ms",              "MAX_LOAD_TIME_MS",              "number"],
  ["post_instruction_gap_ms",       "POST_INSTRUCTION_GAP_MS",       "number"],
  ["post_demographic_gap_ms",       "POST_DEMOGRAPHIC_GAP_MS",       "number"],
  ["fixation_duration_ms",          "FIXATION_DURATION_MS",          "number"],
  ["fixation_symbol",               "FIXATION_SYMBOL",               "string"],
  ["experiment_id",                 "EXPERIMENT_ID",                 "string"],
  ["filename_prefix",               "FILENAME_PREFIX",               "string"],
  ["sona_base_url",                 "SONA_BASE_URL",                 "string"],
  ["sona_experiment_id",            "SONA_EXPERIMENT_ID",            "string"],
  ["sona_credit_token",             "SONA_CREDIT_TOKEN",             "string"],
  ["secret_code",                   "SECRET_CODE",                   "string"],
  ["worker_id_min_length",          "WORKER_ID_MIN_LENGTH",          "number"],
  ["consent_image_path",            "CONSENT_IMAGE_PATH",            "string"],
  ["consent_button_text",           "CONSENT_BUTTON_TEXT",           "string"],
  ["preload_message",               "PRELOAD_MESSAGE",               "string"],
  ["welcome_text",                  "WELCOME_TEXT",                  "string"],
  ["instructions_html",             "INSTRUCTIONS_HTML",             "string"],
  ["continue_button_text",          "CONTINUE_BUTTON_TEXT",          "string"],
  ["speed_feedback_html",           "SPEED_FEEDBACK_HTML",           "string"],
  ["check_feedback_html",           "CHECK_FEEDBACK_HTML",           "string"],
  ["feedback_continue_key",         "FEEDBACK_CONTINUE_KEY",         "string"],
  ["demographic_instructions_html", "DEMOGRAPHIC_INSTRUCTIONS_HTML", "string"],
  ["goodbye_html",                  "GOODBYE_HTML",                  "string"],
  ["secret_code_html",              "SECRET_CODE_HTML",              "string"],
  ["complete_button_text",          "COMPLETE_BUTTON_TEXT",          "string"],
  ["race_ethnicity_prompt",         "RACE_ETHNICITY_PROMPT",         "string"],
  ["race_ethnicity_options",        "RACE_ETHNICITY_OPTIONS",        "array"],
  ["age_prompt",                    "AGE_PROMPT",                    "string"],
  ["age_columns",                   "AGE_COLUMNS",                   "number"],
  ["gender_prompt",                 "GENDER_PROMPT",                 "string"],
  ["gender_columns",                "GENDER_COLUMNS",                "number"],
];

// Groups fields into sections matching the original config.js layout.
const SECTIONS = [
  {
    comment: "── Page ────────────────────────────────────────────────",
    keys: ["page_title"],
  },
  {
    comment: "── Response mode ───────────────────────────────────────",
    keys: ["response_mode", "response_keys"],
  },
  {
    comment: "── Trial counts ────────────────────────────────────────",
    keys: ["n_random_trials", "n_check_trials", "n_validation_trials", "n_main_trials"],
  },
  {
    comment: "── Timing (milliseconds) ──────────────────────────────",
    keys: ["min_rt_ms", "max_load_time_ms", "post_instruction_gap_ms",
           "post_demographic_gap_ms", "fixation_duration_ms"],
  },
  {
    comment: "── Fixation ────────────────────────────────────────────",
    keys: ["fixation_symbol"],
  },
  {
    comment: "── Data pipeline ──────────────────────────────────────",
    keys: ["experiment_id", "filename_prefix"],
  },
  {
    comment: "── SONA integration (UW-Madison) ─────────────────────",
    keys: ["sona_base_url", "sona_experiment_id", "sona_credit_token"],
  },
  {
    comment: "── Participant feedback ───────────────────────────────",
    keys: ["secret_code", "worker_id_min_length"],
  },
  {
    comment: "── Consent ────────────────────────────────────────────",
    keys: ["consent_image_path", "consent_button_text"],
  },
  {
    comment: "── UI text / messages ─────────────────────────────────",
    keys: ["preload_message", "welcome_text", "instructions_html",
           "continue_button_text", "speed_feedback_html", "check_feedback_html",
           "feedback_continue_key", "demographic_instructions_html",
           "goodbye_html", "secret_code_html", "complete_button_text"],
  },
  {
    comment: "── Demographic questions ──────────────────────────────",
    keys: ["race_ethnicity_prompt", "race_ethnicity_options",
           "age_prompt", "age_columns", "gender_prompt", "gender_columns"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(YAML_PATH)) {
    die("experiment.yaml not found at: " + YAML_PATH);
  }

  var cfg = yaml.load(fs.readFileSync(YAML_PATH, "utf8"));

  validate(cfg);

  var imagePaths = scanStimuliDir(cfg.stimuli_dir);

  var validationTrials;
  var trialsSource;
  if (Array.isArray(cfg.validation_trials) && cfg.validation_trials.length > 0) {
    validationTrials = cfg.validation_trials;
    trialsSource = "specified in experiment.yaml";
  } else {
    validationTrials = generateValidationTrials(imagePaths, cfg.n_validation_trials);
    trialsSource = "randomly generated";
  }

  writeConfigJs(cfg);
  writeStimuliJs(imagePaths, validationTrials);

  console.log("config.js  written  (" + FIELD_DEFS.length + " settings)");
  console.log("stimuli.js written  (" + imagePaths.length + " images, " +
              validationTrials.length + " validation trials — " + trialsSource + ")");
}

// ── Validation ───────────────────────────────────────────────────────────────

function validate(cfg) {
  // All required fields present
  for (var i = 0; i < FIELD_DEFS.length; i++) {
    var yamlKey = FIELD_DEFS[i][0];
    if (cfg[yamlKey] === undefined || cfg[yamlKey] === null) {
      die("Missing required field in experiment.yaml: " + yamlKey);
    }
  }

  // Trial counts must add up
  var sum = cfg.n_random_trials + cfg.n_check_trials + cfg.n_validation_trials;
  if (sum !== cfg.n_main_trials) {
    die(
      "Trial count mismatch: n_random_trials (" + cfg.n_random_trials + ") + " +
      "n_check_trials (" + cfg.n_check_trials + ") + " +
      "n_validation_trials (" + cfg.n_validation_trials + ") = " + sum + ", " +
      "but n_main_trials = " + cfg.n_main_trials
    );
  }

  // If validation trials are explicitly provided, check there are enough and
  // that each one has the required fields.  If none are provided, they will be
  // generated automatically from the stimuli directory after this function returns.
  var nProvided = (cfg.validation_trials || []).length;
  if (nProvided > 0 && nProvided < cfg.n_validation_trials) {
    die(
      "Not enough validation_trials: n_validation_trials = " + cfg.n_validation_trials +
      " but only " + nProvided + " trials are defined in experiment.yaml"
    );
  }

  // Each manually specified validation trial must have the required fields
  (cfg.validation_trials || []).forEach(function(trial, idx) {
    ["stimulus", "choice1", "choice2"].forEach(function(field) {
      if (!trial[field]) {
        die("validation_trials[" + idx + "] is missing field: " + field);
      }
    });
  });
}

// ── Stimuli directory scan ────────────────────────────────────────────────────

function scanStimuliDir(stimuliDir) {
  var absDir = path.resolve(PROJECT_ROOT, stimuliDir);
  if (!fs.existsSync(absDir)) {
    die("stimuli_dir not found: " + absDir);
  }

  var files = fs.readdirSync(absDir)
    .filter(function(f) {
      return IMAGE_EXTS.has(path.extname(f).toLowerCase());
    })
    .sort();

  if (files.length < 3) {
    die("stimuli_dir must contain at least 3 images; found " + files.length);
  }

  // Produce paths relative to experiment/ (what index.html uses)
  var relToExperiment = path.relative(EXPERIMENT_DIR, absDir).replace(/\\/g, "/");
  return files.map(function(f) {
    return relToExperiment + "/" + f;
  });
}

// ── config.js writer ─────────────────────────────────────────────────────────

function writeConfigJs(cfg) {
  // Build lookup: yaml_key → [CONFIG_KEY, type]
  var fieldLookup = {};
  FIELD_DEFS.forEach(function(def) {
    fieldLookup[def[0]] = [def[1], def[2]];
  });

  var lines = [];
  lines.push("/**");
  lines.push(" * Experiment configuration constants.");
  lines.push(" * AUTO-GENERATED — do not edit directly.");
  lines.push(" * Edit experiment.yaml and run `npm run setup` to regenerate.");
  lines.push(" */");
  lines.push("");
  lines.push("/* eslint-disable no-unused-vars */");
  lines.push("var CONFIG = {");

  SECTIONS.forEach(function(section) {
    lines.push("");
    lines.push("  // " + section.comment);
    section.keys.forEach(function(yamlKey) {
      var configKey = fieldLookup[yamlKey][0];
      var type      = fieldLookup[yamlKey][1];
      var value     = cfg[yamlKey];
      lines.push("  " + configKey + ": " + formatValue(value, type) + ",");
    });
  });

  lines.push("};");
  lines.push("");
  lines.push("// Export for testing (Node.js / vitest)");
  lines.push("if (typeof module !== \"undefined\" && module.exports) {");
  lines.push("  module.exports = { CONFIG };");
  lines.push("}");
  lines.push("");

  fs.writeFileSync(CONFIG_OUT, lines.join("\n"), "utf8");
}

// ── stimuli.js writer ────────────────────────────────────────────────────────

function writeStimuliJs(imagePaths, validationTrials) {
  var lines = [];
  lines.push("/**");
  lines.push(" * Stimulus image paths and predefined validation trials.");
  lines.push(" * AUTO-GENERATED — do not edit directly.");
  lines.push(" * Edit experiment.yaml and run `npm run setup` to regenerate.");
  lines.push(" */");
  lines.push("");
  lines.push("/* eslint-disable no-unused-vars */");
  lines.push("var IMAGE_PATHS = [");
  imagePaths.forEach(function(p) {
    lines.push("  " + JSON.stringify(p) + ",");
  });
  lines.push("];");
  lines.push("");
  lines.push("var VALIDATION_TRIALS = [");
  validationTrials.forEach(function(t) {
    lines.push("  {");
    lines.push("    type: \"validation\",");
    lines.push("    stimulus: " + JSON.stringify(t.stimulus) + ",");
    lines.push("    choice1:  " + JSON.stringify(t.choice1)  + ",");
    lines.push("    choice2:  " + JSON.stringify(t.choice2)  + ",");
    lines.push("  },");
  });
  lines.push("];");
  lines.push("");
  lines.push("// Export for testing (Node.js / vitest)");
  lines.push("if (typeof module !== \"undefined\" && module.exports) {");
  lines.push("  module.exports = { IMAGE_PATHS: IMAGE_PATHS, VALIDATION_TRIALS: VALIDATION_TRIALS };");
  lines.push("}");
  lines.push("");

  fs.writeFileSync(STIMULI_OUT, lines.join("\n"), "utf8");
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a parsed YAML value to a JavaScript source code string.
 */
function formatValue(value, type) {
  if (type === "number") {
    return String(Number(value));
  }
  if (type === "string") {
    return JSON.stringify(String(value));
  }
  if (type === "array") {
    if (!Array.isArray(value) || value.length === 0) return "[]";
    var items = value.map(function(item) {
      return "    " + JSON.stringify(String(item));
    });
    return "[\n" + items.join(",\n") + ",\n  ]";
  }
  throw new Error("Unknown type: " + type);
}

/**
 * Randomly generate n validation trials from imagePaths.
 * Each trial picks 3 distinct images: stimulus, choice1, choice2.
 */
function generateValidationTrials(imagePaths, n) {
  if (imagePaths.length < 3) {
    die("Cannot auto-generate validation trials: need at least 3 images, found " +
        imagePaths.length);
  }

  var trials = [];
  for (var i = 0; i < n; i++) {
    var idx = sampleWithoutReplacement(imagePaths.length, 3);
    trials.push({
      stimulus: imagePaths[idx[0]],
      choice1:  imagePaths[idx[1]],
      choice2:  imagePaths[idx[2]],
    });
  }
  return trials;
}

/**
 * Return k distinct integers sampled uniformly at random from [0, n).
 * Uses a partial Fisher-Yates shuffle.
 */
function sampleWithoutReplacement(n, k) {
  var arr = [];
  for (var i = 0; i < n; i++) arr.push(i);
  for (var i = 0; i < k; i++) {
    var j = i + Math.floor(Math.random() * (n - i));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr.slice(0, k);
}

function die(msg) {
  console.error("Error: " + msg);
  process.exit(1);
}

main();
