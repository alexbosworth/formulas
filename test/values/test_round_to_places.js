const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../values').roundToPlaces;

const makeArgs = overrides => {
  const args = {places: 2, value: 1.235};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {rounded: 1.24};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Number is rounded to positive decimal places',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({places: -2, value: 149}),
    description: 'Number is rounded to negative decimal places',
    expected: makeExpected({rounded: 100}),
  },
  {
    args: makeArgs({places: 1.9, value: 1.24}),
    description: 'Decimal places are truncated before rounding',
    expected: makeExpected({rounded: 1.2}),
  },
  {
    args: makeArgs({value: '1.235'}),
    description: 'String value is rejected',
    error: 'ExpectedBoolOrFiniteNumberForNumberConversion',
  },
  {
    args: makeArgs({places: '2'}),
    description: 'String places value is rejected',
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
