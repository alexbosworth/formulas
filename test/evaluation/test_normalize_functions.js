const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../evaluation/normalize_functions');

const customFunction = value => value;

const makeArgs = overrides => {
  const args = {functions: {foo: customFunction}};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {normalized: {FOO: customFunction}};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Functions are normalized as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({functions: {}}),
    description: 'Empty functions are normalized as expected',
    expected: makeExpected({normalized: {}}),
  },
  {
    args: makeArgs({functions: {foo: 'bar'}}),
    description: 'Non-function values are rejected',
    error: 'ExpectedFunctionTypeValuesForFunctions',
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
