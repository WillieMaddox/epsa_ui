const path = require('path')
const webpack = require('webpack') //to access built-in plugins
const HtmlWebpackPlugin = require('html-webpack-plugin') //installed via npm
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const indexHtml = path.join(__dirname, 'app', 'index.html')

module.exports = env => {
  console.log(env)
  return {
    resolve: {
      extensions: ['.js', '.json', '.css'],
      modules: [
        'node_modules',
        'bower_components',
        path.resolve(__dirname, 'app', 'libs'),
        path.resolve(__dirname, 'app', 'main-js'),
      ],
      alias: {
        'serversettings': 'settings.dev',  // development
        // serversettings': './settings.prod',  // production
        'jquery': 'jquery/src/jquery',
        'jquery-ui': 'jquery-ui/jquery-ui.min',
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
        // 'ol3': 'ol3-3.19.1/ol-debug',
        'ol': 'openlayers/dist/ol',
        'jsts': 'jsts/dist/jsts.min',
        'shp': 'shpjs/dist/shp.min',
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
    entry: {
      main: [
        path.join(__dirname, 'app', 'main-js', 'main.js'),
        path.join(__dirname, 'app', 'css', 'main.css')
      ],
      // 'webpack/hot/dev-server',
      // 'webpack-dev-server/client?http://localhost:8080/'
      vendor: ['jquery', 'jquery-ui', 'ol', 'layerswitcher', 'jsts'],
      wfscontext: ['wfs110context', 'jsonix', 'XLink_1_0', 'shp']
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main-js/[name].js',
      pathinfo: true,
      crossOriginLoading: false
    },
    module: {
      // noParse: /node_modules\\json-schema\\lib\\validate\.js/,
      // noParse: /bower_components\\jsonix\\dist\\Jsonix-min\.js/,
      rules: [
        {
          test: /layerswitcher/,
          use: [
            'imports-loader?ol'
          ]
        }, {
          include: /WFS_1_1_0/,
          use: [
            'imports-loader?OWS_1_0_0,Filter_1_1_0,GML_3_1_1'
          ]
        }, {
          test: /WFS_2_0/,
          use: [
            'imports-loader?OWS_1_1_0,Filter_2_0,GML_3_1_1'
          ]
          // }, {
          //   test: path.resolve(__dirname, 'bower_components', 'jsonix', 'dist', 'Jsonix-all.js'),
          //   use: [
          //     'imports-loader?define=>false'
          //   ]
        }, {
          test: /\.txt$/,
          use: 'raw-loader'
        }, {
          test: /\.jsx?$/, // both .js and .jsx
          loader: 'eslint-loader',
          include: path.resolve(__dirname, 'app', 'main-js'),
          enforce: 'pre',
          // exclude: [
          //   'node_modules', 'bower_components'
          // ],
          // options: {
          //   fix: true,
          // },
          // }, {
          //   test: indexHtml,
          //   use: [
          //     {
          //       loader: 'file-loader',
          //       options: {
          //         name: '[name].[ext]',
          //       },
          //     },
          //     {
          //       loader: 'extract-loader',
          //     },
          //     {
          //       loader: 'html-loader',
          //       options: {
          //         attrs: ['img:src', 'link:href'],
          //         interpolate: true,
          //       },
          //     },
          //   ],
          // }, {
          //   test: /\.css$/,
          //   use: [
          //     'file-loader',
          //     'extract-loader',
          //     {
          //       loader: 'css-loader',
          //       options: {
          //         modules: true
          //       }
          //     }
          //   ],
        }, {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader',
            publicPath: '../'
          })
        }, {
          test: /\.(jpg|png|gif)$/,
          loader: 'file-loader',
          query: {name: 'img/[name].[ext]'}
        }, {
          test: /\.(json|geojson)$/,
          loader: 'json-loader',
          include: path.resolve(__dirname, 'app', 'data'),
          query: {name: 'data/[name].[ext]'}
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        ol: 'ol'
      }),
      new ExtractTextPlugin({
        filename: 'css/[name].css',
        allChunks: true
      }),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['wfscontext', 'vendor'],
        filename: 'main-js/[name].js',
        // minChunks: 2
      }),
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'commons',
      //   filename: 'main-js/commons.bundle.js',
      //   minChunks: 2
      // }),
      // new webpack.optimize.CommonsChunkPlugin({
      //   async: true,
      //   children: true,
      //   filename: 'commonlazy.js'
      // }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static'
      }),
      new webpack.HotModuleReplacementPlugin(),
      // new UglifyJsPlugin({
      //   sourceMap: true,
      //   compress: {
      //     warnings: true
      //   }
      // }),
      new HtmlWebpackPlugin({
        template: indexHtml,
        inject: 'body'
      })
    ],
    devtool: (env && env.production) ? 'source-map': 'cheap-eval-source-map',
    devServer: {
      hot: true,
      contentBase: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    }
  }
}
