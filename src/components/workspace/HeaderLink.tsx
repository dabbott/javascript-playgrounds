import React, { CSSProperties, memo } from 'react'
import { mergeStyles, prefixObject } from '../../utils/Styles'

const styles = prefixObject({
  buttonReset: {
    border: 'none',
    margin: '0',
    padding: '0',
    width: 'auto',
    overflow: 'visible',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    lineHeight: 'normal',
    WebkitFontSmoothing: 'inherit',
    MozOsxFontSmoothing: 'inherit',
    WebkitAppearance: 'none',
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    marginRight: '20px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
  },
})

interface Props {
  href?: string
  textStyle?: CSSProperties
  title?: string
  onClick?: () => void
  children: React.ReactNode
}

export default memo(function HeaderLink({
  textStyle,
  href,
  onClick,
  title,
  children,
}: Props) {
  const computedTextStyle = mergeStyles(styles.text, textStyle)
  const buttonStyle = mergeStyles(styles.buttonReset, styles.text, textStyle)

  if (href) {
    return (
      <a
        title={title}
        style={computedTextStyle}
        onClick={onClick}
        href={href}
        target="_blank"
      >
        {children}
      </a>
    )
  } else {
    return (
      <button title={title} style={buttonStyle} onClick={onClick}>
        {children}
      </button>
    )
  }
})
