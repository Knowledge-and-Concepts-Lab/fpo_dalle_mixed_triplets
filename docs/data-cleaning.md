---
title: Data Cleaning Reference
layout: default
nav_order: 4
---

# Data Cleaning Reference

The `cleaning/R/` directory contains two scripts:

| Script | Purpose |
|--------|---------|
| `clean_raw_data.R` | Main pipeline — processes raw jsPsych-Pipe CSV exports into a model-ready dataset |
| `standardize_legacy.R` | Converts older triadic comparison datasets from various column formats into the standard 2025 format |

Both scripts depend on the helper functions defined in `functions.R`.

---

## Output format

Both scripts produce the same column structure. Understanding this layout helps interpret what each function does.

### Cleaned data file

| Column | Type | Description |
|--------|------|-------------|
| `head` / `Center` | numeric / string | The target (top) stimulus. `head` is a zero-based integer index; `Center` is the filename string. |
| `winner` / `Answer` | numeric / string | The stimulus the participant chose as most similar. |
| `loser` | numeric / string | The stimulus the participant did not choose. |
| `Left` | string | The stimulus shown on the left side of the screen. |
| `Right` | string | The stimulus shown on the right side of the screen. |
| `worker_id` / `p_id` | string | Participant identifier (sourced from the `?workerId=` URL parameter). |
| `rt` / `RT` | numeric | Reaction time in milliseconds. |
| `sampleAlg` | string | How the trial was generated: `"random"`, `"check"`, or `"validation"`. See [`assign_sample_alg`](#assign_sample_alg). |
| `sampleSet` | string | Whether this trial is in the `"train"` or `"test"` split for embedding models. `NA` for check trials. See [`assign_sample_sets`](#assign_sample_sets). |

The numeric columns `head`, `winner`, and `loser` are zero-based integer indices into an alphabetically-sorted list of all unique stimulus names. This list is written to a separate **levels file** alongside the cleaned data.

### Levels file

Maps each integer index back to its stimulus filename, with one row per unique stimulus:

| Column | Description |
|--------|-------------|
| `file` | Stimulus filename without path or extension (e.g. `rural_day_old_big_house_1`) |
| `path` | Full relative path with extension (e.g. `resources/rural_day_old_big_house_1.png`) |

---

## `clean_raw_data.R` — main pipeline

This script reads all CSV files exported from jsPsych-Pipe, applies the full cleaning pipeline, and writes two output files.

### Configuration

Before running, set three variables near the top of the script:

```r
data_dir       <- "path/to/raw/csvs"   # folder containing downloaded CSV files
filename_df    <- "cleaned_data.csv"    # output: cleaned triplet data
filename_level <- "levels.csv"          # output: stimulus index mapping
```

### Running

```bash
Rscript cleaning/R/clean_raw_data.R
```

### What it does, step by step

1. **Reads all CSVs** in `data_dir` and row-binds them into a single data frame.
2. **Filters for main trials** — keeps only `trial_type == "image-button-response"` rows and drops `trial_index == 3` (which captures early non-trial screens).
3. **Removes incomplete participants** via [`filter_incomplete`](#filter_incomplete) (default: fewer than 510 trials).
4. **Removes fast responders** via [`filter_fast_responders`](#filter_fast_responders) (default: log mean RT below log(1000 ms)).
5. **Cleans stimulus filenames** — strips `resources/` path prefixes, quotes, brackets, and `.png` extensions from the `stimulus` and `choices` columns, then renames `stimulus` to `head`.
6. **Splits choices into winner and loser** — uses the `response` column (0 = left choice selected, 1 = right) to determine which option was chosen (`winner`) and which was not (`loser`).
7. **Labels trial types** via [`assign_sample_alg`](#assign_sample_alg).
8. **Removes attention-check failures** via [`filter_failed_catch`](#filter_failed_catch) (default: more than 20% wrong).
9. **Encodes stimuli as integers** — creates zero-based numeric columns (`head`, `winner`, `loser`) from an alphabetically-sorted factor over all unique stimulus names.
10. **Assigns train/test splits** via [`assign_sample_sets`](#assign_sample_sets) (default: 80% train, 20% test).
11. **Writes outputs** — the cleaned data file and the levels mapping file.

---

## `standardize_legacy.R` — legacy dataset converter

Use this script when you have triadic comparison data from older or external sources that use different column names. It detects and maps a wide range of legacy column names to the standard format.

### Usage

```r
source("cleaning/R/standardize_legacy.R")
result <- clean_triadic_comparisons("your_dataset.csv")
```

The function writes two files and returns their paths:

```r
result$data_file    # e.g. "your_dataset_v2025.csv"
result$levels_file  # e.g. "your_dataset_v2025_levels.csv"
```

### `clean_triadic_comparisons(input_file)`

Reads a single CSV and standardises it to the 2025 column format.

**Column name detection** — the function matches input columns case-insensitively and ignoring punctuation, so `Participant.ID`, `participant_id`, and `PARTICIPANTID` all resolve to the same field.

**Recognised column names by role:**

| Output column | Recognised input names |
|---------------|----------------------|
| `p_id` | `sessionID`, `session_ID`, `puid`, `Participant.ID`, `worker_id`, `sub_id`, `pid` |
| `Center` | `Center`, `Target` |
| `Left` | `Left`, `Option1` |
| `Right` | `Right`, `Option2` |
| `winner` | `winner`, `primary` |
| `loser` | `loser`, `alternate` |
| `sampleSet` | `sampleSet`, `Alg.Label`, `TrnTest` |
| `sampleAlg` | `sampleAlg`, `AlgSample` |

**`sampleAlg` value recoding:**

| Input value | Output value |
|-------------|-------------|
| `"Random"` | `"random"` |
| `"Test"` | `"validation"` |
| `"check"` | `"check"` |
| `"uncertainty"` | `"uncertainty"` |

**Fallback behaviour when columns are missing:**

- If no participant ID column is found, synthetic IDs (`P1`, `P2`, …) are assigned.
- If no `sampleSet` column is found, trials are randomly split 90% train / 10% test (seed 2025).
- If no `sampleAlg` column is found, the column is filled with `NA`.
- Any of `head`, `winner`, `loser`, `Answer` that cannot be found are derived from the relationships among `Center`, `Left`, `Right`, and `Answer` where possible.

---

## Helper functions (`functions.R`)

Source this file to use the functions in your own scripts or in the R console:

```r
source("cleaning/R/functions.R")
```

---

### `process_choices`

```r
process_choices(choices, extension = ".png")
```

Strips formatting artifacts from raw jsPsych choice strings. jsPsych records the `choices` array as a JSON-like string (e.g. `["resources/image_a.png","resources/image_b.png"]`); this function removes the brackets, quotes, `resources/` path prefix, and file extension so only the bare stimulus name remains.

**Arguments**

| Argument | Default | Description |
|----------|---------|-------------|
| `choices` | — | Character vector of raw choice strings from the jsPsych CSV |
| `extension` | `".png"` | File extension to strip, including the leading dot |

**Returns** a character vector of cleaned stimulus names.

**Example**

```r
process_choices('["resources/image_a.png","resources/image_b.png"]')
# => "image_a","image_b"

process_choices("[resources/photo.JPEG]", extension = ".JPEG")
# => "photo"
```

---

### `assign_sample_alg`

```r
assign_sample_alg(d)
```

Adds a `sampleAlg` column that labels each trial by how it was generated:

| Value | Condition |
|-------|-----------|
| `"check"` | The target (`head`) is identical to either the `winner` or the `loser` — i.e. the target reappears as one of the two choices (attention check). |
| `"validation"` | The `validation` column is `TRUE` — trial was drawn from the predefined validation set. |
| `"random"` | All other trials — three independently sampled images. |

**Arguments**

| Argument | Description |
|----------|-------------|
| `d` | Data frame with columns `head`, `winner`, `loser`, and `validation` |

**Returns** the input data frame with a new `sampleAlg` column appended.

---

### `filter_failed_catch`

```r
filter_failed_catch(d, max_prop_wrong = 0.2)
```

Removes participants who failed too many attention-check trials. A catch trial is "wrong" when the participant did **not** select the repeated target (i.e. `head == loser`).

**Arguments**

| Argument | Default | Description |
|----------|---------|-------------|
| `d` | — | Data frame with `worker_id`, `head`, `winner`, and `loser` columns. Should contain only catch trials, or the full dataset (non-catch trials are counted as correct). |
| `max_prop_wrong` | `0.2` | Participants whose proportion of wrong catch trials exceeds this value are removed |

**Returns** the input data frame with failing participants' rows removed.

**Example**

```r
# Remove participants who got more than 30% of catch trials wrong
f <- filter_failed_catch(f, max_prop_wrong = 0.30)
```

---

### `filter_incomplete`

```r
filter_incomplete(d, min_trials = 510)
```

Removes participants who did not complete enough trials. Also removes any rows where `worker_id` is `NA`.

**Arguments**

| Argument | Default | Description |
|----------|---------|-------------|
| `d` | — | Data frame with a `worker_id` column |
| `min_trials` | `510` | Participants with fewer total rows than this are removed |

**Returns** the input data frame with incomplete participants' rows removed.

**Choosing `min_trials`** — the default of 510 is roughly 82% of the 620-trial design. Adjust this based on how much partial data you are willing to accept.

---

### `filter_fast_responders`

```r
filter_fast_responders(d, min_mean_rt_ms = 1000)
```

Removes participants whose mean reaction time is suspiciously fast, which may indicate random clicking. The comparison is made on the **log scale**: the participant's mean log-RT must be at least `log(min_mean_rt_ms)`.

Using log-RT rather than raw RT makes the threshold robust to occasional very slow trials inflating the mean.

**Arguments**

| Argument | Default | Description |
|----------|---------|-------------|
| `d` | — | Data frame with `worker_id` and `rt` columns. `rt` should be in milliseconds. |
| `min_mean_rt_ms` | `1000` | Minimum acceptable mean RT in milliseconds (comparison is done on log scale) |

**Returns** the input data frame with fast responders' rows removed.

**Example**

```r
# Require a mean RT of at least 800 ms
f <- filter_fast_responders(f, min_mean_rt_ms = 800)
```

---

### `assign_sample_sets`

```r
assign_sample_sets(df, test_prop = 0.2, seed = 42)
```

Randomly assigns each non-check trial to either the `"train"` or `"test"` split. Check trials receive `NA` — they are excluded from embedding model training and evaluation.

The split is performed **per participant**, so each participant contributes roughly the same proportion of trials to each set.

**Arguments**

| Argument | Default | Description |
|----------|---------|-------------|
| `df` | — | Data frame with `worker_id` and `sampleAlg` columns |
| `test_prop` | `0.2` | Proportion of non-check trials to assign to the test set |
| `seed` | `42` | Random seed for reproducibility |

**Returns** the input data frame with a new `sampleSet` column: `"train"`, `"test"`, or `NA` (for check trials).

---

## Running the tests

The test suite in `cleaning/tests/testthat/test_cleaning_functions.R` covers all five helper functions in `functions.R`.

```bash
Rscript cleaning/tests/run_tests.R
```

Or from within an R session:

```r
testthat::test_dir("cleaning/tests/testthat")
```
