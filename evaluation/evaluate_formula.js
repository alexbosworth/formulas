const evaluate = require('./evaluate');
const normalizeConstants = require('./normalize_constants');
const normalizeFunctions = require('./normalize_functions');
const parse = require('../parser');
const tokenize = require('../tokenizer');

const isBool = value => typeof value === 'boolean';
const isNumber = value => typeof value === 'number' && Number.isFinite(value);

/** Evaluate a formula with optional constants and functions

  {
    [constants]: <Constants Object>
    formula: <Formula String>
    [functions]: <Functions Object>
  }

  @throws
  <Error>

  @returns
  {
    result: <Evaluated Formula Result Number>
  }
*/
module.exports = ({constants, formula, functions}) => {
  const {result} = evaluate({
    constants: normalizeConstants({constants}).normalized,
    functions: normalizeFunctions({functions}).normalized,
    tree: parse({tokens: tokenize({formula}).tokens}).tree,
  });

  // Check that the evaluated formula output is valid
  if (!isBool(result) && !isNumber(result)) {
    throw new Error('ExpectedFormulaOutputAsBooleanOrFiniteNumber');
  }

  return {result: Number(result)};
};
