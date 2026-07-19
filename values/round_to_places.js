const toNumber = require('./to_number');

const isDecimal = precision => precision >= 0;
const {round} = Math;
const roundingNudge = Number.EPSILON;
const scalingFactor = precision => Math.pow(10, precision);
const {trunc} = Math;

/** Round a number to a specified number of decimal places

  {
    places: <Round To Places Finite Number or Boolean>
    value: <Round Finite Number or Boolean>
  }

  @throws
  <Error>

  @returns
  {
    rounded: <Rounded Finite Number>
  }
*/
module.exports = ({places, value}) => {
  const {number} = toNumber({value});
  const precision = trunc(toNumber({value: places}).number);

  // Exit early when dealing with decimal numbers
  if (isDecimal(precision)) {
    const factor = scalingFactor(precision);

    return {rounded: round((number + roundingNudge) * factor) / factor};
  }

  const factor = scalingFactor(-precision);

  return {rounded: round(number / factor) * factor};
};
