const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = require('./../../parser/is_token');

const token = {type: 'number', value: 1};

const tests = [
  {
    args: {token, type: 'number'},
    description: 'Token matches its type without an expected value',
    expected: true,
  },
  {
    args: {token, type: 'number', value: 1},
    description: 'Token matches its type and value',
    expected: true,
  },
  {
    args: {token, type: 'string'},
    description: 'Token with unexpected type does not match',
    expected: false,
  },
  {
    args: {token, type: 'number', value: 2},
    description: 'Token with unexpected value does not match',
    expected: false,
  },
  {
    args: {token: null, type: 'number'},
    description: 'Missing token does not match',
    expected: false,
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    const res = method(args);

    deepStrictEqual(res, expected, 'Got expected result');

    return end();
  });
});
