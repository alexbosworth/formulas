const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../evaluation/evaluate_binary');

const evaluate = node => node.value;

const makeArgs = overrides => {
  const args = {
    evaluate,
    node: {
      left: {value: 2},
      op: '+',
      right: {value: 1},
    },
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {result: 3};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Addition is evaluated as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({node: {left: {value: 2}, op: '-', right: {value: 1}}}),
    description: 'Subtraction is evaluated as expected',
    expected: makeExpected({result: 1}),
  },
  {
    args: makeArgs({node: {left: {value: 2}, op: '*', right: {value: 3}}}),
    description: 'Multiplication is evaluated as expected',
    expected: makeExpected({result: 6}),
  },
  {
    args: makeArgs({node: {left: {value: 6}, op: '/', right: {value: 2}}}),
    description: 'Division is evaluated as expected',
    expected: makeExpected({result: 3}),
  },
  {
    args: makeArgs({node: {left: {value: 6}, op: '/', right: {value: 0}}}),
    description: 'Division by zero is rejected',
    error: 'ExpectedNonZeroDivisorForFormulaEvaluation',
  },
  {
    args: makeArgs({node: {left: {value: 2}, op: '>', right: {value: 1}}}),
    description: 'Greater-than comparison is evaluated as expected',
    expected: makeExpected({result: true}),
  },
  {
    args: makeArgs({node: {left: {value: 1}, op: '<', right: {value: 2}}}),
    description: 'Less-than comparison is evaluated as expected',
    expected: makeExpected({result: true}),
  },
  {
    args: makeArgs({node: {left: {value: 2}, op: '>=', right: {value: 2}}}),
    description: 'Greater-than-or-equal comparison is evaluated as expected',
    expected: makeExpected({result: true}),
  },
  {
    args: makeArgs({node: {left: {value: 2}, op: '<=', right: {value: 2}}}),
    description: 'Less-than-or-equal comparison is evaluated as expected',
    expected: makeExpected({result: true}),
  },
  {
    args: makeArgs({node: {left: {value: 2}, op: '=', right: {value: 2}}}),
    description: 'Equality comparison is evaluated as expected',
    expected: makeExpected({result: true}),
  },
  {
    args: makeArgs({node: {left: {value: 2}, op: '<>', right: {value: 1}}}),
    description: 'Inequality comparison is evaluated as expected',
    expected: makeExpected({result: true}),
  },
  {
    args: makeArgs({node: {left: {value: 2}, op: '^', right: {value: 1}}}),
    description: 'Unsupported binary operator is rejected',
    error: 'UnexpectedBinaryOperatorForFormulaEvaluation',
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
