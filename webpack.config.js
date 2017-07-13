const path = require('path')
const webpack = require('webpack') //to access built-in plugins
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin') //installed via npm
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')

const indexHtml = path.resolve(__dirname, 'src', 'index.html')
const isProd = process.env.NODE_ENV === 'production'
console.log(isProd ? 'production' : 'development')
const cssDev = ['style-loader', 'css-loader']
const cssProd = ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: ['css-loader'],
  publicPath: '../'
})
const cssConfig = isProd ? cssProd : cssDev

module.exports = {
  resolve: {
    extensions: ['.js', '.json', '.css'],
    modules: [
      'node_modules',
      'bower_components',
      path.resolve(__dirname, 'libs'),
      path.resolve(__dirname, 'src', 'main-js')
    ],
    alias: {
      // 'serversettings': 'settings.dev',  // development
      // serversettings': './settings.prod',  // production
      'jquery': 'jquery/dist/jquery',
      'jquery-ui': 'jquery-ui/jquery-ui',
      'jsonix': 'jsonix/nodejs/scripts/jsonix',
      'WFS_2_0': 'ogc-schemas/lib/WFS_2_0',
      'WFS_1_1_0': 'ogc-schemas/lib/WFS_1_1_0',
      'XLink_1_0': 'w3c-schemas/lib/XLink_1_0',
      'GML_3_1_1': 'ogc-schemas/lib/GML_3_1_1',
      'OWS_1_0_0': 'ogc-schemas/lib/OWS_1_0_0',
      'OWS_1_1_0': 'ogc-schemas/lib/OWS_1_1_0',
      'Filter_2_0': 'ogc-schemas/lib/Filter_2_0',
      'Filter_1_1_0': 'ogc-schemas/lib/Filter_1_1_0',
      'SMIL_2_0': 'ogc-schemas/lib/SMIL_2_0',
      'SMIL_2_0_Language': 'ogc-schemas/lib/SMIL_2_0_Language',
      'openlayers': 'openlayers/dist/ol-debug',
      'jsts': 'jsts/dist/jsts',
      'shp': 'shpjs/dist/shp',
      'layerswitcher': 'ol3-layerswitcher/src/ol3-layerswitcher',
      'wfs110context': 'WFS110Context',
      'wfs200context': 'WFS200Context',
      'ispointinpoly': 'geometry/ispointinpoly',
      'ispolyvalid': 'geometry/ispolyvalid',
      'doespolycoverhole': 'geometry/doespolycoverhole',
      'deg2tile': 'tools/deg2tile',
      'exists': 'utils/exists',
      'defaultsensors': 'utils/defaultsensors',
      'mouseprojection': 'utils/mouseprojection',
      'mouseunits': 'utils/mouseunits',
      'utilities': 'utils/utils',
      'ttemplate': 'tobjects/template',
      'tstylefunction': 'tobjects/stylefunction',
      'stemplate': 'sensors/template',
      'sstylefunction': 'sensors/stylefunction',
      // 'bingKey': ['bingkey', 'bingkey-sample'],
      'bingKey': 'bingkey'
    }
  },
  stats: {
    colors: true,
    reasons: true,
    chunks: true
  },
  entry: {
    main: [
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true',
      path.join(__dirname, 'src', 'css', 'main.css'),
      path.join(__dirname, 'src', 'main-js', 'main.js')
    ],
    vendor: ['jquery', 'jquery-ui', 'openlayers', 'layerswitcher', 'jsts', 'wfs110context', 'shp']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    pathinfo: isProd === false,
    // filename: 'main-js/[name]-[chunkhash].js', // PROD
    filename: 'main-js/[name].js', // DEV
    publicPath: '/',
    // chunkFilename: 'main-js/[name]-[chunkhash].js',
    crossOriginLoading: false
  },
  module: {
    rules: [
      {
        test: /layerswitcher/,
        use: ['imports-loader?openlayers']
      }, {
        test: /\.txt$/,
        use: ['raw-loader']
      }, {
        test: /\.jsx?$/, // both .js and .jsx
        include: path.resolve(__dirname, 'src', 'main-js'),
        exclude: /node_modules/,
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader',
            options: {
              outputPath: '/dist',
              // publicPath: '/dist',
              name: '[name].[ext]'
            }
          }
        ]
      // }, {
      //   test: /\.jsx?$/,
      //   include: path.resolve(__dirname, 'src', 'main-js'),
      //   exclude: ['node_modules', 'bower_components', 'libs'],
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['es2015', {modules: false}]
      //     }
      //   }
      }, {
        test: /\.css$/,
        use: cssConfig
      }, {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              outputPath: 'img/',
              limit: 10000,
              name: '[name].[ext]' // DEV
              // name: '[name]-[hash].[ext]' // PROD
            }
          }, {
            loader: 'image-webpack-loader'
          }
        ]
      }, {
        test: /\.(json|geojson)$/,
        include: path.resolve(__dirname, 'src', 'data'),
        enforce: 'pre',
        use: [
          {
            loader: 'json-loader',
            options: {
              outputPath: 'data/',
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
      // ol: 'ol'
    }),
    new ExtractTextPlugin({
      disable: !isProd,
      filename: 'css/[name].css',
      allChunks: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'manifest'
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'commons',
    //   filename: 'commons-[hash].js',
    //   chunks: ['main', 'wfscontext', 'vendor', 'bootstrap']
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   async: 'used-twice',
    //   minChunks(module, count) {
    //     return count >= 2
    //   },
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   async: true,
    //   children: true,
    //   filename: 'commonlazy.js'
    // }),
    // new ManifestPlugin(),
    // new ChunkManifestPlugin({
    //   filename: 'chunk-manifest.json',
    //   manifestVariable: 'webpackManifest'
    // }),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'server'
    // }),
    new DuplicatePackageCheckerPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    // new UglifyJsPlugin({
    //   sourceMap: true,
    //   compress: env === 'production'
    //   // compress: {
    //   //   warnings: true
    //   // }
    // }),
    new HtmlWebpackPlugin({
      template: indexHtml,
      inject: 'body'
      // hash: true
    })
  ],
  devtool: isProd ? 'source-map' : 'inline-source-map',
  devServer: {
    hot: true,
    compress: true,
    contentBase: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    stats: 'errors-only',
    // proxy: {
    //   '/wfs': 'http://localhost:8080/geoserver/wfs',
    //   '/wms': 'http://localhost:8080/geoserver/wms'
    // },
    port: 3050
  }
}
