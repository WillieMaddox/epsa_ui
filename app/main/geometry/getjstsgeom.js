/**
 * Created by maddoxw on 7/23/16.
 */

define(['ol'], function (ol) {
    return function getJSTSgeom(origGeom) {
        return new jsts.io.GeoJSONReader().read(
            new ol.format.GeoJSON().writeFeatureObject(
                new ol.Feature({ geometry: origGeom })
            )
        ).geometry;
    }
});