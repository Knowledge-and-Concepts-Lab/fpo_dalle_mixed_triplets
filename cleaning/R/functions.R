# Reusable helper functions for triplet data cleaning
#
# Source this file to use the functions in scripts or tests:
#   source("cleaning/R/functions.R")

library(dplyr)
library(stringr)

#' Remove file-path prefixes and extensions from choice strings.
#'
#' @param choices Character vector of raw choice strings (e.g. from jsPsych CSV).
#' @param extension File extension to strip, including the dot (default ".png").
#' @return Cleaned character vector.
process_choices <- function(choices, extension = ".png") {
  choices %>%
    gsub("\\[|\\]", "", .) %>%
    gsub("resources/", "", .) %>%
    gsub('"', "", .) %>%
    gsub(extension, "", ., fixed = TRUE)
}

#' Label each row with a sampling algorithm tag.
#'
#' Rules:
#'   - head == winner OR head == loser  ->  "check"
#'   - validation column is TRUE        ->  "validation"
#'   - otherwise                        ->  "random"
#'
#' @param d Data frame with columns head, winner, loser, and validation.
#' @return Data frame with new column sampleAlg.
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

#' Remove participants who fail more than a threshold of catch trials.
#'
#' @param d Data frame with worker_id, head, winner, loser columns.
#' @param max_prop_wrong Maximum proportion of wrong catch trials (default 0.2).
#' @return Filtered data frame.
filter_failed_catch <- function(d, max_prop_wrong = 0.2) {
  catch <- d %>%
    group_by(worker_id) %>%
    summarise(
      wrong = sum(head == loser),
      correct = sum(head == winner),
      prop_wrong = wrong / (wrong + correct),
      .groups = "drop"
    )

  bad_ids <- catch %>%
    filter(prop_wrong > max_prop_wrong) %>%
    pull(worker_id)

  d %>% filter(!worker_id %in% bad_ids)
}

#' Assign 80/20 train/test split per participant.
#'
#' Check trials get NA for sampleSet.
#'
#' @param df Data frame with worker_id and sampleAlg columns.
#' @param test_prop Proportion of non-check trials in the test set (default 0.2).
#' @param seed Random seed for reproducibility (default 42).
#' @return Data frame with new sampleSet column.
assign_sample_sets <- function(df, test_prop = 0.2, seed = 42) {
  set.seed(seed)
  df %>%
    group_by(worker_id) %>%
    mutate(
      sampleSet = case_when(
        sampleAlg == "check" ~ NA_character_,
        sampleAlg == "random" & runif(n()) <= test_prop ~ "test",
        TRUE ~ "train"
      )
    ) %>%
    ungroup()
}

#' Remove participants with fewer than a minimum number of trials.
#'
#' @param d Data frame with worker_id column.
#' @param min_trials Minimum number of trials (default 510).
#' @return Filtered data frame.
filter_incomplete <- function(d, min_trials = 510) {
  trial_counts <- d %>%
    group_by(worker_id) %>%
    summarise(total_trials = n(), .groups = "drop")

  invalid <- trial_counts %>%
    filter(total_trials < min_trials | is.na(worker_id)) %>%
    pull(worker_id)

  d %>% filter(!worker_id %in% invalid)
}

#' Remove participants whose mean RT is below a threshold.
#'
#' @param d Data frame with worker_id and rt columns.
#' @param min_mean_rt_ms Minimum mean RT in milliseconds (default 1000).
#' @return Filtered data frame.
filter_fast_responders <- function(d, min_mean_rt_ms = 1000) {
  rts <- d %>%
    group_by(worker_id) %>%
    summarise(
      mean_rt = log(mean(as.numeric(rt), na.rm = TRUE)),
      .groups = "drop"
    )

  slow_enough <- rts %>%
    filter(mean_rt >= log(min_mean_rt_ms)) %>%
    pull(worker_id)

  d %>% filter(worker_id %in% slow_enough)
}
