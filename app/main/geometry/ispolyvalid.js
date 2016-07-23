/**
 * Created by maddoxw on 7/23/16.
 */

define(["getjstsgeom"], function (getJSTSgeom) {

    return function isPolyValid(poly) {
        var geom = getJSTSgeom(poly);
        return geom.isValid();
    };

});