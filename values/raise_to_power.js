const toNumber = require('./to_number');

const asNumber = value => toNumber({value}).number;
const {isFinite} = Number;
const {pow} = Math;

/** Raise a number to a power

  {
    base: <Base Finite Number or Boolean>
    exponent: <Exponent Finite Number or Boolean>
  }

  @throws
  <Error>

  @returns
  {
    power: <Finite Number>
  }
*/
module.exports = ({base, exponent}) => {
  const power = pow(asNumber(base), asNumber(exponent));

  // Exit with error when the power is not a real finite number
  if (!isFinite(power)) {
    throw new Error('ExpectedFinitePowerResultForFormulaEvaluation');
  }

  return {power};
};
