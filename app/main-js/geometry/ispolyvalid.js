/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'

const jsts = require('jsts')

const parser = new jsts.io.OL3Parser()
const isPolyValid = function (poly) {
  const geom = parser.read(poly)
  return geom.isValid()
}

module.exports = isPolyValid