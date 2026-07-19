const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../evaluation');

const double = value => value * 2;
const parseDepthLimit = 100;
const nestedCalls = depth => `${'ABS('.repeat(depth)}1${')'.repeat(depth)}`;
const nestedParens = depth => `${'('.repeat(depth)}1${')'.repeat(depth)}`;
const nestedUnary = depth => `${'+'.repeat(depth)}1`;

const makeArgs = overrides => {
  const args = {formula: '1 + 2 * 3'};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {result: 7};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Formula is evaluated as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({formula: 'BASE + 2', constants: {base: 3}}),
    description: 'Formula is evaluated with constants',
    expected: makeExpected({result: 5}),
  },
  {
    args: makeArgs({formula: 'DOUBLE(4)', functions: {double}}),
    description: 'Formula is evaluated with functions',
    expected: makeExpected({result: 8}),
  },
  {
    args: makeArgs({formula: 'TRUE'}),
    description: 'True formula output is converted to one',
    expected: makeExpected({result: 1}),
  },
  {
    args: makeArgs({formula: 'FALSE'}),
    description: 'False formula output is converted to zero',
    expected: makeExpected({result: 0}),
  },
  {
    args: makeArgs({formula: nestedParens(parseDepthLimit)}),
    description: 'Formula at parse depth limit is evaluated',
    expected: makeExpected({result: 1}),
  },
  {
    args: makeArgs({formula: nestedParens(parseDepthLimit + 1)}),
    description: 'Parentheses beyond parse depth limit are rejected',
    error: 'ExpectedFormulaWithinParseDepthLimit',
  },
  {
    args: makeArgs({formula: nestedUnary(parseDepthLimit + 1)}),
    description: 'Unary operators beyond parse depth limit are rejected',
    error: 'ExpectedFormulaWithinParseDepthLimit',
  },
  {
    args: makeArgs({formula: nestedCalls(parseDepthLimit + 1)}),
    description: 'Function calls beyond parse depth limit are rejected',
    error: 'ExpectedFormulaWithinParseDepthLimit',
  },
  {
    args: makeArgs({formula: '"text"'}),
    description: 'Non-number and non-boolean formula output is rejected',
    error: 'ExpectedFormulaOutputAsBooleanOrFiniteNumber',
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
