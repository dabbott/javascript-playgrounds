import React, { Component } from 'react';

import { options, readOnlyOptions, requireAddons } from '../../constants/CodeMirror'

require("../../node_modules/codemirror/lib/codemirror.css")
require("../../styles/codemirror-theme.css")

// Work around a codemirror + flexbox + chrome issue by creating an absolute
// positioned parent and flex grandparent of the codemirror element.
// https://github.com/jlongster/debugger.html/issues/63
const styles = {
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
}

export default class extends Component {

  static defaultProps = {
    value: '',
    onChange: () => {},
  }

  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      requireAddons()

      const {value, onChange, readOnly} = this.props

      this.cm = require('codemirror')(
        this.refs.editor,
        {
          ...options,
          ...(readOnly && readOnlyOptions),
          value,
        }
      )

      this.cm.setSize('100%', '100%')

      this.cm.on('changes', (cm) => {
        onChange(cm.getValue())
      })
    }
  }

  render() {
    return (
      <div style={styles.editorContainer}>
        <div style={styles.editor} ref={'editor'} />
      </div>
    )
  }
}
