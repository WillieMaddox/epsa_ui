/**
 * Created by maddoxw on 1/3/17.
 */

define(function (require) {
    'use strict';

    const $ = require('jquery'),
        ol = require('ol'),
        deg2tile = require('deg2tile'),
        mouseunits = require('mouseunits'),
        mouseprojection = require('mouseprojection'),
        bingKey = require('bingKey');

    require('layerswitcher');

    $('#mouse-units-container').append(mouseunits);
    $('#mouse-projection-container').append(mouseprojection);

    let $unitsSelect = $('#mouse-units');
    let $projectionSelect = $('#mouse-projection');
    let mouseProjection = ol.proj.get('EPSG:4326');
    let mousePrecision = 4;

    function updateMousePrecision(view) {
        let res = view.getResolution();
        let currentProj = map.getView().getProjection();//.getCode();
        if (mouseProjection !== currentProj) {
            let coord0 = view.getCenter();
            let coord1 = [coord0[0] + res, coord0[1] + res];
            coord0 = ol.proj.transform(coord0, currentProj, mouseProjection);
            coord1 = ol.proj.transform(coord1, currentProj, mouseProjection);
            res = Math.max(Math.abs(coord1[0] - coord0[0]), Math.abs(coord1[1] - coord0[1]));
        }
        mousePrecision = Number(Math.abs(Math.min(0, Math.floor(Math.log10(res)))).toFixed());
    }

    function coordinateFormat(coordinates) {
        let zoom = view.getZoom();
        let lonlatstr = ol.coordinate.createStringXY(mousePrecision);
        let lonlat = lonlatstr(coordinates).split(',');
        let coord0 = ol.proj.transform(coordinates, mouseProjection, 'EPSG:4326');
        let xytile = deg2tile(coord0[0], coord0[1], zoom);
        let lon = "Lon: " + lonlat[0];
        let lat = "Lat: " + lonlat[1];
        let x = "X: " + xytile[0];
        let y = "Y: " + xytile[1];
        let z = "Z: " + zoom;
        return [lon, lat, x, y, z].join('  ')
    }

    let layerSwitcher = new ol.control.LayerSwitcher();
    let scaleLineControl = new ol.control.ScaleLine();
    let mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: coordinateFormat,
        projection: mouseProjection,
        target: 'coordinates'
    });

    let thunderforestAttributions = [
        new ol.Attribution({
            html: 'Tiles &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>'
        }),
        ol.source.OSM.ATTRIBUTION
    ];

    let view = new ol.View({
        center: ol.proj.transform(
            // [-86.711, 34.636],
            // [-86.677945, 34.723185],
            // [-86.8043, 33.5170],
            // [-78.87532, 42.884600],
            // [-73.9812, 40.6957],
            // [-105.539, 39.771],
            // [-105.0, 39.75],
            // [-79.049, 43.146],
            // [-109.55, 31.34], // Douglass, AZ
            [-111.9796, 40.7867], // Salt Lake City, UT
            'EPSG:4326', 'EPSG:3857'),
        // center: [-8238000, 4970700],
        // center: [0, 0],
        zoom: 19
    });
    let map = new ol.Map({
        interactions: ol.interaction.defaults({doubleClickZoom: false}),
        target: document.getElementById('map'),
        view: view,
        // logo: {
        //     src: 'img/saic-logo2.png',
        //     href: 'http://www.saic.com'
        // },
        controls: [new ol.control.Attribution(), new ol.control.Zoom()],
        layers: [
            new ol.layer.Group({
                title: 'Bing',
                layers: [
                    new ol.layer.Tile({
                        title: 'Labels',
                        type: 'base',
                        visible: false,
                        source: new ol.source.BingMaps({
                            key: bingKey,
                            imagerySet: 'Road'
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'Aerial',
                        type: 'base',
                        visible: false,
                        source: new ol.source.BingMaps({
                            key: bingKey,
                            imagerySet: 'Aerial'
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'Aerial + Labels',
                        type: 'base',
                        visible: false,
                        source: new ol.source.BingMaps({
                            key: bingKey,
                            imagerySet: 'AerialWithLabels'
                        })
                    })
                ]
            }),
            new ol.layer.Group({
                title: 'Thunderforest',
                layers: [
                    new ol.layer.Tile({
                        title: 'OpenCycleMap',
                        type: 'base',
                        visible: false,
                        source: new ol.source.OSM({
                            url: 'http://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
                            attributions: thunderforestAttributions
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'Outdoors',
                        type: 'base',
                        visible: false,
                        source: new ol.source.OSM({
                            url: 'http://{a-c}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png',
                            attributions: thunderforestAttributions
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'Landscape',
                        type: 'base',
                        visible: false,
                        source: new ol.source.OSM({
                            url: 'http://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
                            attributions: thunderforestAttributions
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'Transport',
                        type: 'base',
                        visible: false,
                        source: new ol.source.OSM({
                            url: 'http://{a-c}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
                            attributions: thunderforestAttributions
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'Transport Dark',
                        type: 'base',
                        visible: false,
                        source: new ol.source.OSM({
                            url: 'http://{a-c}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png',
                            attributions: thunderforestAttributions
                        })
                    })
                ]
            }),
            new ol.layer.Group({
                title: 'OpenStreetMap',
                layers: [
                    new ol.layer.Tile({
                        title: 'OpenStreetMap',
                        type: 'base',
                        visible: true,
                        source: new ol.source.OSM()
                    })
                ]
            })
        ],
        loadTilesWhileInteracting: true,
        loadTilesWhileAnimating: true
    });

    map.addControl(layerSwitcher);
    map.addControl(scaleLineControl);
    map.addControl(mousePositionControl);

    $unitsSelect.on('change', function () {
        scaleLineControl.setUnits(this.value);
    });
    $projectionSelect.on('change', function () {
        mouseProjection = ol.proj.get(this.value);
        mousePositionControl.setProjection(mouseProjection);
    });
    view.on('change:resolution', function (evt) {
        updateMousePrecision(evt.target)
    });
    mousePositionControl.on('change:projection', function (evt) {
        updateMousePrecision(view)
    });
    $unitsSelect.val(scaleLineControl.getUnits());
    $projectionSelect.val(mousePositionControl.getProjection().getCode());

    return map
});

