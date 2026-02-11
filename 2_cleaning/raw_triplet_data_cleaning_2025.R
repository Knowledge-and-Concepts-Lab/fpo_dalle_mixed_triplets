# Load and combine all CSV files
library(dplyr)
library(data.table)
library(stringr)
library(readr)

# set working directory to where data you'd like to clean is!
setwd("")

filename_df <- ""
filename_level <- ""


############ Helpful functions
process_choices <- function(choices) {
  choices %>%
    gsub("\\[|\\]", "", .) %>%
    gsub("resources/", "", .) %>%
    gsub('"', "", .) %>%
    gsub(".JPEG", "", .)
}

assign_sample_alg <- function(d) {
  d %>%
    mutate(
      sampleAlg = case_when(
        head == winner | head == loser ~ "check",
        validation == TRUE ~ "validation",
        TRUE ~ "random"
      )
    )
}

filter_bad_guys <- function(d, criteria) {
  bad_ids <- criteria %>%
    filter(prop_wrong > 0.2) %>%
    pull(worker_id)
  d %>% filter(!worker_id %in% bad_ids)
}

# Function to assign sample sets
assign_sample_sets <- function(df) {
  set.seed(42)  # for reproducibility
  df %>%
    group_by(worker_id) %>%
    mutate(
      sampleSet = case_when(
        sampleAlg == "check" ~ NA_character_,
        sampleAlg == "random" & runif(n()) <= 0.2 ~ "test",
        TRUE ~ "train")
    ) %>%
    ungroup()
}
################



# Read all CSVs into a single dataframe
file_list <- list.files()
f_full <- rbindlist(lapply(file_list, read_csv, show_col_types = FALSE), fill = TRUE)

# Filter for trials of interest
f <- f_full %>%
  filter(trial_type == "image-button-response", trial_index != 3) %>%
  dplyr::select(worker_id, trial_index, rt, stimulus, choices, response, validation)

# Remove incomplete or duplicate participants
total_trials <- f %>%
  group_by(worker_id) %>%
  summarise(total_trials = n(), .groups = "drop")

invalid_workers <- total_trials %>%
  filter(total_trials < 510 | is.na(worker_id)) %>%
  pull(worker_id)

f <- f %>%
  filter(!worker_id %in% invalid_workers)

# Remove participants with reaction times < 1 second
rts <- f %>%
  group_by(worker_id) %>%
  summarise(mean_rt = log(mean(as.numeric(rt), na.rm = TRUE)), .groups = "drop")

low_rt_workers <- rts %>%
  filter(mean_rt < log(1000)) %>%
  pull(worker_id)

f <- f %>%
  filter(!worker_id %in% low_rt_workers)


# Clean file names (CHECK WHETHER PNG OR JPEG)
f <- f %>%
  mutate(
    choices = str_replace_all(choices, c("\\[|\\]" = "", "resources/" = "", '"' = "", ".png" = "")),
    stimulus = str_replace_all(stimulus, c("resources/" = "", ".png" = ""))
  ) %>%
  rename(head = stimulus)

# Split choices into winner and loser
choices_split <- str_split_fixed(f$choices, ",", 2)
f <- f %>%
  mutate(
    winner = if_else(response == 0, choices_split[, 1], choices_split[, 2]),
    loser = if_else(response == 0, choices_split[, 2], choices_split[, 1]),
    left = choices_split[, 1],
    right = choices_split[, 2]
  )

f <- assign_sample_alg(f)


# Filter out participants failing too many catch trials
catch <- f %>%
  group_by(worker_id) %>%
  summarise(
    wrong = sum(head == loser),
    correct = sum(head == winner),
    prop_wrong = wrong / (wrong + correct),
    .groups = "drop"
  )

catch_failures <- catch %>%
  filter(prop_wrong > 0.2) %>%
  pull(worker_id)

f <- f %>%
  filter(!worker_id %in% catch_failures)

split_choices <- f$choices %>% str_split_fixed(",", n = 2) # regathering splits based on new filtering!

unique_labels <- unique(c(f$head, f$winner, f$loser)) %>% sort()

# Prepare final dataset
df1 <- data.frame(
  head = as.numeric(factor(f$head, levels = unique_labels)) - 1,
  winner = as.numeric(factor(f$winner, levels = unique_labels)) - 1,
  loser = as.numeric(factor(f$loser, levels = unique_labels)) - 1,
  worker_id = f$worker_id,
  rt = f$rt,
  Center = f$head,
  Left = split_choices[, 1],
  Right = split_choices[, 2],
  Answer = f$winner,
  sampleAlg = f$sampleAlg
) %>% assign_sample_sets()

write_csv(df1, filename_df)


# Generate and save levels mapping
levels <- data.frame(file = unique_labels) %>%
  mutate(path = paste0("resources/", file, ".png"))
write_csv(levels, filename_level)

