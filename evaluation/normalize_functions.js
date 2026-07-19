const {entries} = Object;
const isFunction = value => typeof value === 'function';

/** Validate functions provided to a formula and uppercase all keys

  {
    [functions]: <Functions Object>
  }

  @throws
  <Error>

  @returns
  {
    normalized: <Functions Object>
  }
*/
module.exports = ({functions}) => {
  const normalized = entries(functions || {}).reduce((agg, [key, value]) => {
    // Validate that all the entries have functions
    if (!isFunction(value)) {
      throw new Error('ExpectedFunctionTypeValuesForFunctions');
    }

    agg[key.toUpperCase()] = value;

    return agg;
  },
  {});

  return {normalized};
};
