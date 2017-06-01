/**
 * Created by maddoxw on 7/23/16.
 */

/**
 * check whether the point consists of pointcoords is inside the supplied polygon geometry
 * @{ol.geometry.Polygon} geom
 * @{Array()} a two elements array representing the point coordinates
 * @returns {Boolean} true||false
 */

define(function (require) {
    'use strict';

    var ol = require('ol'),
        jsts = require('jsts');

    var parser = new jsts.io.OL3Parser();
    return function isPointInPoly(geom, pointcoords) {
        var geomA = parser.read(geom);
        var geomB = parser.read(new ol.geom.Point(pointcoords));
        return geomB.within(geomA);
    };
});