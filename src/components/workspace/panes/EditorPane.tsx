import React, { memo, useState } from 'react'
import screenfull from 'screenfull'
import { LogCommand } from '../../../types/Messages'
import { EditorPaneOptions } from '../../../utils/Panes'
import { columnStyle, mergeStyles, prefixObject } from '../../../utils/Styles'
import {
  compareTabs,
  getTabChanged,
  getTabTitle,
  Tab,
} from '../../../utils/Tab'
import About from '../About'
import Button from '../Button'
import Editor, { Props as EditorProps } from '../Editor'
import HeaderLink from '../HeaderLink'
import Header from '../Header'
import Overlay from '../Overlay'
import Status from '../Status'
import Tabs from '../Tabs'
import { PlaygroundOptions, PublicError, ExternalStyles } from '../Workspace'
import type { WorkspaceDiff } from '../App'
import { TypeScriptOptions, UserInterfaceStrings } from '../../../utils/options'
import { useOptions } from '../../../contexts/OptionsContext'
import { CodeSandboxButton } from '../CodeSandboxButton'
import { CubeIcon, EnterFullScreenIcon, ExternalLinkIcon } from '../Icons'
import { HorizontalSpacer } from '../Spacer'

const toggleFullscreen = () => (screenfull as any).toggle()

const styles = prefixObject({
  editorPane: columnStyle,
  overlayContainer: {
    position: 'relative',
    flex: 0,
    height: 0,
    alignItems: 'stretch',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    background: 'rgba(255,255,255,0.95)',
    zIndex: 100,
    left: 4,
    right: 0,
    borderTop: '1px solid #F8F8F8',
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'auto',
    maxHeight: 300,
  },
  boldMessage: {
    fontWeight: 'bold',
  },
  codeMessage: {
    display: 'block',
    fontFamily: `'source-code-pro', Menlo, 'Courier New', Consolas, monospace`,
    borderRadius: 4,
    padding: '4px 8px',
    backgroundColor: 'rgba(0,0,0,0.02)',
    border: '1px solid rgba(0,0,0,0.05)',
  },
})

interface Props {
  options: EditorPaneOptions
  externalStyles: ExternalStyles
  ready: boolean
  files: Record<string, string>
  strings: UserInterfaceStrings
  logs: LogCommand[]
  fullscreen: boolean
  activeStepIndex: number
  diff: Record<string, WorkspaceDiff>
  playgroundOptions: PlaygroundOptions
  typescriptOptions: TypeScriptOptions
  compilerError?: PublicError
  runtimeError?: PublicError
  activeFile: string
  activeFileTab?: Tab
  fileTabs: Tab[]
  onChange: EditorProps['onChange']
  getTypeInfo: EditorProps['getTypeInfo']
  onClickTab: (tab: Tab) => void
}

export default memo(function EditorPane({
  files,
  externalStyles,
  ready,
  strings,
  fullscreen,
  activeStepIndex,
  diff,
  playgroundOptions,
  typescriptOptions,
  compilerError,
  runtimeError,
  activeFile,
  activeFileTab,
  fileTabs,
  logs,
  options,
  onChange,
  getTypeInfo,
  onClickTab,
}: Props) {
  const internalOptions = useOptions()

  const [showDetails, setShowDetails] = useState(false)

  const title = options.title ?? internalOptions.title

  const fileDiff = diff[activeFile] ? diff[activeFile].ranges : []

  const error = compilerError || runtimeError
  const isError = !!error

  const style = mergeStyles(styles.editorPane, options.style)

  const headerElements = (
    <>
      {internalOptions.codesandbox && (
        <CodeSandboxButton textStyle={externalStyles.tabText} files={files}>
          <CubeIcon />
        </CodeSandboxButton>
      )}
      {internalOptions.openInNewWindow && (
        <HeaderLink
          title={strings.openInNewWindow}
          textStyle={externalStyles.tabText}
          // There may not be a need to guard here, but just in case it runs server-side
          href={typeof location !== undefined ? location.href : undefined}
        >
          <ExternalLinkIcon />
        </HeaderLink>
      )}
      {fullscreen && (
        <HeaderLink
          title={strings.fullscreen}
          textStyle={externalStyles.tabText}
          onClick={toggleFullscreen}
        >
          <EnterFullScreenIcon />
        </HeaderLink>
      )}
      <HorizontalSpacer size={10} />
    </>
  )

  return (
    <div style={style}>
      {title && (
        <Header
          text={title}
          headerStyle={externalStyles.header}
          textStyle={externalStyles.headerText}
        >
          {headerElements}
        </Header>
      )}
      {fileTabs.length > 1 && (
        <Tabs
          tabs={fileTabs}
          getTitle={getTabTitle}
          getChanged={getTabChanged}
          activeTab={activeFileTab}
          compareTabs={compareTabs}
          onClickTab={onClickTab}
          tabStyle={externalStyles.tab}
          textStyle={externalStyles.tabText}
          activeTextStyle={externalStyles.tabTextActive}
          changedTextStyle={externalStyles.tabTextChanged}
        >
          {!title && headerElements}
        </Tabs>
      )}
      <Editor
        key={activeFile}
        initialValue={files[activeFile]}
        filename={activeStepIndex + ':' + activeFile}
        onChange={onChange}
        errorLineNumber={error?.lineNumber}
        showDiff={true}
        diff={fileDiff}
        logs={playgroundOptions.enabled ? logs : undefined}
        playgroundOptions={playgroundOptions}
        getTypeInfo={typescriptOptions.enabled ? getTypeInfo : undefined}
        tooltipStyle={externalStyles.tooltip}
      />
      {showDetails && (
        <div style={styles.overlayContainer}>
          <div style={styles.overlay}>
            <Overlay isError={isError}>
              {isError ? (
                <>
                  <b style={styles.boldMessage}>{error?.description}</b>
                  <br />
                  <br />
                  <code style={styles.codeMessage}>{error?.errorMessage}</code>
                  <br />
                </>
              ) : (
                ''
              )}
              <About text={strings.about} />
            </Overlay>
          </div>
        </div>
      )}
      <Status
        text={
          !!error
            ? error.summary
            : !ready && strings.loading
            ? strings.loading
            : strings.noErrors
        }
        isError={isError}
        style={externalStyles.status}
        textStyle={externalStyles.statusText}
        errorTextStyle={externalStyles.statusTextError}
      >
        {strings.showDetails && (
          <Button
            active={showDetails}
            isError={isError}
            onChange={setShowDetails}
          >
            {showDetails ? strings.hideDetails : strings.showDetails}
          </Button>
        )}
      </Status>
    </div>
  )
})
