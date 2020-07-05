import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { options, requireAddons } from '../../utils/CodeMirror'
import { prefixObject } from '../../utils/PrefixInlineStyles'
import PlaygroundPreview from './PlaygroundPreview'
import { tooltipAddon } from '../../utils/CodeMirrorTooltipAddon'
import Tooltip from './Tooltip'

require('codemirror/lib/codemirror.css')
require('../../styles/codemirror-theme.css')

// Work around a codemirror + flexbox + chrome issue by creating an absolute
// positioned parent and flex grandparent of the codemirror element.
// https://github.com/jlongster/debugger.html/issues/63
const styles = prefixObject({
  editorContainer: {
    display: 'flex',
    position: 'relative',
    flex: '1',
    minWidth: 0,
    minHeight: 0,
  },
  editor: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
})

const docCache = {}

export default class extends PureComponent {
  static defaultProps = {
    initialValue: null,
    value: null,
    onChange: () => {},
    readOnly: false,
    showDiff: false,
    diff: [],
    logs: undefined, // Undefined instead of array to simplify re-rendering,
    playgroundDebounceDuration: 200,
    getTypeInfo: undefined,
    tooltipStyle: undefined,
  }

  currentDiff = []

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const {
        filename,
        initialValue,
        value,
        readOnly,
        onChange,
        getTypeInfo,
        tooltipStyle,
      } = this.props

      if (getTypeInfo) {
        tooltipAddon()
      }

      requireAddons()
      const CodeMirror = require('codemirror')

      if (!docCache[filename]) {
        docCache[filename] = new CodeMirror.Doc(
          initialValue || value || '',
          options.mode
        )
      }

      this.cm = CodeMirror(this.refs.editor, {
        ...options,
        ...(getTypeInfo && {
          tooltip: {
            getNode: (cm, { index }, callback) => {
              getTypeInfo(
                filename,
                index - 1,
                ({ displayParts, documentation }) => {
                  const reactHost = document.createElement('div')
                  reactHost.className = 'cm-s-react'

                  ReactDOM.render(
                    <Tooltip
                      type={displayParts}
                      documentation={documentation}
                    />,
                    reactHost
                  )

                  callback(reactHost)
                }
              )
            },
            removeNode: (node) => {
              ReactDOM.unmountComponentAtNode(node)
            },
            style: tooltipStyle,
          },
        }),
        readOnly,
        value: docCache[filename].linkedDoc({ sharedHist: true }),
      })

      this.cm.on('beforeChange', (cm) => {
        this.currentDiff.forEach((range) => {
          for (let i = range[0]; i <= range[1]; i++) {
            this.cm.removeLineClass(i, 'background', 'cm-line-changed')
            this.cm.removeLineClass(i, 'gutter', 'cm-line-changed')
          }
        })
      })

      this.cm.on('changes', (cm) => {
        onChange(cm.getValue())
      })

      // If this document is unmodified, highlight the diff
      const historySize = docCache[filename].historySize()

      if (historySize.undo === 0) {
        this.highlightDiff()
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.updateTimerId)

