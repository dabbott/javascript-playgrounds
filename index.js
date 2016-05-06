import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import EditorPlayer from './components/EditorPlayer'

const defaultValue = `/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\\n'}
          Cmd+D or shake for dev menu
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('MyApp', () => App);`

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const root = (
  <div style={style}>
    <EditorPlayer
      value={defaultValue}
      inputHeader={'Hello World App'}
    />
  </div>
)

ReactDOM.render(root, document.getElementById('react-root'))
