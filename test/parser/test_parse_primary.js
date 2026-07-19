const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const createTokenCursor = require('./../../parser/create_token_cursor');
const method = require('./../../parser/parse_primary');
const tokenize = require('./../../tokenizer');

const callNode = ({args, call}) => ({args, call, type: 'call'});
const numberNode = value => ({type: 'number', value});
const tokensFor = formula => tokenize({formula}).tokens;

const tests = [
  {
    depth: 0,
    description: 'Number literal is parsed',
    expected: numberNode(1),
    expectedChecks: [],
    expectedDepths: [],
    formula: '1',
  },
  {
    depth: 0,
    description: 'String literal is parsed',
    expected: {type: 'string', value: 'text'},
    expectedChecks: [],
    expectedDepths: [],
    formula: '"text"',
  },
  {
    depth: 0,
    description: 'True identifier is parsed as boolean',
    expected: {type: 'boolean', value: true},
    expectedChecks: [],
    expectedDepths: [],
    formula: 'true',
  },
  {
    depth: 0,
    description: 'False identifier is parsed as boolean',
    expected: {type: 'boolean', value: false},
    expectedChecks: [],
    expectedDepths: [],
    formula: 'false',
  },
  {
    depth: 0,
    description: 'Identifier is uppercased when parsed',
    expected: {name: 'FOO', type: 'identifier'},
    expectedChecks: [],
    expectedDepths: [],
    formula: 'foo',
  },
  {
    depth: 4,
    description: 'Call without arguments is parsed and checked',
    expected: callNode({args: [], call: 'RAND'}),
    expectedChecks: [5],
    expectedDepths: [],
    formula: 'rand()',
  },
  {
    depth: 4,
    description: 'Call arguments are parsed at call depth',
    expected: callNode({
      args: [numberNode(1), numberNode(2)],
      call: 'SUM',
    }),
    expectedChecks: [5, 5, 5],
    expectedDepths: [5, 5],
    formula: 'sum(1, 2)',
  },
  {
    depth: 4,
    description: 'Grouped expression is parsed at increased depth',
    expected: numberNode(1),
    expectedChecks: [5],
    expectedDepths: [5],
    formula: '(1)',
  },
  {
    depth: 0,
    description: 'Unexpected primary token is rejected',
    error: 'UnexpectedPrimaryTokenForFormulaParsing',
    formula: ',',
  },
];

tests.forEach(({
  depth,
  description,
  error,
  expected,
  expectedChecks,
  expectedDepths,
  formula,
}) => {
  return test(description, (t, end) => {
    const cursor = createTokenCursor({tokens: tokensFor(formula)});
    const checkedDepths = [];
    const parsedDepths = [];
    const check = checkedDepth => {
      checkedDepths.push(checkedDepth);
    };
    const parse = parsedDepth => {
      parsedDepths.push(parsedDepth);
      check(parsedDepth);

      const token = cursor.consume({type: 'number'});

      return numberNode(token.value);
    };
    const args = {check, cursor, depth, parse};

    if (!!error) {
      throws(() => method(args), new Error(error), 'Got error');
    } else {
      const res = method(args);

      deepStrictEqual(res, expected, 'Got expected result');
      deepStrictEqual(cursor.complete(), true, 'Consumed all primary tokens');
      deepStrictEqual(checkedDepths, expectedChecks, 'Checked expected depth');
      deepStrictEqual(parsedDepths, expectedDepths, 'Parsed at expected depth');
    }

    return end();
  });
});
