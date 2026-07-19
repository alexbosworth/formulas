const readIdentifierToken = require('./read_identifier_token');
const readNumberToken = require('./read_number_token');
const readStringToken = require('./read_string_token');

const defaultStartPosition = 0;
const doubleCharLength = 2;
const isComma = value => value === ',';
const isIdentifierStart = value => /[A-Za-z_]/.test(value);
const isNumberCharacter = value => /[0-9.]/.test(value);
const isParenthetical = value => value === '(' || value === ')';
const isQuote = value => value === '"' || value === "'";
const isWhitespace = value => /\s/.test(value);
const maxFormulaLength = 8192;
const nextTwoChars = (formula, pos) => formula.slice(pos, pos + 2);
const singleCharacterOperators = '+-*/<>=';
const twoCharacterOperators = ['<>', '<=', '>='];

/** Convert a formula string into tokens

  {
    formula: <Formula String>
  }

  @throws
  <Error>

  @returns
  {
    tokens: [{
      type: <Token Type String>
      value: <Value Number or String>
    }]
  }
*/
module.exports = ({formula}) => {
  // Reject formulas that are too long to process safely
  if (formula.length > maxFormulaLength) {
    throw new Error('ExpectedFormulaWithinLengthLimit');
  }

  let position = defaultStartPosition;
  const tokens = [];

  // Iterate through the formula string to find tokens
  while (position < formula.length) {
    const character = formula[position];

    // Ignore whitespace in the formula
    if (isWhitespace(character)) {
      position++;

      continue;
    }

    // Look for a special double character operator token
    if (twoCharacterOperators.includes(nextTwoChars(formula, position))) {
      tokens.push({type: 'operator', value: nextTwoChars(formula, position)});
      position += doubleCharLength;

      continue;
    }

    // Look for a quote which indicates a need to read in a string token
    if (isQuote(character)) {
      const result = readStringToken({formula, position});

      tokens.push(result.token);
      position = result.next;

      continue;
    }

    // Look for a number which indicates a need to read in a number token
    if (isNumberCharacter(character)) {
      const result = readNumberToken({formula, position});

      tokens.push(result.token);
      position = result.next;

      continue;
    }

    // Look for an identifier which indicates a need to read a variable name
    if (isIdentifierStart(character)) {
      const result = readIdentifierToken({formula, position});

      tokens.push(result.token);
      position = result.next;

      continue;
    }

    // Look for a single character operator token
    if (singleCharacterOperators.includes(character)) {
      tokens.push({type: 'operator', value: character});
      position++;

      continue;
    }

    // Look for a parenthetical token
    if (isParenthetical(character)) {
      tokens.push({type: 'paren', value: character});
      position++;

      continue;
    }

    // Look for a comma token
    if (isComma(character)) {
      tokens.push({type: 'comma', value: character});
      position++;

      continue;
    }

    throw new Error('ExpectedOnlySupportedCharactersInFormula');
  }

  return {tokens};
};
