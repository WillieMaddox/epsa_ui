/**
 * Created by maddoxw on 7/23/16.
 */

define(["jsts"], function (jsts) {
    var parser = new jsts.io.OL3Parser();
    return function isPolyValid(poly) {
        var geom = parser.read(poly);
        return geom.isValid();
    };
});