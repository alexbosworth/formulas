const isClosingParen = token => token.type === 'paren' && token.value === ')';
const typeCall = 'call';
const typeComma = 'comma';
const typeParen = 'paren';
const valueCloseParen = ')';
const valueComma = ',';
const valueOpenParen = '(';

/** Parse a formula function call

  {
    cursor: <Token Cursor Object>
    depth: <Current Parse Depth Number>
    call: <Function Name String>
    parse: <Parse Expression Function>
  }

  @throws
  <Error>

  @returns
  {
    args: [<Parsed Formula Node Object>]
    call: <Function Name String>
    type: <Node Type String>
  }
*/
module.exports = ({call, cursor, depth, parse}) => {
  cursor.consume({type: typeParen, value: valueOpenParen});

  const args = [];
  const first = cursor.peek();

  // Exit early when a function call has no arguments
  if (!!first && isClosingParen(first)) {
    cursor.consume({type: typeParen, value: valueCloseParen});

    return {args, call, type: typeCall};
  }

  // Parse each comma-separated function argument until the end paren
  while (true) {
    args.push(parse(depth));

    const token = cursor.peek();

    if (!token) {
      throw new Error('ExpectedCompleteFunctionArgumentsForParsing');
    }

    // Exit loop early when we are dealing with an argument separator
    if (token.type === typeComma) {
      cursor.consume({type: typeComma, value: valueComma});

      continue;
    }

    // We're expecting a closing paren now
    if (!isClosingParen(token)) {
      throw new Error('UnexpectedTokenForFunctionArgumentsParsing');
    }

    cursor.consume({type: typeParen, value: valueCloseParen});

    break;
  }

  return {args, call, type: typeCall};
};
