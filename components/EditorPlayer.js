import React, { Component } from 'react';
// import ReactDOM from 'react-dom/server';
import Tabs from './Tabs'
import PlayerFrame from './PlayerFrame'
import { options, requireAddons } from '../constants/CodeMirror'

// Styles
require("../node_modules/codemirror/lib/codemirror.css")
require("../styles/codemirror-theme.css")

const Babel = require('babel-standalone')

const playerWidth = 400
const editorHeight = 600

const styles = {
  container: {
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
  },
  left: {
    flex: `1 1 auto`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
  },
  right: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 0,
    minHeight: 0,
    marginLeft: 10,
    marginRight: 10,
  },
  // Work around a codemirror + flexbox + chrome issue by creating an absolute
  // positioned parent and flex grandparent of the codemirror element.
  // https://github.com/jlongster/debugger.html/issues/63
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
  err: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    overflow: 'auto',
    borderTop: '1px solid whitesmoke',
    color: '#ac4142',
    padding: '15px 20px',
    whiteSpace: 'pre',
    fontFamily: 'monospace',
    zIndex: 1,
  },
}

export default class EditorTranspiler extends Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const value = typeof this.props.value === 'string' ? this.props.value :
          this.props.value.join('\n')

      requireAddons()

      this.cm1 = require('codemirror')(
        this.refs.editor,
        Object.assign({}, options, {
          value,
        })
      )

      this.cm1.on('changes', (cm) => {
        this.runApplication(cm)
      })

      this.cm1.setSize('100%', '100%')

      this.runApplication(this.cm1)
    }
  }

  runApplication(code) {
    const compiled = this.compile(code)

    if (compiled) {
      this.refs.player.runApplication(compiled)
    }
  }

  compile(cm) {
    try {
      const code = Babel.transform(cm.getValue(), {
        presets: ['es2015', 'react'],
        retainLines: true,
      }).code

      this.setState({
        compilerError: null
      })

      return code
    } catch (e) {
      this.setState({
        compilerError: e.message.replace('unknown', e.name)
      })
    }

    return null
  }

  renderError() {
    const {compilerError, runtimeError} = this.state
    const e = compilerError || runtimeError

    if (e) {
      return (
        <div style={styles.err}>
          {e}
        </div>
      )
    }

    return null
  }

  render() {
    const {inputHeader} = this.props

    return (
      <div style={styles.container}>
        <div style={styles.left}>
          <Tabs
            tabs={['Live JSX Editor', 'Compiled JS']}
            active={'Live JSX Editor'}
          />
          <div style={styles.editorContainer}>
            <div style={styles.editor} ref={'editor'} />
          </div>
        </div>
        <div style={styles.right}>
          {this.renderError()}
          <PlayerFrame ref={'player'}
            width={playerWidth}
            height={editorHeight}
            onRun={() => {
              this.setState({runtimeError: null})
            }}
            onError={(e) => {
              this.setState({runtimeError: e})
            }}/>
        </div>
      </div>
    )
  }
}
