const webpack = require('webpack'),
  path = require('path'),
  fileSystem = require('fs'),
  env = require('./utils/env'),
  { CleanWebpackPlugin } = require('clean-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  VueLoaderPlugin = require('vue-loader/lib/plugin'),
  WriteFilePlugin = require('write-file-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  showdown = require('showdown'),
  converter = new showdown.Converter({ openLinksInNewWindow: true }),
  fs = require('fs')

// load the secrets
const alias = {
  '@': '/',
  'vue$': 'vue/dist/vue.esm.js',
}

const secretsPath = path.join(__dirname, ('secrets.' + env.NODE_ENV + '.js'))

if (fileSystem.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath
}

const copyPluginPatterns = [{ from: 'src/manifest.json' }]

{
  //监测多语言文件夹
  const i18n_folder_path = path.join(__dirname, 'src', '_locales')
  if (fileSystem.existsSync(i18n_folder_path)) {
    copyPluginPatterns.push({ from: 'src/_locales', to: '_locales' })
  }

  // 压缩json
  copyPluginPatterns.forEach(pattern => {
    pattern.transform = function (content, path) {
      return Buffer.from(JSON.stringify(JSON.parse(content)))
    }
  })
}

const entry = {
  popup: path.join(__dirname, 'src', 'popup', 'index.js'),
  options: path.join(__dirname, 'src', 'options', 'index.js'),
  background: path.join(__dirname, 'src', 'background', 'index.js'),
  // privacy_policy: path.join(__dirname, 'src', 'privacy_policy', 'index.js'),
}


// {
//   //将PrivacyPolicy.md转为两种语言的html写入到对应的.vue文件
//   const basePath = path.join(__dirname, 'src', 'privacy_policy')
//   let content = fs.readFileSync('./PrivacyPolicy.md', 'utf-8')
//   content = content.split('\n###')
//   const zh = converter.makeHtml(content[0]),
//     en = converter.makeHtml('###' + content[1])
//   let template = fs.readFileSync(path.join(basePath, 'App.vue'), 'utf-8')
//   template = template.replace('{zh_markdown}', zh).replace('{en_markdown}', en)
//   fs.writeFileSync(path.join(basePath, 'NewApp.vue'), template)
// }

const options = {
  mode: process.env.NODE_ENV || 'development',
  entry,
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        use: ['vue-loader'],
      },
    ],
  },
  resolve: {
    alias: alias,
    extensions: ['.js', '.vue'],
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      protectWebpackAssets: false,
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    }),
    new CopyWebpackPlugin(copyPluginPatterns),
    new CopyWebpackPlugin([{ from: 'src/img', to: 'img' }]),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new WriteFilePlugin(),
  ],
}

//自动生成
Object.keys(entry).forEach(key => {
  options.plugins.splice(-1, 0, new HtmlWebpackPlugin({
    template: path.join(__dirname, 'src', key, 'index.html'),
    filename: key + '.html',
    chunks: [key],
  }))
})

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-eval-source-map'
}

module.exports = options