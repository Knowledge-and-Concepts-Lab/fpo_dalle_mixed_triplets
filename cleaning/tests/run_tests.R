# Run all R tests.
#
# Usage:
#   Rscript cleaning/tests/run_tests.R

library(testthat)

test_dir(file.path(dirname(dirname(sys.frame(1)$ofile %||% ".")), "tests", "testthat"))
