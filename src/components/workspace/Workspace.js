import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import Header from './Header'
import Editor from './Editor'
import PlayerFrame from './PlayerFrame'
import Status from './Status'
import Overlay from './Overlay'
import Button from './Button'
import About from './About'
import Tabs from './Tabs'
import TabContainer from './TabContainer'
import Fullscreen from './Fullscreen'
import { getErrorDetails } from '../../utils/ErrorMessage'
import { prefixObject } from '../../utils/PrefixInlineStyles'

import CompilationManager from '../../compilation/CompilationManager'
const compilationManager = new CompilationManager()
// const prettyCompilationManager = new CompilationManager()

// Utilities for determining which compiler worker responses are for the player vs
// the transpiler view, since we encode this information in the filename.
const transpilerPrefix = '@compiler-'
const getTranspilerId = (filename) => `${transpilerPrefix}${filename}`
const isTranspilerId = (filename) => filename.indexOf(transpilerPrefix) === 0

const containsPane = (panes, target) =>
  panes.some(pane => (
    typeof pane === 'string'
      ? pane === target
      : containsPane(pane.children, target)
  ))

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
  },
  column: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
  row: {
    flex: '1',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
})

@pureRender
export default class extends Component {

  static defaultProps = {
    title: 'Live Editor',
    files: {['index.js']: ''},
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
    playerStyleSheet: null,
    playerCSS: null,
    panes: [],
  }

  constructor(props) {
    super()

    const {initialTab, panes} = props

    this.state = {
      compilerError: null,
      runtimeError: null,
      showDetails: false,
      activeTab: initialTab,
      transpilerVisible: containsPane(panes, 'transpiler'),
      playerVisible: containsPane(panes, 'player'),
      compiledFiles: [],
    }

    this.codeCache = {}

    // Map pane names to render methods
    this.paneMap = {
      editor: this.renderEditor,
      transpiler: this.renderTranspiler,
      player: this.renderPlayer,
    }

    compilationManager.on('compile', this.onCompile)
    compilationManager.on('error', this.onCompileError)
  }

  componentWillUnmount() {
    compilationManager.removeListener('compile', this.onCompile)
    compilationManager.removeListener('error', this.onCompileError)
  }

  async componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const {files} = this.props
      const {playerVisible, transpilerVisible} = this.state

      const filesToCompile = []

      // Cache and compile each file
      Object.keys(files).forEach((filename) => {
        const code = files[filename]

        this.codeCache[filename] = code

        if (playerVisible) {
          filesToCompile.push({
            filename,
            code,
            options: {retainLines: true},
          })
        }

        if (transpilerVisible) {
          filesToCompile.push({
            filename: getTranspilerId(filename),
            code,
          })
        }
      })

