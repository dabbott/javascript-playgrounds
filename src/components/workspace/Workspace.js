import React, { PureComponent } from 'react'
import { getErrorDetails } from '../../utils/ErrorMessage'
import { prefixObject } from '../../utils/PrefixInlineStyles'
import About from './About'
import Button from './Button'
import Console from './Console'
import Editor from './Editor'
import Fullscreen from './Fullscreen'
import Header from './Header'
import Overlay from './Overlay'
import PlayerFrame from './PlayerFrame'
import Status from './Status'
import TabContainer from './TabContainer'
import Tabs from './Tabs'
import WorkspacesList from './WorkspacesList'
import { workerRequest } from '../../utils/WorkerRequest'

const BabelWorker = require('../../babel-worker.js')
const babelWorker = new BabelWorker()

// Utilities for determining which babel worker responses are for the player vs
// the transpiler view, since we encode this information in the filename.
const transpilerPrefix = '@babel-'
const getTranspilerId = (filename) => `${transpilerPrefix}${filename}`
const isTranspilerId = (filename) => filename.indexOf(transpilerPrefix) === 0

const compareTabs = (a, b) => a.index === b.index
const getTabTitle = (tab) => tab.title
const getTabChanged = (tab) => tab.changed

const containsPane = (panes, target) =>
  panes.some((pane) =>
    typeof pane === 'string'
      ? pane === target
      : containsPane(pane.children, target)
  )

const styles = prefixObject({
  container: {
    flex: '1',
    display: 'flex',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
  },
  editorPane: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden', // Clip box shadows
  },
  transpilerPane: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden', // Clip box shadows
  },
  playerPane: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    marginLeft: 10,
    marginRight: 10,
  },
  workspacesPane: {
    width: 220,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden', // Clip box shadows
  },
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
  column: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  row: {
    flex: '1',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
  },
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

export default class extends PureComponent {
  static defaultProps = {
    title: 'Live Editor',
    files: { ['index.js']: '' },
    entry: 'index.js',
    initialTab: 'index.js',
    onChange: () => {},
    platform: null,
    scale: null,
    width: null,
    assetRoot: null,
    vendorComponents: [],
    externalStyles: {},
    fullscreen: false,
    sharedEnvironment: true,
    playerStyleSheet: null,
    playerCSS: null,
    panes: [],
    consoleOptions: {},
    playgroundOptions: {},
    typescriptOptions: {},
    workspaces: [],
    diff: {},
    statusBarHeight: 0,
    statusBarColor: 'black',
  }

