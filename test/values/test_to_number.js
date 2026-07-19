const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../values').toNumber;

const makeArgs = overrides => {
  const args = {value: true};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {number: 1};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'True is converted to one',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({value: false}),
    description: 'False is converted to zero',
    expected: makeExpected({number: 0}),
  },
  {
    args: makeArgs({value: 2.5}),
    description: 'Finite number is returned as expected',
    expected: makeExpected({number: 2.5}),
  },
  {
    args: makeArgs({value: '1'}),
    description: 'String value is rejected',
    error: 'ExpectedBoolOrFiniteNumberForNumberConversion',
  },
  {
    args: makeArgs({value: Infinity}),
    description: 'Infinite number is rejected',
    error: 'ExpectedBoolOrFiniteNumberForNumberConversion',
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
