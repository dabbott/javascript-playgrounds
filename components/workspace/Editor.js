import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { options, requireAddons } from '../../utils/CodeMirror'
import { prefixObject } from '../../utils/PrefixInlineStyles'

require("../../node_modules/codemirror/lib/codemirror.css")
require("../../styles/codemirror-theme.css")

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

const docCache = {}

@pureRender
export default class extends Component {

  static defaultProps = {
    initialValue: '',
    onChange: () => {},
  }

  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const {filename, initialValue, onChange} = this.props

      requireAddons()
      const CodeMirror = require('codemirror')

      if (!docCache[filename]) {
        docCache[filename] = new CodeMirror.Doc(initialValue, options.mode)
      }

      this.cm = CodeMirror(
        this.refs.editor,
        {
          ...options,
          value: docCache[filename],
        }
      )

      this.cm.on('changes', (cm) => {
        onChange(cm.getValue())
      })
    }
  }

  componentWillUnmount() {
    if (typeof navigator !== 'undefined') {
      const CodeMirror = require('codemirror')

      this.cm.swapDoc(new CodeMirror.Doc('', options.mode))
    }
  }

  componentWillUpdate(nextProps) {
    const {errorLineNumber: nextLineNumber} = nextProps
    const {errorLineNumber: prevLineNumber} = this.props

    if (this.cm) {
      if (typeof prevLineNumber === 'number') {
        this.cm.removeLineClass(prevLineNumber, "background", "cm-line-error")
      }

      if (typeof nextLineNumber === 'number') {
        this.cm.addLineClass(nextLineNumber, "background", "cm-line-error")
      }
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
