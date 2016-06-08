import React, { Component } from 'react'

import { prefixObject } from '../../utils/PrefixInlineStyles'

const styles = prefixObject({
  container: {
    flex: '0 0 40px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#3B3738',
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    lineHeight: '40px',
    padding: '0 20px',
  },
})

export default class extends Component {

  static defaultProps = {
    text: '',
  }

  render() {
    const {text} = this.props

    return (
      <div style={styles.container}>
        <div style={styles.text}>
          {text}
        </div>
      </div>
    )
  }
}
