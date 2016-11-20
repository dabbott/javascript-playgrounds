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
    initialValue: null,
    value: null,
    onChange: () => {},
    readOnly: false,
  }

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const {filename, initialValue, value, readOnly, onChange} = this.props

      requireAddons()
      const CodeMirror = require('codemirror')

      if (!docCache[filename]) {
        docCache[filename] = new CodeMirror.Doc(initialValue || value || '', options.mode)
      }

      this.cm = CodeMirror(
        this.refs.editor,
        {
          ...options,
          readOnly,
          value: docCache[filename].linkedDoc({sharedHist: true}),
        }
      )

      this.cm.on('changes', (cm) => {
        onChange(cm.getValue())
      })
    }
  }

  componentWillUnmount() {
    if (typeof navigator !== 'undefined') {
      const {filename} = this.props
      const CodeMirror = require('codemirror')

      // Store a reference to the current linked doc
      const linkedDoc = this.cm.doc

      this.cm.swapDoc(new CodeMirror.Doc('', options.mode))

      // Unlink the doc
      docCache[filename].unlinkDoc(linkedDoc)
    }
  }

  componentWillUpdate(nextProps) {
    const {errorLineNumber: nextLineNumber, value} = nextProps
    const {errorLineNumber: prevLineNumber} = this.props

    if (this.cm) {
      if (typeof prevLineNumber === 'number') {
        this.cm.removeLineClass(prevLineNumber, "background", "cm-line-error")
      }

      if (typeof nextLineNumber === 'number') {
        this.cm.addLineClass(nextLineNumber, "background", "cm-line-error")
      }

      if (typeof value === 'string' && value !== this.cm.getValue()) {
        this.cm.setValue(value)
      }
    }
  }

  render() {
    const {readOnly} = this.props

    return (
      <div style={styles.editorContainer} className={readOnly && 'read-only'}>
        <div style={styles.editor} ref={'editor'} />
      </div>
    )
  }
}
