import React, { CSSProperties, PureComponent } from 'react'
import type * as ts from 'typescript'
import type { WorkspaceDiff } from '../../index'
import { ConsoleCommand, LogCommand } from '../../types/Messages'
import { getErrorDetails } from '../../utils/ErrorMessage'
import {
  containsPane,
  EditorPaneOptions,
  Pane,
  StackPaneOptions,
} from '../../utils/Panes'
import {
  columnStyle,
  mergeStyles,
  prefixObject,
  rowStyle,
} from '../../utils/Styles'
import { workerRequest } from '../../utils/WorkerRequest'
import About from './About'
import Button from './Button'
import Editor from './Editor'
import Fullscreen from './Fullscreen'
import Header from './Header'
import Overlay from './Overlay'
import ConsolePane from './panes/ConsolePane'
import PlayerPane from './panes/PlayerPane'
import TranspilerPane, {
  getTranspilerId,
  isTranspilerId,
} from './panes/TranspilerPane'
import WorkspacesPane from './panes/WorkspacesPane'
import PlayerFrame from './PlayerFrame'
import Status from './Status'
import TabContainer from './TabContainer'
import Tabs from './Tabs'

export type BabelWorkerMessage = {
  filename: string
} & (
  | {
      type: 'code'
      code: string
    }
  | {
      type: 'error'
      error: {
        message: string
      }
    }
)

export type TypeScriptRequest =
  | {
      type: 'libs'
      libs: string[]
      types: string[]
    }
  | {
      type: 'file'
      filename: string
      code: string
    }
  | {
      type: 'quickInfo'
      filename: string
      position: number
    }

const BabelWorker = require('../../babel-worker.js')
const babelWorker = new BabelWorker()

interface Tab {
  index: number
  title: string
  changed: boolean
}
const compareTabs = (a: Tab, b: Tab) => a.index === b.index
const getTabTitle = (tab: Tab) => tab.title
const getTabChanged = (tab: Tab) => tab.changed

const findPaneSetIndex = (
  responsivePaneSets: ResponsivePaneSet[],
  windowWidth?: number
): number =>
  windowWidth === undefined
    ? responsivePaneSets.length - 1
    : responsivePaneSets.findIndex((paneSet) => paneSet.maxWidth > windowWidth)

const styles = prefixObject({
  container: rowStyle,
  editorPane: columnStyle,
  overlayContainer: {
    position: 'relative',
    flex: 0,
    height: 0,
    alignItems: 'stretch',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    background: 'rgba(255,255,255,0.95)',
    zIndex: 100,
    left: 4,
    right: 0,
    borderTop: '1px solid #F8F8F8',
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'auto',
    maxHeight: 300,
  },
  column: columnStyle,
  row: rowStyle,
  boldMessage: {
    fontWeight: 'bold',
  },
  codeMessage: {
    display: 'block',
    fontFamily: `'source-code-pro', Menlo, 'Courier New', Consolas, monospace`,
    borderRadius: 4,
    padding: '4px 8px',
    backgroundColor: 'rgba(0,0,0,0.02)',
    border: '1px solid rgba(0,0,0,0.05)',
  },
})

export type ResponsivePaneSet = {
  maxWidth: number
  panes: Pane[]
}

export type PublicError = {
  lineNumber?: number
  errorMessage: string
  summary: string
  description: string
}

interface PlaygroundOptions {
  enabled: boolean
  renderReactElements: boolean
  debounceDuration: number
}

interface TypeScriptOptions {
  enabled: false
  libs?: string[]
  types?: string[]
}

export interface Props {
  title: string
  description: string
  files: Record<string, string>
  entry: string
  initialTab: string
  onChange: (files: Record<string, string>) => void
  externalStyles: Record<string, CSSProperties>
  fullscreen: boolean
  sharedEnvironment: boolean
  responsivePaneSets: ResponsivePaneSet[]
  playgroundOptions: PlaygroundOptions
  typescriptOptions: TypeScriptOptions
  workspaces: Props[]
  diff: Record<string, WorkspaceDiff>
  activeStepIndex: number
  onChangeActiveStepIndex: (index: number) => void
}

interface State {
  compilerError?: PublicError
  runtimeError?: PublicError
  showDetails: boolean
  logs: LogCommand[]
  activeFile: string
  transpilerCache: Record<string, string>
  transpilerVisible: boolean
  playerVisible: boolean
  fileTabs: Tab[]
  activeFileTab?: Tab
  paneSetIndex: number
}

