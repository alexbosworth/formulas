const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../evaluation/normalize_constants');

const makeArgs = overrides => {
  const args = {constants: {foo: 'bar'}};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {normalized: {FOO: 'bar'}};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Constants are normalized as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({constants: {number: 1, bool: true}}),
    description: 'Constants are normalized with bool and number',
    expected: makeExpected({normalized: {NUMBER: 1, BOOL: true}}),
  },
  {
    args: makeArgs({constants: {values: [1, true, 'foo']}}),
    description: 'Array constants are normalized as expected',
    expected: makeExpected({normalized: {VALUES: [1, true, 'foo']}}),
  },
  {
    args: makeArgs({constants: {values: []}}),
    description: 'Empty array constants are normalized as expected',
    expected: makeExpected({normalized: {VALUES: []}}),
  },
  {
    args: makeArgs({constants: {foo: Infinity}}),
    description: 'Infinite number constants are rejected',
    error: 'ExpectedValidBoolStringOrFiniteNumberConstantValue',
  },
  {
    args: makeArgs({constants: {values: [1, Infinity]}}),
    description: 'Infinite values in constant arrays are rejected',
    error: 'ExpectedValidValuesInConstantArray',
  },
  {
    args: makeArgs({constants: {values: [[1]]}}),
    description: 'Nested constant arrays are rejected',
    error: 'ExpectedValidValuesInConstantArray',
  },
  {
    args: makeArgs({constants: {values: Array(2)}}),
    description: 'Sparse constant arrays are rejected',
    error: 'ExpectedValidValuesInConstantArray',
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