  constructor(props) {
    super()

    const {
      initialTab,
      panes,
      consoleOptions,
      files,
      diff,
      typescriptOptions,
    } = props

    const fileTabs = Object.keys(files).map((filename, index) => {
      return {
        title: filename,
        changed: diff[filename] && diff[filename].ranges.length > 0,
        index,
      }
    })

    if (
      typescriptOptions.enabled &&
      Object.keys(files).filter((file) => file.match(/\.tsx?/)).length === 0
    ) {
      console.warn('TypeScript is enabled but there are no .ts or .tsx files.')
    }

    this.state = {
      compilerError: null,
      runtimeError: null,
      showDetails: false,
      showLogs: consoleOptions.visible,
      logs: [],
      activeFile: initialTab,
      transpilerCache: {},
      transpilerVisible: containsPane(panes, 'transpiler'),
      playerVisible: containsPane(panes, 'player'),
      fileTabs,
      activeFileTab: fileTabs.find((tab) => tab.title === initialTab),
    }

    this.codeCache = {}
    this.playerCache = {}

    // Map pane names to render methods
    this.paneMap = {
      editor: this.renderEditor,
      transpiler: this.renderTranspiler,
      player: this.renderPlayer,
      workspaces: this.renderWorkspaces,
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
    const { playerCache, player } = this
    const { entry } = this.props

    player.runApplication(playerCache, entry)
  }

  onBabelWorkerMessage = ({ data }) => {
    const { playerCache } = this
    const { files } = this.props
    const { transpilerCache } = this.state
    const { filename, type, code, error } = JSON.parse(data)

    this.updateStatus(type, error)

    if (type === 'code') {
      if (isTranspilerId(filename)) {
        this.setState({
          transpilerCache: {
            ...transpilerCache,
            [filename]: code,
          },
        })
      } else {
        playerCache[filename] = code

        // Run the app once we've transformed each file at least once
        if (Object.keys(files).every((filename) => playerCache[filename])) {
          this.clearLogs()
          this.runApplication()
        }
      }
    }
  }

  updateStatus = (type, error) => {
    switch (type) {
      case 'code':
        this.setState({
          compilerError: null,
          showDetails: false,
        })
        break
      case 'error':
        this.setState({
          compilerError: getErrorDetails(error.message),
        })
        break
    }
  }

  runTypeScriptRequest = (payload) => {
    if (!this.props.typescriptOptions.enabled) {
      return Promise.resolve()
    }

    if (!this.typeScriptWorker) {
      this.typeScriptWorker = import(
        '../../typescript-worker.js'
      ).then((worker) => worker.default())
    }

    return this.typeScriptWorker.then((worker) =>
      workerRequest(worker, payload)
    )
  }

  getTypeScriptInfo = (prefixedFilename, index, done) => {
    const [, filename] = prefixedFilename.split(':')

    this.runTypeScriptRequest({
      type: 'quickInfo',
      filename,
      position: index,
    })
      .then((info) => {
        if (info && info.displayParts.length > 0) {
          done(info)
        }
      })
      .catch((error) => {
        console.log('Error finding type info', error)
      })
  }

  onCodeChange = (code) => {
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

  onToggleDetails = (showDetails) => {
    this.setState({ showDetails })
  }

  onToggleLogs = (showLogs) => {
    this.setState({ showLogs })
  }

  onPlayerRun = () => {
    this.setState({ runtimeError: null })
  }

  // TODO: Runtime errors should indicate which file they're coming from,
  // and only cause a line highlight on that file.
  onPlayerError = (message) => {
    this.setState({ runtimeError: getErrorDetails(message) })
  }

  onPlayerConsole = (payload) => {
    const { consoleOptions, playgroundOptions } = this.props
    const { logs } = this.state

    if (consoleOptions.enabled || playgroundOptions.enabled) {
      const { command } = payload

      switch (command) {
        case 'log':
          this.setState({ logs: logs.concat(payload) })
          break
        case 'clear':
          this.clearLogs()
          break
      }
    }
  }

  clearLogs() {
    const { logs } = this.state

    if (logs.length === 0) return

    this.setState({ logs: [] })
  }

  onClickTab = (tab) => {
    this.setState({
      activeFile: tab.title,
      activeFileTab: tab,
    })
  }

  renderEditor = (key) => {
    const {
      files,
      title,
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

    const fileDiff = diff[activeFile] ? diff[activeFile].ranges : []

    const error = compilerError || runtimeError
    const isError = !!error

    return (
      <div key={key} style={styles.editorPane}>
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
          errorLineNumber={isError && error.lineNumber}
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
                  <React.Fragment>
                    <b style={styles.boldMessage}>{error.description}</b>
                    <br />
                    <br />
                    <code style={styles.codeMessage}>{error.errorMessage}</code>
                    <br />
                  </React.Fragment>
                ) : (
                  ''
                )}
                <About />
              </Overlay>
            </div>
          </div>
        )}
        <Status text={isError ? error.summary : 'No Errors'} isError={isError}>
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

  renderTranspiler = (key) => {
    const { externalStyles, transpilerTitle } = this.props
    const { activeFile, transpilerCache } = this.state

    return (
      <div key={key} style={styles.transpilerPane}>
        {transpilerTitle && (
          <Header
            text={transpilerTitle}
            headerStyle={externalStyles.transpilerHeader}
            textStyle={externalStyles.transpilerHeaderText}
          />
        )}
        <Editor
          key={getTranspilerId(activeFile)}
          readOnly={true}
          value={transpilerCache[getTranspilerId(activeFile)]}
          filename={getTranspilerId(activeFile)}
        />
      </div>
    )
  }

  renderWorkspaces = (key) => {
    const {
      externalStyles,
      workspacesTitle,
      workspaces,
      activeStepIndex,
      onChangeActiveStepIndex,
    } = this.props

    const style = externalStyles.workspacesPane
      ? { ...styles.workspacesPane, ...externalStyles.workspacesPane }
      : styles.workspacesPane

    return (
      <div key={key} style={style}>
        {workspacesTitle && (
          <Header
            text={workspacesTitle}
            headerStyle={externalStyles.workspacesHeader}
            textStyle={externalStyles.workspacesHeaderText}
          />
        )}
        <WorkspacesList
          key={key}
          steps={workspaces}
          activeStepIndex={activeStepIndex}
          onChangeActiveStepIndex={onChangeActiveStepIndex}
          style={externalStyles.workspacesList}
          rowStyle={externalStyles.workspacesRow}
          rowTitleStyle={externalStyles.workspacesRowTitle}
          descriptionStyle={externalStyles.workspacesDescription}
          descriptionTextStyle={externalStyles.workspacesDescriptionText}
          buttonTextStyle={externalStyles.workspacesButtonText}
          buttonContainerStyle={externalStyles.workspacesButtonContainer}
          buttonWrapperStyle={externalStyles.workspacesButtonWrapper}
          dividerStyle={externalStyles.workspacesDivider}
        />
      </div>
    )
  }

  renderPlayer = (key) => {
    const {
      files,
      width,
      scale,
      platform,
      assetRoot,
      vendorComponents,
      externalStyles,
      playerStyleSheet,
      playerCSS,
      playerTitle,
      consoleOptions,
      statusBarHeight,
      statusBarColor,
      sharedEnvironment,
    } = this.props
    const { showLogs, logs } = this.state

    const style = externalStyles.playerPane
      ? { ...styles.playerPane, ...externalStyles.playerPane }
      : styles.playerPane

    return (
      <div key={key} style={style}>
        {playerTitle && (
          <Header
            text={playerTitle}
            headerStyle={externalStyles.playerHeader}
            textStyle={externalStyles.playerHeaderText}
          />
        )}
        <div style={styles.column}>
          <div style={styles.row}>
            <PlayerFrame
              ref={(ref) => (this.player = ref)}
              width={width}
              scale={scale}
              platform={platform}
              assetRoot={assetRoot}
              vendorComponents={vendorComponents}
              playerStyleSheet={playerStyleSheet}
              playerCSS={playerCSS}
              statusBarHeight={statusBarHeight}
              statusBarColor={statusBarColor}
              sharedEnvironment={sharedEnvironment}
              onRun={this.onPlayerRun}
              onError={this.onPlayerError}
              onConsole={this.onPlayerConsole}
            />
            {consoleOptions.enabled && showLogs && (
              <Console
                style={externalStyles.consolePane}
                rowStyle={externalStyles.consoleRow}
                maximize={consoleOptions.maximized}
                showFileName={
                  Object.keys(files).length > 1 && consoleOptions.showFileName
                }
                showLineNumber={consoleOptions.showLineNumber}
                logs={logs}
                renderReactElements={consoleOptions.renderReactElements}
              />
            )}
          </div>
          {consoleOptions.enabled && consoleOptions.collapsible !== false && (
            <Status text={'Logs' + (showLogs ? '' : ` (${logs.length})`)}>
              <Button active={showLogs} onChange={this.onToggleLogs}>
                {'Show Logs'}
              </Button>
            </Status>
          )}
        </div>
      </div>
    )
  }

  renderPane = (pane, i) => {
    const { externalStyles } = this.props

    if (typeof pane === 'string') {
      return this.paneMap[pane](i)
    }

    const { children, type } = pane

    if (type === 'stack') {
      const tabs = children.map((child, i) => ({
        title: typeof child === 'string' ? child : child.title,
        index: i,
        pane: child,
      }))

      return (
        <TabContainer
          tabs={tabs}
          getTitle={getTabTitle}
          initialTab={tabs[0]}
          tabStyle={externalStyles.tab}
          textStyle={externalStyles.tabText}
          activeTextStyle={externalStyles.tabTextActive}
          renderHiddenContent={true}
          compareTabs={compareTabs}
          renderContent={(tab) => this.renderPane(tab.pane, tab.index)}
        />
      )
    }

    return (
      <div key={i} style={styles[type === 'row' ? 'row' : 'column']}>
        {children.map(this.renderPane)}
      </div>
    )
  }

  render() {
    const { panes } = this.props

    return <div style={styles.container}>{panes.map(this.renderPane)}</div>
  }
}
