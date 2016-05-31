import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Phone from './Phone'
import Sandbox from './Sandbox'

export default class extends Component {
  render() {
    const {id, width} = this.props

    return (
      <Phone width={width}>
        <Sandbox id={id} />
      </Phone>
    )
  }
}
