import React, { memo } from 'react'
import { TranspilerPaneOptions } from '../../../utils/Panes'
import {
  columnStyle,
  mergeStyles,
  prefixObject,
  rowStyle,
} from '../../../utils/Styles'
import Editor from '../Editor'
import Header from '../Header'
import type { ExternalStyles, PlaygroundOptions } from '../Workspace'

const styles = prefixObject({
  transpilerPane: columnStyle,
  column: columnStyle,
  row: rowStyle,
})

interface Props {
  options: TranspilerPaneOptions
  externalStyles: ExternalStyles
  activeFile: string
  transpilerCache: Record<string, string>
  playgroundOptions: PlaygroundOptions
}

export default memo(function TranspilerPane({
  options,
  externalStyles,
  activeFile,
  transpilerCache,
  playgroundOptions,
}: Props) {
  const { title } = options

  const style = mergeStyles(styles.transpilerPane, options.style)

  return (
    <div style={style}>
      {title && (
        <Header
          text={title}
          headerStyle={externalStyles.transpilerHeader}
          textStyle={externalStyles.transpilerHeaderText}
        />
      )}
      <Editor
        key={activeFile}
        readOnly={true}
        value={transpilerCache[activeFile]}
        filename={activeFile}
        playgroundOptions={playgroundOptions}
      />
    </div>
  )
})
