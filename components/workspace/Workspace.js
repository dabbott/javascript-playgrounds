import React, { Component } from 'react';

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

export default class extends Component {

  static defaultProps = {
    value: '',
    title: 'Live Editor',
    showHeader: true,
  }

  constructor(props) {
    super(props)
    this.state = {
      compilerError: null,
      runtimeError: null,
      showDetails: false,
    }
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
          compilerError: error.message
        })
      break
    }
  }

  render() {
    const {value, title, showHeader} = this.props
    const {compilerError, runtimeError, showDetails} = this.state

    const error = compilerError || runtimeError
    const isError = !! error
    const errorDetails = isError && getErrorDetails(error)

    return (
      <div style={styles.container}>
        <div style={styles.left}>
          {showHeader && (
            <Header
              text={title}
            />
          )}
          <Editor
            value={value}
            onChange={(value) => {
              babelWorker.postMessage(value)
            }}
            errorLineNumber={isError && errorDetails.lineNumber}
          />
          {showDetails && (
            <div style={styles.overlayContainer}>
              <div style={styles.overlay}>
                <Overlay isError={isError}>
                  {isError ? errorDetails.description + '\n\n' : ''}
                  <About />
                </Overlay>
              </div>
            </div>
          )}
          <Status
            text={isError ? errorDetails.summary : 'No Errors'}
            isError={isError}
          >
            <Button
              active={showDetails}
              isError={isError}
              onChange={() => this.setState({showDetails: ! showDetails})}
            >
              {'Show Details'}
            </Button>
          </Status>
        </div>
        <div style={styles.right}>
          <PlayerFrame
            ref={'player'}
            width={210}
            onRun={() => {
              this.setState({runtimeError: null})
            }}
            onError={(e) => {
              this.setState({runtimeError: e})
            }}
          />
        </div>
      </div>
    )
  }
}
