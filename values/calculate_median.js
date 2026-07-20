const calculateAverage = require('./calculate_average');

const average = (left, right) => {
  return calculateAverage({values: [left, right]}).average;
};
const {floor} = Math;
const isOdd = n => n % 2;

/** Calculate the median of a non-empty array of finite numbers

  {
    values: [<Finite Number>]
  }

  @returns
  {
    median: <Finite Number>
  }
*/
module.exports = ({values}) => {
  const sorted = values.toSorted((a, b) => a - b);

  const middle = floor(sorted.length / 2);

  // Exit early with the middle value when the array has an odd length
  if (isOdd(sorted.length)) {
    return {median: sorted[middle]};
  }

  // Take the two middle values in the sorted list and average them
  return {median: average(sorted[middle - 1], sorted[middle])};
};
