const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../evaluation/evaluate_call');

const double = value => value * 2;
const invalidResult = () => Infinity;
const valueNode = value => ({value});

const evaluate = node => {
  if (node.error) {
    throw new Error(node.error);
  }

  return node.value;
};

const makeArgs = overrides => {
  const args = {
    args: [valueNode(true), valueNode(1), valueNode(2)],
    evaluate,
    functions: {BAD: invalidResult, DOUBLE: double},
    call: 'IF',
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {result: 1};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'IF returns true branch as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      args: [valueNode(false), valueNode(1), valueNode(2)],
      call: 'IF',
    }),
    description: 'IF returns false branch as expected',
    expected: makeExpected({result: 2}),
  },
  {
    args: makeArgs({
      args: [valueNode(true), valueNode(1), {error: 'Unexpected evaluation'}],
      call: 'IF',
    }),
    description: 'IF does not evaluate unselected branch',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({args: [], call: 'IF'}),
    description: 'IF requires exactly three arguments',
    error: 'ExpectedExactlyThreeArgumentsForIfFunctionEval',
  },
  {
    args: makeArgs({
      args: [valueNode(true), valueNode(1)],
      call: 'AND',
    }),
    description: 'AND returns true when all arguments are true',
    expected: makeExpected({result: true}),
  },
  {
    args: makeArgs({
      args: [valueNode(false), {error: 'Unexpected evaluation'}],
      call: 'AND',
    }),
    description: 'AND stops evaluating after false argument',
    expected: makeExpected({result: false}),
  },
  {
    args: makeArgs({args: [], call: 'AND'}),
    description: 'AND requires at least one argument',
    error: 'ExpectedAtLeastOneArgumentForAndFunctionEvaluation',
  },
  {
    args: makeArgs({
      args: [valueNode(2), valueNode(4), valueNode(6)],
      call: 'AVERAGE',
    }),
    description: 'AVERAGE returns average of scalar arguments',
    expected: makeExpected({result: 4}),
  },
  {
    args: makeArgs({args: [valueNode([2, 10, 3])], call: 'AVERAGE'}),
    description: 'AVERAGE returns average of an array argument',
    expected: makeExpected({result: 5}),
  },
  {
    args: makeArgs({
      args: [valueNode(1), valueNode([3, 5])],
      call: 'AVERAGE',
    }),
    description: 'AVERAGE combines scalar and array arguments',
    expected: makeExpected({result: 3}),
  },
  {
    args: makeArgs({
      args: [valueNode(false), valueNode(true)],
      call: 'AVERAGE',
    }),
    description: 'AVERAGE converts boolean arguments to numbers',
    expected: makeExpected({result: 0.5}),
  },
  {
    args: makeArgs({args: [], call: 'AVERAGE'}),
    description: 'AVERAGE requires at least one argument',
    error: 'ExpectedAnArgumentForAverageFunctionEvaluation',
  },
  {
    args: makeArgs({args: [valueNode([])], call: 'AVERAGE'}),
    description: 'AVERAGE rejects an empty array',
    error: 'ExpectedValuesForAverageFunctionEvaluation',
  },
  {
    args: makeArgs({args: [valueNode(['one'])], call: 'AVERAGE'}),
    description: 'AVERAGE rejects non-numeric values',
    error: 'ExpectedBoolOrFiniteNumberForNumberConversion',
  },
  {
    args: makeArgs({
      args: [valueNode(true), {error: 'Unexpected evaluation'}],
      call: 'OR',
    }),
    description: 'OR stops evaluating after true argument',
    expected: makeExpected({result: true}),
  },
  {
    args: makeArgs({
      args: [valueNode(false), valueNode(0)],
      call: 'OR',
    }),
    description: 'OR returns false when all arguments are false',
    expected: makeExpected({result: false}),
  },
  {
    args: makeArgs({args: [], call: 'OR'}),
    description: 'OR requires at least one argument',
    error: 'ExpectedAtLeastOneArgumentForOrFunctionEvaluation',
  },
  {
    args: makeArgs({args: [valueNode(true)], call: 'NOT'}),
    description: 'NOT reverses boolean value',
    expected: makeExpected({result: false}),
  },
  {
    args: makeArgs({args: [], call: 'NOT'}),
    description: 'NOT requires exactly one argument',
    error: 'ExpectedExactlyOneArgumentForNotFunctionEvaluation',
  },
  {
    args: makeArgs({
      args: [valueNode(3), valueNode(1), valueNode(2)],
      call: 'MIN',
    }),
    description: 'MIN returns smallest argument',
    expected: makeExpected({result: 1}),
  },
  {
    args: makeArgs({args: [], call: 'MIN'}),
    description: 'MIN requires at least one argument',
    error: 'ExpectedAtLeastOneArgumentForMinFunctionEvaluation',
  },
  {
    args: makeArgs({
      args: [valueNode(3), valueNode(1), valueNode(2)],
      call: 'MAX',
    }),
    description: 'MAX returns largest argument',
    expected: makeExpected({result: 3}),
  },
  {
    args: makeArgs({args: [], call: 'MAX'}),
    description: 'MAX requires at least one argument',
    error: 'ExpectedAtLeastOneArgumentForMaxFunctionEvaluation',
  },
  {
    args: makeArgs({args: [valueNode([2, 10, 3])], call: 'MEDIAN'}),
    description: 'MEDIAN returns middle value from odd array',
    expected: makeExpected({result: 3}),
  },
  {
    args: makeArgs({args: [valueNode([4, 1, 3, 2])], call: 'MEDIAN'}),
    description: 'MEDIAN averages middle values from even array',
    expected: makeExpected({result: 2.5}),
  },
  {
    args: makeArgs({args: [valueNode([false, true, true])], call: 'MEDIAN'}),
    description: 'MEDIAN converts boolean array values to numbers',
    expected: makeExpected({result: 1}),
  },
  {
    args: makeArgs({args: [], call: 'MEDIAN'}),
    description: 'MEDIAN rejects no arguments',
    error: 'ExpectedAnArgumentForMedianFunctionEvaluation',
  },
  {
    args: makeArgs({
      args: [valueNode([1]), valueNode([2])],
      call: 'MEDIAN',
    }),
    description: 'MEDIAN rejects more than one argument',
    error: 'ExpectedAtMostOneArgumentForMedianFunctionEvaluation',
  },
  {
    args: makeArgs({args: [valueNode(1)], call: 'MEDIAN'}),
    description: 'MEDIAN rejects a non-array argument',
    error: 'ExpectedArrayForMedianFunctionEvaluation',
  },
  {
    args: makeArgs({args: [valueNode([])], call: 'MEDIAN'}),
    description: 'MEDIAN rejects an empty array',
    error: 'ExpectedNonEmptyArrayForMedianFunctionEvaluation',
  },
  {
    args: makeArgs({args: [valueNode([1, 'two'])], call: 'MEDIAN'}),
    description: 'MEDIAN rejects non-numeric array values',
    error: 'ExpectedBoolOrFiniteNumberForNumberConversion',
  },
  {
    args: makeArgs({
      args: [valueNode(3), valueNode(1), valueNode(2)],
      call: 'SUM',
    }),
    description: 'SUM adds all arguments',
    expected: makeExpected({result: 6}),
  },
  {
    args: makeArgs({args: [], call: 'SUM'}),
    description: 'SUM requires at least one argument',
    error: 'ExpectedAtLeastOneArgumentForSumFunctionEvaluation',
  },
  {
    args: makeArgs({args: [valueNode(-4)], call: 'ABS'}),
    description: 'ABS returns absolute value',
    expected: makeExpected({result: 4}),
  },
  {
    args: makeArgs({args: [], call: 'ABS'}),
    description: 'ABS requires exactly one argument',
    error: 'ExpectedExactlyOneArgumentForAbsFunctionEvaluation',
  },
  {
    args: makeArgs({args: [valueNode(1.235)], call: 'ROUND'}),
    description: 'ROUND defaults to zero decimal places',
    expected: makeExpected({result: 1}),
  },
  {
    args: makeArgs({
      args: [valueNode(1.235), valueNode(2)],
      call: 'ROUND',
    }),
    description: 'ROUND uses provided decimal places',
    expected: makeExpected({result: 1.24}),
  },
  {
    args: makeArgs({args: [], call: 'ROUND'}),
    description: 'ROUND rejects no arguments',
    error: 'ExpectedAnArgumentForRoundFunctionEvaluation',
  },
  {
    args: makeArgs({
      args: [valueNode(1), valueNode(2), valueNode(3)],
      call: 'ROUND',
    }),
    description: 'ROUND rejects more than two arguments',
    error: 'ExpectedAtMostTwoArgsForRoundFunctionEvaluation',
  },
  {
    args: makeArgs({
      args: [valueNode(3), valueNode(3)],
      call: 'RANDBETWEEN',
    }),
    description: 'RANDBETWEEN returns value inside bounds',
    expected: makeExpected({result: 3}),
  },
  {
    args: makeArgs({args: [], call: 'RANDBETWEEN'}),
    description: 'RANDBETWEEN requires exactly two arguments',
    error: 'ExpectedTwoRangeArgumentsForRandBetween',
  },
  {
    args: makeArgs({
      args: [valueNode(3), valueNode(2)],
      call: 'RANDBETWEEN',
    }),
    description: 'RANDBETWEEN rejects reversed bounds',
    error: 'ExpectedOrderedBoundsForRandBetween',
  },
  {
    args: makeArgs({args: [valueNode(4)], call: 'DOUBLE'}),
    description: 'Custom function is evaluated as expected',
    expected: makeExpected({result: 8}),
  },
  {
    args: makeArgs({args: [], call: 'BAD'}),
    description: 'Invalid custom function result is rejected',
    error: 'ExpectedBoolOrFiniteNumberOrStringValueToNormalize',
  },
  {
    args: makeArgs({args: [], call: 'MISSING'}),
    description: 'Unsupported function is rejected',
    error: 'UnexpectedFunctionForFormulaEvaluation',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => method(args), new Error(error), 'Got error');
    } else {
      const res = method(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return end();
  });
});
