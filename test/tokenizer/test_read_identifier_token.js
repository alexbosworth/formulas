const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = require('./../../tokenizer/read_identifier_token');

const makeArgs = overrides => {
  const args = {formula: 'foo_1+', position: 0};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {
    next: 5,
    token: {type: 'identifier', value: 'foo_1'},
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Identifier token is read as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({formula: '1 + _FOO2', position: 4}),
    description: 'Identifier token is read from provided position',
    expected: makeExpected({
      next: 9,
      token: {type: 'identifier', value: '_FOO2'},
    }),
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    const res = method(args);

    deepStrictEqual(res, expected, 'Got expected result');

    return end();
  });
});
