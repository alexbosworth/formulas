const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../tokenizer/read_number_token');

const makeArgs = overrides => {
  const args = {formula: '1.25+', position: 0};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {
    next: 4,
    token: {type: 'number', value: 1.25},
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Number token is read as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({formula: 'x .5+', position: 2}),
    description: 'Number token is read from provided position',
    expected: makeExpected({
      token: {type: 'number', value: 0.5},
    }),
  },
  {
    args: makeArgs({formula: '5.', position: 0}),
    description: 'Number with trailing decimal is read',
    expected: makeExpected({
      next: 2,
      token: {type: 'number', value: 5},
    }),
  },
  {
    args: makeArgs({formula: '1.2.3', position: 0}),
    description: 'Number with multiple decimals is rejected',
    error: 'UnexpectedInvalidDecimalNumberValue',
  },
  {
    args: makeArgs({formula: '.', position: 0}),
    description: 'Decimal without digits is rejected',
    error: 'UnexpectedInvalidDecimalNumberValue',
  },
  {
    args: makeArgs({formula: '9'.repeat(400), position: 0}),
    description: 'Non-finite number is rejected',
    error: 'UnexpectedNonFiniteNumberForNumberValue',
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