      compilationManager.compileFiles(filesToCompile)
    }
  }

  runApplication = (files) => {
    const {player} = this
    const {entry} = this.props

    const compiledEntryFile = files.find(file => file.originalFilename === entry)
    if (!compiledEntryFile) return

    const fileMap = Object.assign(
      ...files.map(file => ({[file.filename]: file.code}))
    )

    player.runApplication(fileMap, compiledEntryFile.filename)
  }

  onCompile = (files) => {
    this.setState({compiledFiles: files})

    this.updateStatus('code')
    this.runApplication(files)
  }

  onCompileError = (errors) => {
    const error = errors[0]

    this.updateStatus('error', error)
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
          compilerError: getErrorDetails(error.message)
        })
      break
    }
  }

  onCodeChange = (code) => {
    const {activeTab, transpilerVisible, playerVisible} = this.state

    const filesToCompile = []

    if (playerVisible) {
      filesToCompile.push({
        filename: activeTab,
        code,
        options: {retainLines: true},
      })
    }

    if (transpilerVisible) {
      filesToCompile.push({
        filename: getTranspilerId(activeTab),
        code,
      })
    }

    compilationManager.compileFiles(filesToCompile)

    this.codeCache[activeTab] = code
    this.props.onChange(this.codeCache)
  }

  onToggleDetails = (showDetails) => {
    this.setState({showDetails})
  }

  onPlayerRun = () => {
    this.setState({runtimeError: null})
  }

  // TODO: Runtime errors should indicate which file they're coming from,
  // and only cause a line highlight on that file.
  onPlayerError = (message) => {
    this.setState({runtimeError: getErrorDetails(message)})
  }

  onClickTab = (tab) => {
    this.setState({activeTab: tab})
  }

  renderEditor = (key) => {
    const {files, title, externalStyles, fullscreen} = this.props
    const {compilerError, runtimeError, showDetails, activeTab} = this.state

    const filenames = Object.keys(files)

    const error = compilerError || runtimeError
    const isError = !! error

    return (
      <div key={key} style={styles.editorPane}>
        {title && (
          <Header
            text={title}
            headerStyle={externalStyles.header}
            textStyle={externalStyles.headerText}
          >
            {fullscreen && (
              <Fullscreen textStyle={externalStyles.headerText} />
            )}
          </Header>
        )}
        {filenames.length > 1 && (
          <Tabs
            tabs={filenames}
            activeTab={activeTab}
            onClickTab={this.onClickTab}
            tabStyle={externalStyles.tab}
            textStyle={externalStyles.tabText}
            activeTextStyle={externalStyles.tabTextActive}
          >
            {fullscreen && !title && (
              <Fullscreen textStyle={externalStyles.tabText} />
            )}
          </Tabs>
        )}
        <Editor
          key={activeTab}
          initialValue={files[activeTab]}
          filename={activeTab}
          onChange={this.onCodeChange}
          errorLineNumber={isError && error.lineNumber}
        />
        {showDetails && (
          <div style={styles.overlayContainer}>
            <div style={styles.overlay}>
              <Overlay isError={isError}>
                {isError ? error.description + '\n\n' : ''}
                <About />
              </Overlay>
            </div>
          </div>
        )}
        <Status
          text={isError ? error.summary : 'No Errors'}
          isError={isError}
        >
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
    const {externalStyles, transpilerTitle} = this.props
    const {activeTab, compiledFiles} = this.state

    const file = compiledFiles.find(
      file => file.originalFilename === getTranspilerId(activeTab)
    )

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
          key={getTranspilerId(activeTab)}
          readOnly={true}
          value={file ? file.code : ''}
          filename={getTranspilerId(activeTab)}
        />
      </div>
    )
  }

  renderPlayer = (key) => {
    const {width, scale, platform, assetRoot, vendorComponents, externalStyles, playerStyleSheet, playerCSS} = this.props

    const style = externalStyles.playerPane
      ? {...styles.playerPane, ...externalStyles.playerPane}
      : styles.playerPane

    return (
      <div key={key} style={style}>
        <PlayerFrame
          ref={ref => this.player = ref}
          width={width}
          scale={scale}
          platform={platform}
          assetRoot={assetRoot}
          vendorComponents={vendorComponents}
          playerStyleSheet={playerStyleSheet}
          playerCSS={playerCSS}
          onRun={this.onPlayerRun}
          onError={this.onPlayerError}
        />
      </div>
    )
  }

  renderPane = (pane, i) => {
    const {externalStyles} = this.props

    if (typeof pane === 'string') {
      return this.paneMap[pane](i)
    }

    const {children, type} = pane

    if (type === 'stack') {
      const tabs = children.map((child, i) => ({
        title: typeof child === 'string' ? child : child.title,
        index: i,
        pane: child,
      }))

      return (
        <TabContainer
          tabs={tabs}
          titles={tabs.map(x => x.title)}
          initialTab={tabs[0]}
          tabStyle={externalStyles.tab}
          textStyle={externalStyles.tabText}
          activeTextStyle={externalStyles.tabTextActive}
          renderHiddenContent={true}
          compareTabs={(a, b) => a.index === b.index}
          renderContent={tab => this.renderPane(tab.pane, tab.index)}
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
    const {panes} = this.props

    return (
      <div style={styles.container}>
        {panes.map(this.renderPane)}
      </div>
    )
  }
}
