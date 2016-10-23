/**
 * Created by maddoxw on 7/23/16.
 */

define([
    'tfillopacity',
    'tcolor'
], function (
    tobjectFillOpacity,
    tobjectColor) {

    var tobjectTemplates = {
        aor: {
            geometry_type: 'Polygon',
            // properties: {}
        },
        building: {
            geometry_type: 'Polygon',
            height: 10
            // properties: {
            //     height: 10
            // }
        },
        herbage: {
            geometry_type: 'Polygon',
            height: 10
            // properties: {
            //     height: 10
            // }
        },
        water: {
            geometry_type: 'Polygon',
            // properties: {}
        },
        wall: {
            geometry_type: 'LineString',
            height: 10,
            thickness: 10
            // properties: {
            //     height: 10,
            //     thickness: 10
            // }
        },
        road: {
            geometry_type: 'LineString',
            thickness: 10
            // properties: {
            //     thickness: 10
            // }
        },
        generic: {
            // properties: {}
        }
    };

    for (var template in tobjectTemplates) {
        if (tobjectTemplates.hasOwnProperty(template)) {
            tobjectTemplates[template].color = tobjectColor[template];
            tobjectTemplates[template].fillopacity = template === 'aor' ? 0 : 0.5;
        }
    }

    return tobjectTemplates;
});

