const createTokenCursor = require('./create_token_cursor');
const parseBinary = require('./parse_binary');
const parsePrimary = require('./parse_primary');

const additiveOperators = ['+', '-'];
const comparisonOperators = ['>', '<', '=', '<>', '<=', '>='];
const defaultDepth = 0;
const isOp = (ops, t) => !!t && t.type === 'operator' && ops.includes(t.value);
const maxParseDepth = 100;
const multiplicativeOperators = ['*', '/'];
const typeBinary = 'binary';
const typeOperator = 'operator';
const typeUnary = 'unary';

/** Parse formula tokens into a tree

  {
    tokens: [{
      type: <Token Type String>
      value: <Token Value Number or String>
    }]
  }

  @throws
  <Error>

  @returns
  {
    tree: <Parsed Formula Tree Object>
  }
*/
module.exports = ({tokens}) => {
  const cursor = createTokenCursor({tokens});

  // Ensure the current parse depth stays within the safe limit
  const check = depth => {
    if (depth > maxParseDepth) {
      throw new Error('ExpectedFormulaWithinParseDepthLimit');
    }

    return;
  };

  // Parse additions and subtractions
  const parseAdditive = depth => {
    const {node} = parseBinary({
      depth,
      consume: cursor.consume,
      operators: additiveOperators,
      next: parseMultiplicative,
      peek: cursor.peek,
    });

    return node;
  };

  // Parse a comparison of values
  const parseComparison = depth => {
    const left = parseAdditive(depth);
    const token = cursor.peek();

    if (!isOp(comparisonOperators, token)) {
      return left;
    }

    const op = cursor.consume({type: typeOperator}).value;

    return {left, op, right: parseAdditive(depth), type: typeBinary};
  };

  // Parse an expression beginning at a comparison
  const parseExpression = (depth = defaultDepth) => {
    check(depth);

    return parseComparison(depth);
  };

  // Parse multiplications and divisions
  const parseMultiplicative = depth => {
    const {node} = parseBinary({
      depth,
      consume: cursor.consume,
      operators: multiplicativeOperators,
      next: parseUnary,
      peek: cursor.peek,
    });

    return node;
  };

  // Parse prefix operators
  const parseUnary = depth => {
    check(depth);

    const token = cursor.peek();

    if (!isOp(additiveOperators, token)) {
      return parsePrimary({check, cursor, depth, parse: parseExpression});
    }

    const op = cursor.consume({type: typeOperator}).value;

    return {op, argument: parseUnary(depth + 1), type: typeUnary};
  };

  const tree = parseExpression();

  if (!cursor.complete()) {
    throw new Error('UnexpectedTrailingTokenForFormulaParsing');
  }

  return {tree};
};
