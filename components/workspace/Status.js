import React, { Component } from 'react'

const styles = {
  container: {
    flex: '0 0 40px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderTop: '1px solid #F7F7F7',
    borderLeft: '4px solid rgba(238,238,238,1)',
    boxSizing: 'border-box',
  },
  text: {
    color: '#D8D8D8',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    lineHeight: '40px',
    padding: '0 12px',
    fontWeight: 'bold',
  },
}

styles.error = {
  ...styles.text,
  color: '#C92C2C',
}

export default class extends Component {

  static defaultProps = {
    text: '',
  }

  render() {
    const {text, isError} = this.props

    return (
      <div style={styles.container}>
        <div style={isError ? styles.error : styles.text}>
          {text}
        </div>
      </div>
    )
  }
}
