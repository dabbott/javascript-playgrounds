import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefixObject } from '../../utils/PrefixInlineStyles'

let styles = {
  container: {
    flex: '1',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    whiteSpace: 'pre-wrap',
  },
  text: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    lineHeight: '20px',
    padding: '12px',
  },
}

styles.error = {
  ...styles.text,
  color: '#C92C2C',
}

styles = prefixObject(styles)

@pureRender
export default class extends Component {

  static defaultProps = {
    children: '',
    isError: false,
  }

  render() {
    const {children, isError} = this.props

    return (
      <div style={styles.container}>
        <div style={isError ? styles.error : styles.text}>
          {children}
        </div>
      </div>
    )
  }
}
