const {isFinite} = Number;

/** Calculate the average of a non-empty array of finite numbers

  {
    values: [<Finite Number>]
  }

  @returns
  {
    average: <Finite Number>
  }
*/
module.exports = ({values}) => {
  const average = values.reduce((average, value, index) => {
    const valuesCount = index + 1;
    const difference = value - average;

    // Exit early with the difference when we overflow and go to Infinity
    if (!isFinite(difference)) {
      return average + value / valuesCount - average / valuesCount;
    }

    return average + difference / valuesCount;
  },
  Number());

  return {average};
};
