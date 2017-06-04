import React, { Component } from 'react'
import Inspector, { chromeLight } from 'react-inspector'
import pureRender from 'pure-render-decorator'

import Overlay from './Overlay'
import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'

const styles = prefixObject({
  overlay: {
    position: 'absolute',
    zIndex: 100,
    overflow: 'auto',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
    borderTop: '1px solid #F8F8F8',
    background: 'rgba(255,255,255,0.95)',
  },
  overlayMaximized: {
    position: 'absolute',
    zIndex: 100,
    overflow: 'auto',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    background: 'rgba(255,255,255,0.95)',
    borderLeft: '4px solid rgba(238,238,238,1)',
  },
  entryRow: {
    display: 'flex',
  },
  itemSpacer: {
    width: 8,
  },
})

const theme = {
  ...chromeLight,
  BASE_FONT_SIZE: '13px',
  TREENODE_FONT_SIZE: '13px',
  BASE_LINE_HEIGHT: '17px',
  TREENODE_LINE_HEIGHT: '17px',
}

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
    let row = entry.data
      .map((item, index) => (
        <Inspector
          key={index}
          theme={theme}
          data={item}
        />
      ))
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
        {row}
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
        <Overlay>
          {logs.map(this.renderEntry)}
        </Overlay>
      </div>
    )
  }
}
