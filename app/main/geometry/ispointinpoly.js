/**
 * Created by maddoxw on 7/23/16.
 */

/**
 * check whether the point consists of pointcoords is inside the supplied polygon geometry
 * @{ol.geometry.Polygon} geom
 * @{Array()} a two elements array representing the point coordinates
 * @returns {Boolean} true||false
 */

define(["ol", "getjstsgeom"], function (ol, getJSTSgeom) {
    return function isPointInPoly(geom, pointcoords) {
        var geomA = getJSTSgeom(geom);
        var geomB = getJSTSgeom(new ol.geom.Point(pointcoords));
        return geomB.within(geomA);
    };
});