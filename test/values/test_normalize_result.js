const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../values').normalizeResult;

const makeArgs = overrides => {
  const args = {value: 'foo'};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {normalized: 'foo'};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'String result is normalized as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({value: false}),
    description: 'Boolean result is normalized as expected',
    expected: makeExpected({normalized: false}),
  },
  {
    args: makeArgs({value: 2.5}),
    description: 'Finite number result is normalized as expected',
    expected: makeExpected({normalized: 2.5}),
  },
  {
    args: makeArgs({value: Infinity}),
    description: 'Infinite function result is rejected',
    error: 'ExpectedBoolOrFiniteNumberOrStringValueToNormalize',
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
