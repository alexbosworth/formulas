const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../values').compareOrdered;

const makeArgs = overrides => {
  const args = {left: 1, operator: '<', right: 2};

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
    description: 'Numbers are compared as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({left: false, right: true}),
    description: 'Booleans are compared as numbers',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({left: 'a', right: 'b'}),
    description: 'Strings are compared as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({left: '1', right: 2}),
    description: 'String left operand cannot be compared with number',
    error: 'UnexpectedComparisonWithStringAndNonStringValues',
  },
  {
    args: makeArgs({left: 1, right: '2'}),
    description: 'Number left operand cannot be compared with string',
    error: 'UnexpectedComparisonWithStringAndNonStringValues',
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
