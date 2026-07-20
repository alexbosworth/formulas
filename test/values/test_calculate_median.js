const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = require('./../../values').calculateMedian;

const makeArgs = overrides => {
  const args = {values: Object.freeze([2, 10, 3])};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {median: 3};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Median is found without mutating values',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({values: [4, 1, 3, 2]}),
    description: 'Median averages middle values in even array',
    expected: makeExpected({median: 2.5}),
  },
  {
    args: makeArgs({values: [Number.MAX_VALUE, Number.MAX_VALUE]}),
    description: 'Median avoids overflow when averaging positive values',
    expected: makeExpected({median: Number.MAX_VALUE}),
  },
  {
    args: makeArgs({values: [-Number.MAX_VALUE, Number.MAX_VALUE]}),
    description: 'Median averages values with opposite signs',
    expected: makeExpected({median: 0}),
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    const res = method(args);

    deepStrictEqual(res, expected, 'Got expected result');

    return end();
  });
});