    if (typeof navigator !== 'undefined') {
      const { filename } = this.props
      const CodeMirror = require('codemirror')

      // Store a reference to the current linked doc
      const linkedDoc = this.cm.doc

      this.cm.swapDoc(new CodeMirror.Doc('', options.mode))

      // Unlink the doc
      docCache[filename].unlinkDoc(linkedDoc)
    }
  }

  updateTimerId = undefined

  componentDidUpdate() {
    const { playgroundDebounceDuration } = this.props

    if (this.updateTimerId) {
      clearTimeout(this.updateTimerId)
    }

    this.updateTimerId = setTimeout(() => {
      this.addPlaygroundWidgets()
    }, playgroundDebounceDuration)
  }

  widgets = []

  addPlaygroundWidgets() {
    if (!this.cm) return

    const { filename, logs, playgroundRenderReactElements } = this.props

    // Skip configuring playgrounds altogether if there are no logs
    if (logs === undefined) return

    // Line numbers start at 1 in the logs and UI, but 0 in CodeMirror
    const editorLine = (location) => location.line - 1

    // Take the latest log for each line
    const createLogMap = (logs) => {
      return logs
        .filter(
          (log) =>
            log.command === 'log' &&
            log.data.length > 0 &&
            log.location &&
            filename.endsWith(log.location.file)
        )
        .reduce((result, log) => {
          result[editorLine(log.location)] = log
          return result
        }, {})
    }

    const logMap = createLogMap(logs)

    // Remove widgets that aren't needed from CodeMirror
    this.widgets.forEach((widget) => {
      const lineNumber = this.cm.getLineNumber(widget.line)

      if (logMap[lineNumber]) return

      ReactDOM.unmountComponentAtNode(widget.node)

      this.cm.removeLineWidget(widget)
    })

    // Delete widgets from our array of widgets
    this.widgets = this.widgets.filter((widget) => {
      const lineNumber = this.cm.getLineNumber(widget.line)

      return !!logMap[lineNumber]
    })

    // Create or update all widgets
    Object.values(logMap).forEach((entry) => {
      const { data, location } = entry

      const handle = this.cm.getLineHandle(editorLine(location))

      if (handle) {
        const ensureWidget = () => {
          const found = this.widgets.find(
            (widget) =>
              this.cm.getLineNumber(widget.line) === editorLine(location)
          )

          if (found) return found

          const reactHost = document.createElement('div')

          const widget = this.cm.addLineWidget(handle, reactHost, {
            noHScroll: true,
            coverGutter: false,
          })

          this.widgets.push(widget)

          return widget
        }

        const widget = ensureWidget()

        ReactDOM.render(
          <PlaygroundPreview
            indent={4 + location.column * this.cm.defaultCharWidth()}
            renderReactElements={playgroundRenderReactElements}
            data={data}
            didResize={() => {
              if (this.widgets.includes(widget)) {
                widget.changed()
              }
            }}
          />,
          widget.node
        )
      }
    })
  }

  highlightDiff() {
    const CodeMirror = require('codemirror')

    if (!this.cm) return

    const { showDiff, diff } = this.props

    if (showDiff) {
      diff.forEach((range) => {
        for (let i = range[0]; i <= range[1]; i++) {
          this.cm.addLineClass(i, 'gutter', 'cm-line-changed')
          this.cm.addLineClass(i, 'background', 'cm-line-changed')
        }
      })

      if (diff.length > 0) {
        const scrollInfo = this.cm.getScrollInfo()

        const fromLine = diff[0][0]
        const toLine = diff[diff.length - 1][1]

        const fromHeight = this.cm.heightAtLine(fromLine)
        const toHeight = this.cm.heightAtLine(toLine)

        const visibleHeight = toHeight - fromHeight

        if (visibleHeight < scrollInfo.clientHeight) {
          const middleLine = fromLine + Math.floor((toLine - fromLine) / 2)
          this.cm.scrollIntoView(
            CodeMirror.Pos(middleLine, 0),
            scrollInfo.clientHeight / 2
          )
        } else {
          this.cm.scrollIntoView(
            CodeMirror.Pos(fromLine, 0),
            scrollInfo.clientHeight / 2
          )
        }
      }

      this.currentDiff = diff
    }
  }

  componentWillUpdate(nextProps) {
    const { errorLineNumber: nextLineNumber, value } = nextProps
    const { errorLineNumber: prevLineNumber } = this.props

    if (this.cm) {
      if (typeof prevLineNumber === 'number') {
        this.cm.removeLineClass(prevLineNumber, 'background', 'cm-line-error')
      }

      if (typeof nextLineNumber === 'number') {
        this.cm.addLineClass(nextLineNumber, 'background', 'cm-line-error')
      }

      const oldValue = this.cm.getValue()

      if (typeof value === 'string' && value !== oldValue) {
        this.cm.setValue(value)
      }
    }
  }

  render() {
    const { readOnly } = this.props

    return (
      <div
        style={styles.editorContainer}
        className={readOnly ? 'read-only' : undefined}
      >
        <div style={styles.editor} ref={'editor'} />
      </div>
    )
  }
}
