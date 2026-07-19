const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../parser/create_token_cursor');

const numberToken = {type: 'number', value: 1};
const operatorToken = {type: 'operator', value: '+'};

const makeArgs = overrides => {
  const args = {tokens: [numberToken, operatorToken]};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'First token is returned without advancing cursor',
    expected: [numberToken, numberToken],
    run: cursor => [cursor.peek(), cursor.peek()],
  },
  {
    args: makeArgs({}),
    description: 'Consuming a token advances cursor',
    expected: {consumed: numberToken, next: operatorToken},
    run: cursor => ({
      consumed: cursor.consume({type: 'number', value: 1}),
      next: cursor.peek(),
    }),
  },
  {
    args: makeArgs({tokens: [numberToken]}),
    description: 'Cursor is complete after final token is consumed',
    expected: [false, true],
    run: cursor => {
      const before = cursor.complete();

      cursor.consume({});

      return [before, cursor.complete()];
    },
  },
  {
    args: makeArgs({tokens: []}),
    description: 'Empty cursor is complete and has no token',
    expected: {complete: true, token: null},
    run: cursor => ({
      complete: cursor.complete(),
      token: cursor.peek(),
    }),
  },
  {
    args: makeArgs({tokens: []}),
    description: 'Token cannot be consumed from empty cursor',
    error: 'ExpectedCompleteFormulaForParsing',
    run: cursor => cursor.consume({}),
  },
  {
    args: makeArgs({}),
    description: 'Unexpected token type is rejected',
    error: 'UnexpectedTokenTypeForFormulaParsing',
    run: cursor => cursor.consume({type: 'string'}),
  },
  {
    args: makeArgs({}),
    description: 'Unexpected token value is rejected',
    error: 'UnexpectedTokenValueForFormulaParsing',
    run: cursor => cursor.consume({value: 2}),
  },
];

tests.forEach(({args, description, error, expected, run}) => {
  return test(description, (t, end) => {
    const cursor = method(args);

    if (!!error) {
      throws(() => run(cursor), new Error(error), 'Got error');
    } else {
      const res = run(cursor);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return end();
  });
});