export default class Workspace extends PureComponent<Props, State> {
  static defaultProps = {
    title: 'Live Editor',
    files: { ['index.js']: '' },
    entry: 'index.js',
    initialTab: 'index.js',
    onChange: () => {},
    externalStyles: {},
    fullscreen: false,
    sharedEnvironment: true,
    responsivePaneSets: [],
    // consoleOptions: {},
    playgroundOptions: {},
    typescriptOptions: {},
    workspaces: [],
    diff: {},
    statusBarHeight: 0,
    statusBarColor: 'black',
  }

  codeCache: Record<string, string> = {}
  playerCache: Record<string, string> = {}
  players: Record<string, PlayerFrame> = {}

  constructor(props: Props) {
    super(props)

    const {
      initialTab,
      responsivePaneSets,
      files,
      diff,
      typescriptOptions,
    } = props

    const fileTabs: Tab[] = Object.keys(files).map((filename, index) => {
      return {
        title: filename,
        changed: diff[filename] ? diff[filename].ranges.length > 0 : false,
        index,
      }
    })

    if (
      typescriptOptions.enabled &&
      Object.keys(files).filter((file) => file.match(/\.tsx?/)).length === 0
    ) {
      console.warn('TypeScript is enabled but there are no .ts or .tsx files.')
    }

    let initialWindowWidth

    if (typeof window !== 'undefined') {
      initialWindowWidth = window.outerWidth

      if (responsivePaneSets.length > 1) {
        window.addEventListener('resize', () => {
          const nextIndex = findPaneSetIndex(
            responsivePaneSets,
            window.outerWidth
          )

          if (nextIndex !== this.state.paneSetIndex) {
            this.setState(
              {
                paneSetIndex: nextIndex,
              },
              () => {
                // We may be rendering a different player pane, so we need to re-run
                this.runApplication()
              }
            )
          }
        })
      }
    }

    const paneSetIndex = findPaneSetIndex(
      responsivePaneSets,
      initialWindowWidth
    )
    const panes = responsivePaneSets[paneSetIndex].panes

    this.state = {
      compilerError: undefined,
      runtimeError: undefined,
      showDetails: false,
      logs: [],
      activeFile: initialTab,
      transpilerCache: {},
      transpilerVisible: containsPane(panes, 'transpiler'),
      playerVisible: containsPane(panes, 'player'),
      fileTabs,
      activeFileTab: fileTabs.find((tab) => tab.title === initialTab),
      paneSetIndex,
    }

    babelWorker.addEventListener('message', this.onBabelWorkerMessage)
  }

  componentWillUnmount() {
    babelWorker.removeEventListener('message', this.onBabelWorkerMessage)
  }

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const { files, typescriptOptions } = this.props
      const { playerVisible, transpilerVisible } = this.state

