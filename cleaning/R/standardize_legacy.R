# Function to standardize triadic comparison datasets

# R code that one can run to clean up triadic comparison datasets to match a standard format. You feed it CSVs, and it will save out a new CSV with a modified version of the filename (appending "_v2025"). This new CSV will have the columns: 
#   
#   p_id: character label of the participant identifier
# 
# Center: character label of the stimulus item that was the center ("head","reference", "on top", "target") item in a triad. Generally relevant, but mostly used for legacy embedding code
# 
# Left: character label of choice stimuli presented on the left
# 
# Right: character label of choice stimuli presented on the right
# 
# Answer: character label of participants' chosen response
# 
# head: numeric factorized label of Center, by label such that the first entry alphabetically in Center = 0 in this column
# 
# winner: numeric factorized label of Answer, will be numeric factorization equivalent of either the Left or Right, same ordering as head
# 
# loser: numeric factorized label of whichever of Answer is not Left or Right, same ordering as head
# 
# RT: numeric value of reaction time for this triad
# 
# sampleAlg: character label of the sampling algorithm, either selected randomly ("random"), as a check trial ("check"), or as a validation trial ("validation"). Some datasets may have trials that were sampled for "uncertainty"-- this is legacy information used in some embedding algorithms, e.g. NEXT)
# 
# sampleSet: character label of the embedding sample set, indicating whether this triplet be used as "train"ing data or "test"ing data for generating embeddings
# 
# -----
# 
# Some input datasets will have versions of this information in differently-named columns. Here is a list of conversions that are made in my code:
# 
# -input columns named "sessionID", "session_ID", "puid", "Participant.ID", "worker_id", "sub_id", "pid", or capitalization/punctuation variants of these can be used as the "p_id" column
# 
# - input columns named "Target" can be used as the character value for Center and the numeric factor value for head
# - input columns named "Option1" can be used to fill in "Left"
# - input columns named "Option2" can be used to fill in "Right"
# - input columns named "primary" can be used to fill in "winner"
# - input columns named "alternate" can be used to fill in "loser"
# - input columns named "Alg.Label", "TrnTest" can be used as values for sampleSet
# - input columns named "AlgSample" can be used as values for sampleAlg
# 
# - values in AlgSample (before being used as values in sampleAlg) should be recoded, such that "Random" trials become "random", "Test" trials become validation
# - if no data that can be used as sampleSet is found, just make a that as 10% of trials randomly sampled labeled "test" and the remaining as "train"
# - if no data that cam be used as sampleAlg is found, fill column with NAs

# - based on what exists of the columns mentioned above for Center, Left, Right, Answer, head, winner, and loser, if any of these columns do not exist, we compute what they should be based on the relationships of between these variables described above
# 
# - The numeric factor organization should be based on the ordering of unique items in Center, Left, Right in alphabetical order. This code writes out these orderings in a separate file with "_2025_levels.csv" appended to the input CSV filename. This CSV should have one column that is 0 to n -1, (numeric value) with n being the number of unique items in Center, Left, Right. The other column should be the filenames in alphabetical order. These should reflect the factor orderings in head, winner, loser. 

##########################

library(dplyr)
library(tidyr)
library(stringr)
library(readr)

