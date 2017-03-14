/**
 * Created by maddoxw on 7/23/16.
 */

define(["jquery", "stemplate"], function ($, sensorTemplates) {

    return (function () {

        var icons = {
            "camera": './img/camera-normal.png',
            "radio": './img/radio-normal.png'
        };
        var setStyle = function (icon_src) {
            var style = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    // size: [20, 20],
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    color: [255, 0, 0],
                    scale: 0.05,
                    src: icon_src
                }))
            });
            return [style]
        };
        return function (feature, resolution) {
            var icon_src;
            if (feature.get('type') && sensorTemplates.hasOwnProperty(feature.get('type'))) {
                icon_src = icons[feature.get('type')];
            } else {
                icon_src = 'https://openlayers.org/en/v3.19.1/examples/data/icon.png'
            }
            return setStyle(icon_src);
        };
    })();
});