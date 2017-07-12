'use strict'

const path = require('path')
const express = require('express')
// const bodyGrab = require('express-grab-body')
const errorHandler = require('express-error-handler')
// const cgi = require('serve-cgi')
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer()

const app = express()

// app.use(function (req, res, next) {
//   console.log('Time: %d', Date.now())
//   next()
// })

const isDeveloping = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3050
const publicPath = path.resolve(__dirname, 'dist')
const fileName = path.resolve(__dirname, 'dist', 'index.html')

// app.use(bodyGrab.init())
// app.use(bodyGrab.grab())

app.use(errorHandler())

// app.use('/cgi-bin', cgi({
//   mount: '/',
//   root: __dirname,
//   roles: {
//     '.py': '/usr/bin/python'
//   }
// }))

if (isDeveloping) {
  const webpack = require('webpack')
  const webpackConfig = require('./webpack.config.js')
  const webpackMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')

  const compiler = webpack(webpackConfig)
  const middleware = webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  })

  app.use(middleware)
  app.use(webpackHotMiddleware(compiler))
  app.get('/', function response (req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')))
    res.end()
  })
  app.all('/wms', function (req, res) {
    proxy.web(req, res, {
      target: 'http://localhost:8080/geoserver/wms'
    })
  })
  app.all('/wfs', function (req, res) {
    proxy.web(req, res, {
      target: 'http://localhost:8080/geoserver/wfs'
    })
  })
} else {
  app.use(express.static(publicPath))
  app.get('/', function (req, res, next) {
    res.sendFile(fileName, function (err) {
      if (err) {
        next(err)
      } else {
        console.log('Sent:', fileName)
      }
    })
  })
}

// It is important to catch any errors from the proxy or the
// server will crash. An example of this is connecting to the
// server when webpack is bundling
proxy.on('error', function (e) {
  console.log('Could not connect to proxy, please try again...')
})

app.listen(port, function () {
  console.log('localhost listening on port ' + port)
})