      // Cache and compile each file
      Object.keys(files).forEach((filename) => {
        const code = files[filename]

        this.codeCache[filename] = code

        this.runTypeScriptRequest({
          type: 'libs',
          libs: typescriptOptions.libs || [],
          types: typescriptOptions.types || [],
        })

        this.runTypeScriptRequest({
          type: 'file',
          filename,
          code,
        })

        if (playerVisible) {
          babelWorker.postMessage({
            filename,
            code,
            options: { retainLines: true },
          })
        }

        if (transpilerVisible) {
          babelWorker.postMessage({
            filename: getTranspilerId(filename),
            code,
          })
        }
      })
    }
  }

  runApplication = () => {
    const { entry, files } = this.props

    // Run the app once we've transformed each file at least once
    if (Object.keys(files).every((filename) => this.playerCache[filename])) {
      this.clearLogs()
      Object.values(this.players).forEach((player) => {
        player.runApplication(this.playerCache, entry)
      })
    }
  }

  onBabelWorkerMessage = ({ data }: MessageEvent) => {
    const { playerCache } = this
    const { transpilerCache } = this.state
    const babelMessage = JSON.parse(data) as BabelWorkerMessage

    this.updateStatus(babelMessage)

    if (babelMessage.type === 'code') {
      const { filename, code } = babelMessage

      if (isTranspilerId(filename)) {
        this.setState({
          transpilerCache: {
            ...transpilerCache,
            [filename]: code,
          },
        })
      } else {
        playerCache[filename] = code
        this.runApplication()
      }
    }
  }

  updateStatus = (babelMessage: BabelWorkerMessage) => {
    switch (babelMessage.type) {
      case 'code':
        this.setState({
          compilerError: undefined,
          showDetails: false,
        })
        break
      case 'error':
        this.setState({
          compilerError: getErrorDetails(babelMessage.error.message),
        })
        break
    }
  }

  typeScriptWorker?: Promise<any>

  runTypeScriptRequest = (payload: TypeScriptRequest) => {
    if (!this.props.typescriptOptions.enabled) {
      return Promise.resolve()
    }

    if (!this.typeScriptWorker) {
      this.typeScriptWorker = import(
        '../../typescript-worker.js'
      ).then((worker) => (worker as any).default())
    }

    return this.typeScriptWorker.then((worker: unknown) =>
      workerRequest(worker, payload)
    )
  }

  getTypeScriptInfo = (
    prefixedFilename: string,
    index: number,
    done: (info: ts.QuickInfo) => void
  ): void => {
    const [, filename] = prefixedFilename.split(':')

    this.runTypeScriptRequest({
      type: 'quickInfo',
      filename,
      position: index,
    })
      .then((info?: ts.QuickInfo) => {
        if (info && info.displayParts && info.displayParts.length > 0) {
          done(info)
        }
      })
      .catch((error: unknown) => {
        console.log('Error finding type info', error)
      })
  }

  onCodeChange = (code: string) => {
    const { activeFile, transpilerVisible, playerVisible } = this.state

    this.runTypeScriptRequest({
      type: 'file',
      filename: activeFile,
      code,
    })

    if (playerVisible) {
      babelWorker.postMessage({
        filename: activeFile,
        code,
        options: { retainLines: true },
      })
    }

    if (transpilerVisible) {
      babelWorker.postMessage({
        filename: getTranspilerId(activeFile),
        code,
      })
    }

    this.codeCache[activeFile] = code
    this.props.onChange(this.codeCache)
  }

  onToggleDetails = (showDetails: boolean) => {
    this.setState({ showDetails })
  }

  onPlayerRun = () => {
    this.setState({ runtimeError: undefined })
  }

  // TODO: Runtime errors should indicate which file they're coming from,
  // and only cause a line highlight on that file.
  onPlayerError = (message: string) => {
    this.setState({ runtimeError: getErrorDetails(message) })
  }

  onPlayerConsole = (payload: ConsoleCommand) => {
    const { playgroundOptions } = this.props
    const { logs } = this.state

    // if (consoleOptions.enabled || playgroundOptions.enabled) {
    switch (payload.command) {
      case 'log':
        this.setState({ logs: logs.concat(payload) })
        break
      case 'clear':
        this.clearLogs()
        break
    }
    // }
  }

  clearLogs() {
    const { logs } = this.state

    if (logs.length === 0) return

    this.setState({ logs: [] })
  }

  onClickTab = (tab: Tab) => {
    this.setState({
      activeFile: tab.title,
      activeFileTab: tab,
    })
  }

  renderEditor = (key: number, options: EditorPaneOptions) => {
    const {
      files,
      externalStyles,
      fullscreen,
      activeStepIndex,
      diff,
      playgroundOptions,
      typescriptOptions,
    } = this.props
    const {
      compilerError,
      runtimeError,
      showDetails,
      activeFile,
      activeFileTab,
      fileTabs,
      logs,
    } = this.state

    const { title } = options

    const fileDiff = diff[activeFile] ? diff[activeFile].ranges : []

    const error = compilerError || runtimeError
    const isError = !!error

    const style = mergeStyles(styles.editorPane, options.style)

    return (
      <div key={key} style={style}>
        {title && (
          <Header
            text={title}
            headerStyle={externalStyles.header}
            textStyle={externalStyles.headerText}
          >
            {fullscreen && <Fullscreen textStyle={externalStyles.headerText} />}
          </Header>
        )}
        {fileTabs.length > 1 && (
          <Tabs
            tabs={fileTabs}
            getTitle={getTabTitle}
            getChanged={getTabChanged}
            activeTab={activeFileTab}
            compareTabs={compareTabs}
            onClickTab={this.onClickTab}
            tabStyle={externalStyles.tab}
            textStyle={externalStyles.tabText}
            activeTextStyle={externalStyles.tabTextActive}
            changedTextStyle={externalStyles.tabTextChanged}
          >
            {fullscreen && !title && (
              <Fullscreen textStyle={externalStyles.tabText} />
            )}
          </Tabs>
        )}
        <Editor
          key={activeFile}
          initialValue={files[activeFile]}
          filename={activeStepIndex + ':' + activeFile}
          onChange={this.onCodeChange}
          errorLineNumber={error?.lineNumber}
          showDiff={true}
          diff={fileDiff}
          logs={playgroundOptions.enabled ? logs : undefined}
          playgroundDebounceDuration={playgroundOptions.debounceDuration}
          playgroundRenderReactElements={playgroundOptions.renderReactElements}
          getTypeInfo={
            typescriptOptions.enabled ? this.getTypeScriptInfo : undefined
          }
          tooltipStyle={externalStyles.tooltip}
        />
        {showDetails && (
          <div style={styles.overlayContainer}>
            <div style={styles.overlay}>
              <Overlay isError={isError}>
                {isError ? (
                  <>
                    <b style={styles.boldMessage}>{error?.description}</b>
                    <br />
                    <br />
                    <code style={styles.codeMessage}>
                      {error?.errorMessage}
                    </code>
                    <br />
                  </>
                ) : (
                  ''
                )}
                <About />
              </Overlay>
            </div>
          </div>
        )}
        <Status text={!!error ? error.summary : 'No Errors'} isError={isError}>
          <Button
            active={showDetails}
            isError={isError}
            onChange={this.onToggleDetails}
          >
            {'Show Details'}
          </Button>
        </Status>
      </div>
    )
  }

  renderStack = (key: number, options: StackPaneOptions) => {
    const { externalStyles } = this.props

    const { children } = options

    const tabs: (Tab & { pane: Pane })[] = children.map((pane, i) => ({
      title: pane.title || pane.type,
      index: i,
      pane,
      changed: false,
    }))

    return (
      <TabContainer
        key={key}
        tabs={tabs}
        getTitle={getTabTitle}
        initialTab={tabs[0]}
        tabStyle={externalStyles.stackTab || externalStyles.tab}
        textStyle={externalStyles.stackTabText || externalStyles.tabText}
        activeTextStyle={
          externalStyles.stackTabTextActive || externalStyles.tabTextActive
        }
        renderHiddenContent={true}
        compareTabs={compareTabs}
        renderContent={(tab) => this.renderPane(tab.pane, tab.index)}
      />
    )
  }

  renderPane = (options: Pane, key: number) => {
    const {
      files,
      externalStyles,
      sharedEnvironment,
      workspaces,
      activeStepIndex,
      onChangeActiveStepIndex,
    } = this.props
    const { logs, transpilerCache, activeFile } = this.state

    switch (options.type) {
      case 'editor':
        return this.renderEditor(key, options)
      case 'transpiler':
        return (
          <TranspilerPane
            key={key}
            options={options}
            externalStyles={externalStyles}
            transpilerCache={transpilerCache}
            activeFile={activeFile}
          />
        )
      case 'player':
        return (
          <PlayerPane
            ref={(player) => {
              if (player) {
                this.players[options.id] = player
              } else {
                delete this.players[options.id]
              }
            }}
            key={key}
            options={options}
            externalStyles={externalStyles}
            sharedEnvironment={sharedEnvironment}
            files={files}
            logs={logs}
            onPlayerRun={this.onPlayerRun}
            onPlayerError={this.onPlayerError}
            onPlayerConsole={this.onPlayerConsole}
          />
        )
      case 'workspaces':
        return (
          <WorkspacesPane
            key={key}
            options={options}
            externalStyles={externalStyles}
            workspaces={workspaces}
            activeStepIndex={activeStepIndex}
            onChangeActiveStepIndex={onChangeActiveStepIndex}
          />
        )
      case 'stack':
        return this.renderStack(key, options)
      case 'console':
        return (
          <ConsolePane
            key={key}
            options={options}
            externalStyles={externalStyles}
            files={files}
            logs={logs}
          />
        )
      default:
        return `Unknown pane type: ${options['type']}`
    }
  }

  render() {
    const { responsivePaneSets } = this.props
    const { paneSetIndex } = this.state
    const panes = responsivePaneSets[paneSetIndex].panes

    return <div style={styles.container}>{panes.map(this.renderPane)}</div>
  }
}
