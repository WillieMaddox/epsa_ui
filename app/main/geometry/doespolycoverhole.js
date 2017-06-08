/**
 * Created by maddoxw on 7/23/16.
 */

define(function (require) {
    'use strict';

    const ol = require('ol'),
        jsts = require('jsts');

    const parser = new jsts.io.OL3Parser();
    return function doesPolyCoverHole(geom, holecoords) {
        const geomA = parser.read(geom);
        const geomB = parser.read(new ol.geom.Polygon([holecoords]));
        return geomA.covers(geomB);
    }
});