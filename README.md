# Triplet Experiment Template

A ready-to-use template for running **triadic comparison experiments** (triplet tasks) online using [jsPsych](https://www.jspsych.org/) v7, with an accompanying R-based data-cleaning pipeline.

Participants view three images — one target on top, two choices below — and select the choice most similar to the target. The template includes attention checks, validation trials, progress tracking, and automated data export.

## Repository Structure

```
├── experiment/            # Web experiment (HTML + JS)
│   ├── index.html         # Main experiment page
│   ├── js/                # JavaScript modules
│   │   ├── config.js      # Configurable constants
│   │   ├── stimuli.js     # Image paths & validation trials
│   │   └── utils.js       # Pure utility functions
│   └── assets/
│       ├── consent/       # Consent form images
│       └── stimuli/       # Stimulus images (96 PNGs)
├── cleaning/              # Data cleaning pipeline
│   ├── R/
│   │   ├── functions.R          # Reusable cleaning functions
│   │   ├── clean_raw_data.R     # Main cleaning script
│   │   └── standardize_legacy.R # Legacy dataset standardizer
│   └── tests/             # R unit tests (testthat)
├── tests/                 # JavaScript unit tests (vitest)
├── docs/                  # Documentation & usage examples
└── .github/workflows/     # CI pipeline
```

## Quick Start

### Running the Experiment

1. Clone this repository.
2. Serve the `experiment/` directory with any static file server:
   ```bash
   # Using Python
   cd experiment && python -m http.server 8000

   # Using Node.js
   npx serve experiment
   ```
3. Open `http://localhost:8000` in your browser.

> **Note:** The experiment must be served over HTTP(S) — opening `index.html` directly as a file will not work due to ES module restrictions.

### Cleaning Data

1. Install R dependencies:
   ```r
   install.packages(c("dplyr", "data.table", "stringr", "readr", "tidyr"))
   ```
2. Edit `cleaning/R/clean_raw_data.R` and set `data_dir`, `filename_df`, and `filename_level`.
3. Run:
   ```bash
   Rscript cleaning/R/clean_raw_data.R
   ```

### Running Tests

```bash
# JavaScript tests
npm install
npm test

# R tests
Rscript cleaning/tests/run_tests.R
```

## Customizing the Template

| What to change | Where |
|---|---|
| Trial counts (random / check / validation) | `experiment/js/config.js` |
| Stimulus images | Replace PNGs in `experiment/assets/stimuli/` and update `experiment/js/stimuli.js` |
| SONA / data-pipe credentials | `experiment/js/config.js` |
| Demographic questions | `experiment/index.html` (demographics section) |
| Cleaning thresholds (min trials, min RT) | `cleaning/R/clean_raw_data.R` |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch workflow and coding standards.

## License

[MIT](LICENSE)
