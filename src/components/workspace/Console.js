import React, { PureComponent } from 'react'
import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'
import { MultiInspector } from './Inspector'

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
  lineNumberSpacer: {
    flex: '1 1 auto',
  },
  lineNumber: {
    fontFamily: 'Menlo, monospace',
    fontSize: '13px',
    lineHeight: '20px',
    color: 'rgb(200,200,200)',
    textDecoration: 'underline',
  },
})

export default class extends PureComponent {
  static defaultProps = {
    maximize: false,
    showFileName: false,
    showLineNumber: true,
    logs: [],
    style: null,
    rowStyle: null,
  }

  getComputedStyle = () => {
    const { style, maximize } = this.props
    const defaultStyle = maximize ? styles.overlayMaximized : styles.overlay

    return style ? prefix({ ...defaultStyle, ...style }) : defaultStyle
  }

  getComputedRowStyle = () => {
    const { rowStyle } = this.props
    const defaultStyle = styles.entryRow

    return rowStyle ? prefix({ ...defaultStyle, ...rowStyle }) : defaultStyle
  }

  componentDidMount() {
    const { clientHeight, scrollHeight } = this.container
    const maxScrollTop = scrollHeight - clientHeight

    this.container.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
  }

  componentDidUpdate() {
    const { clientHeight, scrollHeight, scrollTop } = this.container
    const maxScrollTop = scrollHeight - clientHeight

    // If we're within one clientHeight of the bottom, scroll to bottom
    if (maxScrollTop - clientHeight < scrollTop) {
      this.container.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
    }
  }

  renderLineNumber = (location) => {
    const string = this.props.showFileName
      ? `${location.file}:${location.line}`
      : `:${location.line}`

    return (
      <React.Fragment>
        <span style={styles.lineNumberSpacer}></span>
        <span style={styles.lineNumber}>{string}</span>
      </React.Fragment>
    )
  }

  renderEntry = (entry) => {
    const { renderReactElements } = this.props

    const lineNumber =
      this.props.showLineNumber && entry.location
        ? this.renderLineNumber(entry.location)
        : null

    return (
      <div key={entry.id} style={this.getComputedRowStyle()}>
        <MultiInspector
          data={entry.data}
          renderReactElements={renderReactElements}
        />
        {lineNumber}
      </div>
    )
  }

  render() {
    const { logs } = this.props

    return (
      <div
        style={this.getComputedStyle()}
        ref={(ref) => (this.container = ref)}
      >
        {logs.map(this.renderEntry)}
      </div>
    )
  }
}
