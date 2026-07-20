const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = require('./../../values').calculateAverage;

const makeArgs = overrides => {
  const args = {values: [2, 4]};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {average: 3};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Positive values are averaged as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({values: [-4, -2]}),
    description: 'Negative values are averaged as expected',
    expected: makeExpected({average: -3}),
  },
  {
    args: makeArgs({values: [1, 2, 6]}),
    description: 'Multiple values are averaged as expected',
    expected: makeExpected({average: 3}),
  },
  {
    args: makeArgs({values: [Number.MAX_VALUE, Number.MAX_VALUE]}),
    description: 'Average avoids overflow with positive values',
    expected: makeExpected({average: Number.MAX_VALUE}),
  },
  {
    args: makeArgs({values: [-Number.MAX_VALUE, Number.MAX_VALUE]}),
    description: 'Values with opposite signs are averaged as expected',
    expected: makeExpected({average: 0}),
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    const res = method(args);

    deepStrictEqual(res, expected, 'Got expected result');

    return end();
  });
});
