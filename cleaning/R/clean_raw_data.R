# Main data-cleaning pipeline for raw jsPsych triplet CSV exports.
#
# Usage:
#   1. Set `data_dir`, `filename_df`, and `filename_level` below.
#   2. Run the script:  Rscript cleaning/R/clean_raw_data.R

library(data.table)
library(readr)
library(stringr)

source(file.path(dirname(sys.frame(1)$ofile %||% ""), "functions.R"))

# ── Configuration ──────────────────────────────────────────
data_dir       <- ""   # directory containing raw CSV exports
filename_df    <- ""   # output: cleaned triplet data
filename_level <- ""   # output: stimulus-level mapping

# ── Read all CSVs ─────────────────────────────────────────
setwd(data_dir)
file_list <- list.files(pattern = "\\.csv$")
f_full <- rbindlist(lapply(file_list, read_csv, show_col_types = FALSE), fill = TRUE)

# ── Filter for trials of interest ─────────────────────────
f <- f_full %>%
  filter(trial_type == "image-button-response", trial_index != 3) %>%
  dplyr::select(worker_id, trial_index, rt, stimulus, choices, response, validation)

# ── Remove incomplete participants ────────────────────────
f <- filter_incomplete(f, min_trials = 510)

# ── Remove fast responders ────────────────────────────────
f <- filter_fast_responders(f, min_mean_rt_ms = 1000)

# ── Clean file names (adjust extension as needed) ─────────
f <- f %>%
  mutate(
    choices = str_replace_all(choices, c("\\[|\\]" = "", "resources/" = "", '"' = "", ".png" = "")),
    stimulus = str_replace_all(stimulus, c("resources/" = "", ".png" = ""))
  ) %>%
  rename(head = stimulus)

# ── Split choices into winner and loser ───────────────────
choices_split <- str_split_fixed(f$choices, ",", 2)
f <- f %>%
  mutate(
    winner = if_else(response == 0, choices_split[, 1], choices_split[, 2]),
    loser  = if_else(response == 0, choices_split[, 2], choices_split[, 1]),
    left   = choices_split[, 1],
    right  = choices_split[, 2]
  )

f <- assign_sample_alg(f)

# ── Filter participants failing catch trials ──────────────
f <- filter_failed_catch(f, max_prop_wrong = 0.2)

# ── Build final dataset ──────────────────────────────────
split_choices  <- f$choices %>% str_split_fixed(",", n = 2)
unique_labels  <- unique(c(f$head, f$winner, f$loser)) %>% sort()

df1 <- data.frame(
  head      = as.numeric(factor(f$head,   levels = unique_labels)) - 1,
  winner    = as.numeric(factor(f$winner, levels = unique_labels)) - 1,
  loser     = as.numeric(factor(f$loser,  levels = unique_labels)) - 1,
  worker_id = f$worker_id,
  rt        = f$rt,
  Center    = f$head,
  Left      = split_choices[, 1],
  Right     = split_choices[, 2],
  Answer    = f$winner,
  sampleAlg = f$sampleAlg
) %>% assign_sample_sets()

write_csv(df1, filename_df)

# ── Save stimulus-level mapping ───────────────────────────
levels_map <- data.frame(file = unique_labels) %>%
  mutate(path = paste0("resources/", file, ".png"))
write_csv(levels_map, filename_level)
