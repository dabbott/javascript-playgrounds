import React, { PureComponent, useRef, useEffect } from 'react'
import { prefixObject } from '../../utils/Styles'
import * as DOMCoding from '../../utils/DOMCoding'
import type { InspectorThemeDefinition, InspectorProps } from 'react-inspector'
import inspect from '../../utils/inspect'

// Types don't match the version we're using. TODO: Upgrade or remove
const Loadable = require('react-loadable')

const styles = prefixObject({
  itemSpacer: {
    width: 8,
  },
})

const createInspectorTheme = (base: InspectorThemeDefinition) => ({
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

      return function LazyInspector(props: InspectorProps) { return <Inspector {...props} theme={theme} /> }
    }),
  loading: () => null,
})

interface InlineElementProps {
  onMount: (node: HTMLElement) => void
  onUnmount: (node: HTMLElement) => void
}

const InlineElement = ({ onMount, onUnmount }: InlineElementProps) => {
  const ref = useRef(null)

  useEffect(() => {
    onMount(ref.current!)

    return () => {
      onUnmount(ref.current!)
    }
  }, [])

  return <span ref={ref} />
}

// https://stackoverflow.com/a/20476546
function isNodeInDOM(o: any) {
  return (
    typeof o === 'object' &&
    o !== null &&
    !!(
      o.ownerDocument &&
      (o.ownerDocument.defaultView || o.ownerDocument.parentWindow).alert
    )
  )
}

interface Props {
  data: unknown[]
  inspector: 'browser' | 'node'
  renderReactElements: boolean
  expandLevel?: number
}

export class MultiInspector extends PureComponent<Props> {
  render() {
    const {
      data,
      renderReactElements,
      expandLevel,
      inspector: inspectorType,
    } = this.props

    const inspectors = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i]

      if (isNodeInDOM(item) || item instanceof HTMLElement) {
        inspectors.push(
          <InlineElement
            key={JSON.stringify(DOMCoding.toJSON(item as HTMLElement))}
            onMount={(node) => {
              node.appendChild(item as HTMLElement)
            }}
            onUnmount={(node) => {
              node.removeChild(item as HTMLElement)
            }}
          />
        )
      } else if (
        typeof item === 'object' &&
        item !== null &&
        '__is_react_element' in item
      ) {
        // Render using the iframe's copy of React
        const { element, ReactDOM } = item as {
          element: JSX.Element
          ReactDOM: typeof import('react-dom')
        }

        const key = Math.random().toString()

        if (renderReactElements) {
          inspectors.push(
            <InlineElement
              key={key}
              onMount={(node: Element) => {
                ReactDOM.render(element, node)
              }}
              onUnmount={(node: Element) => {
                ReactDOM.unmountComponentAtNode(node)
              }}
            />
          )
        } else {
          inspectors.push(
            <Inspector key={key} data={element} expandLevel={expandLevel} />
          )
        }
      } else {
        switch (inspectorType) {
          case 'browser':
            inspectors.push(
              <Inspector key={i} data={item} expandLevel={expandLevel} />
            )
            break
          case 'node':
            const spans = inspect(item, {
              colors: true,
              bracketSeparator: '',
              depth: expandLevel,
            }).map((span, j) => (
              <span key={j} style={{ color: span.style }}>
                {span.value}
              </span>
            ))

            inspectors.push(<span key={i}>{spans}</span>)
            break
        }
      }
    }

    let content = inspectors
      // Add spacers between each item
      .reduce((result: JSX.Element[], value, index, list) => {
        result.push(value)

        if (index !== list.length - 1) {
          result.push(<div key={`s-${index}`} style={styles.itemSpacer} />)
        }

        return result
      }, [])

    return content
  }
}
