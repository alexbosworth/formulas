const evaluateBinary = require('./evaluate_binary');
const evaluateCall = require('./evaluate_call');
const toNumber = require('../values').toNumber;

const defaultDepth = 0;
const maxEvaluationDepth = 256;
const unaryOps = ['-', '+'];

/** Evaluate a parsed formula tree

  {
    constants: <Normalized Constants Object>
    functions: <Normalized Functions Object>
    tree: <Parsed Formula Tree Object>
  }

  @throws
  <Error>

  @returns
  {
    result: <Evaluated Formula Value>
  }
*/
module.exports = ({constants, functions, tree}) => {
  // Recursively evaluate the parsed formula tree
  const evaluateNode = (node, depth = defaultDepth) => {
    // Reject trees that are too deep to evaluate safely
    if (depth > maxEvaluationDepth) {
      throw new Error('ExpectedFormulaWithinEvaluationDepthLimit');
    }

    const evaluateChild = child => evaluateNode(child, depth + 1);

    switch (node.type) {
    // Evaluate an operator value with left and right operands
    case 'binary':
      return evaluateBinary({evaluate: evaluateChild, node}).result;

    // Return the value stored by a literal value node
    case 'boolean':
    case 'number':
    case 'string':
      return node.value;

    // Evaluate a built-in or custom function call
    case 'call':
      const {result} = evaluateCall({
        functions,
        args: node.args,
        call: node.call,
        evaluate: evaluateChild,
      });

      return result;

    // Return the constant referenced by the identifier
    case 'identifier':
      if (!(node.name in constants)) {
        throw new Error('ExpectedAllKnownConstantsInFormulaToEvaluate');
      }

      return constants[node.name];

    // Apply a numeric operator to one argument value
    case 'unary':
      if (!unaryOps.includes(node.op)) {
        throw new Error('UnexpectedUnaryOperatorForFormulaEvaluation');
      }

      const {number} = toNumber({value: evaluateChild(node.argument)});

      return node.op === '-' ? -number : number;
    }

    // Reject a node type the evaluator does not support
    throw new Error('UnexpectedNodeTypeForFormulaEvaluation');
  };

  return {result: evaluateNode(tree)};
};
