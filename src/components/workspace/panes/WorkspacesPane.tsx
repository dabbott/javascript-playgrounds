import React from 'react'
import { WorkspacesPaneOptions } from '../../../utils/Panes'
import { memo, CSSProperties } from 'react'
import WorkspacesList, { Step } from '../WorkspacesList'
import Header from '../Header'
import { mergeStyles, prefixObject, columnStyle } from '../../../utils/Styles'

const styles = prefixObject({
  workspacesPane: mergeStyles(columnStyle, {
    width: 220,
    overflowX: 'hidden',
    overflowY: 'auto',
  }),
})

interface Props {
  options: WorkspacesPaneOptions
  externalStyles: Record<string, CSSProperties>
  activeStepIndex: number
  workspaces: Step[]
  onChangeActiveStepIndex: (index: number) => void
}

export default memo(function WorkspacesPane({
  options,
  externalStyles,
  workspaces,
  activeStepIndex,
  onChangeActiveStepIndex,
}: Props) {
  const { title } = options

  const style = mergeStyles(
    styles.workspacesPane,
    externalStyles.workspacesPane,
    options.style
  )

  return (
    <div style={style}>
      {title && (
        <Header
          text={title}
          headerStyle={externalStyles.workspacesHeader}
          textStyle={externalStyles.workspacesHeaderText}
        />
      )}
      <WorkspacesList
        steps={workspaces}
        activeStepIndex={activeStepIndex}
        onChangeActiveStepIndex={onChangeActiveStepIndex}
        style={externalStyles.workspacesList}
        rowStyle={externalStyles.workspacesRow}
        rowStyleActive={externalStyles.workspacesRowActive}
        rowTitleStyle={externalStyles.workspacesRowTitle}
        rowTitleStyleActive={externalStyles.workspacesRowTitleActive}
        descriptionStyle={externalStyles.workspacesDescription}
        descriptionTextStyle={externalStyles.workspacesDescriptionText}
        buttonTextStyle={externalStyles.workspacesButtonText}
        buttonContainerStyle={externalStyles.workspacesButtonContainer}
        buttonWrapperStyle={externalStyles.workspacesButtonWrapper}
        dividerStyle={externalStyles.workspacesDivider}
      />
    </div>
  )
})
