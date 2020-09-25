import type Babel from '@babel/core'

// Add line & column info to console.log calls.
//
// console.log(arg) becomes console._rnwp_log("index.js", "8", "2", arg)
export default ({
  types: t,
}: typeof Babel): { visitor: Babel.Visitor<Babel.PluginOptions> } => {
  return {
    visitor: {
      CallExpression(path, options) {
        const optionsObject = { filename: '/', ...options }

        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object) &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.object.name === 'console' &&
          path.node.callee.property.name === 'log'
        ) {
          path.node.callee.property.name = '_rnwp_log'

          const strings = [
            optionsObject.filename.slice(1),
            path.node.loc!.end.line.toString(),
            path.node.loc!.start.column.toString(),
            'visible',
          ]

          path.node.arguments = [
            ...strings.map((value) => t.stringLiteral(value)),
            ...path.node.arguments,
          ]
        }
      },
    },
  }
}
