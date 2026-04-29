---
title: How to Set Up a New Experiment
layout: default
nav_order: 3
---

# How to Set Up and Run a New Experiment

This guide walks through every step needed to adapt this template for a new triadic comparison experiment — from preparing stimuli to collecting and cleaning data.

---

## Overview

Each trial shows participants three images: one **target** (top) and two **choices** (bottom). Participants click (or press a key) to select which choice is most similar to the target. The experiment is built on [jsPsych](https://www.jspsych.org/) v7.3.4 and uses [jsPsych-Pipe](https://pipe.jspsych.org/) to save data server-side.

**The workflow for setting up a new experiment is:**

1. Edit `experiment.yaml` — the single source of truth for all settings.
2. Run `npm run setup` — auto-generates `experiment/js/config.js` and `experiment/js/stimuli.js`.
3. Test locally, then deploy.

**Never edit `config.js` or `stimuli.js` directly** — they are overwritten every time you run `npm run setup`.

---

## File responsibilities

| File | Role |
|------|------|
| `experiment.yaml` | **Edit this.** All researcher-facing settings in one place. |
| `scripts/generate_experiment.js` | Generator script — run via `npm run setup`. |
| `experiment/js/config.js` | Auto-generated — do not edit. |
| `experiment/js/stimuli.js` | Auto-generated — do not edit. |
| `experiment/assets/stimuli/` | Your stimulus image files. |
| `experiment/assets/consent/` | Your consent form image. |
| `experiment/index.html` | Experiment structure — only edit if you need to change the demographic questions or overall flow. |

---

## Step 1: Install dependencies

If you have not already done so:

```bash
npm install
```

This installs `js-yaml` (used by the generator) and `vitest` (used for tests).

---

## Step 2: Prepare your stimuli

### 2a. Add your images

Copy all stimulus images into `experiment/assets/stimuli/`. Supported formats: `.png`, `.jpg`, `.jpeg`, `.gif`, `.bmp`, `.webp`, `.svg`. You need at least 3 images to run the experiment.

The generator scans this directory automatically and sorts files alphabetically — you do not need to list them anywhere.

### 2b. Update `stimuli_dir` in `experiment.yaml`

```yaml
stimuli_dir: experiment/assets/stimuli
```

This is already the default. Change it only if you store your images elsewhere (path is relative to the project root).

### 2c. Define your validation trials

Validation trials are predefined triplets used for quality control (e.g., cross-participant consistency checks). The `validation_trials` field in `experiment.yaml` is **optional**:

**Option 1 — auto-generate (default for new experiments)**

Omit `validation_trials` entirely, or set it to an empty list. The setup script will randomly select `n_validation_trials` triplets from your stimuli directory each time you run `npm run setup`:

```yaml
# validation_trials:   ← omit this, or write:
validation_trials: []
```

New triplets are drawn every time `npm run setup` runs, so re-running the script will produce a different random set.

**Option 2 — specify explicitly**

List the triplets you want. Paths are relative to `experiment/` (the same root as `index.html`). You must supply at least `n_validation_trials` entries; if you provide more, the experiment samples from them at runtime:

```yaml
validation_trials:
  - stimulus: assets/stimuli/your_target.png
    choice1:  assets/stimuli/option_a.png
    choice2:  assets/stimuli/option_b.png
  # ... add at least n_validation_trials entries
```

---

## Step 3: Configure the experiment

All settings live in `experiment.yaml`. The sections below cover the ones you are most likely to change.

### Data pipeline (required)

Create a project at [pipe.jspsych.org](https://pipe.jspsych.org/) to get your experiment ID.

```yaml
experiment_id: "YOUR_PIPE_EXPERIMENT_ID"
filename_prefix: "your_study_name"
```

Each participant's data is saved as a CSV named `<filename_prefix>_<random_code>.csv`.

### SONA integration (required for credit granting)

Find these values in your SONA study's "Automated Credit Granting" settings.

```yaml
sona_base_url: "https://uwmadison.sona-systems.com/webstudy_credit.aspx"
sona_experiment_id: "YOUR_SONA_STUDY_ID"
sona_credit_token: "YOUR_CREDIT_TOKEN"
```

On completion, participants are automatically redirected to the SONA credit URL. Their SONA ID is read from the `?workerId=` URL parameter — make sure your SONA study appends it to the experiment URL.

### Trial counts

```yaml
n_random_trials: 550    # 3 random images — no correct answer
n_check_trials: 20      # attention checks — target repeats as one choice
n_validation_trials: 50 # drawn from your validation_trials list
n_main_trials: 620      # MUST equal the sum of the three above
```

The generator will error if `n_main_trials` does not equal the sum of the other three.

### Response mode

```yaml
response_mode: button      # "button" (default) or "keyboard"
response_keys: [f, j]     # left/right keys — only used in keyboard mode
```

### Timing

```yaml
min_rt_ms: 900             # responses faster than this trigger a speed warning
fixation_duration_ms: 500  # fixation cross duration before each trial
post_instruction_gap_ms: 2000
post_demographic_gap_ms: 1000
max_load_time_ms: 120000   # how long to wait for images to preload
```

### Consent form

```yaml
consent_image_path: "assets/consent/your_consent_form.png"
consent_button_text: "Consent & Continue"
```

### UI text

All participant-facing text is in `experiment.yaml`. Two fields support runtime placeholders:

- `instructions_html` — use `{{N_MAIN_TRIALS}}` and it will be replaced with the actual trial count.
- `secret_code_html` — use `{{SECRET_CODE}}` and it will be replaced with the participant's completion code.

The secret code is only shown when the `workerId` URL parameter is longer than `worker_id_min_length` characters (default: 7). This prevents it appearing during local testing.

---

## Step 4: Generate the experiment files

After editing `experiment.yaml`, run:

```bash
npm run setup
```

This overwrites `experiment/js/config.js` and `experiment/js/stimuli.js`. The script validates your settings before writing and will print a clear error message if something is wrong (mismatched trial counts, missing validation trials, stimuli directory not found, etc.).

---

## Step 5: Test locally

The experiment must be served over HTTP — opening `index.html` as a `file://` URL will not work.

```bash
# Python (no install needed)
cd experiment && python -m http.server 8000

# Node.js
npx serve experiment
```

Open `http://localhost:8000` in your browser.

**Testing tips:**

- Add a fake worker ID to skip SONA: `http://localhost:8000?workerId=test1234`
- For a shorter test session, temporarily reduce `n_random_trials` in `experiment.yaml` (and adjust `n_main_trials` to match), then re-run `npm run setup`.
- Run the unit test suite to verify utility functions are correct:

```bash
npm test
```

---

## Step 6: Deploy

The experiment is a static site — any static file host works. Common options:

- **GitHub Pages** — push the `experiment/` folder to a `gh-pages` branch, or configure Pages to serve from a subdirectory.
- **Netlify / Vercel** — drag and drop the `experiment/` folder or connect the repository.
- **University web server** — upload the `experiment/` folder via SFTP.

Ensure the host uses HTTPS, as jsPsych-Pipe requires it.

After deploying, give SONA the URL with the `%SURVEY_CODE%` placeholder appended as `?workerId=%SURVEY_CODE%` so SONA passes each participant's ID into the experiment automatically.

---

## Step 7: Collect and clean data

### Downloading data

Log in to your [jsPsych-Pipe](https://pipe.jspsych.org/) project to download individual CSV files, or use the Pipe API to batch-download them.

### Cleaning data

The `cleaning/` directory contains an R pipeline for cleaning raw triplet data:

1. Install R dependencies:
   ```r
   install.packages(c("dplyr", "data.table", "stringr", "readr", "tidyr"))
   ```
2. Edit `cleaning/R/clean_raw_data.R` and set `data_dir`, `filename_df`, and `filename_level` to point to your downloaded data.
3. Run:
   ```bash
   Rscript cleaning/R/clean_raw_data.R
   ```

---

## Quick reference: experiment.yaml settings

| Setting | Default | Notes |
|---------|---------|-------|
| `stimuli_dir` | `experiment/assets/stimuli` | Path to images, relative to project root |
| `validation_trials` | *(list)* | Must have ≥ `n_validation_trials` entries |
| `page_title` | `"Triadic Judgment Task"` | Browser tab title |
| `response_mode` | `"button"` | `"button"` or `"keyboard"` |
| `response_keys` | `[f, j]` | Left/right keys for keyboard mode |
| `n_random_trials` | `550` | |
| `n_check_trials` | `20` | |
| `n_validation_trials` | `50` | |
| `n_main_trials` | `620` | Must equal sum of above three |
| `min_rt_ms` | `900` | Faster responses trigger speed warning |
| `fixation_duration_ms` | `500` | |
| `post_instruction_gap_ms` | `2000` | |
| `post_demographic_gap_ms` | `1000` | |
| `max_load_time_ms` | `120000` | |
| `fixation_symbol` | `"+"` | |
| `experiment_id` | — | From jsPsych-Pipe dashboard |
| `filename_prefix` | — | Prefix for saved CSV files |
| `sona_base_url` | UW-Madison URL | Change for other institutions |
| `sona_experiment_id` | — | From SONA study settings |
| `sona_credit_token` | — | From SONA automated credit granting |
| `secret_code` | — | Shown to participants on completion |
| `worker_id_min_length` | `7` | Min URL param length to show secret code |
| `consent_image_path` | — | Path to consent form image |
| `consent_button_text` | `"Consent & Continue"` | |
