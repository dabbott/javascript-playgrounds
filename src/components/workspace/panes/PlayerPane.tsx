import React, { CSSProperties, memo, useState } from 'react'
import { ConsoleCommand, LogCommand } from '../../../types/Messages'
import {
  columnStyle,
  mergeStyles,
  prefixObject,
  rowStyle,
} from '../../../utils/Styles'
import Button from '../Button'
import Console from '../Console'
import Header from '../Header'
import PlayerFrame from '../PlayerFrame'
import Status from '../Status'
import { PlayerPaneOptions } from '../../../utils/Panes'
import { ExternalStyles } from '../Workspace'
import type { ExternalModule } from '../../player/VendorComponents'

const styles = prefixObject({
  playerPane: mergeStyles(columnStyle, { flex: '0 0 auto' }),
  column: columnStyle,
  row: rowStyle,
})

export interface Props {
  options: PlayerPaneOptions
  externalStyles: ExternalStyles
  preset: string
  sharedEnvironment: boolean
  files: Record<string, string>
  detectedModules: ExternalModule[]
  logs: LogCommand[]
  onPlayerRun: () => void
  onPlayerError: (message: string) => void
  onPlayerConsole: (payload: ConsoleCommand) => void
}

const PlayerPane = memo(
  React.forwardRef<PlayerFrame, Props>(function renderPlayer(
    {
      options,
      externalStyles,
      preset,
      sharedEnvironment,
      files,
      logs,
      onPlayerRun,
      onPlayerError,
      onPlayerConsole,
      detectedModules,
    },
    ref
  ) {
    const {
      title,
      width,
      scale,
      platform,
      assetRoot,
      modules,
      styleSheet,
      css,
      prelude,
      statusBarHeight,
      statusBarColor,
      console,
    } = options

    const [showLogs, setShowLogs] = useState(console?.visible)

    const style = mergeStyles(
      styles.playerPane,
      externalStyles.playerPane,
      options.style
    )

    return (
      <div style={style}>
        {title && (
          <Header
            text={title}
            headerStyle={externalStyles.playerHeader}
            textStyle={externalStyles.playerHeaderText}
          />
        )}
        <div style={styles.column}>
          <div style={styles.row}>
            <PlayerFrame
              ref={ref}
              externalStyles={externalStyles}
              preset={preset}
              width={width}
              scale={scale}
              platform={platform}
              assetRoot={assetRoot}
              detectedModules={detectedModules}
              modules={modules}
              styleSheet={styleSheet}
              css={css}
              prelude={prelude}
              statusBarHeight={statusBarHeight}
              statusBarColor={statusBarColor}
              sharedEnvironment={sharedEnvironment}
              onRun={onPlayerRun}
              onError={onPlayerError}
              onConsole={onPlayerConsole}
            />
            {console && showLogs && (
              <Console
                style={externalStyles.consolePane}
                rowStyle={externalStyles.consoleRow}
                maximize={console.maximized}
                showFileName={
                  Object.keys(files).length > 1 && console.showFileName
                }
                showLineNumber={console.showLineNumber}
                logs={logs}
                renderReactElements={console.renderReactElements}
              />
            )}
          </div>
          {console && console.collapsible !== false && (
            <Status
              text={'Logs' + (showLogs ? '' : ` (${logs.length})`)}
              isError={false}
            >
              <Button active={showLogs} onChange={setShowLogs}>
                {'Show Logs'}
              </Button>
            </Status>
          )}
        </div>
      </div>
    )
  })
)

export default PlayerPane
