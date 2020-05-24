/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict'

import pluginMap from 'babel-preset-react-native/plugins'

// Manually resolve all default Babel plugins.
function resolvePlugins(plugins) {
  return plugins.map(function(plugin) {
    // Normalise plugin to an array.
    if (!Array.isArray(plugin)) {
      plugin = [plugin]
    }
    // Only resolve the plugin if it's a string reference.
    if (typeof plugin[0] === 'string') {
      plugin[0] = pluginMap['babel-plugin-' + plugin[0]]
      plugin[0] = plugin[0].__esModule ? plugin[0].default : plugin[0]
    }
    return plugin
  })
}

export default resolvePlugins([
  'syntax-async-functions',
  'syntax-class-properties',
  'syntax-trailing-function-commas',
  'transform-class-properties',
  'transform-es2015-function-name',
  'transform-es2015-arrow-functions',
  'transform-es2015-block-scoping',
  'transform-es2015-classes',
  'transform-es2015-computed-properties',
  'check-es2015-constants',
  'transform-es2015-destructuring',
  ['transform-es2015-modules-commonjs', { strict: false, allowTopLevelThis: true }],
  'transform-es2015-parameters',
  'transform-es2015-shorthand-properties',
  'transform-es2015-spread',
  'transform-es2015-template-literals',
  'transform-es2015-literals',
  'transform-flow-strip-types',
  'transform-object-assign',
  'transform-object-rest-spread',
  'transform-react-display-name',
  'transform-react-jsx',
  'transform-regenerator',
  ['transform-es2015-for-of', { loose: true }],
  require('babel-loader!babel-preset-react-native/transforms/transform-symbol-member'),
])
