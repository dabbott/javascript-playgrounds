import React, { PureComponent } from 'react'
import Loadable from 'react-loadable'
import { prefixObject } from '../../utils/PrefixInlineStyles'

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

export class MultiInspector extends PureComponent {
  render() {
    const { data } = this.props

    const inspectors = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i]

      inspectors.push(<Inspector key={i} data={item} />)
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
