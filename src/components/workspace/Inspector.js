import React, { PureComponent, useRef, useEffect } from 'react'
import Loadable from 'react-loadable'
import { prefixObject } from '../../utils/PrefixInlineStyles'
import * as DOMCoding from '../../utils/DOMCoding'

const styles = prefixObject({
  itemSpacer: {
    width: 8,
  },
})

const createInspectorTheme = (base) => ({
  ...base,
  BASE_FONT_SIZE: '13px',
  TREENODE_FONT_SIZE: '13px',
  BASE_LINE_HEIGHT: '20px',
  TREENODE_LINE_HEIGHT: '20px',
  BASE_BACKGROUND_COLOR: 'transparent',
})

export const Inspector = Loadable({
  loader: () =>
    import('react-inspector').then(({ default: Inspector, chromeLight }) => {
      const theme = createInspectorTheme(chromeLight)

      return (props) => <Inspector {...props} theme={theme} />
    }),
  loading: () => null,
})

const InlineElement = ({ onMount, onUnmount }) => {
  const ref = useRef(null)

  useEffect(() => {
    onMount(ref.current)

    return () => {
      onUnmount(ref.current)
    }
  }, [])

  return <span ref={ref} />
}

// https://stackoverflow.com/a/20476546
function isNodeInDOM(o) {
  return (
    typeof o === 'object' &&
    o !== null &&
    !!(
      o.ownerDocument &&
      (o.ownerDocument.defaultView || o.ownerDocument.parentWindow).alert
    )
  )
}

export class MultiInspector extends PureComponent {
  render() {
    const { data, renderReactElements } = this.props

    const inspectors = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i]

      if (isNodeInDOM(item) || item instanceof HTMLElement) {
        inspectors.push(
          <InlineElement
            key={JSON.stringify(DOMCoding.toJSON(item))}
            onMount={(node) => {
              node.appendChild(item)
            }}
            onUnmount={(node) => {
              node.removeChild(item)
            }}
          />
        )
      } else if (
        typeof item === 'object' &&
        item !== null &&
        '__is_react_element' in item
      ) {
        // Render using the iframe's copy of React
        const { element, ReactDOM } = item

        const key = Math.random().toString()

        if (renderReactElements) {
          inspectors.push(
            <InlineElement
              key={key}
              onMount={(node) => {
                ReactDOM.render(element, node)
              }}
              onUnmount={(node) => {
                ReactDOM.unmountComponentAtNode(node)
              }}
            />
          )
        } else {
          inspectors.push(<Inspector key={key} data={element} />)
        }
      } else {
        inspectors.push(<Inspector key={i} data={item} />)
      }
    }

    let content = inspectors
      // Add spacers between each item
      .reduce((result, value, index, list) => {
        result.push(value)

        if (index !== list.length - 1) {
          result.push(<div key={`s-${index}`} style={styles.itemSpacer} />)
        }

        return result
      }, [])

    return content
  }
}
