/** Compare two ordered values

  {
    left: <Number or String>
    operator: <Comparison Operator String>
    right: <Number or String>
  }

  @throws
  <Error>

  @returns
  {
    comparison: <Boolean>
  }
*/
module.exports = ({left, operator, right}) => {
  switch (operator) {
  case '>':
    return {comparison: left > right};

  case '<':
    return {comparison: left < right};

  case '>=':
    return {comparison: left >= right};

  case '<=':
    return {comparison: left <= right};

  default:
    throw new Error('UnexpectedComparisonOperatorForValuesComparison');
  }
};
