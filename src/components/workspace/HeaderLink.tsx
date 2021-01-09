import React, { ButtonHTMLAttributes, CSSProperties, memo } from 'react'
import { mergeStyles, prefixObject } from '../../utils/Styles'

const styles = prefixObject({
  // Reset button CSS: https://gist.github.com/MoOx/9137295
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
    padding: '9px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
  },
})

type BaseProps = {
  textStyle?: CSSProperties
  title?: string
  children: React.ReactNode
}

type AnchorProps = BaseProps & {
  href: string
}

type ButtonProps = BaseProps & {
  type?: ButtonHTMLAttributes<unknown>['type']
  onClick?: () => void
}

export default memo(function HeaderLink(props: AnchorProps | ButtonProps) {
  const { textStyle, title, children } = props

  const computedTextStyle = mergeStyles(styles.text, textStyle)
  const buttonStyle = mergeStyles(styles.buttonReset, styles.text, textStyle)

  if ('href' in props) {
    return (
      <a
        title={title}
        style={computedTextStyle}
        href={props.href}
        target="_blank"
      >
        {children}
      </a>
    )
  } else {
    return (
      <button
        type={props.type}
        title={title}
        style={buttonStyle}
        onClick={props.onClick}
      >
        {children}
      </button>
    )
  }
})
