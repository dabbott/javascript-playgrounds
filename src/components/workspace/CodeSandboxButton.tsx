import { getParameters } from 'codesandbox/lib/api/define'
import React, { memo, useMemo } from 'react'
import { useOptions } from '../../contexts/OptionsContext'
import { entries, fromEntries } from '../../utils/Object'
import { prefixObject } from '../../utils/Styles'
import HeaderLink from './HeaderLink'

interface Props {
  files: Record<string, string>
  children?: React.ReactNode
}

const styles = prefixObject({
  form: {
    display: 'flex',
  },
  // Reset button CSS: https://gist.github.com/MoOx/9137295
  button: {
    border: 'none',
    margin: '0',
    padding: '0',
    width: 'auto',
    overflow: 'visible',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    lineHeight: 'normal',
    WebkitFontSmoothing: 'inherit',
    MozOsxFontSmoothing: 'inherit',
    WebkitAppearance: 'none',
  },
})

const scriptTargetMap: Record<number, string> = {
  0: 'ES3',
  1: 'ES5',
  2: 'ES2015',
  3: 'ES2016',
  4: 'ES2017',
  5: 'ES2018',
  6: 'ES2019',
  7: 'ES2020',
  99: 'ESNext',
  100: 'JSON',
}

const moduleKindMap: Record<number, string> = {
  0: 'None',
  1: 'CommonJS',
  2: 'AMD',
  3: 'UMD',
  4: 'System',
  5: 'ES2015',
  6: 'ES2020',
  99: 'ESNext',
}

const jsxEmitMap: Record<number, string> = {
  0: 'none',
  1: 'preserve',
  2: 'react',
  3: 'react-native',
}

export const CodeSandboxButton = memo(function CodeSandboxButton({
  files,
  children,
}: Props) {
  const internalOptions = useOptions()

  const parameters = useMemo(() => {
    const { typescript, title, initialTab: main } = internalOptions
    const compilerOptions = typescript.compilerOptions || {}

    const allFiles = {
      ...files,
      ...(typescript.enabled && {
        'tsconfig.json': JSON.stringify(
          {
            compilerOptions: {
              ...compilerOptions,
              ...('target' in compilerOptions && {
                target: scriptTargetMap[compilerOptions.target as number],
              }),
              ...('module' in compilerOptions && {
                module: moduleKindMap[compilerOptions.module as number],
              }),
              ...('jsx' in compilerOptions && {
                jsx: jsxEmitMap[compilerOptions.jsx as number],
              }),
              lib: (compilerOptions.lib || typescript.libs || [])
                .map((name) => (name.startsWith('lib.') ? name.slice(4) : name))
                .filter((name) => name !== 'lib'),
            },
          },
          null,
          2
        ),
      }),
    }

    return getParameters({
      files: {
        'package.json': {
          isBinary: false,
          content: {
            name: title,
            version: '1.0.0',
            main,
            scripts: {
              start: `parcel ${main} --open`,
              build: `parcel build ${main}`,
            },
            dependencies: {},
            devDependencies: {
              'parcel-bundler': '^1.6.1',
            },
          } as any,
        },
        ...fromEntries(
          entries(allFiles).map(([name, code]) => [
            name,
            { isBinary: false, content: code },
          ])
        ),
      },
    })
  }, [files, internalOptions])

  return (
    <form
      style={styles.form}
      action="https://codesandbox.io/api/v1/sandboxes/define"
      method="POST"
      target="_blank"
    >
      <input type="hidden" name="parameters" value={parameters} />
      <button
        title={internalOptions.strings.codesandbox}
        style={styles.button}
        type="submit"
      >
        <HeaderLink>{children}</HeaderLink>
      </button>
    </form>
  )
})
