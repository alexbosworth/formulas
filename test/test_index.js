const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');

const method = require('./..');

test('Named export evaluates a formula', (t, end) => {
  deepStrictEqual(method.evaluateFormula({formula: '1 + 2'}), {result: 3});

  return end();
});

test('Entry point exposes only the named export', (t, end) => {
  deepStrictEqual(Object.keys(method), ['evaluateFormula']);

  return end();
});
