import React, { CSSProperties, memo } from 'react'
import {
  columnStyle,
  mergeStyles,
  prefixObject,
  rowStyle,
} from '../../../utils/Styles'
import Editor from '../Editor'
import Header from '../Header'
import { TranspilerPaneOptions } from '../../../utils/Panes'
import { ExternalStyles } from '../Workspace'

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
}

export default memo(function TranspilerPane({
  options,
  externalStyles,
  activeFile,
  transpilerCache,
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
      />
    </div>
  )
})
