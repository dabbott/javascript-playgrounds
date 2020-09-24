import type {
  ExpressionStatement,
  CallExpression,
  StringLiteral,
} from '@babel/types'

const baseNode = {
  leadingComments: null,
  innerComments: null,
  trailingComments: null,
  start: null,
  end: null,
  loc: null,
}

// Wrap expression statements in instrumented console.log calls.
//
// 3 becomes console._rnwp_log("index.js", "8", "2", 3)
export default () => {
  return {
    visitor: {
      ExpressionStatement(
        path: { node: ExpressionStatement },
        state: { filename: string }
      ) {
        // Don't instrument any calls to console.*
        if (
          path.node.expression.type === 'CallExpression' &&
          path.node.expression.callee.type === 'MemberExpression' &&
          path.node.expression.callee.object.type === 'Identifier' &&
          path.node.expression.callee.object.name === 'console'
        ) {
          return
        }

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

        const call: CallExpression = {
          ...baseNode,
          type: 'CallExpression',
          arguments: [...stringLiterals, path.node.expression],
          callee: {
            ...baseNode,
            type: 'MemberExpression',
            object: {
              ...baseNode,
              type: 'Identifier',
              name: 'console',
              decorators: null,
              optional: null,
              typeAnnotation: null,
            },
            property: {
              ...baseNode,
              type: 'Identifier',
              name: '_rnwp_log',
              decorators: null,
              optional: null,
              typeAnnotation: null,
            },
            optional: null,
            computed: false,
          },
          optional: null,
          typeArguments: null,
          typeParameters: null,
        }

        path.node.expression = call
      },
    },
  }
}
