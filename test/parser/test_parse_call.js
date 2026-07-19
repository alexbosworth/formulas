const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const createTokenCursor = require('./../../parser/create_token_cursor');
const method = require('./../../parser/parse_call');
const tokenize = require('./../../tokenizer/tokenize');

const callNode = ({args, call}) => ({args, call, type: 'call'});
const numberNode = value => ({type: 'number', value});
const tokensFor = formula => tokenize({formula}).tokens;

const tests = [
  {
    depth: 1,
    description: 'Call without arguments is parsed',
    expected: callNode({args: [], call: 'RAND'}),
    expectedDepths: [],
    formula: '()',
    call: 'RAND',
  },
  {
    depth: 1,
    description: 'Call with multiple arguments is parsed',
    expected: callNode({
      args: [numberNode(1), numberNode(2), numberNode(3)],
      call: 'SUM',
    }),
    expectedDepths: [1, 1, 1],
    formula: '(1, 2, 3)',
    call: 'SUM',
  },
  {
    depth: 15,
    description: 'Parse depth is forwarded to every call argument',
    expected: callNode({
      args: [numberNode(4), numberNode(5)],
      call: 'MAX',
    }),
    expectedDepths: [15, 15],
    formula: '(4, 5)',
    call: 'MAX',
  },
  {
    depth: 1,
    description: 'Incomplete call arguments are rejected',
    error: 'ExpectedCompleteFunctionArgumentsForParsing',
    formula: '(1',
    call: 'SUM',
  },
  {
    depth: 1,
    description: 'Unexpected call argument separator is rejected',
    error: 'UnexpectedTokenForFunctionArgumentsParsing',
    formula: '(1 2)',
    call: 'SUM',
  },
];

tests.forEach(({
  depth,
  description,
  error,
  expected,
  expectedDepths,
  formula,
  call,
}) => {
  return test(description, (t, end) => {
    const cursor = createTokenCursor({tokens: tokensFor(formula)});
    const parsedDepths = [];
    const parse = argumentDepth => {
      parsedDepths.push(argumentDepth);

      const token = cursor.consume({type: 'number'});

      return numberNode(token.value);
    };
    const args = {call, cursor, depth, parse};

    if (!!error) {
      throws(() => method(args), new Error(error), 'Got error');
    } else {
      const res = method(args);

      deepStrictEqual(res, expected, 'Got expected result');
      deepStrictEqual(cursor.complete(), true, 'Consumed all call tokens');
      deepStrictEqual(
        parsedDepths,
        expectedDepths,
        'Forwarded expected depth',
      );
    }

    return end();
  });
});
