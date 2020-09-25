// Adapted from https://github.com/facebook/react/blob/480626a9e920d5e04194c793a828318102ea4ff4/scripts/babel/transform-prevent-infinite-loops.js
// Based on https://repl.it/site/blog/infinite-loops.

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * Copyright (c) 2017, Amjad Masad
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type Babel from '@babel/core'

const DEFAULT_MAX_ITERATIONS = 1000

module.exports = ({ types: t }: typeof Babel) => {
  return {
    visitor: {
      'WhileStatement|ForStatement|DoWhileStatement': (
        path: Babel.NodePath<
          | Babel.types.WhileStatement
          | Babel.types.ForStatement
          | Babel.types.DoWhileStatement
        >,
        options?: { opts?: { maxIterations?: number } }
      ) => {
        const maxIterations =
          options?.opts?.maxIterations ?? DEFAULT_MAX_ITERATIONS

        // An iterator incremented with each iteration
        const iterator = path.scope.parent.generateUidIdentifier('loopIt')
        const iteratorInit = t.numericLiteral(0)
        path.scope.parent.push({
          id: iterator,
          init: iteratorInit,
        })

        const guard = t.ifStatement(
          t.binaryExpression(
            '>',
            t.updateExpression('++', iterator, true),
            t.numericLiteral(maxIterations)
          ),
          t.throwStatement(
            t.newExpression(t.identifier('RangeError'), [
              t.stringLiteral(
                `Exceeded ${maxIterations} iterations, potential infinite loop.`
              ),
            ])
          )
        )

        const body = path.get('body')

        if (body.isBlockStatement()) {
          body.unshiftContainer('body', guard)
        } else {
          // No block statement e.g. `while (1) 1;`
          const statement = body.node
          body.replaceWith(t.blockStatement([guard, statement]))
        }
      },
    },
  }
}
