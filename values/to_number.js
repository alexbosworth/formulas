const isBool = value => typeof value === 'boolean';
const isNumber = value => typeof value === 'number' && Number.isFinite(value);

/** Validate and convert a finite number or boolean to a number

  {
    value: <Finite Number or Boolean>
  }

  @throws
  <Error>

  @returns
  {
    number: <Finite Number>
  }
*/
module.exports = ({value}) => {
  if (!isBool(value) && !isNumber(value)) {
    throw new Error('ExpectedBoolOrFiniteNumberForNumberConversion');
  }

  return {number: Number(value)};
};
