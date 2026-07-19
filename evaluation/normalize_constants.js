const {entries} = Object;
const isBool = value => typeof value === 'boolean';
const isNumber = value => typeof value === 'number' && Number.isFinite(value);
const isString = value => typeof value === 'string';

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
    // Exit with error on invalid value
    if (!isBool(value) && !isString(value) && !isNumber(value)) {
      throw new Error('ExpectedValidBoolStringOrFiniteNumberConstantValue');
    }

    agg[key.toUpperCase()] = value;

    return agg;
  },
  {});

  return {normalized};
};
