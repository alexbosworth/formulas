const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = require('./../../values').countNumbers;

const makeArgs = overrides => {
  const args = {values: [1, 2, 3]};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {count: 3};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Numbers are counted as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({values: [1, '2', true, 0]}),
    description: 'Only numbers are counted',
    expected: makeExpected({count: 2}),
  },
  {
    args: makeArgs({values: ['one', false]}),
    description: 'Array without numbers returns zero',
    expected: makeExpected({count: 0}),
  },
  {
    args: makeArgs({values: [1, Infinity, NaN]}),
    description: 'Only finite numbers are counted',
    expected: makeExpected({count: 1}),
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    const res = method(args);

    deepStrictEqual(res, expected, 'Got expected result');

    return end();
  });
});
