---
title: Installation & Prerequisites
layout: default
nav_order: 2
---

# Installation & Prerequisites

This project has three independent components, each with its own dependencies. Install only what you need for the tasks you plan to do.

| Component | What it does | Requires |
|-----------|-------------|---------|
| Experiment setup | Generates `config.js` and `stimuli.js` from `experiment.yaml` | Node.js |
| Experiment preview | Serves the experiment locally for testing | Node.js or Python |
| JavaScript tests | Runs the `utils.js` / `config.js` / `stimuli.js` unit tests | Node.js |
| Data cleaning | Cleans raw participant data from jsPsych-Pipe | R |
| R tests | Runs the cleaning pipeline unit tests | R |
| Docs preview | Builds and serves this documentation site locally | Ruby |

---

## Node.js

Required for: experiment setup (`npm run setup`), JS tests (`npm test`), and serving the experiment locally (`npx serve`).

### Install

1. Go to [nodejs.org](https://nodejs.org) and download the **LTS** installer for Windows.
2. Run the installer, accepting all defaults. Ensure "Add to PATH" is checked.
3. Open a new terminal and verify:

```bash
node --version   # should print v20 or higher
npm --version    # should print 10 or higher
```

### Project setup

From the project root, install the project's Node dependencies once:

```bash
npm install
```

This installs `js-yaml` (used by the generator script) and `vitest` (used by the test suite).

---

## R

Required for: data cleaning (`cleaning/R/clean_raw_data.R`) and R tests.

### Install R

1. Go to [cran.r-project.org](https://cran.r-project.org) and click **Download R for Windows**.
2. Click **base**, then download and run the installer, accepting all defaults.
3. Verify in a new terminal:

```bash
Rscript --version   # should print R scripting front-end version 4.x.x
```

### Optional: RStudio

[RStudio](https://posit.co/download/rstudio-desktop/) is a popular IDE for R. It is not required but makes running and editing R scripts easier.

### Install R packages

Open an R console (or run `Rscript` in your terminal) and install the required packages:

```r
install.packages(c("dplyr", "data.table", "stringr", "readr", "tidyr", "testthat"))
```

This only needs to be done once. Package installation may take a few minutes.

---

## Ruby

Required for: previewing the documentation site locally.

Not needed to run the experiment, clean data, or run tests — only install this if you want to work on the documentation.

### Install

1. Go to [rubyinstaller.org/downloads](https://rubyinstaller.org/downloads/) and download the latest **Ruby+Devkit x64** installer (the recommended version is highlighted).
2. Run the installer, accepting all defaults. Leave "Add Ruby executables to your PATH" checked.
3. At the final screen, leave the checkbox ticked to run `ridk install`. In the window that opens, type `3` and press Enter to install MSYS2 and MINGW development tools. Wait for it to complete, then close the window.
4. Open a **new** terminal and verify:

```bash
ruby --version    # should print ruby 3.x.x
bundle --version  # should print Bundler version 2.x.x
```

### Install documentation dependencies

From the `docs/` directory, install the Ruby gems once:

```bash
cd docs
bundle install
```

### Preview the docs locally

```bash
bundle exec jekyll serve
```

Then open `http://localhost:4000`. Jekyll will watch for file changes and rebuild automatically.

---

## Python (optional)

Python is an alternative way to serve the experiment locally for testing. It is not required if you have Node.js installed (you can use `npx serve` instead).

### Check if Python is already installed

```bash
python --version
```

Python 3.x is pre-installed on many Windows systems. If the command is not found, download the installer from [python.org](https://www.python.org/downloads/) and ensure "Add Python to PATH" is checked during installation.

### Serve the experiment with Python

```bash
cd experiment
python -m http.server 8000
```

Then open `http://localhost:8000`.
