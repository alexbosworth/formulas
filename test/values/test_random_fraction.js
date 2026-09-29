const crypto = require('node:crypto');
const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = require('./../../values').randomFraction;

const tests = [
  {
    bytes: [0, 0, 0, 0, 0, 0],
    description: 'Zero bytes give a zero fraction',
    expected: {fraction: 0},
  },
  {
    bytes: [64, 0, 0, 0, 0, 0],
    description: 'Random bytes are scaled to a fraction',
    expected: {fraction: 0.25},
  },
  {
    bytes: [255, 255, 255, 255, 255, 255],
    description: 'Maximum bytes give a fraction below one',
    expected: {fraction: (2 ** 48 - 1) / 2 ** 48},
  },
];

tests.forEach(({bytes, description, expected}) => {
  return test(description, (t, end) => {
    t.mock.method(crypto, 'randomBytes', () => Buffer.from(bytes));

    deepStrictEqual(method(), expected, 'Got expected result');

    return end();
  });
});

test('Random fraction is from zero up to but not including one', (t, end) => {
  const {fraction} = method();

  deepStrictEqual(fraction >= 0 && fraction < 1, true, 'Got fraction');

  return end();
});
