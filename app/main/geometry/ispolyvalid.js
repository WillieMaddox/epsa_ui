/**
 * Created by maddoxw on 7/23/16.
 */

define(function (require) {
  'use strict'

  const jsts = require('jsts')

  const parser = new jsts.io.OL3Parser()
  return function isPolyValid(poly) {
    const geom = parser.read(poly)
    return geom.isValid()
  }
})