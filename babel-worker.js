const Babel = require('babel-core')

// Ensure consistency with react-native's babel plugins by directly using
// the babel-preset-react-native. It's intended for usage in node, so we
// have to require it slightly differently to get it to work in the browser.
import plugins from './utils/BabelPlugins'

onmessage = function(event) {
  const {code: value, filename, options} = event.data
  let output

  try {
    const code = Babel.transform(value, {
      plugins,
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
