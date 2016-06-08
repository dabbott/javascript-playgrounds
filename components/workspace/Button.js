import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefixObject } from '../../utils/PrefixInlineStyles'

const colors = {
  normal: '#D8D8D8',
  error: '#C92C2C',
}

const baseStyles = {
  container: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 3,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  text: {
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    padding: '6px 8px',
    fontWeight: 'bold',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s',
    userSelect: 'none',
  },
}

const styles = {}
const errorStates = ['normal', 'error']

// Generate a style for all states: normal & error, base & active
errorStates.forEach(errorState => {
  const color = colors[errorState]
  styles[errorState] = {
    base: prefixObject({
      container: { ...baseStyles.container, borderColor: color },
      text: { ...baseStyles.text, color: color },
    }),
    active: prefixObject({
      container: { ...baseStyles.container, backgroundColor: color, borderColor: color },
      text: { ...baseStyles.text, color: 'white' },
    })
  }
})

@pureRender
export default class extends Component {

  static defaultProps = {
    text: '',
    active: false,
    isError: false,
    onChange: () => {},
  }

  constructor() {
    super()

    this.state = {
      hover: false,
    }
  }

  render() {
    const {children, isError, active, onChange} = this.props
    const {hover} = this.state
    const hoverOpacity = hover ? 0.7 : 0.85

    let currentStyles = styles[isError ? 'error' : 'normal'][active ? 'active' : 'base']
    const containerStyle = { ...currentStyles.container, opacity: hoverOpacity }

    return (
      <div style={containerStyle}>
        <div style={currentStyles.text}
          onMouseEnter={() => this.setState({hover: true})}
          onMouseLeave={() => this.setState({hover: false})}
          onClick={() => onChange(! active)}
        >
          {children}
        </div>
      </div>
    )
  }
}
