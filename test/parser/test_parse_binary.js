const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const createTokenCursor = require('./../../parser/create_token_cursor');
const method = require('./../../parser/parse_binary');
const tokenize = require('./../../tokenizer/tokenize');

const binaryNode = ({left, op, right}) => ({
  left,
  op,
  right,
  type: 'binary',
});

const numberNode = value => ({type: 'number', value});
const tokensFor = formula => tokenize({formula}).tokens;

const tests = [
  {
    depth: 0,
    description: 'Binary operator series is parsed from left to right',
    expected: binaryNode({
      left: binaryNode({
        left: numberNode(10),
        op: '-',
        right: numberNode(3),
      }),
      op: '-',
      right: numberNode(2),
    }),
    expectedDepths: [0, 0, 0],
    formula: '10 - 3 - 2',
    remaining: null,
    operators: ['+', '-'],
  },
  {
    depth: 0,
    description: 'Parsing stops at an operator outside the provided set',
    expected: binaryNode({
      left: numberNode(1),
      op: '+',
      right: numberNode(2),
    }),
    expectedDepths: [0, 0],
    formula: '1 + 2 * 3',
    remaining: {type: 'operator', value: '*'},
    operators: ['+', '-'],
  },
  {
    depth: 12,
    description: 'Parse depth is forwarded to every operand',
    expected: binaryNode({
      left: binaryNode({
        left: numberNode(8),
        op: '/',
        right: numberNode(4),
      }),
      op: '/',
      right: numberNode(2),
    }),
    expectedDepths: [12, 12, 12],
    formula: '8 / 4 / 2',
    remaining: null,
    operators: ['*', '/'],
  },
];

tests.forEach(({
  depth,
  description,
  expected,
  expectedDepths,
  formula,
  operators,
  remaining,
}) => {
  return test(description, (t, end) => {
    const cursor = createTokenCursor({tokens: tokensFor(formula)});
    const parsedDepths = [];
    const next = operandDepth => {
      parsedDepths.push(operandDepth);

      const token = cursor.consume({type: 'number'});

      return numberNode(token.value);
    };

    const res = method({
      consume: cursor.consume,
      depth,
      operators,
      next,
      peek: cursor.peek,
    });

    deepStrictEqual(res, {node: expected}, 'Got expected result');
    deepStrictEqual(cursor.peek(), remaining, 'Stopped at expected token');
    deepStrictEqual(parsedDepths, expectedDepths, 'Forwarded expected depth');

    return end();
  });
});
