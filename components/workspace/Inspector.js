import React, { Component } from 'react'
import Loadable from 'react-loadable'

const createTheme = (base) => ({
  ...base,
  BASE_FONT_SIZE: '13px',
  TREENODE_FONT_SIZE: '13px',
  BASE_LINE_HEIGHT: '20px',
  TREENODE_LINE_HEIGHT: '20px',
  BASE_BACKGROUND_COLOR: 'transparent',
})

export default Loadable({
  loader: () => import('react-inspector')
    .then(({default: Inspector, chromeLight}) => {
      const theme = createTheme(chromeLight)

      return (props) => <Inspector {...props} theme={theme} />
    }),
  LoadingComponent: () => null,
})
