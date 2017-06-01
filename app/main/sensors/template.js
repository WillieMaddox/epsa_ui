/**
 * Created by maddoxw on 7/23/16.
 */

define(function (require) {
    'use strict';

    var $ = require('jquery'),
        defaultSensors = require('defaultsensors');

    var sensorProperties = {
        source_height: {
            units: 'meter',
            value: 3
        },
        target_height: {
            units: 'meter',
            value: 1
        },
        isotropic: true,
        min_range: {
            units: 'meter',
            value: 0
        },
        max_range: {
            units: 'meter',
            value: 1000
        },
        pan: {
            wrt: 'north',
            units: 'degree',
            value: 0
        },
        tilt: {
            units: 'degree',
            value: 0
        }
    };
    var cameraProperties = {
        type: 'camera',
        defaultsensor: 'TC1',
        option: 'A1',
        fov: 'wide'
    };
    var radioProperties = {
        type: 'radio',
        defaultsensor: 'TR1',
        option: 'A1',
        pattern: 'pattern'
    };

    var sensorTemplates = {
        camera: {
            geometry_type: 'Point',
            properties: $.extend({}, sensorProperties, cameraProperties),
            defaultSensors: null
        },
        radio: {
            geometry_type: 'Point',
            properties: $.extend({}, sensorProperties, radioProperties),
            defaultSensors: null
        }
    };

    defaultSensors(function (data) {
        sensorTemplates.camera.defaultSensors = data.camera;
        sensorTemplates.radio.defaultSensors = data.radio;
    });
    return sensorTemplates;
});