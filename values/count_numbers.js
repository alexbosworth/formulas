const isNumber = value => typeof value === 'number' && Number.isFinite(value);

/** Count finite numbers in an array of values

  {
    values: [<Value>]
  }

  @returns
  {
    count: <Number>
  }
*/
module.exports = ({values}) => {
  return {count: values.filter(isNumber).length};
};
