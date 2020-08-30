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

// Utilities for determining which babel worker responses are for the player vs
// the transpiler view, since we encode this information in the filename.
export const transpilerPrefix = '@babel-'
export const getTranspilerId = (filename: string): string =>
  `${transpilerPrefix}${filename}`
export const isTranspilerId = (filename: string): boolean =>
  filename.indexOf(transpilerPrefix) === 0

const styles = prefixObject({
  transpilerPane: columnStyle,
  column: columnStyle,
  row: rowStyle,
})

interface Props {
  options: TranspilerPaneOptions
  externalStyles: Record<string, CSSProperties>
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
        key={getTranspilerId(activeFile)}
        readOnly={true}
        value={transpilerCache[getTranspilerId(activeFile)]}
        filename={getTranspilerId(activeFile)}
      />
    </div>
  )
})
