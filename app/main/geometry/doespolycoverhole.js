/**
 * Created by maddoxw on 7/23/16.
 */

define(["ol", "getjstsgeom"], function (ol, getJSTSgeom) {
    return function doesPolyCoverHole(geom, holecoords) {
        var geomA = getJSTSgeom(geom);
        var geomB = getJSTSgeom(new ol.geom.Polygon([holecoords]));
        return geomA.covers(geomB);
    }
});