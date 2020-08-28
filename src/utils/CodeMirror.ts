export const options = {
  value: '',
  mode: 'text/typescript-jsx',
  theme: 'react',
  keyMap: 'sublime',
  indentUnit: 2,
  lineNumbers: true,
  dragDrop: false,
  showCursorWhenSelecting: true,
  autoCloseBrackets: true,
  matchTags: {
    bothTags: true,
  },
  extraKeys: {
    Tab: 'indentMore',
    'Cmd-/': (cm: CodeMirror.Editor) => {
      cm.listSelections().forEach((selection) => {
        ;(cm as any).toggleComment({ lineComment: '//' })
      })
    },
  },
}

export const requireAddons = () => {
  require('codemirror/mode/jsx/jsx')
  require('codemirror/keymap/sublime')
  require('codemirror/addon/fold/xml-fold') // required for matchtags
  require('codemirror/addon/edit/matchtags')
  require('codemirror/addon/edit/closebrackets')
  require('codemirror/addon/comment/comment')
  require('codemirror/addon/selection/active-line')
}
