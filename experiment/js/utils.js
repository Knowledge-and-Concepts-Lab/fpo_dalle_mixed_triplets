/**
 * Pure utility functions for the triplet experiment.
 *
 * These functions have no dependency on jsPsych and can be unit tested directly.
 */

/**
 * Fisher-Yates shuffle — randomizes array in place and returns it.
 * @param {Array} array
 * @returns {Array} the same array, shuffled
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Return `n` unique images from `imagePaths`, excluding any in `excludeImages`.
 *
 * @param {string[]} imagePaths - full list of available image paths
 * @param {number}   n          - how many to select
 * @param {string[]} excludeImages - paths to skip
 * @param {Function} sampleFn  - sampling function(array, count) → array
 * @returns {string[]|null} selected paths, or null if not enough available
 */
export function getUniqueRandomImages(
  imagePaths,
  n,
  excludeImages = [],
  sampleFn
) {
  const availableImages = imagePaths.filter(
    (img) => !excludeImages.includes(img)
  );
  if (availableImages.length < n) {
    return null;
  }
  return sampleFn(availableImages, n);
}

/**
 * Build a random trial (three distinct images).
 *
 * @param {string[]} imagePaths
 * @param {Function} sampleFn - sampling function(array, count) → array
 * @returns {{ type: string, stimulus: string, choice1: string, choice2: string }}
 */
export function generateRandomTrial(imagePaths, sampleFn) {
  const selectedImages = getUniqueRandomImages(imagePaths, 3, [], sampleFn);
  return {
    type: "random",
    stimulus: selectedImages[0],
    choice1: selectedImages[1],
    choice2: selectedImages[2],
  };
}

/**
 * Build a check (attention) trial where the target appears as one of the choices.
 *
 * @param {string[]} imagePaths
 * @param {Function} sampleFn - sampling function(array, count) → array
 * @returns {{ type: string, stimulus: string, choice1: string, choice2: string, correct_choice: number }}
 */
export function generateCheckTrial(imagePaths, sampleFn) {
  const target = sampleFn(imagePaths, 1)[0];
  const otherChoice = getUniqueRandomImages(imagePaths, 1, [target], sampleFn)[0];
  const isFirstChoice = Math.random() < 0.5;
  return {
    type: "check",
    stimulus: target,
    choice1: isFirstChoice ? target : otherChoice,
    choice2: isFirstChoice ? otherChoice : target,
    correct_choice: isFirstChoice ? 0 : 1,
  };
}

/**
 * Create a shuffled sequence of random, check, and validation trials.
 *
 * @param {number}   numRandom
 * @param {number}   numCheck
 * @param {number}   numValidation
 * @param {string[]} imagePaths
 * @param {Object[]} validationTrials - predefined validation trial objects
 * @param {Function} sampleFn - sampling function(array, count) → array
 * @returns {Object[]} shuffled array of trial descriptors
 */
export function createTrialSequence(
  numRandom,
  numCheck,
  numValidation,
  imagePaths,
  validationTrials,
  sampleFn
) {
  let trials = [];

  for (let i = 0; i < numRandom; i++) {
    trials.push(generateRandomTrial(imagePaths, sampleFn));
  }
  for (let i = 0; i < numCheck; i++) {
    trials.push(generateCheckTrial(imagePaths, sampleFn));
  }

  const selectedValidation = sampleFn(validationTrials, numValidation);
  trials = trials.concat(selectedValidation);

  return shuffle(trials);
}
