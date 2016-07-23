/**
 * Created by maddoxw on 7/23/16.
 */

define(['ttemplate', 'tstyle', 'tfillopacity'], function (tobjectTemplates, tobjectStyle, fillOpacity) {

    var tobjectStyleFunction = (function () {
        return function (feature, resolution) {
            if (exists(feature.get('type')) && tobjectTemplates.hasOwnProperty(feature.get('type'))) {
                return tobjectStyle(
                    tobjectTemplates[feature.get('type')].color,
                    tobjectTemplates[feature.get('type')].fillopacity
                );
            } else {
                return tobjectStyle(
                    [255, 0, 0],
                    fillOpacity[feature.getGeometry().getType()]
                );
            }
        };
    })();

    return tobjectStyleFunction;

});