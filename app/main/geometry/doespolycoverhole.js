/**
 * Created by maddoxw on 7/23/16.
 */

define(function (require) {
    'use strict';

    var ol = require('ol'),
        jsts = require('jsts');

    var parser = new jsts.io.OL3Parser();
    return function doesPolyCoverHole(geom, holecoords) {
        var geomA = parser.read(geom);
        var geomB = parser.read(new ol.geom.Polygon([holecoords]));
        return geomA.covers(geomB);
    }
});