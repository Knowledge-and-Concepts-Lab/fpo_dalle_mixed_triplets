---
title: Home
layout: home
nav_order: 1
---

# Triplet Experiment Template

A ready-to-use template for running **triadic comparison experiments** (triplet tasks) online using [jsPsych](https://www.jspsych.org/) v7, with an R-based data-cleaning pipeline.

Participants view three images — one target on top, two choices below — and select the choice most similar to the target. The template includes attention checks, validation trials, progress tracking, and automated data export.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Edit the master config
#    — set your stimuli directory, credentials, trial counts, and UI text
open experiment.yaml

# 3. Generate experiment/js/config.js and experiment/js/stimuli.js
npm run setup

# 4. Serve and preview locally
cd experiment && python -m http.server 8000
```

Then open `http://localhost:8000`.

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Installation & Prerequisites](installation) | Software and dependencies needed to use this template |
| [How to Set Up a New Experiment](how-to-new-experiment) | Step-by-step walkthrough — stimuli, config, deployment, data cleaning |
| [Data Cleaning Reference](data-cleaning) | All R cleaning functions, the full pipeline, and the legacy converter |

---

## Repository layout

```
├── experiment/            # Web experiment (HTML + JS)
│   ├── index.html         # Main experiment page
│   ├── js/
│   │   ├── config.js      # Auto-generated — do not edit
│   │   ├── stimuli.js     # Auto-generated — do not edit
│   │   └── utils.js       # Trial-generation utilities
│   └── assets/
│       ├── consent/       # Consent form image
│       └── stimuli/       # Stimulus images
├── experiment.yaml        # ← Edit this to configure your experiment
├── scripts/
│   └── generate_experiment.js  # Reads experiment.yaml, writes config.js + stimuli.js
├── cleaning/              # R data-cleaning pipeline
│   └── R/
│       ├── clean_raw_data.R
│       └── functions.R
├── tests/                 # JavaScript unit tests (vitest)
└── docs/                  # This documentation site
```
