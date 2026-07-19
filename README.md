# formulas

Evaluate spreadsheet-style formulas with JavaScript values and functions.

## Requirements

- Node.js 22 or later

## Installation

```sh
npm install formulas
```

## Usage

Import the named `evaluateFormula` function and pass it a formula string:

```js
const {evaluateFormula} = require('formulas');

const {result} = evaluateFormula({
  formula: '1 + 2 * 3',
});

console.log(result); // 7
```

Write formulas without a leading `=`. For example, use `SUM(1, 2)` rather
than `=SUM(1, 2)`.

`evaluateFormula` accepts an object with these properties:

| Property | Required | Description |
| --- | --- | --- |
| `formula` | Yes | Formula string to evaluate |
| `constants` | No | Named values available to the formula |
| `functions` | No | Custom functions available to the formula |

It returns an object containing a numeric `result`:

```js
{result: 7}
```

A final boolean result is converted to `1` for true or `0` for false.

## Constants

Pass constants as finite numbers, booleans, or strings. Constant names are
case-insensitive within formulas.

```js
const {evaluateFormula} = require('formulas');

const {result} = evaluateFormula({
  constants: {
    subtotal: 25,
    taxRate: 0.08,
  },
  formula: 'ROUND(SUBTOTAL * (1 + TAXRATE), 2)',
});

console.log(result); // 27
```

## Custom functions

Pass custom functions by name through the `functions` object. Function names
are case-insensitive within formulas, and each argument is evaluated before
the JavaScript function is called.

```js
const {evaluateFormula} = require('formulas');

const {result} = evaluateFormula({
  constants: {
    earned: 17,
    possible: 20,
  },
  formula: 'ROUND(PERCENT(EARNED, POSSIBLE), 1)',
  functions: {
    percent: (value, total) => value / total * 100,
  },
});

console.log(result); // 85
```

Custom functions must return a finite number, boolean, or string. The final
formula result must still be a finite number or boolean.

## Formula syntax

Formulas support numbers, `TRUE`, `FALSE`, quoted strings, parentheses, and
the following operators:

| Operation | Operators |
| --- | --- |
| Unary | `+`, `-` |
| Multiplication and division | `*`, `/` |
| Addition and subtraction | `+`, `-` |
| Comparison | `>`, `<`, `>=`, `<=`, `=`, `<>` |

Not-equal comparisons use spreadsheet-style `<>` syntax:

```js
const {evaluateFormula} = require('formulas');

const {result} = evaluateFormula({formula: '3 <> 2'});

console.log(result); // 1
```

## Built-in functions

| Function | Description |
| --- | --- |
| `ABS(value)` | Return the absolute value |
| `AND(value, ...)` | Return true when every value is true |
| `IF(condition, ifTrue, ifFalse)` | Return the selected result |
| `MAX(value, ...)` | Return the largest value |
| `MIN(value, ...)` | Return the smallest value |
| `NOT(value)` | Reverse a boolean value |
| `OR(value, ...)` | Return true when any value is true |
| `RANDBETWEEN(low, high)` | Return a random integer within inclusive bounds |
| `ROUND(value[, places])` | Round a value; places defaults to zero |
| `SUM(value, ...)` | Add one or more values |

For example:

```js
const {evaluateFormula} = require('formulas');

const {result} = evaluateFormula({
  constants: {
    disqualified: false,
    passingScore: 70,
    score: 82,
  },
  formula: 'IF(AND(SCORE >= PASSINGSCORE, NOT(DISQUALIFIED)), 100, 0)',
});

console.log(result); // 100
```

## Errors

Invalid syntax, unknown names, unsupported values, invalid argument counts,
and non-finite results cause `evaluateFormula` to throw an `Error`.

```js
const {evaluateFormula} = require('formulas');

try {
  evaluateFormula({formula: '1 / 0'});
} catch (err) {
  console.error(err.message);
}
```

## Testing

```sh
npm test
```

## License

MIT
