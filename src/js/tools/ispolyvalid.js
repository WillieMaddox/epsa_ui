/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'
import * as jsts from 'jsts'

const parser = new jsts.io.OL3Parser()
const isPolyValid = function (poly) {
  const geom = parser.read(poly)
  return geom.isValid()
}

export default isPolyValid
