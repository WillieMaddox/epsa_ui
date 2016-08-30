/**
 * Created by maddoxw on 7/23/16.
 */


define([
    'tfillopacity',
    'tcolor',
    'tstyle'
], function (
    tobjectFillOpacity,
    tobjectColor,
    tobjectStyle) {

    var tobjectTemplates = {
        aor: {
            geometry_type: 'Polygon',
            properties: {}
        },
        building: {
            geometry_type: 'Polygon',
            properties: {
                height: 10
            }
        },
        herbage: {
            geometry_type: 'Polygon',
            properties: {
                height: 10
            }
        },
        water: {
            geometry_type: 'Polygon',
            properties: {}
        },
        wall: {
            geometry_type: 'LineString',
            properties: {
                height: 10,
                thickness: 10
            }
        },
        road: {
            geometry_type: 'LineString',
            properties: {
                thickness: 10
            }
        },
        polygon: {
            geometry_type: 'Polygon',
            properties: {}
        },
        point: {
            geometry_type: 'Point',
            properties: {}
        },
        line: {
            geometry_type: 'LineString',
            properties: {}
        }
    };

    for (var template in tobjectTemplates) {
        if (tobjectTemplates.hasOwnProperty(template)) {
            color = tobjectColor[template];
            tobjectTemplates[template].color = color;
            opacity = template === 'aor' ? 0 : tobjectFillOpacity[tobjectTemplates[template].geometry_type];
            tobjectTemplates[template].fillopacity = opacity;
            tobjectTemplates[template].styleFunction = tobjectStyle(color, opacity)
        }
    }

    return tobjectTemplates;
});