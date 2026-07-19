const isToken = require('./is_token');
const parseCall = require('./parse_call');

const booleanNames = ['FALSE', 'TRUE'];
const literalTypes = ['number', 'string'];
const next = depth => depth + 1;
const valCloseParen = ')';
const valOpenParen = '(';

/** Parse a primary formula token

  {
    check: <Parse Depth Check Function>
    cursor: <Token Cursor Object>
    depth: <Current Parse Depth Number>
    parse: <Parse Expression Function>
  }

  @throws
  <Error>

  @returns
  <Parsed Literal, Identifier, Call, or Grouped Formula Node>
*/
module.exports = ({check, cursor, depth, parse}) => {
  const token = cursor.consume({});

  // Exit early on number and string types
  if (literalTypes.includes(token.type)) {
    return {type: token.type, value: token.value};
  }

  // Exit early on identifiers
  if (token.type === 'identifier') {
    const identifier = token.value.toUpperCase();

    // Identifier followed by open paren
    if (isToken({token: cursor.peek(), type: 'paren', value: valOpenParen})) {
      check(next(depth));

      return parseCall({
        cursor,
        parse,
        call: identifier,
        depth: next(depth),
      });
    }

    // Equality identifier call
    if (booleanNames.includes(identifier)) {
      return {type: 'boolean', value: identifier === 'TRUE'};
    }

    return {name: identifier, type: 'identifier'};
  }

  // We're now expecting an expression within parentheses
  if (!isToken({token, type: 'paren', value: valOpenParen})) {
    throw new Error('UnexpectedPrimaryTokenForFormulaParsing');
  }

  const expression = parse(next(depth));

  cursor.consume({type: 'paren', value: valCloseParen});

  return expression;
};
