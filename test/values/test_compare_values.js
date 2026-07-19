const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../values').compareValues;

const makeArgs = overrides => {
  const args = {left: 2, operator: '>', right: 1};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {comparison: true};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Greater-than values are compared as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({left: 1, operator: '<', right: 2}),
    description: 'Less-than values are compared as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({operator: '>=', right: 2}),
    description: 'Greater-than-or-equal values are compared as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({operator: '<=', right: 2}),
    description: 'Less-than-or-equal values are compared as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({operator: '='}),
    description: 'Unsupported comparison operator is rejected',
    error: 'UnexpectedComparisonOperatorForValuesComparison',
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
