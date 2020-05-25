import React, { PureComponent } from 'react'
import { prefixObject } from '../../utils/PrefixInlineStyles'

const colors = {
  normal: '#D8D8D8',
  error: '#C92C2C',
  inverse: 'white',
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
const variants = ['normal', 'error']

// Generate a style for all variants: normal & error, base & active
variants.forEach((variant) => {
  const color = colors[variant]
  styles[variant] = {
    base: prefixObject({
      container: { ...baseStyles.container, borderColor: color },
      text: { ...baseStyles.text, color: color },
    }),
    active: prefixObject({
      container: {
        ...baseStyles.container,
        backgroundColor: color,
        borderColor: color,
      },
      text: { ...baseStyles.text, color: 'white' },
    }),
  }
})

export default class extends PureComponent {
  static defaultProps = {
    active: false,
    inverse: false,
    isError: false,
    onClick: () => {},
    onChange: () => {},
  }

  constructor() {
    super()

    this.state = {
      hover: false,
    }
  }

  render() {
    const { children, isError, active, inverse, onChange, onClick } = this.props
    const { hover } = this.state
    const hoverOpacity = hover ? 0.7 : 0.85

    let currentStyles =
      styles[isError ? 'error' : 'normal'][active ^ inverse ? 'active' : 'base']
    const containerStyle = {
      ...currentStyles.container,
      opacity: hoverOpacity,
      ...this.props.containerStyle,
    }
    const textStyle = this.props.textStyle
      ? { ...currentStyles.text, ...this.props.textStyle }
      : currentStyles.text

    return (
      <div style={containerStyle}>
        <div
          style={textStyle}
          onMouseEnter={() => this.setState({ hover: true })}
          onMouseLeave={() => this.setState({ hover: false })}
          onClick={() => {
            onClick()
            onChange(!active)
          }}
        >
          {children}
        </div>
      </div>
    )
  }
}
