/**
 * Pure utility functions for the triplet experiment.
 *
 * These functions have no dependency on jsPsych and can be unit tested directly.
 */

/* eslint-disable no-unused-vars */

/**
 * Fisher-Yates shuffle — randomizes array in place and returns it.
 * @param {Array} array
 * @returns {Array} the same array, shuffled
 */
function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
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
function getUniqueRandomImages(imagePaths, n, excludeImages, sampleFn) {
  excludeImages = excludeImages || [];
  var availableImages = imagePaths.filter(function (img) {
    return excludeImages.indexOf(img) === -1;
  });
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
function generateRandomTrial(imagePaths, sampleFn) {
  var selectedImages = getUniqueRandomImages(imagePaths, 3, [], sampleFn);
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
function generateCheckTrial(imagePaths, sampleFn) {
  var target = sampleFn(imagePaths, 1)[0];
  var otherChoice = getUniqueRandomImages(imagePaths, 1, [target], sampleFn)[0];
  var isFirstChoice = Math.random() < 0.5;
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
function createTrialSequence(
  numRandom,
  numCheck,
  numValidation,
  imagePaths,
  validationTrials,
  sampleFn
) {
  var trials = [];

  for (var i = 0; i < numRandom; i++) {
    trials.push(generateRandomTrial(imagePaths, sampleFn));
  }
  for (var j = 0; j < numCheck; j++) {
    trials.push(generateCheckTrial(imagePaths, sampleFn));
  }

  var selectedValidation = sampleFn(validationTrials, numValidation);
  trials = trials.concat(selectedValidation);

  return shuffle(trials);
}

// Export for testing (Node.js / vitest)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    shuffle: shuffle,
    getUniqueRandomImages: getUniqueRandomImages,
    generateRandomTrial: generateRandomTrial,
    generateCheckTrial: generateCheckTrial,
    createTrialSequence: createTrialSequence,
  };
}
