const isBadDecimal = n => n === '.' || n.indexOf('.') !== n.lastIndexOf('.');
const isNumber = n => Number.isFinite(n);
const numberPattern = /^[0-9.]+/;
const type = 'number';

/** Read a number token from a formula

  {
    formula: <Formula String>
    position: <Number Start Position Number>
  }

  @throws
  <Error>

  @returns
  {
    next: <Next Formula Position Number>
    token: {
      type: <Token Type String>
      value: <Number Value Number>
    }
  }
*/
module.exports = ({formula, position}) => {
  const [numberString] = formula.slice(position).match(numberPattern);

  if (isBadDecimal(numberString)) {
    throw new Error('UnexpectedInvalidDecimalNumberValue');
  }

  const value = Number(numberString);

  if (!isNumber(value)) {
    throw new Error('UnexpectedNonFiniteNumberForNumberValue');
  }

  return {next: position + numberString.length, token: {type, value}};
};
