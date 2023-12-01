import React, { PureComponent, CSSProperties, MutableRefObject } from 'react'
import ReactDOM from 'react-dom'
import { getOptions, requireAddons } from '../../utils/CodeMirror'
import { prefixObject } from '../../utils/Styles'
import PlaygroundPreview from './PlaygroundPreview'
import { tooltipAddon, TooltipValue } from '../../utils/CodeMirrorTooltipAddon'
import Tooltip from './Tooltip'
import type * as CM from 'codemirror'
import type { DiffRange } from '../../utils/Diff'
import { SourceLocation, LogCommand } from '../../types/Messages'
import type * as ts from 'typescript'
import CodeMirror from 'codemirror'
import type { PlaygroundOptions } from './Workspace'
import { extname } from '../../utils/path'

// Import scrollPosIntoView directly. The public API calls the native DOM scrollIntoView,
// which will scroll the parent window when displayed in an iframe.
const { scrollPosIntoView } = require('codemirror/src/display/scrolling')

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

const docCache: Record<string, CM.Doc> = {}

const modeMap: Record<string, string> = {
  '.py': 'python',
  '.css': 'css',
  '.html': 'htmlmixed',
}

function getMode(filename: string): string {
  const ext = extname(filename)
  return modeMap[ext] || 'text/typescript-jsx'
}

export interface Props {
  filename: string
  initialValue: string | null
  value: string | null
  onChange: (value: string) => void
  readOnly: boolean
  showDiff: boolean
  diff: DiffRange[]
  logs?: LogCommand[] // Undefined instead of array to simplify re-rendering,
  playgroundOptions: PlaygroundOptions
  getTypeInfo?: (
    prefixedFilename: string,
    index: number,
    done: (info: ts.QuickInfo) => void
  ) => void
  tooltipStyle?: CSSProperties
  errorLineNumber?: number
}

export default class Editor extends PureComponent<Props> {
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
    playgroundRenderReactElements: false,
  }

  currentDiff: DiffRange[] = []
  cm!: CM.Editor
  editorNode: MutableRefObject<HTMLDivElement | null> = React.createRef()

  componentDidMount() {
    const {
      filename,
      initialValue,
      value,
      readOnly,
      onChange,
      getTypeInfo,
      tooltipStyle,
    } = this.props

    const mode = getMode(filename)

    if (!this.editorNode.current) return

    let toolipPlugin: TooltipValue | undefined

    if (getTypeInfo) {
      tooltipAddon()
      toolipPlugin = {
        getNode: (cm, { index }, callback) => {
          getTypeInfo(
            filename,
            index - 1,
            ({ displayParts, documentation }) => {
              const reactHost = document.createElement('div')
              reactHost.className = 'cm-s-react'

              ReactDOM.render(
                <Tooltip type={displayParts} documentation={documentation} />,
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
      }
    }

    requireAddons()

    if (!docCache[filename]) {
      docCache[filename] = new CodeMirror.Doc(initialValue || value || '', mode)
    }

    this.cm = CodeMirror(this.editorNode.current, {
      ...getOptions(mode),
      ...(typeof toolipPlugin && {
        tooltip: toolipPlugin,
      }),
      readOnly,
      value: docCache[filename].linkedDoc({
        sharedHist: true,
        mode: undefined,
      }),
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

  componentWillUnmount() {
    const { filename } = this.props

    const mode = getMode(filename)

    if (typeof this.updateTimerId !== 'undefined') {
      clearTimeout(this.updateTimerId)
    }

    // Store a reference to the current linked doc
    const linkedDoc = this.cm.getDoc()

    this.cm.swapDoc(new CodeMirror.Doc('', mode))

    // Unlink the doc
    docCache[filename].unlinkDoc(linkedDoc)
  }

  updateTimerId?: ReturnType<typeof setTimeout> = undefined

  componentDidUpdate() {
    const { playgroundOptions } = this.props

    if (this.updateTimerId) {
      clearTimeout(this.updateTimerId)
    }

    this.updateTimerId = setTimeout(() => {
      this.addPlaygroundWidgets()
    }, playgroundOptions.debounceDuration)

    // In the rare case where we get this far and the autoResize plugin hasn't
    // refreshed the display, check if we should manually refresh it once.
    const display = (this.cm as any).display
    if (display.sizer.style.marginLeft === '0px') {
      this.cm.refresh()
    }
  }

  widgets: CM.LineWidget[] = []

  addPlaygroundWidgets() {
    if (!this.cm) return

    const { filename, logs, playgroundOptions } = this.props

    // Skip configuring playgrounds altogether if there are no logs
    if (logs === undefined) return

    // Line numbers start at 1 in the logs and UI, but 0 in CodeMirror
    const editorLine = (location: SourceLocation): number => location.line - 1

    // Take the latest log for each line
    const createLogMap = (logs: LogCommand[]) => {
      return logs
        .filter(
          (log) =>
            log.command === 'log' &&
            log.data.length > 0 &&
            log.location &&
            filename.endsWith(log.location.file)
        )
        .reduce((result: Record<number, LogCommand>, log) => {
          const line = editorLine(log.location)
          result[line] = log
          return result
        }, {})
    }

    const logMap: Record<string, LogCommand> = createLogMap(logs)

    // Remove widgets that aren't needed from CodeMirror
    this.widgets.forEach((widget) => {
      const lineNumber = this.cm.getLineNumber((widget as any).line) as number

      if (logMap[lineNumber]) return

      ReactDOM.unmountComponentAtNode((widget as any).node)

      this.cm.removeLineWidget(widget)
    })

    // Delete widgets from our array of widgets
    this.widgets = this.widgets.filter((widget) => {
      const lineNumber = this.cm.getLineNumber((widget as any).line) as number

      return !!logMap[lineNumber]
    })

    // Create or update all widgets
    Object.values(logMap).forEach((entry: LogCommand) => {
      const { data, location } = entry

      const handle = this.cm.getLineHandle(editorLine(location))

      if (handle) {
        const ensureWidget = () => {
          const found = this.widgets.find(
            (widget) =>
              this.cm.getLineNumber((widget as any).line) ===
              editorLine(location)
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
            data={data}
            didResize={() => {
              if (this.widgets.includes(widget)) {
                widget.changed()
              }
            }}
            playgroundOptions={playgroundOptions}
          />,
          (widget as any).node
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
        const margin = scrollInfo.clientHeight / 2

        if (visibleHeight < scrollInfo.clientHeight) {
          const middleLine = fromLine + Math.floor((toLine - fromLine) / 2)
          scrollPosIntoView(
            this.cm,
            CodeMirror.Pos(middleLine, 0),
            undefined,
            margin
          )
        } else {
          scrollPosIntoView(
            this.cm,
            CodeMirror.Pos(fromLine, 0),
            undefined,
            margin
          )
        }
      }

      this.currentDiff = diff
    }
  }

  componentWillUpdate(nextProps: Props) {
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
        <div style={styles.editor} ref={this.editorNode} />
      </div>
    )
  }
}
