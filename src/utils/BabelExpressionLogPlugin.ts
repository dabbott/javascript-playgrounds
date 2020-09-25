import type Babel from '@babel/core'

// Wrap expression statements in instrumented console.log calls.
//
// 3 becomes console._rnwp_log("index.js", "8", "2", 3)
export default ({
  types: t,
}: typeof Babel): { visitor: Babel.Visitor<Babel.PluginOptions> } => {
  return {
    visitor: {
      ExpressionStatement(path, options) {
        const optionsObject = { filename: '/', ...options }

        // Don't instrument any calls to console.*
        if (
          t.isCallExpression(path.node.expression) &&
          t.isMemberExpression(path.node.expression.callee) &&
          t.isIdentifier(path.node.expression.callee.object) &&
          path.node.expression.callee.object.name === 'console'
        ) {
          return
        }

        const strings = [
          optionsObject.filename.slice(1),
          path.node.loc!.end.line.toString(),
          path.node.loc!.start.column.toString(),
          'hidden',
        ]

        const call = t.callExpression(
          t.memberExpression(
            t.identifier('console'),
            t.identifier('_rnwp_log')
          ),
          [
            ...strings.map((value) => t.stringLiteral(value)),
            path.node.expression,
          ]
        )

        path.node.expression = call
      },
    },
  }
}
