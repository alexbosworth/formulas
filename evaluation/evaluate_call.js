const calculateAverage = require('../values').calculateAverage;
const calculateMedian = require('../values').calculateMedian;
const countNumbers = require('../values').countNumbers;
const normalizeResult = require('../values').normalizeResult;
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
const expectedMaxMedianArgumentsCount = 1;
const expectedMaxRoundArgumentsCount = 2;
const expectedRandBetweenArgumentsCount = 2;
const {floor} = Math;
const {max} = Math;
const {min} = Math;
const randomNum = (low, high) => floor(Math.random() * (high - low + 1) + low);
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

    return {result: max(...args.map(evaluate).map(asNumber))};

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

    return {result: min(...args.map(evaluate).map(asNumber))};

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

  // Return a random integer between the passed arguments
  case 'RANDBETWEEN': {
    if (args.length !== expectedRandBetweenArgumentsCount) {
      throw new Error('ExpectedTwoRangeArgumentsForRandBetween');
    }

    const [low, high] = args.map(num => trunc(asNumber(evaluate(num))));

    if (low > high) {
      throw new Error('ExpectedOrderedBoundsForRandBetween');
    }

    return {result: randomNum(low, high)};
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

    return {result: sumOf(args.map(evaluate).map(asNumber))};
  }

  // Evaluate a custom formula function
  const customFunction = functions[call];

  if (!customFunction) {
    throw new Error('UnexpectedFunctionForFormulaEvaluation');
  }

  const value = customFunction(...args.map(evaluate));

  return {result: normalizeResult({value}).normalized};
};
