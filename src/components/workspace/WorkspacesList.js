import React, { PureComponent } from 'react'
import snarkdown from 'snarkdown'
import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'
import Button from './Button'

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
    flexDirection: 'column',
    alignItems: 'stretch',
    boxSizing: 'border-box',
    borderLeftStyle: 'solid',
    borderLeftColor: 'rgba(238,238,238,1)',
    borderLeftWidth: 4,
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
    paddingTop: 14,
    paddingRight: 14,
    paddingBottom: 14,
    paddingLeft: 10,
  },
  description: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(25, 144, 184, 0.85)',
    padding: 14,
  },
  descriptionText: {
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    whiteSpace: 'pre-wrap',
    color: 'white',
  },
  buttonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: 2,
    paddingRight: 14,
    paddingBottom: 18,
    paddingLeft: 14,
    backgroundColor: 'rgba(25, 144, 184, 0.85)',
  },
  buttonContainer: {
    backgroundColor: 'white',
    border: 'none',
  },
  buttonText: {
    color: 'rgba(0,0,0,0.6)',
    fontWeight: 'normal',
  },
  divider: {
    height: 1,
  },
}

rawStyles.activeRow = {
  ...rawStyles.row,
  borderLeftColor: '#1990B8',
  backgroundColor: '#1990B8',
  marginBottom: 0,
}

rawStyles.activeRowTitle = {
  ...rawStyles.rowTitle,
  color: 'white',
}

const styles = prefixObject(rawStyles)

export default class WorkspacesList extends PureComponent {
  static defaultProps = {
    style: null,
    rowStyle: null,
    rowTitleStyle: null,
    descriptionStyle: null,
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

  getComputedDescriptionStyle = () => {
    const { descriptionStyle } = this.props
    const defaultStyle = styles.description

    return descriptionStyle
      ? prefix({ ...defaultStyle, ...descriptionStyle })
      : defaultStyle
  }

  getComputedDescriptionTextStyle = () => {
    const { descriptionTextStyle } = this.props
    const defaultStyle = styles.descriptionText

    return descriptionTextStyle
      ? prefix({ ...defaultStyle, ...descriptionTextStyle })
      : defaultStyle
  }

  getComputedButtonTextStyle = () => {
    const { buttonTextStyle } = this.props
    const defaultStyle = styles.buttonText

    return buttonTextStyle
      ? prefix({ ...defaultStyle, ...buttonTextStyle })
      : defaultStyle
  }

  getComputedButtonContainerStyle = () => {
    const { buttonContainerStyle } = this.props
    const defaultStyle = styles.buttonContainer

    return buttonContainerStyle
      ? prefix({ ...defaultStyle, ...buttonContainerStyle })
      : defaultStyle
  }

  getComputedButtonWrapperStyle = () => {
    const { buttonWrapperStyle } = this.props
    const defaultStyle = styles.buttonWrapper

    return buttonWrapperStyle
      ? prefix({ ...defaultStyle, ...buttonWrapperStyle })
      : defaultStyle
  }

  getComputedDividerStyle = () => {
    const { dividerStyle } = this.props
    const defaultStyle = styles.divider

    return dividerStyle
      ? prefix({ ...defaultStyle, ...dividerStyle })
      : defaultStyle
  }

  renderStep = (step, index, list) => {
    const { activeStepIndex, onChangeActiveStepIndex } = this.props
    const { title, description } = step

    const isActive = index === activeStepIndex

    return (
      <React.Fragment key={index}>
        <div
          style={this.getComputedRowStyle(isActive)}
          onClick={onChangeActiveStepIndex.bind(null, index)}
        >
          <div style={this.getComputedRowTitleStyle(isActive)}>{title}</div>
        </div>
        {isActive && (
          <div style={this.getComputedDescriptionStyle()}>
            <div
              className={'markdown'}
              style={this.getComputedDescriptionTextStyle()}
              dangerouslySetInnerHTML={{ __html: snarkdown(description) }}
            />
          </div>
        )}
        {isActive && index !== list.length - 1 && (
          <div style={this.getComputedButtonWrapperStyle()}>
            <Button
              inverse={true}
              containerStyle={this.getComputedButtonContainerStyle()}
              textStyle={this.getComputedButtonTextStyle()}
              onChange={onChangeActiveStepIndex.bind(null, index + 1)}
            >
              {'Next'}
            </Button>
          </div>
        )}
        <div style={this.getComputedDividerStyle()} />
      </React.Fragment>
    )
  }

  render() {
    const { steps } = this.props

    return (
      <div style={this.getComputedStyle()}>{steps.map(this.renderStep)}</div>
    )
  }
}
