const isOp = (ops, t) => !!t && t.type === 'operator' && ops.includes(t.value);
const type = 'operator';

/** Parse a series of binary formula operators

  {
    consume: <Consume Token Function>
    depth: <Current Parse Depth Number>
    operators: [<Operator String>]
    next: <Next Parser Function>
    peek: <Peek Token Function>
  }

  @returns
  {
    node: {
      [left]: <Parsed Formula Node>
      [op]: <Operator String>
      [right]: <Parsed Formula Node>
      type: <Formula Node Type String>
    }
  }
*/
module.exports = ({consume, depth, next, operators, peek}) => {
  const parsed = {node: next(depth)};

  // Build a node for each matching operator
  while (isOp(operators, peek())) {
    const op = consume({type}).value;

    parsed.node = {op, left: parsed.node, right: next(depth), type: 'binary'};
  }

  return {node: parsed.node};
};
