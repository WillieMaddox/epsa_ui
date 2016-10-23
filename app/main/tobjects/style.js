/**
 * Created by maddoxw on 7/23/16.
 */

define(['ol'], function (ol) {

    return function (color, opacity) {
        var style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: color.concat(1),
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: color.concat(0.5)
                })
            }),
            stroke: new ol.style.Stroke({
                color: color.concat(1),
                width: 3
            }),
            fill: new ol.style.Fill({
                color: color.concat(opacity)
            })
        });
        return [style]
    };

});