const isBool = value => typeof value === 'boolean';
const isNumber = value => typeof value === 'number' && Number.isFinite(value);

/** Validate and convert a finite number or boolean to a boolean

  {
    value: <Finite Number or Boolean>
  }

  @throws
  <Error>

  @returns
  {
    bool: <Boolean>
  }
*/
module.exports = ({value}) => {
  if (!isBool(value) && !isNumber(value)) {
    throw new Error('ExpectedBoolOrFiniteNumberForBooleanConversion');
  }

  return {bool: !!value};
};
