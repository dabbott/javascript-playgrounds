import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import Header from './Header'
import Editor from './Editor'
import PlayerFrame from './PlayerFrame'
import Status from './Status'
import Overlay from './Overlay'
import Button from './Button'
import About from './About'
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
    value: '',
    title: 'Live Editor',
    onChange: () => {},
    platform: null,
    scale: null,
    width: null,
    assetRoot: null,
    runApp: null,
  }

  constructor(props) {
    super(props)
    this.state = {
      compilerError: null,
      runtimeError: null,
      showDetails: false,
    }
    this.onCodeChange = this.onCodeChange.bind(this)
    this.onToggleDetails = this.onToggleDetails.bind(this)
    this.onPlayerRun = this.onPlayerRun.bind(this)
    this.onPlayerError = this.onPlayerError.bind(this)
    this.onBabelWorkerMessage = this.onBabelWorkerMessage.bind(this)
    babelWorker.addEventListener("message", this.onBabelWorkerMessage)
  }

  componentWillUnmount() {
    babelWorker.removeEventListener("message", this.onBabelWorkerMessage)
  }

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const {value} = this.props
      babelWorker.postMessage(value)
    }
  }

  runApplication(value) {
    this.refs.player.runApplication(value)
  }

  onBabelWorkerMessage({data}) {
    this.onCompile(JSON.parse(data))
  }

  onCompile(data) {
    switch (data.type) {
      case 'code':
        this.setState({
          compilerError: null,
          showDetails: false,
        })

        const {code} = data

        if (code) {
          this.runApplication(code)
        }
      break
      case 'error':
        const {error} = data

        this.setState({
          compilerError: getErrorDetails(error.message)
        })
      break
    }
  }

  onCodeChange(value) {
    babelWorker.postMessage(value)
    this.props.onChange(value)
  }

  onToggleDetails(showDetails) {
    this.setState({showDetails})
  }

  onPlayerRun() {
    this.setState({runtimeError: null})
  }

  onPlayerError(message) {
    this.setState({runtimeError: getErrorDetails(message)})
  }

  render() {
    const {value, title, platform, scale, width, assetRoot, runApp} = this.props
    const {compilerError, runtimeError, showDetails} = this.state

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
          <Editor
            value={value}
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
            runApp={runApp}
            onRun={this.onPlayerRun}
            onError={this.onPlayerError}
          />
        </div>
      </div>
    )
  }
}
