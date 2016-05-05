import React, { Component } from 'react'
import ReactDOM from 'react-dom'

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const root = (
  <div style={style}>
    Hello
  </div>
)

ReactDOM.render(root, document.getElementById('react-root'))
