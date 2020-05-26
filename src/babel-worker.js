import * as Babel from '@babel/core'

onmessage = function (event) {
  const { code: value, filename, options } = event.data
  let output

  try {
    const presets = [
      require('metro-react-native-babel-preset').getPreset(value, {
        enableBabelRuntime: false,
      }),
    ]

    const plugins = [
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
      filename,
      type: 'code',
      code,
    }
  } catch (e) {
    output = {
      filename,
      type: 'error',
      error: {
        message: e.message.replace('unknown', e.name),
      },
    }
  }

  postMessage(JSON.stringify(output))
}