clean_triadic_comparisons <- function(input_file) {
  # Extract base filename without extension
  base_name <- tools::file_path_sans_ext(input_file)
  
  # Read the input CSV
  data <- read.csv(input_file, stringsAsFactors = FALSE)
  
  # Function to find matching column names ignoring case and punctuation
  find_column <- function(possible_names, df) {
    clean_names <- tolower(gsub("[[:punct:]]", "", colnames(df)))
    possible_names <- tolower(gsub("[[:punct:]]", "", possible_names))
    
    for (name in possible_names) {
      idx <- which(clean_names == name)
      if (length(idx) > 0) {
        return(colnames(df)[idx[1]])
      }
    }
    return(NULL)
  }
  
  # Define column mappings
  id_cols <- c("sessionID", "session_ID", "puid", "Participant.ID", 
               "worker_id", "sub_id", "pid")
  center_cols <- c("Center", "Target")
  left_cols <- c("Left", "Option1")
  right_cols <- c("Right", "Option2")
  winner_cols <- c("winner", "primary")
  loser_cols <- c("loser", "alternate")
  sampleset_cols <- c("sampleSet", "Alg.Label", "TrnTest")
  samplealg_cols <- c("sampleAlg", "AlgSample")
  
  # Find matching columns
  p_id_col <- find_column(id_cols, data)
  center_col <- find_column(center_cols, data)
  left_col <- find_column(left_cols, data)
  right_col <- find_column(right_cols, data)
  winner_col <- find_column(winner_cols, data)
  loser_col <- find_column(loser_cols, data)
  sampleset_col <- find_column(sampleset_cols, data)
  samplealg_col <- find_column(samplealg_cols, data)
  
  # Initialize new dataframe
  new_data <- data
  
  # Process participant ID
  if (!is.null(p_id_col)) {
    new_data$p_id <- data[[p_id_col]]
  } else {
    new_data$p_id <- paste0("P", seq_len(nrow(data)))
  }
  
  # Process Center/Left/Right columns
  new_data$Center <- if (!is.null(center_col)) data[[center_col]] else NA
  new_data$Left <- if (!is.null(left_col)) data[[left_col]] else NA
  new_data$Right <- if (!is.null(right_col)) data[[right_col]] else NA
  
  # Process Answer column if it exists, or derive from winner/loser
  if ("Answer" %in% colnames(data)) {
    new_data$Answer <- data$Answer
  } else if (!is.null(winner_col)) {
    new_data$Answer <- data[[winner_col]]
  } else {
    new_data$Answer <- NA
  }
  
  # Create factor levels for stimuli
  all_stimuli <- unique(c(new_data$Center, new_data$Left, new_data$Right))
  all_stimuli <- sort(all_stimuli[!is.na(all_stimuli)])
  stimulus_levels <- data.frame(
    numeric_value = seq(0, length(all_stimuli) - 1),
    stimulus = all_stimuli,
    stringsAsFactors = FALSE
  )
  
  # Write levels file
  write.csv(stimulus_levels, 
            paste0(base_name, "_2025_levels.csv"), 
            row.names = FALSE)
  
  # Create numeric columns
  stimulus_map <- setNames(stimulus_levels$numeric_value, stimulus_levels$stimulus)
  
  new_data$head <- stimulus_map[new_data$Center]
  
  # Determine winner and loser based on Answer
  new_data <- new_data %>%
    mutate(
      winner = stimulus_map[Answer],
      loser = case_when(
        Answer == Left ~ stimulus_map[Right],
        Answer == Right ~ stimulus_map[Left],
        TRUE ~ NA_real_
      )
    )
  
  # Process RT
  if ("RT" %in% colnames(data)) {
    new_data$RT <- data$RT
  } else {
    new_data$RT <- NA
  }
  
  # Process sampleAlg
  if (!is.null(samplealg_col)) {
    new_data$sampleAlg <- case_when(
      tolower(data[[samplealg_col]]) == "random" ~ "random",
      tolower(data[[samplealg_col]]) == "test" ~ "validation",
      tolower(data[[samplealg_col]]) == "check" ~ "check",
      tolower(data[[samplealg_col]]) == "uncertainty" ~ "uncertainty",
      TRUE ~ NA_character_
    )
  } else {
    new_data$sampleAlg <- NA_character_
  }
  
  # Process sampleSet
  if (!is.null(sampleset_col)) {
    new_data$sampleSet <- data[[sampleset_col]]
  } else {
    # Randomly assign 90% to train, 10% to test
    set.seed(2025)  # For reproducibility
    new_data$sampleSet <- sample(
      c("train", "test"), 
      size = nrow(new_data), 
      replace = TRUE, 
      prob = c(0.9, 0.1)
    )
  }
  
  # Ensure all required columns are present and in correct order
  new_data <- new_data %>%
    select(p_id, Center, Left, Right, Answer, head, winner, loser, 
           RT, sampleAlg, sampleSet)
  
  # Write output file
  output_file <- paste0(base_name, "_v2025.csv")
  write.csv(new_data, output_file, row.names = FALSE)
  
  # Return both filenames for confirmation
  return(list(
    data_file = output_file,
    levels_file = paste0(base_name, "_v2025_levels.csv")
  ))
}

# use the function! 
result <- clean_triadic_comparisons("triplets.csv") # replace the input CSV
 print(paste("Created:", result$data_file, "and", result$levels_file))