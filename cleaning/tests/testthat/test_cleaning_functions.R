library(testthat)
library(dplyr)

# Source the functions under test
source(file.path(dirname(dirname(dirname(testthat::test_path()))), "R", "functions.R"))

# ── process_choices ──────────────────────────────────────

test_that("process_choices removes brackets, paths, and extensions", {
  raw <- '[resources/"image_a.png","resources/image_b.png"]'
  result <- process_choices(raw)
  expect_false(grepl("\\[|\\]", result))
  expect_false(grepl("resources/", result))
  expect_false(grepl('\\"', result))
  expect_false(grepl("\\.png", result))
})

test_that("process_choices handles custom extension", {
  raw <- "[resources/image_a.JPEG]"
  result <- process_choices(raw, extension = ".JPEG")
  expect_equal(result, "image_a")
})

test_that("process_choices preserves core stimulus name", {
  raw <- "resources/rural_day_old_big_church_1.png"
  result <- process_choices(raw)
  expect_equal(result, "rural_day_old_big_church_1")
})

# ── assign_sample_alg ───────────────────────────────────

test_that("assign_sample_alg labels check trials correctly", {
  d <- data.frame(
    head       = c("A", "B", "C"),
    winner     = c("A", "X", "Y"),
    loser      = c("X", "B", "Z"),
    validation = c(FALSE, FALSE, FALSE),
    stringsAsFactors = FALSE
  )
  result <- assign_sample_alg(d)
  # Row 1: head == winner -> check
  expect_equal(result$sampleAlg[1], "check")
  # Row 2: head == loser  -> check
  expect_equal(result$sampleAlg[2], "check")
  # Row 3: neither        -> random
  expect_equal(result$sampleAlg[3], "random")
})

test_that("assign_sample_alg labels validation trials", {
  d <- data.frame(
    head       = c("A"),
    winner     = c("B"),
    loser      = c("C"),
    validation = c(TRUE),
    stringsAsFactors = FALSE
  )
  result <- assign_sample_alg(d)
  expect_equal(result$sampleAlg[1], "validation")
})

# ── filter_failed_catch ──────────────────────────────────

test_that("filter_failed_catch removes participants above threshold", {
  d <- data.frame(
    worker_id = c(rep("good", 10), rep("bad", 10)),
    head      = c(rep("A", 10), rep("A", 10)),
    winner    = c(rep("B", 10), rep("B", 10)),
    loser     = c(rep("C", 10), rep("A", 10)),    # bad: head == loser always
    stringsAsFactors = FALSE
  )
  result <- filter_failed_catch(d, max_prop_wrong = 0.2)
  expect_true(all(result$worker_id == "good"))
  expect_equal(nrow(result), 10)
})

test_that("filter_failed_catch keeps participants below threshold", {
  d <- data.frame(
    worker_id = rep("ok", 20),
    head   = rep("A", 20),
    winner = c(rep("A", 2), rep("B", 18)),   # 2/20 wrong = 10%
    loser  = c(rep("C", 2), rep("C", 18)),
    stringsAsFactors = FALSE
  )
  result <- filter_failed_catch(d, max_prop_wrong = 0.2)
  expect_equal(nrow(result), 20)
})

# ── assign_sample_sets ───────────────────────────────────

test_that("assign_sample_sets gives NA for check trials", {
  d <- data.frame(
    worker_id = rep("W1", 5),
    sampleAlg = c("check", "random", "random", "random", "random"),
    stringsAsFactors = FALSE
  )
  result <- assign_sample_sets(d)
  expect_true(is.na(result$sampleSet[1]))
})

test_that("assign_sample_sets assigns only train or test", {
  d <- data.frame(
    worker_id = rep("W1", 100),
    sampleAlg = rep("random", 100),
    stringsAsFactors = FALSE
  )
  result <- assign_sample_sets(d)
  expect_true(all(result$sampleSet %in% c("train", "test")))
})

# ── filter_incomplete ────────────────────────────────────

test_that("filter_incomplete removes participants with too few trials", {
  d <- data.frame(
    worker_id = c(rep("enough", 520), rep("not_enough", 100)),
    rt = 1500,
    stringsAsFactors = FALSE
  )
  result <- filter_incomplete(d, min_trials = 510)
  expect_true(all(result$worker_id == "enough"))
})

# ── filter_fast_responders ───────────────────────────────

test_that("filter_fast_responders removes participants with low mean RT", {
  d <- data.frame(
    worker_id = c(rep("slow", 10), rep("fast", 10)),
    rt = c(rep(2000, 10), rep(500, 10)),
    stringsAsFactors = FALSE
  )
  result <- filter_fast_responders(d, min_mean_rt_ms = 1000)
  expect_true(all(result$worker_id == "slow"))
})

test_that("filter_fast_responders keeps participants at exactly the threshold", {
  d <- data.frame(
    worker_id = rep("borderline", 10),
    rt = rep(1000, 10),
    stringsAsFactors = FALSE
  )
  result <- filter_fast_responders(d, min_mean_rt_ms = 1000)
  expect_equal(nrow(result), 10)
})
