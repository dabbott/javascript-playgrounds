const Babel = require('babel-core')
import { parse } from 'babylon'
import traverse from 'babel-traverse'

// Ensure consistency with react-native's babel plugins by directly using
// the babel-preset-react-native. It's intended for usage in node, so we
// have to require it slightly differently to get it to work in the browser.
import plugins from './utils/BabelPlugins'

const findJSXElements = (value) => {
  const parsed = parse(value, {
    sourceType: "module",
    plugins: [
      "asyncFunctions",
      "jsx",
      "flow",
    ],
  })

  const elements = []

  traverse(parsed, {
    noScope: true,
    enter: (path) => {
      const {node} = path
      const {type, openingElement} = node

      if (type === 'JSXElement') {
        const {attributes} = openingElement

        if (attributes.length) {
          attributes.forEach(({name, value}) => {
            if (name.name === 'key') {
              const key = value.expression.value

              elements.push({
                key,
                loc: node.loc,
              })
            }
          })
        }
      }
    },
  })

  return elements
}

onmessage = function(event) {
  const value = event.data
  let output

  try {
    const {code} = Babel.transform(value, {
      sourceType: 'module',
      plugins,
      retainLines: true,
    })

    output = {
      type: 'code',
      code,
      elements: findJSXElements(value),
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
