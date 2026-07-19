const compareValues = require('./compare_values');
const toNumber = require('./to_number');

const isString = value => typeof value === 'string';

/** Compare two strings or two numbers and booleans

  {
    left: <Finite Number, Boolean, or String>
    operator: <Comparison Operator String>
    right: <Finite Number, Boolean, or String>
  }

  @throws
  <Error>

  @returns
  {
    comparison: <Boolean>
  }
*/
module.exports = ({left, operator, right}) => {
  const hasNonStringValue = !isString(left) || !isString(right);
  const hasStringValue = isString(left) || isString(right);

  // Exit early with error when trying to compare string with non-string
  if (hasStringValue && hasNonStringValue) {
    throw new Error('UnexpectedComparisonWithStringAndNonStringValues');
  }

  // Exit early when there is no need to coerce values to numbers
  if (hasStringValue) {
    return compareValues({left, operator, right});
  }

  const leftNumber = toNumber({value: left}).number;
  const rightNumber = toNumber({value: right}).number;

  return compareValues({operator, left: leftNumber, right: rightNumber});
};
