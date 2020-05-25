import React, { PureComponent } from 'react'
import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'

const rawStyles = {
  container: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    backgroundColor: '#FAFAFA',
  },
  row: {
    display: 'flex',
    boxSizing: 'border-box',
    padding: '14px',
    borderLeftStyle: 'solid',
    borderLeftColor: 'rgba(238,238,238,1)',
    borderLeftWidth: 4,
    marginBottom: 1,
    cursor: 'pointer',
    transition: 'border-color 0.1s',
  },
  rowTitle: {
    color: 'rgb(170, 170, 170)',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.1s',
  },
  rowBody: {},
}

rawStyles.activeRow = {
  ...rawStyles.row,
  borderLeftColor: '#1990B8',
}

rawStyles.activeRowTitle = {
  ...rawStyles.rowTitle,
  color: 'black',
}

const styles = prefixObject(rawStyles)

export default class extends PureComponent {
  static defaultProps = {
    style: null,
    rowStyle: null,
    rowTitleStyle: null,
    rowBodyStyle: null,
    activeRowStyle: null,
    onChangeActiveStepIndex: () => {},
  }

  getComputedStyle = () => {
    const { style } = this.props
    const defaultStyle = styles.container

    return style ? prefix({ ...defaultStyle, ...style }) : defaultStyle
  }

  getComputedRowStyle = (isActive) => {
    const { rowStyle } = this.props
    const defaultStyle = isActive ? styles.activeRow : styles.row

    return rowStyle ? prefix({ ...defaultStyle, ...rowStyle }) : defaultStyle
  }

  getComputedRowTitleStyle = (isActive) => {
    const { rowTitleStyle } = this.props
    const defaultStyle = isActive ? styles.activeRowTitle : styles.rowTitle

    return rowTitleStyle
      ? prefix({ ...defaultStyle, ...rowTitleStyle })
      : defaultStyle
  }

  getComputedRowBodyStyle = () => {
    const { rowBodyStyle } = this.props
    const defaultStyle = styles.rowBody

    return rowBodyStyle
      ? prefix({ ...defaultStyle, ...rowBodyStyle })
      : defaultStyle
  }

  renderStep = (step, index) => {
    const { activeStepIndex, onChangeActiveStepIndex } = this.props
    const { title, body } = step

    return (
      <div
        key={index}
        style={this.getComputedRowStyle(index === activeStepIndex)}
        onClick={onChangeActiveStepIndex.bind(null, index)}
      >
        <div style={this.getComputedRowTitleStyle(index === activeStepIndex)}>
          {title}
        </div>
        {/* <div style={this.getComputedRowBodyStyle()}>{body}</div> */}
      </div>
    )
  }

  render() {
    const { steps } = this.props

    return (
      <div style={this.getComputedStyle()}>{steps.map(this.renderStep)}</div>
    )
  }
}
