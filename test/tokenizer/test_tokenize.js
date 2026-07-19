const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const method = require('./../../tokenizer');

const formulaLengthLimit = 8192;
const formulaWithLength = length => `1${' '.repeat(length - 1)}`;

const makeArgs = overrides => {
  const args = {formula: 'SUM(foo_1, 1.25) >= "ok"'};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {
    tokens: [
      {type: 'identifier', value: 'SUM'},
      {type: 'paren', value: '('},
      {type: 'identifier', value: 'foo_1'},
      {type: 'comma', value: ','},
      {type: 'number', value: 1.25},
      {type: 'paren', value: ')'},
      {type: 'operator', value: '>='},
      {type: 'string', value: 'ok'},
    ],
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Formula is tokenized as expected',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({formula: '+ - * / < > = <> <= >= ( ) ,'}),
    description: 'Operators, parentheses, and comma are tokenized',
    expected: makeExpected({
      tokens: [
        {type: 'operator', value: '+'},
        {type: 'operator', value: '-'},
        {type: 'operator', value: '*'},
        {type: 'operator', value: '/'},
        {type: 'operator', value: '<'},
        {type: 'operator', value: '>'},
        {type: 'operator', value: '='},
        {type: 'operator', value: '<>'},
        {type: 'operator', value: '<='},
        {type: 'operator', value: '>='},
        {type: 'paren', value: '('},
        {type: 'paren', value: ')'},
        {type: 'comma', value: ','},
      ],
    }),
  },
  {
    args: makeArgs({formula: '.5 5.'}),
    description: 'Numbers with optional leading or trailing decimal are tokenized',
    expected: makeExpected({
      tokens: [
        {type: 'number', value: 0.5},
        {type: 'number', value: 5},
      ],
    }),
  },
  {
    args: makeArgs({formula: '"line\\n", \'it\'\'s\''}),
    description: 'Escaped and doubled quote strings are tokenized',
    expected: makeExpected({
      tokens: [
        {type: 'string', value: 'line\n'},
        {type: 'comma', value: ','},
        {type: 'string', value: 'it\'s'},
      ],
    }),
  },
  {
    args: makeArgs({formula: '"a\\tb\\\\c\\q"'}),
    description: 'Known and unknown string escapes are tokenized',
    expected: makeExpected({
      tokens: [
        {type: 'string', value: 'a\tb\\cq'},
      ],
    }),
  },
  {
    args: makeArgs({formula: formulaWithLength(formulaLengthLimit)}),
    description: 'Formula at length limit is tokenized',
    expected: makeExpected({tokens: [{type: 'number', value: 1}]}),
  },
  {
    args: makeArgs({formula: formulaWithLength(formulaLengthLimit + 1)}),
    description: 'Formula beyond length limit is rejected',
    error: 'ExpectedFormulaWithinLengthLimit',
  },
  {
    args: makeArgs({formula: '1.2.3'}),
    description: 'Number with multiple decimals is rejected',
    error: 'UnexpectedInvalidDecimalNumberValue',
  },
  {
    args: makeArgs({formula: '.'}),
    description: 'Decimal without digits is rejected',
    error: 'UnexpectedInvalidDecimalNumberValue',
  },
  {
    args: makeArgs({formula: '9'.repeat(400)}),
    description: 'Non-finite number is rejected',
    error: 'UnexpectedNonFiniteNumberForNumberValue',
  },
  {
    args: makeArgs({formula: '"unterminated'}),
    description: 'Unterminated string is rejected',
    error: 'ExpectedAllTerminatedStringLiterals',
  },
  {
    args: makeArgs({formula: '"bad\\'}),
    description: 'String ending with escape is rejected',
    error: 'UnexpectedUnterminatedStringLiteral',
  },
  {
    args: makeArgs({formula: '&'}),
    description: 'Unexpected character is rejected',
    error: 'ExpectedOnlySupportedCharactersInFormula',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => method(args), new Error(error), 'Got error');
    } else {
      const res = method(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return end();
  });
});
