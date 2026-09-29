const crypto = require('node:crypto');

const calculateAverage = require('../values').calculateAverage;
const calculateMedian = require('../values').calculateMedian;
const countNumbers = require('../values').countNumbers;
const normalizeResult = require('../values').normalizeResult;
const raiseToPower = require('../values').raiseToPower;
const randomFraction = require('../values').randomFraction;
const roundToPlaces = require('../values').roundToPlaces;
const toBoolean = require('../values').toBoolean;
const toNumber = require('../values').toNumber;

const {abs} = Math;
const {isArray} = Array;
const isString = value => typeof value === 'string';
const asBool = value => toBoolean({value}).bool;
const asNumber = value => toNumber({value}).number;
const asValues = value => isArray(value) ? value : [value];
const defaultNumPlaces = 0;
const expectedAbsArgumentsCount = 1;
const expectedExactArgumentsCount = 2;
const expectedNotArgumentsCount = 1;
const expectedIfArgumentsCount = 3;
const expectedMinChooseArgumentsCount = 2;
const expectedMaxMedianArgumentsCount = 1;
const expectedMaxRoundArgumentsCount = 2;
const expectedPowerArgumentsCount = 2;
const expectedRandArgumentsCount = 0;
const expectedRandBetweenArgumentsCount = 2;
const {max} = Math;
const maxRandBetweenSpan = 2 ** 48 - 1;
const {min} = Math;
const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());
const {trunc} = Math;

