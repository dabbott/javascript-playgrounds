const Babel = require('babel-standalone')

onmessage = function(event) {
  const value = event.data
  let output

  try {
    const code = Babel.transform(value, {
      presets: ['es2015', 'react'],
      retainLines: true,
    }).code

    output = {
      type: 'code',
      code,
    }
  } catch (e) {
    output = {
      type: 'error',
      error: {
        message: e.message.replace('unknown', e.name),
      },
    }
  }

  postMessage(JSON.stringify(output))
}
