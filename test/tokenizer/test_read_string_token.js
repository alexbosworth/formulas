const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../tokenizer/read_string_token');

const makeArgs = overrides => {
  const args = {formula: '"foo"+', position: 0};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {
    next: 5,
    token: {type: 'string', value: 'foo'},
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'String token is read as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({formula: 'x "foo"', position: 2}),
    description: 'String token is read from provided position',
    expected: makeExpected({next: 7}),
  },
  {
    args: makeArgs({formula: '\'it\'\'s\'+', position: 0}),
    description: 'Doubled quote is included in string token',
    expected: makeExpected({
      next: 7,
      token: {type: 'string', value: 'it\'s'},
    }),
  },
  {
    args: makeArgs({formula: '"a\\nb\\\\c\\q"', position: 0}),
    description: 'Known and unknown escapes are included in string token',
    expected: makeExpected({
      next: 11,
      token: {type: 'string', value: 'a\nb\\cq'},
    }),
  },
  {
    args: makeArgs({formula: '"unterminated', position: 0}),
    description: 'Unterminated string is rejected',
    error: 'ExpectedAllTerminatedStringLiterals',
  },
  {
    args: makeArgs({formula: '"bad\\', position: 0}),
    description: 'String ending with escape is rejected',
    error: 'UnexpectedUnterminatedStringLiteral',
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
