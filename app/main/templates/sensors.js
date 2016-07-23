/**
 * Created by maddoxw on 7/23/16.
 */

define([""], function (mod) {
    var sensorTemplates = {
        camera: {
            geometry_type: 'point',
            styleFunction: cameraStyleFunction,
            properties: cameraProperties
        },
        radio: { // To be added later...
            geometry_type: 'point',
            styleFunction: 'radioStyleFunction',
            properties: 'radioProperties'
        }
    }

    var cameraProperties = {
        defaultsensor: '',
        source_height: {
            units: 'meter',
            value: 3
        },
        target_height: {
            units: 'meter',
            value: 1
        },
        tilt: {
            units: 'degree',
            value: 0
        },
        pan: {
            wrt: 'north',
            units: 'degree',
            value: 0
        },
        min_range: {
            units: 'meter',
            value: 0
        },
        max_range: {
            units: 'meter',
            value: 1000
        },
        isotropic: true,
        option: '',
        fovtype: ''
    };
    var cameraStyleFunction = (function () {
        var setStyle = function (color) {
            var style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: color.concat(1),
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: color.concat(0.6)
                    })
                })
            });
            return [style]
        };
        return function (feature, resolution) {
            var color;
            if (exists(feature.get('type')) && cameraProperties.hasOwnProperty(feature.get('type'))) {
                color = cameraProperties[feature.get('type')]['color'];
            } else {
                color = [255, 0, 0];
            }
            return setStyle(color);
        };
    })();


});