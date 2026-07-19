const compareOrdered = require('../values').compareOrdered;
const toNumber = require('../values').toNumber;
const valuesEqual = require('../values').valuesEqual;

const numberValue = value => toNumber({value}).number;

/** Evaluate a binary formula node

  {
    evaluate: <Evaluate Node Function>
    node: <Binary Formula Node Object>
  }

  @throws
  <Error>

  @returns
  {
    result: <Evaluated Binary Value>
  }
*/
module.exports = ({evaluate, node}) => {
  const left = evaluate(node.left);
  const right = evaluate(node.right);

  switch (node.op) {
  case '+':
    return {result: numberValue(left) + numberValue(right)};

  case '-':
    return {result: numberValue(left) - numberValue(right)};

  case '*':
    return {result: numberValue(left) * numberValue(right)};

  case '/':
    const divisor = numberValue(right);

    // Exit with error when there is a division by zero request
    if (!divisor) {
      throw new Error('ExpectedNonZeroDivisorForFormulaEvaluation');
    }

    return {result: numberValue(left) / divisor};

  case '>':
  case '<':
  case '>=':
  case '<=':
    const {comparison} = compareOrdered({left, right, operator: node.op});

    return {result: comparison};

  case '=':
    return {result: valuesEqual({left, right}).equal};

  case '<>':
    return {result: !valuesEqual({left, right}).equal};
  }

  throw new Error('UnexpectedBinaryOperatorForFormulaEvaluation');
};
