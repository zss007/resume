const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack')

const path = require('path')

module.exports = {
  entry: {
    main: './src/main.js',
  },
  output: {
    publicPath: '/',
    filename: '[name].js',
  },
  devServer: {
    disableHostCheck: true,
    clientLogLevel: 'warning',
    hot: true,
    open: true,
    contentBase: './src',
  },
  resolve: {
    modules: [ path.resolve(__dirname, 'node_modules') ], // 使用绝对路径指定 node_modules，不做过多查询
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        // 提取出css
        loaders: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        }),
        include: path.resolve(__dirname, 'src')
      },
      {
        test: /\.css$/,
        // 提取出css
        loaders: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader'],
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
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('[name].css'),
    new HtmlWebpackPlugin({
      filename: 'index.html', // 配置输出文件名和路径
      template: './src/index.html', // 配置文件模板
    }),
  ],
  devtool: 'source-map',
};
