/** Check whether a formula token matches a type and optional value

  {
    [token]: <Formula Token Object>
    type: <Token Type String>
    [value]: <Token Value Number or String>
  }

  @returns
  <Boolean>
*/
module.exports = ({token, type, value}) => {
  // Exit early when there is no token
  if (!token) {
    return false;
  }

  return token.type === type && (value === undefined || token.value === value);
};
