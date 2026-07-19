const advance = position => position + 1;
const defaultValue = '';
const doubleCharLength = 2;
const escapeCharacter = '\\';
const escapes = {n: '\n', r: '\r', t: '\t', '\\': '\\'};
const type = 'string';

/** Read a string token from a formula

  {
    formula: <Formula String>
    position: <Opening Quote Position Number>
  }

  @throws
  <Error>

  @returns
  {
    next: <Next Formula Position Number>
    token: {
      type: <Token Type String>
      value: <String Value String>
    }
  }
*/
module.exports = ({formula, position}) => {
  const quote = formula[position];
  let next = advance(position);
  let value = defaultValue;

  while (next < formula.length) {
    const currentCharacter = formula[next];

    // Look for escape character
    if (currentCharacter === escapeCharacter) {
      const nextCharacter = formula[advance(next)];

      if (nextCharacter == null) {
        throw new Error('UnexpectedUnterminatedStringLiteral');
      }

      value += escapes[nextCharacter] ?? nextCharacter;
      next += doubleCharLength;

      continue;
    }

    // Look for a doubled quote character
    if (currentCharacter === quote && formula[advance(next)] === quote) {
      value += quote;
      next += doubleCharLength;

      continue;
    }

    // Exit early on closing quote
    if (currentCharacter === quote) {
      return {next: advance(next), token: {type, value}};
    }

    value += currentCharacter;
    next++;
  }

  throw new Error('ExpectedAllTerminatedStringLiterals');
};
