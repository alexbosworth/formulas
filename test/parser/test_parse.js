const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../parser');
const tokenize = require('./../../tokenizer');

const binaryNode = ({left, op, right}) => ({
  left,
  op,
  right,
  type: 'binary',
});

const callNode = ({args, call}) => ({args, call, type: 'call'});
const numberNode = value => ({type: 'number', value});
const parseDepthLimit = 100;

const nestedCalls = depth => {
  return `${'ABS('.repeat(depth)}${')'.repeat(depth)}`;
};

const nestedCallTree = depth => {
  const emptyCall = callNode({args: [], call: 'ABS'});

  return Array(depth - 1).fill().reduce(argument => {
    return callNode({args: [argument], call: 'ABS'});
  }, emptyCall);
};

const tokensFor = formula => tokenize({formula}).tokens;
const unaryNode = ({argument, op}) => ({argument, op, type: 'unary'});

const makeArgs = overrides => {
  const args = {tokens: tokensFor('1 + 2 * 3')};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {
    tree: binaryNode({
      left: numberNode(1),
      op: '+',
      right: binaryNode({
        left: numberNode(2),
        op: '*',
        right: numberNode(3),
      }),
    }),
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Operator precedence is parsed as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({tokens: tokensFor('1 + 2 >= 3 * 1')}),
    description: 'Comparison is parsed after arithmetic',
    expected: makeExpected({
      tree: binaryNode({
        left: binaryNode({
          left: numberNode(1),
          op: '+',
          right: numberNode(2),
        }),
        op: '>=',
        right: binaryNode({
          left: numberNode(3),
          op: '*',
          right: numberNode(1),
        }),
      }),
    }),
  },
  {
    args: makeArgs({tokens: tokensFor('10 - 3 - 2')}),
    description: 'Subtraction is parsed from left to right',
    expected: makeExpected({
      tree: binaryNode({
        left: binaryNode({
          left: numberNode(10),
          op: '-',
          right: numberNode(3),
        }),
        op: '-',
        right: numberNode(2),
      }),
    }),
  },
  {
    args: makeArgs({tokens: tokensFor('16 / 4 / 2')}),
    description: 'Division is parsed from left to right',
    expected: makeExpected({
      tree: binaryNode({
        left: binaryNode({
          left: numberNode(16),
          op: '/',
          right: numberNode(4),
        }),
        op: '/',
        right: numberNode(2),
      }),
    }),
  },
  {
    args: makeArgs({tokens: tokensFor('-(1 + 2)')}),
    description: 'Grouped unary expression is parsed as expected',
    expected: makeExpected({
      tree: unaryNode({
        argument: binaryNode({
          left: numberNode(1),
          op: '+',
          right: numberNode(2),
        }),
        op: '-',
      }),
    }),
  },
  {
    args: makeArgs({tokens: tokensFor('-+1')}),
    description: 'Unary operators are parsed from right to left',
    expected: makeExpected({
      tree: unaryNode({
        argument: unaryNode({argument: numberNode(1), op: '+'}),
        op: '-',
      }),
    }),
  },
  {
    args: makeArgs({tokens: tokensFor('true')}),
    description: 'Boolean identifier is parsed as expected',
    expected: makeExpected({tree: {type: 'boolean', value: true}}),
  },
  {
    args: makeArgs({tokens: tokensFor('foo')}),
    description: 'Identifier is uppercased when parsed',
    expected: makeExpected({tree: {name: 'FOO', type: 'identifier'}}),
  },
  {
    args: makeArgs({tokens: tokensFor('sum(foo, ABS(-2))')}),
    description: 'Function arguments and nested call are parsed',
    expected: makeExpected({
      tree: callNode({
        args: [
          {name: 'FOO', type: 'identifier'},
          callNode({
            args: [unaryNode({argument: numberNode(2), op: '-'})],
            call: 'ABS',
          }),
        ],
        call: 'SUM',
      }),
    }),
  },
  {
    args: makeArgs({tokens: tokensFor('RAND()')}),
    description: 'Function call without arguments is parsed',
    expected: makeExpected({tree: callNode({args: [], call: 'RAND'})}),
  },
  {
    args: makeArgs({tokens: tokensFor('"value"')}),
    description: 'String literal is parsed as expected',
    expected: makeExpected({tree: {type: 'string', value: 'value'}}),
  },
  {
    args: makeArgs({tokens: tokensFor(nestedCalls(parseDepthLimit))}),
    description: 'Empty calls at parse depth limit are parsed',
    expected: makeExpected({tree: nestedCallTree(parseDepthLimit)}),
  },
  {
    args: makeArgs({tokens: tokensFor(nestedCalls(parseDepthLimit + 1))}),
    description: 'Empty calls beyond parse depth limit are rejected',
    error: 'ExpectedFormulaWithinParseDepthLimit',
  },
  {
    args: makeArgs({tokens: []}),
    description: 'Empty formula is rejected',
    error: 'ExpectedCompleteFormulaForParsing',
  },
  {
    args: makeArgs({tokens: tokensFor(',')}),
    description: 'Unexpected primary token is rejected',
    error: 'UnexpectedPrimaryTokenForFormulaParsing',
  },
  {
    args: makeArgs({tokens: tokensFor('(1,')}),
    description: 'Unexpected token type is rejected',
    error: 'UnexpectedTokenTypeForFormulaParsing',
  },
  {
    args: makeArgs({tokens: tokensFor('(1(')}),
    description: 'Unexpected token value is rejected',
    error: 'UnexpectedTokenValueForFormulaParsing',
  },
  {
    args: makeArgs({tokens: tokensFor('SUM(1')}),
    description: 'Incomplete function arguments are rejected',
    error: 'ExpectedCompleteFunctionArgumentsForParsing',
  },
  {
    args: makeArgs({tokens: tokensFor('SUM(1 2)')}),
    description: 'Unexpected function argument token is rejected',
    error: 'UnexpectedTokenForFunctionArgumentsParsing',
  },
  {
    args: makeArgs({tokens: tokensFor('1 2')}),
    description: 'Trailing token is rejected',
    error: 'UnexpectedTrailingTokenForFormulaParsing',
  },
  {
    args: makeArgs({tokens: tokensFor('1 < 2 < 3')}),
    description: 'Chained comparison is rejected',
    error: 'UnexpectedTrailingTokenForFormulaParsing',
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
