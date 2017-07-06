/**
 * Created by maddoxw on 7/23/16.
 */

/**
 * check whether the point consists of pointcoords is inside the supplied polygon geometry
 * @{ol.geometry.Polygon} geom
 * @{Array()} a two elements array representing the point coordinates
 * @returns {Boolean} true||false
 */

'use strict'
import ol from 'openlayers'
import * as jsts from 'jsts'

const parser = new jsts.io.OL3Parser()
const isPointInPoly = function (geom, pointcoords) {
  const geomA = parser.read(geom)
  const geomB = parser.read(new ol.geom.Point(pointcoords))
  return geomB.within(geomA)
}

export default isPointInPoly
