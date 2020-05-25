// Add line & column info to console.log calls.
//
// console.log(arg) becomes console._rnwp_log("index.js", "8", "2", arg)
export default () => {
  return {
    visitor: {
      CallExpression(path, state) {
        if (
          path.node.callee.object &&
          path.node.callee.object.name === 'console' &&
          path.node.callee.property.name === 'log'
        ) {
          path.node.callee.property.name = '_rnwp_log'

          const locationArguments = [
            state.filename.slice(1),
            path.node.loc.end.line.toString(),
            path.node.loc.start.column.toString(),
          ]

          path.node.arguments = [
            ...locationArguments.map((value) => ({
              type: 'StringLiteral',
              value,
            })),
            ...path.node.arguments,
          ]
        }
      },
    },
  }
}
