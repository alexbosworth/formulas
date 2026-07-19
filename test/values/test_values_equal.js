const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = require('./../../values').valuesEqual;

const makeArgs = overrides => {
  const args = {left: 1, right: 1};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {equal: true};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Equal numbers are equal as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({right: 2}),
    description: 'Different numbers are not equal',
    expected: makeExpected({equal: false}),
  },
  {
    args: makeArgs({left: 'foo', right: 'foo'}),
    description: 'Equal strings are equal as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({left: '1'}),
    description: 'String and number are not equal',
    expected: makeExpected({equal: false}),
  },
  {
    args: makeArgs({left: true}),
    description: 'True and one are equal',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({left: false}),
    description: 'False and one are not equal',
    expected: makeExpected({equal: false}),
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    const res = method(args);

    deepStrictEqual(res, expected, 'Got expected result');

    return end();
  });
});
