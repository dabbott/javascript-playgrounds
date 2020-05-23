const Babel = require('babel-core')

import babelPluginConsoleSource from 'babel-loader!babel-plugin-console-source'

// Ensure consistency with react-native's babel plugins by directly using
// the babel-preset-react-native. It's intended for usage in node, so we
// have to require it slightly differently to get it to work in the browser.
import plugins from './utils/BabelPlugins'

import * as LogMarker from './utils/LogMarker'

onmessage = function (event) {
  const { code: value, filename, options } = event.data
  let output

  try {
    const code = Babel.transform(value, {
      plugins: [
        ...plugins,
        [
          babelPluginConsoleSource,
          { resolveFile: () => `${LogMarker.symbol}${filename}` },
        ],
      ],
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
