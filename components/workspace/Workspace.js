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
import { getErrorDetails } from '../../utils/ErrorMessage'
import { prefixObject } from '../../utils/PrefixInlineStyles'

const BabelWorker = require("worker!../../babel-worker.js")
const babelWorker = new BabelWorker()

const styles = prefixObject({
  container: {
    flex: '1',
    display: 'flex',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
  },
  left: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
  },
  right: {
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
})

@pureRender
export default class extends Component {

  static defaultProps = {
    title: 'Live Editor',
    initialTab: 'index.js',
    files: [['index.js', '']],
    onChange: () => {},
    platform: null,
    scale: null,
    width: null,
    assetRoot: null,
    vendorComponents: [],
  }

  constructor(props) {
    super()

    const {initialTab, files} = props

    this.state = {
      compilerError: null,
      runtimeError: null,
      showDetails: false,
      activeTab: files.find(
        ([filename]) => filename === initialTab
      ) ? initialTab : 'index.js',
    }

    this.codeCache = {}
    this.babelCache = {}

    babelWorker.addEventListener("message", this.onBabelWorkerMessage)
  }

  componentWillUnmount() {
    babelWorker.removeEventListener("message", this.onBabelWorkerMessage)
  }

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const {files} = this.props

      // Cache and compile each file
      files.forEach(([filename, code]) => {
        this.codeCache[filename] = code
        babelWorker.postMessage({filename, code})
      })
    }
  }

  runApplication = (value) => {
    this.refs.player.runApplication(value)
  }

  onBabelWorkerMessage = ({data}) => {
    const {babelCache} = this
    const {files} = this.props
    const {filename, type, code, error} = JSON.parse(data)

    this.updateStatus(type, error)

    if (type === 'code') {
      babelCache[filename] = code

      // Run the app once we've transformed each file at least once
      if (Object.keys(babelCache).length >= files.length) {
        this.runApplication(babelCache)
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
          compilerError: getErrorDetails(error.message)
        })
      break
    }
  }

  onCodeChange = (value) => {
    const {activeTab} = this.state

    babelWorker.postMessage({
      filename: activeTab,
      code: value,
    })

    this.codeCache[activeTab] = value
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

  getFileCode = (filename) => {
    const {files} = this.props

    return files.find(([name]) => name === filename)[1]
  }

  render() {
    const {files, title, platform, scale, width, assetRoot, vendorComponents} = this.props
    const {compilerError, runtimeError, showDetails, activeTab} = this.state

    const error = compilerError || runtimeError
    const isError = !! error

    return (
      <div style={styles.container}>
        <div style={styles.left}>
          {title && (
            <Header
              text={title}
            />
          )}
          {files.length > 1 && (
            <Tabs
              tabs={files.map(([name]) => name)}
              activeTab={activeTab}
              onClickTab={this.onClickTab}
            />
          )}
          <Editor
            key={activeTab}
            initialValue={this.getFileCode(activeTab)}
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
        <div style={styles.right}>
          <PlayerFrame
            ref={'player'}
            width={width}
            scale={scale}
            platform={platform}
            assetRoot={assetRoot}
            vendorComponents={vendorComponents}
            onRun={this.onPlayerRun}
            onError={this.onPlayerError}
          />
        </div>
      </div>
    )
  }
}