/** Evaluate a formula function call node

  {
    args: [<Formula Node Object>]
    evaluate: <Evaluate Node Function>
    functions: <Normalized Functions Object>
    call: <Function Name String>
  }

  @throws
  <Error>

  @returns
  {
    result: <Evaluated Function Value>
  }
*/
module.exports = ({args, call, evaluate, functions}) => {
  switch (call) {
  // Return the absolute value of the argument
  case 'ABS':
    if (args.length !== expectedAbsArgumentsCount) {
      throw new Error('ExpectedExactlyOneArgumentForAbsFunctionEvaluation');
    }

    const [argument] = args;

    return {result: abs(asNumber(evaluate(argument)))};

  // Determine if all arguments in formula evaluate to true
  case 'AND':
    if (!args.length) {
      throw new Error('ExpectedAtLeastOneArgumentForAndFunctionEvaluation');
    }

    return {result: args.every(n => asBool(evaluate(n)))};

  // Return the average of scalar or array values
  case 'AVERAGE':
    if (!args.length) {
      throw new Error('ExpectedAnArgumentForAverageFunctionEvaluation');
    }

    const averageValues = args.map(evaluate).flatMap(asValues).map(asNumber);

    if (!averageValues.length) {
      throw new Error('ExpectedValuesForAverageFunctionEvaluation');
    }

    return {result: calculateAverage({values: averageValues}).average};

  // Evaluate and return the value selected by a one-based index
  case 'CHOOSE':
    if (args.length < expectedMinChooseArgumentsCount) {
      throw new Error('ExpectedIndexAndValueForChooseFunctionEvaluation');
    }

    const [chooseIndex, ...choices] = args;

    const chosen = choices[trunc(asNumber(evaluate(chooseIndex))) - 1];

    if (!chosen) {
      throw new Error('ExpectedIndexWithinValuesForChooseFunctionEvaluation');
    }

    return {result: evaluate(chosen)};

  // Count numeric scalar or array values
  case 'COUNT':
    if (!args.length) {
      throw new Error('ExpectedAnArgumentForCountFunctionEvaluation');
    }

    const countValues = args.map(evaluate).flatMap(asValues);

    return {result: countNumbers({values: countValues}).count};

  // Compare two strings using exact case and spacing
  case 'EXACT':
    if (args.length !== expectedExactArgumentsCount) {
      throw new Error('ExpectedExactlyTwoArgumentsForExactFunctionEvaluation');
    }

    const [leftString, rightString] = args.map(evaluate);

    if ([leftString, rightString].some(value => !isString(value))) {
      throw new Error('ExpectedStringsForExactFunctionEvaluation');
    }

    return {result: leftString === rightString};

  // Evaluate and return the branch selected by the condition
  case 'IF':
    if (args.length !== expectedIfArgumentsCount) {
      throw new Error('ExpectedExactlyThreeArgumentsForIfFunctionEval');
    }

    const [value, ifTrue, ifFalse] = args;

    return {result: evaluate(asBool(evaluate(value)) ? ifTrue : ifFalse)};

  // Return the maximum of the passed arguments
  case 'MAX':
    if (!args.length) {
      throw new Error('ExpectedAtLeastOneArgumentForMaxFunctionEvaluation');
    }

    const maxValues = args.map(evaluate).flatMap(asValues).map(asNumber);

    // Return zero when the arguments contain no values
    if (!maxValues.length) {
      return {result: Number()};
    }

    return {result: maxValues.reduce((maximum, value) => max(maximum, value))};

  // Return the median value from an array
  case 'MEDIAN':
    if (!args.length) {
      throw new Error('ExpectedAnArgumentForMedianFunctionEvaluation');
    }

    if (args.length > expectedMaxMedianArgumentsCount) {
      throw new Error('ExpectedAtMostOneArgumentForMedianFunctionEvaluation');
    }

    const [numbers] = args;

    const values = evaluate(numbers);

    if (!isArray(values)) {
      throw new Error('ExpectedArrayForMedianFunctionEvaluation');
    }

    if (!values.length) {
      throw new Error('ExpectedNonEmptyArrayForMedianFunctionEvaluation');
    }

    return {result: calculateMedian({values: values.map(asNumber)}).median};

  // Return the minimum of the passed arguments
  case 'MIN':
    if (!args.length) {
      throw new Error('ExpectedAtLeastOneArgumentForMinFunctionEvaluation');
    }

    const minValues = args.map(evaluate).flatMap(asValues).map(asNumber);

    // Return zero when the arguments contain no values
    if (!minValues.length) {
      return {result: Number()};
    }

    return {result: minValues.reduce((minimum, value) => min(minimum, value))};

  // Return the opposite boolean value of the argument
  case 'NOT':
    if (args.length !== expectedNotArgumentsCount) {
      throw new Error('ExpectedExactlyOneArgumentForNotFunctionEvaluation');
    }

    const [condition] = args;

    return {result: !asBool(evaluate(condition))};

  // Determine if any argument in formula evaluates to true
  case 'OR':
    if (!args.length) {
      throw new Error('ExpectedAtLeastOneArgumentForOrFunctionEvaluation');
    }

    return {result: args.some(argument => asBool(evaluate(argument)))};

  // Raise a number to the passed power
  case 'POWER':
    if (args.length !== expectedPowerArgumentsCount) {
      throw new Error('ExpectedExactlyTwoArgumentsForPowerFunctionEvaluation');
    }

    const [base, exponent] = args.map(evaluate);

    return {result: raiseToPower({base, exponent}).power};

  // Return a random number from zero up to but not including one
  case 'RAND':
    if (args.length !== expectedRandArgumentsCount) {
      throw new Error('ExpectedNoArgumentsForRandFunctionEvaluation');
    }

    return {result: randomFraction().fraction};

  // Return a random integer between the passed arguments
  case 'RANDBETWEEN': {
    if (args.length !== expectedRandBetweenArgumentsCount) {
      throw new Error('ExpectedTwoRangeArgumentsForRandBetween');
    }

    const [low, high] = args.map(num => trunc(asNumber(evaluate(num))));

    if (low > high) {
      throw new Error('ExpectedOrderedBoundsForRandBetween');
    }

    // Count the integers that can be picked between the bounds
    const span = high - low + 1;

    // Exit with error when the span is beyond the secure random number limit
    if (span > maxRandBetweenSpan) {
      throw new Error('ExpectedBoundsWithinRangeLimitForRandBetween');
    }

    return {result: low + crypto.randomInt(span)};
  }

  // Round a value to the passed number of decimal places
  case 'ROUND':
    if (!args.length) {
      throw new Error('ExpectedAnArgumentForRoundFunctionEvaluation');
    }

    if (args.length > expectedMaxRoundArgumentsCount) {
      throw new Error('ExpectedAtMostTwoArgsForRoundFunctionEvaluation');
    }

    const [valueToRound, placesCount] = args;

    const places = !!placesCount ? evaluate(placesCount) : defaultNumPlaces;

    const {rounded} = roundToPlaces({places, value: evaluate(valueToRound)});

    return {result: rounded};

  // Return the sum of the passed arguments
  case 'SUM':
    if (!args.length) {
      throw new Error('ExpectedAtLeastOneArgumentForSumFunctionEvaluation');
    }

    const sumValues = args.map(evaluate).flatMap(asValues).map(asNumber);

    return {result: sumOf(sumValues)};
  }

  // Evaluate a custom formula function
  const customFunction = functions[call];

  if (!customFunction) {
    throw new Error('UnexpectedFunctionForFormulaEvaluation');
  }

  const value = customFunction(...args.map(evaluate));

  return {result: normalizeResult({value}).normalized};
};
