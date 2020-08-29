import React, { PureComponent, CSSProperties, memo, createRef } from 'react'
import { prefix, prefixObject } from '../../utils/Styles'
import { MultiInspector } from './Inspector'
import { LogCommand, SourceLocation } from '../../types/Messages'

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

interface Props {
  maximize: boolean
  showFileName: boolean
  showLineNumber: boolean
  renderReactElements: boolean
  logs: LogCommand[]
  style?: CSSProperties
  rowStyle?: CSSProperties
}

const LineNumber = memo(
  ({
    showFileName,
    location,
  }: {
    showFileName: boolean
    location: SourceLocation
  }) => {
    const string = showFileName
      ? `${location.file}:${location.line}`
      : `:${location.line}`

    return (
      <>
        <span style={styles.lineNumberSpacer}></span>
        <span style={styles.lineNumber}>{string}</span>
      </>
    )
  }
)

export default class extends PureComponent<Props> {
  static defaultProps = {
    maximize: false,
    showFileName: false,
    showLineNumber: true,
    logs: [],
  }

  container = createRef<HTMLDivElement>()

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
    if (!this.container.current) return

    const { clientHeight, scrollHeight } = this.container.current
    const maxScrollTop = scrollHeight - clientHeight

    this.container.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
  }

  componentDidUpdate() {
    if (!this.container.current) return

    const { clientHeight, scrollHeight, scrollTop } = this.container.current
    const maxScrollTop = scrollHeight - clientHeight

    // If we're within one clientHeight of the bottom, scroll to bottom
    if (maxScrollTop - clientHeight < scrollTop) {
      this.container.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
    }
  }

  renderEntry = (entry: LogCommand) => {
    const { renderReactElements, showFileName } = this.props

    const lineNumber =
      this.props.showLineNumber && entry.location ? (
        <LineNumber showFileName={showFileName} location={entry.location} />
      ) : null

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
      <div style={this.getComputedStyle()} ref={this.container}>
        {logs.map(this.renderEntry)}
      </div>
    )
  }
}
