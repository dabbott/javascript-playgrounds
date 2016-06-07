import React, { Component } from 'react'

const nbsp = "\u00a0"

export default class extends Component {

  static defaultProps = {}

  render() {
    return (
      <div>
        How this simulator works: the
        {nbsp}<a target="_blank" href={'https://github.com/dabbott/react-native-web-player'}>
          react-native-web-player
        </a>{nbsp}
        simulates a React Native environment using the components from
        {nbsp}<a target="_blank" href={'https://github.com/necolas/react-native-web'}>
          react-native-web
        </a>.
      </div>
    )
  }
}
