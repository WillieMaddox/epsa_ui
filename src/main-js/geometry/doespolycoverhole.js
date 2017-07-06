/**
 * Created by maddoxw on 7/23/16.
 */

'use strict'
import ol from 'openlayers'
import * as jsts from 'jsts'

const parser = new jsts.io.OL3Parser()
const doesPolyCoverHole = function (geom, holecoords) {
  const geomA = parser.read(geom)
  const geomB = parser.read(new ol.geom.Polygon([holecoords]))
  return geomA.covers(geomB)
}

export default doesPolyCoverHole
