process.env['NODE_ENV'] = 'production'
const webpack = require('webpack'),
  config = require('../webpack.config'),
  TerserPlugin = require('terser-webpack-plugin')

delete config.chromeExtensionBoilerplate

config['optimization'] = Object.assign(config['optimization'] || {},
  {
    minimizer: [
      new TerserPlugin({
        sourceMap: false, // Must be set to true if using source-maps in production
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  })

webpack(
  config,
  function (err) {
    if (err) throw err
  },
)
