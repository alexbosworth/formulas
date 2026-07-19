const startPosition = 0;

/** Create a cursor for reading formula tokens

  {
    tokens: [{
      type: <Token Type String>
      value: <Token Value Number or String>
    }]
  }

  @returns
  {
    consume: <Consume Token Function>
    complete: <Is Cursor Complete Function>
    peek: <Peek Token Function>
  }
*/
module.exports = ({tokens}) => {
  const state = {position: startPosition};

  const peek = () => tokens[state.position] || null;

  // Get the current token and ensure that it exists
  const currentToken = () => {
    const token = peek();

    if (!token) {
      throw new Error('ExpectedCompleteFormulaForParsing');
    }

    return token;
  };

  // Validate and consume the current token
  const consume = ({type, value}) => {
    const token = currentToken();

    if (!!type && token.type !== type) {
      throw new Error('UnexpectedTokenTypeForFormulaParsing');
    }

    if (value !== undefined && token.value !== value) {
      throw new Error('UnexpectedTokenValueForFormulaParsing');
    }

    state.position++;

    return token;
  };

  return {consume, peek, complete: () => state.position === tokens.length};
};
