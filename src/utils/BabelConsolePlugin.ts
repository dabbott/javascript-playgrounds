import type { CallExpression, StringLiteral } from '@babel/types'

const baseNode = {
  leadingComments: null,
  innerComments: null,
  trailingComments: null,
  start: null,
  end: null,
  loc: null,
}

// Add line & column info to console.log calls.
//
// console.log(arg) becomes console._rnwp_log("index.js", "8", "2", arg)
export default () => {
  return {
    visitor: {
      CallExpression(
        path: { node: CallExpression },
        state: { filename: string }
      ) {
        if (
          path.node.callee.type === 'MemberExpression' &&
          path.node.callee.object.type === 'Identifier' &&
          path.node.callee.object.name === 'console' &&
          path.node.callee.property.name === 'log'
        ) {
          path.node.callee.property.name = '_rnwp_log'

          const strings = [
            state.filename.slice(1),
            path.node.loc!.end.line.toString(),
            path.node.loc!.start.column.toString(),
          ]

          const stringLiterals: StringLiteral[] = strings.map((value) => ({
            type: 'StringLiteral',
            value,
            ...baseNode,
          }))

          path.node.arguments = [...stringLiterals, ...path.node.arguments]
        }
      },
    },
  }
}
