import React, { Component } from 'react';
import ReactDOM from 'react-dom/server';

import { options, readOnlyOptions, requireAddons } from '../constants/CodeMirror'

const Babel = require('babel-standalone')

const widgetContainerStyle = {
  margin: '20px 0px 30px 0px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  height: 330,
  minWidth: 0,
  minHeight: 0,
}

const widgetStyle = {
  // width: 'calc(50%)',
  // display: 'inline-block',
  flex: '0 0 50%',
  // position: 'relative',
  minWidth: 0,
  minHeight: 0,
}

const cmHeaderStyle = {
  backgroundColor: 'rgb(245,245,245)',
  color: 'rgba(0,0,0,0.8)',
  height: 40,
  paddingTop: 10,
  paddingLeft: 20,
  paddingBottom: 10,
}

const outputHeaderStyle = {
  backgroundColor: 'white',
  color: 'rgba(0,0,0,0.8)',
  height: 40,
  paddingTop: 10,
  paddingLeft: 20,
  paddingBottom: 10,
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
        this.refs.cmBlockScopedVariables,
        Object.assign({}, options, {
          value,
        })
      )

      this.cm2 = require('codemirror')(
        this.refs.cmBlockScopedVariablesOutput,
        readOnlyOptions
      )

      this.cm1.on('changes', (cm) => {
        this.compile(cm)
      })

      this.compile(this.cm1)
    }
  }

  compile(cm) {
    try {
      if (this.panel) {
        this.panel.clear()
        delete this.panel
      }

      const code = Babel.transform(cm.getValue(), { presets: ['es2015', 'react'] }).code
      this.cm2.setValue(code)
    } catch (e) {
      const div = document.createElement('div')
      div.setAttribute('style', 'overflow: auto; border-top: 1px solid whitesmoke;')
      div.innerHTML = ReactDOM.renderToStaticMarkup(
        <div style={{
          color: '#ac4142',
          padding: '15px 20px',
          whiteSpace: 'pre',
          fontFamily: 'monospace',
        }}>
          {e.message.replace('unknown', e.name)}
        </div>
      )
      this.panel = this.cm2.addPanel(div, {
        position: 'bottom',
        replace: this.panel,
      })
    }
  }

  render() {
    const {inputHeader, outputHeader} = this.props

    return (
      <div style={widgetContainerStyle}>
        <div style={widgetStyle}>
          <div style={cmHeaderStyle}>{inputHeader}</div>
          <div ref={'cmBlockScopedVariables'} />
        </div>
        <div style={widgetStyle}>
          <div style={outputHeaderStyle}>{outputHeader}</div>
          <div ref={'cmBlockScopedVariablesOutput'} />
        </div>
      </div>
    )
  }
}
