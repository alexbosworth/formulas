const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../values').raiseToPower;

const makeArgs = overrides => {
  const args = {base: 2, exponent: 3};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {power: 8};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Number is raised to a power',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({base: 9, exponent: 0.5}),
    description: 'Number is raised to a fractional power',
    expected: makeExpected({power: 3}),
  },
  {
    args: makeArgs({exponent: -2}),
    description: 'Number is raised to a negative power',
    expected: makeExpected({power: 0.25}),
  },
  {
    args: makeArgs({base: true, exponent: false}),
    description: 'Boolean values are converted to numbers',
    expected: makeExpected({power: 1}),
  },
  {
    args: makeArgs({base: '2'}),
    description: 'String base is rejected',
    error: 'ExpectedBoolOrFiniteNumberForNumberConversion',
  },
  {
    args: makeArgs({exponent: '3'}),
    description: 'String exponent is rejected',
    error: 'ExpectedBoolOrFiniteNumberForNumberConversion',
  },
  {
    args: makeArgs({base: 0, exponent: -1}),
    description: 'Infinite result is rejected',
    error: 'ExpectedFinitePowerResultForFormulaEvaluation',
  },
  {
    args: makeArgs({base: 10, exponent: 400}),
    description: 'Overflowing result is rejected',
    error: 'ExpectedFinitePowerResultForFormulaEvaluation',
  },
  {
    args: makeArgs({base: -8, exponent: 0.5}),
    description: 'Non-real result is rejected',
    error: 'ExpectedFinitePowerResultForFormulaEvaluation',
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
