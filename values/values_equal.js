const toNumber = require('./to_number');

const asNumber = value => toNumber({value}).number;
const isBool = value => typeof value === 'boolean';
const isString = value => typeof value === 'string';

/** Check whether two formula values are equal

  {
    left: <Finite Number, Boolean, or String>
    right: <Finite Number, Boolean, or String>
  }

  @throws
  <Error>

  @returns
  {
    equal: <Boolean>
  }
*/
module.exports = ({left, right}) => {
  // Exit early when performing a string comparison
  if (isString(left) || isString(right)) {
    return {equal: isString(left) && isString(right) && left === right};
  }

  // Exit early when performing a boolean comparison
  if (isBool(left) || isBool(right)) {
    return {equal: asNumber(left) === asNumber(right)};
  }

  return {equal: left === right};
};
