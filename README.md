# React Native Web Player
Run react native apps in your browser!

[Try it out!]( https://cdn.rawgit.com/dabbott/react-native-web-player/v0.1.2/index.html#title=React%20Native%20Web%20Player)

### Instructions

Include the web player in an iframe.

```html
<iframe width="880" height="425" frameborder="0" src="//cdn.rawgit.com/dabbott/react-native-web-player/v0.1.2/index.html"></iframe>
```

The iframe accepts the following parameters *after the hash* in the url:

- `code` - The code to show/run in the player. Defaults to the sample app.
- `title` - An optional title for the player. By default, there is no title.
- `width` - The width of the device. Defaults to `210`.
- `scale` - Zoom the device screen. Defaults to `1`.
- `platform` - One of `ios` or `android`. Defaults to `ios`. Currently this changes the phone image, but may also have an effect on how the code is executed in the future.
- `assetRoot` - Specifies the root url for asset `require`s. E.g. to require `http://localhost:8080/images/hello.png`, you could set `assetRoot=http%3A%2F%2Flocalhost%3A8080%2F` and write `require('./images/hello.png')` in your code.
- `runApp` - Specifies the name of the app to run, registered via `AppRegistry.registerComponent(...)`. Defaults to `App`.

The easiest way to set the `code` parameter is to edit the code in the web player and copy and paste the url when you're done (the url updates automatically as you type).

Alternately, you can manually url-encode the parameters. You can do so via the JavaScript console.
```JavaScript
encodeURIComponent('Hello World')
# => "Hello%20World"
```

### Hosting

This project contains static assets that run standalone in the browser. You don't need a server, unless you want to host the assets yourself.

The example URLs on this page use rawgit to hit MaxCDN for performance. If you prefer, you may access the gh-pages branch directly. This has the advantage of always serving you the latest version, but the drawback of potentially failing on major API changes (along with slower download speeds for the assets).

```html
<iframe width="880" height="425" frameborder="0" src="//dabbott.github.io/react-native-web-player/"></iframe>
```

### Examples

- Custom code - https://cdn.rawgit.com/dabbott/react-native-web-player/v0.1.2/index.html#platform=ios&code=import%20React%2C%20%7B%20Component%2C%20%7D%20from%20'react'%3B%0Aimport%20%7B%20AppRegistry%2C%20Text%2C%20%7D%20from%20'react-native'%3B%0A%0Aconst%20App%20%3D%20()%20%3D%3E%20%3CText%3EHello%20World%3C%2FText%3E%3B%0A%0AAppRegistry.registerComponent('App'%2C%20()%20%3D%3E%20App)%3B
- Android device - https://cdn.rawgit.com/dabbott/react-native-web-player/v0.1.2/index.html#platform=android
- Custom title - https://cdn.rawgit.com/dabbott/react-native-web-player/v0.1.2/index.html#title=Hello%20Title

## Development

### Run

```
npm install
npm run start
=> localhost:8080
```

### Build

```
npm run build
```

### License
MIT
