const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const EndWebpackPlugin = require('end-webpack-plugin')
const puppeteer = require('puppeteer')
const ghpages = require('gh-pages')

const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')

const config = require('./config')
const outputPath = path.resolve(__dirname, config.output)

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
      fs.writeFileSync(path.resolve(outputPath, 'CNAME'), config.url)

      // 静态资源发布
      await ghPagesPromise()

      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
      const page = await browser.newPage()
      await page.goto(`http://${config.url}`)
      page.waitFor(2000)

      // 网页快照
      await page.pdf({
        path: `${config.output}/resume.pdf`,
        printBackground: true,
        displayHeaderFooter: false,
        format: 'A4',
      })

      // 关闭浏览器
      await browser.close()

      // 静态资源发布
      await ghPagesPromise()

      exec(`rm -rf ${outputPath}`)
    }),
  ]
};
