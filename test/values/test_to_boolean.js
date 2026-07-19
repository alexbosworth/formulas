const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../values').toBoolean;

const makeArgs = overrides => {
  const args = {value: true};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {bool: true};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Boolean is returned as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({value: 0}),
    description: 'Zero is converted to false',
    expected: makeExpected({bool: false}),
  },
  {
    args: makeArgs({value: -2}),
    description: 'Non-zero number is converted to true',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({value: 'true'}),
    description: 'String value is rejected',
    error: 'ExpectedBoolOrFiniteNumberForBooleanConversion',
  },
  {
    args: makeArgs({value: NaN}),
    description: 'Non-finite number is rejected',
    error: 'ExpectedBoolOrFiniteNumberForBooleanConversion',
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
