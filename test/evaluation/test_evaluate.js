const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../evaluation/evaluate');

const evaluationDepthLimit = 256;
const numberNode = value => ({type: 'number', value});

const nestedBinary = depth => Array(depth).fill().reduce(left => ({
  left,
  op: '+',
  right: numberNode(1),
  type: 'binary',
}), numberNode(1));

const nestedCall = depth => Array(depth).fill().reduce(argument => ({
  args: [argument],
  call: 'ABS',
  type: 'call',
}), numberNode(1));

const nestedUnary = depth => Array(depth).fill().reduce(argument => ({
  argument,
  op: '+',
  type: 'unary',
}), numberNode(2));

const cyclicBinary = () => {
  const tree = {op: '+', right: numberNode(1), type: 'binary'};

  tree.left = tree;

  return tree;
};

const makeArgs = overrides => {
  const args = {
    constants: {FOO: 4},
    functions: {},
    tree: {type: 'number', value: 2},
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {result: 2};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Number node is evaluated as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({tree: {type: 'string', value: 'foo'}}),
    description: 'String node is evaluated as expected',
    expected: makeExpected({result: 'foo'}),
  },
  {
    args: makeArgs({tree: {type: 'boolean', value: true}}),
    description: 'Boolean node is evaluated as expected',
    expected: makeExpected({result: true}),
  },
  {
    args: makeArgs({tree: {name: 'FOO', type: 'identifier'}}),
    description: 'Identifier node is evaluated with constants',
    expected: makeExpected({result: 4}),
  },
  {
    args: makeArgs({tree: {name: 'MISSING', type: 'identifier'}}),
    description: 'Unknown identifier is rejected',
    error: 'ExpectedAllKnownConstantsInFormulaToEvaluate',
  },
  {
    args: makeArgs({
      tree: {
        argument: {type: 'boolean', value: true},
        op: '+',
        type: 'unary',
      },
    }),
    description: 'Unary plus node is evaluated as expected',
    expected: makeExpected({result: 1}),
  },
  {
    args: makeArgs({
      tree: {
        argument: {type: 'number', value: 2},
        op: '-',
        type: 'unary',
      },
    }),
    description: 'Unary minus node is evaluated as expected',
    expected: makeExpected({result: -2}),
  },
  {
    args: makeArgs({tree: nestedUnary(evaluationDepthLimit)}),
    description: 'Tree at evaluation depth limit is evaluated',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      tree: {
        argument: {type: 'number', value: 2},
        op: '!',
        type: 'unary',
      },
    }),
    description: 'Unsupported unary operator is rejected',
    error: 'UnexpectedUnaryOperatorForFormulaEvaluation',
  },
  {
    args: makeArgs({
      tree: {
        left: {type: 'number', value: 2},
        op: '+',
        right: {type: 'number', value: 3},
        type: 'binary',
      },
    }),
    description: 'Binary node is evaluated as expected',
    expected: makeExpected({result: 5}),
  },
  {
    args: makeArgs({tree: nestedBinary(evaluationDepthLimit + 1)}),
    description: 'Binary tree beyond evaluation depth limit is rejected',
    error: 'ExpectedFormulaWithinEvaluationDepthLimit',
  },
  {
    args: makeArgs({tree: cyclicBinary()}),
    description: 'Cyclic binary tree is rejected',
    error: 'ExpectedFormulaWithinEvaluationDepthLimit',
  },
  {
    args: makeArgs({
      tree: {
        args: [
          {type: 'number', value: 2},
          {type: 'number', value: 3},
        ],
        call: 'SUM',
        type: 'call',
      },
    }),
    description: 'Function call node is evaluated as expected',
    expected: makeExpected({result: 5}),
  },
  {
    args: makeArgs({tree: nestedCall(evaluationDepthLimit + 1)}),
    description: 'Function calls beyond evaluation depth limit are rejected',
    error: 'ExpectedFormulaWithinEvaluationDepthLimit',
  },
  {
    args: makeArgs({
      tree: {
        args: [
          {type: 'boolean', value: true},
          numberNode(2),
          nestedUnary(evaluationDepthLimit + 1),
        ],
        call: 'IF',
        type: 'call',
      },
    }),
    description: 'Unselected branch beyond evaluation depth limit is skipped',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({tree: {type: 'unsupported'}}),
    description: 'Unknown node type is rejected',
    error: 'UnexpectedNodeTypeForFormulaEvaluation',
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
