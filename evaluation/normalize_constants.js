const {entries} = Object;
const {from} = Array;
const {isArray} = Array;
const isBool = value => typeof value === 'boolean';
const isNumber = value => typeof value === 'number' && Number.isFinite(value);
const isString = value => typeof value === 'string';
const isValue = value => isBool(value) || isString(value) || isNumber(value);

/** Validate constants provided to a formula and uppercase all keys

  {
    [constants]: <Constants Object>
  }

  @throws
  <Error>

  @returns
  {
    normalized: <Constants Object>
  }
*/
module.exports = ({constants}) => {
  const normalized = entries(constants || {}).reduce((agg, [key, value]) => {
    // Exit with error when an array contains an invalid value
    if (isArray(value) && !from(value).every(isValue)) {
      throw new Error('ExpectedValidValuesInConstantArray');
    }

    // Exit with error on invalid scalar value
    if (!isArray(value) && !isValue(value)) {
      throw new Error('ExpectedValidBoolStringOrFiniteNumberConstantValue');
    }

    agg[key.toUpperCase()] = isArray(value) ? from(value) : value;

    return agg;
  },
  {});

  return {normalized};
};
