import React, { CSSProperties, memo } from 'react'
import { LogCommand } from '../../../types/Messages'
import {
  columnStyle,
  mergeStyles,
  prefixObject,
  rowStyle,
} from '../../../utils/Styles'
import Console from '../Console'
import Header from '../Header'
import { ConsolePaneOptions } from '../../../utils/Panes'

const styles = prefixObject({
  consolePane: columnStyle,
  column: columnStyle,
  row: rowStyle,
})

interface Props {
  options: ConsolePaneOptions
  externalStyles: Record<string, CSSProperties>
  files: Record<string, string>
  logs: LogCommand[]
}

export default memo(function ConsolePane({
  options,
  externalStyles,
  files,
  logs,
}: Props) {
  const style = mergeStyles(
    styles.consolePane,
    externalStyles.consolePane,
    options.style
  )

  return (
    <div style={style}>
      {options.title && (
        <Header
          text={options.title}
          headerStyle={externalStyles.playerHeader}
          textStyle={externalStyles.playerHeaderText}
        />
      )}
      <div style={styles.column}>
        <div style={styles.row}>
          <Console
            style={externalStyles.consolePane}
            rowStyle={externalStyles.consoleRow}
            maximize={true}
            showFileName={Object.keys(files).length > 1 && options.showFileName}
            showLineNumber={options.showLineNumber}
            logs={logs}
            renderReactElements={options.renderReactElements}
          />
        </div>
      </div>
    </div>
  )
})
