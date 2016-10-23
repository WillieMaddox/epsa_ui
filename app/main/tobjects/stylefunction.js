/**
 * Created by maddoxw on 7/23/16.
 */

define(['ol',
    'ttemplate',
    'tcolor',
    'tstyle',
    'tfillopacity',
    'exists'], function (
        ol,
        tobjectTemplates,
        tobjectColor,
        tobjectStyle,
        FillOpacity,
        exists) {

    return (function () {
        return function (feature, resolution) {
            if (exists(feature.get('type')) && tobjectTemplates.hasOwnProperty(feature.get('type'))) {
                return tobjectStyle(
                    tobjectColor[feature.get('type')],
                    feature.get('type') === 'aor' ? 0 : FillOpacity[feature.getGeometry().getType()]
                );
            } else {
                return tobjectStyle(
                    [255, 0, 0],
                    0.5
                );
            }
        };
    })();
});