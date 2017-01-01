import { Events, ModuleManager } from 'webplayer'
import ReactNativeEnvironment from './ReactNativeEnvironment'

ModuleManager.inject({
  react: require('react'),
  'react-dom': require('react-dom'),
  'react-native': require('react-native-web'),
})

// Make regeneratorRuntime globally available for async/await
window.regeneratorRuntime = require('regenerator-runtime')

const environment = new ReactNativeEnvironment()

Events.on('app:before', environment.before)
Events.on('app:after', environment.after)
