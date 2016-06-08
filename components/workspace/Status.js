import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefixObject } from '../../utils/PrefixInlineStyles'

let styles = {
  container: {
    flex: '0 0 40px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTop: '1px solid #F7F7F7',
    borderLeft: '4px solid rgba(238,238,238,1)',
    boxSizing: 'border-box',
    paddingRight: 7,
  },
  text: {
    color: '#D8D8D8',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    padding: '0 12px',
    fontWeight: 'bold',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s',
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
    text: '',
    isError: false,
  }

  render() {
    const {text, isError, children} = this.props

    return (
      <div style={styles.container}>
        <div style={isError ? styles.error : styles.text}>
          {text}
        </div>
        {children}
      </div>
    )
  }
}
