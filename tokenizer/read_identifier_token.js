const identifierPattern = /^[A-Za-z_][A-Za-z0-9_]*/;
const type = 'identifier';

/** Read an identifier token from a formula

  {
    formula: <Formula String>
    position: <Identifier Start Position Number>
  }

  @returns
  {
    next: <Next Formula Position Number>
    token: {
      type: <Token Type String>
      value: <Identifier Value String>
    }
  }
*/
module.exports = ({formula, position}) => {
  const [value] = formula.slice(position).match(identifierPattern);

  return {next: position + value.length, token: {type, value}};
};
