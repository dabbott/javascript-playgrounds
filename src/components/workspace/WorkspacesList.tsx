import React, { PureComponent, CSSProperties } from 'react'
import snarkdown from 'snarkdown'
import { prefix, prefixObject } from '../../utils/Styles'
import Button from './Button'

const rawStyles: Record<string, CSSProperties> = {
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

export interface Step {
  title: string
  description: string
}

interface Props {
  steps: Step[]
  activeStepIndex: number
  onChangeActiveStepIndex: (index: number) => void
  style?: CSSProperties
  rowStyle?: CSSProperties
  rowStyleActive?: CSSProperties
  rowTitleStyle?: CSSProperties
  rowTitleStyleActive?: CSSProperties
  descriptionStyle?: CSSProperties
  descriptionTextStyle?: CSSProperties
  buttonTextStyle?: CSSProperties
  buttonContainerStyle?: CSSProperties
  buttonWrapperStyle?: CSSProperties
  dividerStyle?: CSSProperties
}

function computeActiveStyle(
  isActive: boolean,
  style: CSSProperties,
  activeStyle?: CSSProperties,
  externalStyle?: CSSProperties,
  externalActiveStyle?: CSSProperties
) {
  if (isActive) {
    if (!externalStyle && !externalActiveStyle) return activeStyle

    return {
      ...activeStyle,
      ...(externalStyle ? prefix(externalStyle) : {}),
      ...(externalActiveStyle ? prefix(externalActiveStyle) : {}),
    }
  } else {
    return externalStyle ? { ...style, ...prefix(externalStyle) } : style
  }
}

function computeStyle(style: CSSProperties, externalStyle?: CSSProperties) {
  return externalStyle ? { ...style, ...prefix(externalStyle) } : style
}

export default class WorkspacesList extends PureComponent<Props> {
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

  getComputedRowStyle = (isActive: boolean) => {
    const { rowStyle, rowStyleActive } = this.props

    return computeActiveStyle(
      isActive,
      styles.row,
      styles.activeRow,
      rowStyle,
      rowStyleActive
    )
  }

  getComputedRowTitleStyle = (isActive: boolean) => {
    const { rowTitleStyle, rowTitleStyleActive } = this.props

    return computeActiveStyle(
      isActive,
      styles.rowTitle,
      styles.activeRowTitle,
      rowTitleStyle,
      rowTitleStyleActive
    )
  }

  getComputedDescriptionStyle = () => {
    const { descriptionStyle } = this.props

    return computeStyle(styles.description, descriptionStyle)
  }

  getComputedDescriptionTextStyle = () => {
    const { descriptionTextStyle } = this.props

    return computeStyle(styles.descriptionText, descriptionTextStyle)
  }

  getComputedButtonTextStyle = () => {
    const { buttonTextStyle } = this.props

    return computeStyle(styles.buttonText, buttonTextStyle)
  }

  getComputedButtonContainerStyle = () => {
    const { buttonContainerStyle } = this.props

    return computeStyle(styles.buttonContainer, buttonContainerStyle)
  }

  getComputedButtonWrapperStyle = () => {
    const { buttonWrapperStyle } = this.props

    return computeStyle(styles.buttonWrapper, buttonWrapperStyle)
  }

  getComputedDividerStyle = () => {
    const { dividerStyle } = this.props

    return computeStyle(styles.divider, dividerStyle)
  }

  renderStep = (step: Step, index: number, list: Step[]) => {
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
