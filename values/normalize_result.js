const isBool = value => typeof value === 'boolean';
const isNumber = value => typeof value === 'number' && Number.isFinite(value);
const isString = value => typeof value === 'string';

/** Validate and normalize the result of a function

  {
    value: <Finite Number, Boolean, or String>
  }

  @throws
  <Error>

  @returns
  {
    normalized: <Finite Number, Boolean, or String>
  }
*/
module.exports = ({value}) => {
  if (!isString(value) && !isBool(value) && !isNumber(value)) {
    throw new Error('ExpectedBoolOrFiniteNumberOrStringValueToNormalize');
  }

  return {normalized: value};
};
