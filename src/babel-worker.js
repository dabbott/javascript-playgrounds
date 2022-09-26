import * as Babel from '@babel/standalone'

onmessage = function (event) {
  const {
    id,
    payload: {
      code: value,
      filename,
      options: {
        instrumentExpressionStatements,
        maxLoopIterations,
        ...options
      },
    },
  } = event.data

  let output

  try {
    const presets = [
      require('metro-react-native-babel-preset').getPreset(value, {
        enableBabelRuntime: false,
      }),
    ]

    const plugins = [
      ...(maxLoopIterations > 0
        ? [
            [
              require('./utils/BabelInfiniteLoopPlugin'),
              { maxIterations: maxLoopIterations },
            ],
          ]
        : []),
      ...(instrumentExpressionStatements
        ? [require('./utils/BabelExpressionLogPlugin')]
        : []),
      require('./utils/BabelConsolePlugin'),
      [
        require('@babel/plugin-transform-typescript'),
        {
          isTSX: true,
          allowNamespaces: true,
        },
      ],
    ]

    const code = Babel.transform(value, {
      presets,
      plugins,
      filename,
      ...options,
    }).code

    output = {
      id,
      payload: {
        filename,
        type: 'code',
        code,
      },
    }
  } catch (e) {
    output = {
      id,
      payload: {
        filename,
        type: 'error',
        error: {
          message: e.message.replace('unknown', e.name),
        },
      },
    }
  }

  postMessage(output)
}
