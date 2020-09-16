<p align="center">
  <img src="docs/assets/logo.png" width="192" height="192" />
</p>

<h1 align="center">JavaScript Playgrounds</h1>

<br />

<p align="center">
  <b>An interactive JavaScript sandbox. <a href="https://unpkg.com/javascript-playgrounds@^0.1.0/public/index.html">Try it!</a></b>
</p>

<p align="center">
  <img alt="Animated demo" src="docs/assets/demo.gif" />
</p>

## Overview

This project provides a quick, visual way to experiment with JavaScript code. It's designed to be loaded as an `iframe` for easy inclusion in any webpage.

There are a variety of configuration options, including a [React preset][react] and a [React Native preset][react native].

I use this sandbox in my free educational guides:

- [JavaScript Express](https://www.javascript.express)
- [TypeScript Express](https://www.typescript.express)
- [React Express](https://www.react.express)
- [React Native Express](https://www.reactnative.express)

## Usage

The sandbox may be included on your site in one of two ways:

- [as a React component](#as-a-react-component)
- [directly as an `iframe`](#as-an-iframe)

> For legacy React Native-specific docs, see the [v1 branch](https://github.com/dabbott/javascript-playgrounds/tree/v1)

### As a React Component

If you're using React:

```bash
npm install --save javascript-playgrounds

# or

yarn add javascript-playgrounds
```

Then:

```js
import Playground from 'javascript-playgrounds'

export default function App() {
  return <Playground style={{ width: 800, height: 500 }} />
}
```

This component is a wrapper around the `iframe` that handles encoding parameters for you. While it passes most props along to the `iframe`, it has a few extra props:

| Title           | Description                                                                                   | Default                           |
| --------------- | --------------------------------------------------------------------------------------------- | --------------------------------- |
| **`style`**     | The style of the `div` which wraps the `iframe` (the iframe has `100%` width and height).     | `undefined`                       |
| **`className`** | The className of the `div` which wraps the `iframe`                                           | `undefined`                       |
| **`baseURL`**   | Optionally, specify a custom url to load the player from. This url should not include a hash. | `unpkg.com` (see [unpkg](#unpkg)) |

### As an `iframe`

If you're not using React, include the sandbox in an `iframe`.

```html
<iframe
  width="880"
  height="425"
  frameborder="0"
  src="//unpkg.com/javascript-playgrounds@^0.1.0/public/index.html"
></iframe>
```

Configuration parameters should be passed as part of the hash string, after `#data=`. They should be JSON-encoded _and then_ URI-encoded:

```JavaScript
const parameters = { code: `console.log('Hello, world!')` }
const hashString = '#data=' + encodeURIComponent(JSON.stringify(parameters))
```

> When used as an `iframe`, the easiest way to set the `code` parameter is to edit the code in the sandbox and copy and paste the url when you're done (the url updates automatically as you type).

For convenience, you may optionally pass the `preset` parameter in the url string directly, e.g. `#preset=react&data=...`.

## Parameters

The sandbox accepts the following props/parameters.

| Title                                | Description                                                                                                                                                                                                                                                                                                                             | Default                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **`preset`**                         | This sets reasonable defaults for other parameters. Options are `javascript`, `react`, and `react-native`.                                                                                                                                                                                                                              | `'javascript'`                |
| **`title`**                          | An optional title for the editor pane.                                                                                                                                                                                                                                                                                                  | `''`                          |
| **`code`**                           | The code to show/run in the player.                                                                                                                                                                                                                                                                                                     | The sample app                |
| **`files`**                          | A map of `{ [filename]: code }`. This will take precedence over `code` if given.                                                                                                                                                                                                                                                        | `undefined`                   |
| **`entry`**                          | The filename of the file that runs first. This is only relevant when showing multiple files with the `files` parameter. Defaults to `index.js`, or `index.tsx` if TypeScript is enabled.                                                                                                                                                | `'index.js'` or `'index.tsx'` |
| **`initialTab`**                     | The filename of the tab to show by default. This is only relevant when showing multiple files with the `files` parameter. Defaults to the value of `entry`.                                                                                                                                                                             | `entry`                       |
| **`css`**                            | An optional CSS string to apply within the workspace `iframe`.                                                                                                                                                                                                                                                                          | `''`                          |
| **`styles`**                         | An map of inline style objects, applied to various elements to customize the style of the UI. Example: `{ header: { backgroundColor: 'red' } }`                                                                                                                                                                                         | `{}`                          |
| **`strings`**                        | A map of strings that appear in the UI. Example: `{ loading: 'Loading dependencies...' }`                                                                                                                                                                                                                                               | `{}`                          |
| **`sharedEnvironment`**              | This affects how the iframes share data with one another, mainly for the "playgrounds" feature. When `true`, iframes will pass JavaScript objects back and forth, while when `false`, they'll pass serialized JSON.                                                                                                                     | `false`                       |
| **`detectDependencies`**             | Should the player scan code files for `import`s and try to fetch them from `unpkg`? Only modules imported in the initial code are fetched (not those added while typing in the sandbox).                                                                                                                                                | `true`                        |
| **`fullscreen`**                     | Show a button to enable fullscreen editing (in most configurations of panes). Note that the iframe must have the `allowfullscreen` attribute for this to work.                                                                                                                                                                          | `false`                       |
| **`playground`**                     | Settings for playgrounds (inline widgets that display runtime values)                                                                                                                                                                                                                                                                   | `{}`                          |
| **`playground.enabled`**             | Turn on playgrounds?                                                                                                                                                                                                                                                                                                                    | `false`                       |
| **`playground.renderReactElements`** | Render React elements? If `false`, will print the React element object, e.g. `{ type, props, key }`, rather than render it.                                                                                                                                                                                                             | `true`                        |
| **`playground.debounceDuration`**    | How frequently widgets update. A little delay helps keep the UI feeling smoother.                                                                                                                                                                                                                                                       | `200` (milliseconds)          |
| **`typescript`**                     | TypeScript settings                                                                                                                                                                                                                                                                                                                     | `{}`                          |
| **`typescript.enabled`**             | Turn on TypeScript hover tooltip info? Defaults to `false`                                                                                                                                                                                                                                                                              | `false`                       |
| **`typescript.libs`**                | An array of default libraries to include, e.g. `'dom'` and `'es2015'`. We don't include some newer/esoteric ones by default, to reduce download size.                                                                                                                                                                                   | See source code               |
| **`typescript.types`**               | An array of additional type files to download. Each should be an object `{ name, url }`.                                                                                                                                                                                                                                                | `[]`                          |
| **`workspaces`**                     | Add a tutorial-like sequence of sets of files, highlighting changes between each set. Each object in this array can contain: `{ title, description, workspace: { title, files, entry, initialTab } }`. Properties in the `workspace` object will override those given as top level parameters.                                          | `[]`                          |
| **`panes`**                          | An array of UI panes to display. To display a pane without options, use a string. Otherwise, use an object with a `type` property. The available panes are: `'stack'`, `'editor'`, `'transpiler'`, `'player'`, `'workspaces'`, `'console'`. Note that there _must be_ a `player` pane for any code to run. For pane options, see below. | `['editor', 'player']`        |
| **`responsivePaneSets`**             | An array of `{ maxWidth, panes }` objects to show at different responsive breakpoints. The iframe will use the first set where the `maxWidth` is greater than the current window width. The top-level `panes` parameter has `maxWidth: Infinity` so that it's used by default if there's no matching set of panes.                      | `[]`                          |
| **`targetOrigin`**                   | If passed, the sandbox will call `parent.postMessage(JSON.stringify(data), targetOrigin)` on code changes.                                                                                                                                                                                                                              | `undefined`                   |

### Pane options

All panes support the following options:

| Title       | Description                                                                                                               | Default     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **`style`** | The inline styles for this specific pane, merged with those passed in the top-level `styles` object if given.             | `undefined` |
| **`title`** | An optional title for this pane. If used on an `'editor'` pane, this will override a top-level `title`, if one was given. | `''`        |

Each pane additionally supports pane-specific options. For more detail:

- [player](#the-player-pane)
- [console](#the-console-pane)
- [stack](#the-stack-pane)
- [editor](#the-editor-pane)
- [transpiler](#the-transpiler-pane)
- [workspaces](#the-workspaces-pane)

#### The `player` pane

Display the running app, optionally with the image of a phone around it.

| Title                     | Description                                                                                                                                                                                                                                                 | Default   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **`platform`**            | One of `ios`, `android`, or `web`. When `web`, no phone image is displayed.                                                                                                                                                                                 | `'ios'`   |
| **`width`**               | The width of the device.                                                                                                                                                                                                                                    | `210px`   |
| **`scale`**               | Zoom the device screen. This has no effect if the platform is `web`.                                                                                                                                                                                        | `1`       |
| **`assetRoot`**           | Specifies the root url for asset `require`s. E.g. to require `http://localhost:8080/images/hello.png`, you could set `assetRoot` to `'http://localhost:8080/'` and write `require('./images/hello.png')` in your code.                                      | `''`      |
| **`css`**                 | An optional CSS string to apply within the player's `iframe`.                                                                                                                                                                                               | `''`      |
| **`styleSheet`**          | One of `reset` or `none`. When `reset`, the meyerweb CSS reset is applied to the player's `iframe`.                                                                                                                                                         | `'reset'` |
| **`statusBarHeight`**     | Display a rectangle at the top of the phone screen, mimicking a status bar.                                                                                                                                                                                 | `0px`     |
| **`statusBarColor`**      | The color of the fake status bar.                                                                                                                                                                                                                           | `'black'` |
| **`prelude`**             | JavaScript code that runs before the entry file.                                                                                                                                                                                                            | `''`      |
| **`modules`**             | An array of external modules to make available to the sandbox. Each object in the array should be an object containing a `name` and `url`. As a shorthand, pass a string name to load a module from unpkg (`https://unpkg.com/${name}`). More detail below. | `[]`      |
| **`console`**             | Display an embedded console in this pane. See the `console` options below. Additionally, the embedded version of the console has the following properties...                                                                                                | `{}`      |
| **`console.visible`**     | Show the console?                                                                                                                                                                                                                                           | `false`   |
| **`console.maximized`**   | Show the console over the entire player?                                                                                                                                                                                                                    | `false`   |
| **`console.collapsible`** | Allow collapsing the console via a toggle button.                                                                                                                                                                                                           | `true`    |

##### Examples of loading modules:

- To load a CommonJS `require`-style module, the `name` is the `require(name)` name, and the second is the source url. E.g. to load moment.js: set `modules` to the value `[{ name: 'moment', url: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js' }]`
- To load a component as a property on `window`, also pass a `globalName`, which will be the window property name (e.g. `window.moment`). E.g. to load moment.js this way: set `modules` to the value `[{ name: 'moment', globalName: 'moment', url: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js' }]`

#### The `console` pane

Show the output `console.log`, similar to the Chrome inspector. This can be a separate pane, or embedded in the player pane.

| Title                     | Description                                                | Default |
| ------------------------- | ---------------------------------------------------------- | ------- |
| **`showFileName`**        | Show the file name containing the `console.log`.           | `false` |
| **`showLineNumber`**      | Show the line number of the `console.log`.                 | `true`  |
| **`renderReactElements`** | Render React elements, instead of displaying element JSON. | `false` |

#### The `stack` pane

A nested stack of panes.

| Title          | Description                                                   | Default |
| -------------- | ------------------------------------------------------------- | ------- |
| **`children`** | An array of panes, just like the top level `panes` parameter. | `[]`    |

#### The `editor` pane

None at the moment.

#### The `transpiler` pane

None at the moment.

#### The `workspaces` pane

None at the moment.

## Hosting

This project contains static assets that run standalone in the browser. You don't need a server, unless you want to host the assets yourself.

### unpkg

The recommended host is https://unpkg.com, which is a CDN that serves content from the npm registry. The examples in this README all point to:

```html
<iframe
  width="880"
  height="425"
  frameborder="0"
  src="//unpkg.com/javascript-playgrounds@^0.1.0/public/index.html"
></iframe>
```

> Note that `unpkg` resolves semver versions in the url

## Examples

These examples were created by loading the demo page and running roughly the following JS in the console:

```js
location.href.slice(0, location.href.indexOf('#')) +
  '#data=' +
  encodeURIComponent(
    JSON.stringify({
      title: 'Custom title',
      panes: [
        'editor',
        { type: 'player', platform: 'android', modules: ['moment'] },
      ],
    })
  )
```

- [React][react]
- [React Native][react native]
- [Custom code][custom code]
- [Load external library via URL][library]

## Development

### Run

```bash
yarn
yarn dev
# => localhost:8080
```

### Build

```bash
yarn build
```

## Contributing

Contributions are welcome, but if you're planning to add features, I recommend opening an issue describing the change first.

I maintain this project specifically for my educational guides, so if it's a feature I wouldn't use, I might not want to maintain it. It also may take me a little while to get to reviewing.

## License

3-Clause BSD

https://opensource.org/licenses/BSD-3-Clause

[react]: https://unpkg.com/javascript-playgrounds@^0.1.0/public/index.html#data=%7B%22preset%22%3A%22react%22%7D
[react native]: https://unpkg.com/javascript-playgrounds@^0.1.0/public/index.html#data=%7B%22preset%22%3A%22react-native%22%7D
[custom code]: https://unpkg.com/javascript-playgrounds@^0.1.0/public/index.html#data=%7B%22code%22%3A%22console.log(42)%22%7D
[library]: https://unpkg.com/javascript-playgrounds@^0.1.0/public/index.html#data=%7B%22code%22%3A%22import%20moment%20from%20'moment'%5Cn%5Cnconsole.log(moment())%22%2C%22modules%22%3A%5B%22moment%22%5D%7D
