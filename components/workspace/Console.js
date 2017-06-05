import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Loadable from 'react-loadable'

import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'

const styles = prefixObject({
  overlay: {
    position: 'absolute',
    zIndex: 100,
    overflow: 'auto',
    boxSizing: 'border-box',
    padding: '4px 0',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
    borderTop: '1px solid #F8F8F8',
    background: 'rgba(255,255,255,0.98)',
  },
  overlayMaximized: {
    position: 'absolute',
    zIndex: 100,
    overflow: 'auto',
    boxSizing: 'border-box',
    padding: '4px 0',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    background: 'rgba(255,255,255,0.98)',
    borderLeft: '4px solid rgba(238,238,238,1)',
  },
  entryRow: {
    display: 'flex',
    boxSizing: 'border-box',
    boxShadow: '0 -1px 0 0 rgb(240,240,240) inset',
    padding: '0 7px',
  },
  itemSpacer: {
    width: 8,
  },
})

const createTheme = (base) => ({
  ...base,
  BASE_FONT_SIZE: '13px',
  TREENODE_FONT_SIZE: '13px',
  BASE_LINE_HEIGHT: '20px',
  TREENODE_LINE_HEIGHT: '20px',
  BASE_BACKGROUND_COLOR: 'transparent',
})

const Inspector = Loadable({
  loader: () => import('react-inspector')
    .then(({default: Inspector, chromeLight}) => {
      const theme = createTheme(chromeLight)

      console.log("Inspector", Inspector, chromeLight)

      return (props) => <Inspector {...props} theme={theme} />
    }),
  LoadingComponent: () => null,
})

@pureRender
export default class extends Component {

  static defaultProps = {
    maximize: false,
    logs: [],
  }

  componentDidMount() {
    const {clientHeight, scrollHeight} = this.container
    const maxScrollTop = scrollHeight - clientHeight

    this.container.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
  }

  componentDidUpdate() {
    const {clientHeight, scrollHeight, scrollTop} = this.container
    const maxScrollTop = scrollHeight - clientHeight

    // If we're within one clientHeight of the bottom, scroll to bottom
    if (maxScrollTop - clientHeight < scrollTop) {
      this.container.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
    }
  }

  renderEntry = (entry) => {
    let content = entry.data
      .map((item, index) => (
        <Inspector
          key={index}
          data={item}
        />
      ))
      // Add spacers between each item
      .reduce((result, value, index, list) => {
        result.push(value)

        if (index !== list.length - 1) {
          result.push(
            <div
              key={`s-${index}`}
              style={styles.itemSpacer}
            />
          )
        }

        return result
      }, [])

    return (
      <div
        key={entry.id}
        style={styles.entryRow}
      >
        {content}
      </div>
    )
  }

  render() {
    const {maximize, logs} = this.props

    return (
      <div
        style={maximize ? styles.overlayMaximized : styles.overlay}
        ref={ref => this.container = ref}
      >
        {logs.map(this.renderEntry)}
      </div>
    )
  }
}
