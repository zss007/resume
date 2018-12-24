const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const EndWebpackPlugin = require('end-webpack-plugin')
const ghpages = require('gh-pages')

const path = require('path')
const fs = require('fs')
const { exec, spawnSync } = require('child_process')

const outputPath = path.resolve(__dirname, '.public')

function ghPagesPromise() {
  return new Promise((resolve, reject) => {
    ghpages.publish(outputPath, { dotfiles: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  })
}

module.exports = {
  entry: {
    main: './src/main.js',
  },
  output: {
    path: outputPath,
    publicPath: '',
    filename: '[name]_[chunkhash:8].js',
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        // 提取出css
        loaders: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          // 压缩css
          use: ['css-loader', 'postcss-loader', 'sass-loader']
        }),
        include: path.resolve(__dirname, 'src')
      },
      {
        test: /\.css$/,
        // 提取出css
        loaders: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          // 压缩css
          use: ['css-loader?minimize', 'postcss-loader'],
        }),
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
      {
        test: /\.(htm|html)$/,
        use: [
          'raw-loader'
        ]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name]_[chunkhash:8].css',
      allChunks: true,
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
    }),
    new EndWebpackPlugin(async () => {
      // 自定义域名
      fs.writeFileSync(path.resolve(outputPath, 'CNAME'), 'resume.master-ss.cn')

      await ghPagesPromise()

      // 调用 Chrome 渲染出 PDF 文件
      // const chromePath = findChrome()
      // spawnSync(chromePath, ['--headless', '--disable-gpu', `--print-to-pdf=${path.resolve(outputPath, 'resume.pdf')}`,
      //   'http://resume.master-ss.cn' // 这里注意改成你的在线简历的网站
      // ])

      // await ghPagesPromise()

      exec(`rm -rf ${outputPath}`)
    }),
  ]
};
