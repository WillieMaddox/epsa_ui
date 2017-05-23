// using simple sub-module augmentation
define(['MainCore', 'ol'], function(OSMFire_Core, ol) {
    "use strict";
    let map = null;
    let view = null;
    let mouseProjection = "EPSG:4326";
    let mousePrecision = 0;
    let selectedLayer = null;

    let self = {};
    self.getMap = function() {
        return map;
    };
    self.setMap = function(value) {
        map = value;
    };
    self.getView = function() {
        return view;
    };
    // self.setView = function(value) {
    //     view = value;
    // };
    self.addControl = function(control) {
        map.addControl(control)
    };
    self.getMouseProjection = function() {
        return mouseProjection;
    };
    self.setMouseProjection = function(proj) {
        mouseProjection = proj;
    };
    self.getMousePrecision = function() {
        return mousePrecision;
    };
    self.setMousePrecision = function () {
        let res = view.getResolution();
        let oldProj = view.getProjection();
        let newProj = ol.proj.get(mouseProjection);
        if (oldProj !== newProj) {
            let coord0 = view.getCenter();
            let coord1 = [coord0[0] + res, coord0[1] + res];
            coord0 = ol.proj.transform(coord0, oldProj, newProj);
            coord1 = ol.proj.transform(coord1, oldProj, newProj);
            res = Math.max(Math.abs(coord1[0] - coord0[0]), Math.abs(coord1[1] - coord0[1]));
        } else {
            res = view.getResolution();
        }
        mousePrecision = Number(Math.abs(Math.min(0, Math.floor(Math.log10(res)))).toFixed());
    };
    self.getFormat = function (formatString) {
        var Formats = {
            'zip': function () {
                return new ol.format.GeoJSON();
            },
            'geojson': function () {
                return new ol.format.GeoJSON();
            },
            'topojson': function () {
                return new ol.format.TopoJSON();
            },
            'kml': function () {
                return new ol.format.KML();
            },
            'osm': function () {
                return new ol.format.OSMXML();
            },
            'wmscapabilities': function () {
                return new ol.format.WMSCapabilities();
            },
            'wfs': function () {
                return new ol.format.WFS();
            },
            'gml': function () {
                // TODO: Add a callback.
                return new ol.format.GML();
            }
        };
        return Formats[formatString]();
    };
    self.getLoadingStrategy = function(strategy) {
        var Strategies = {
            'tile': function () {
                return ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({}))
            },
            'bbox': function () {
                return ol.loadingstrategy.bbox
            }
        };
        return Strategies[strategy]();
    };
    self.getSource = function(source, opt) {
        var Sources = {
            'TileWMS': function () {
                return new ol.source.TileWMS(opt)
            },
            'ImageWMS': function () {
                return new ol.source.ImageWMS(opt)
            },
            'ImageVector': function () {
                return new ol.source.ImageVector(opt)
            },
            'ImageStatic': function () {
                return new ol.source.ImageStatic(opt)
            },
            'BingMaps': function () {
                return new ol.source.BingMaps(opt)
            },
            'OSM': function () {
                return new ol.source.OSM(opt)
            },
            'Vector': function () {
                return new ol.source.Vector(opt)
            }
        };
        return Sources[source]();
    };
    self.getLayer = function(layer, opt) {
        var Layers = {
            'Group': function () {
                return new ol.layer.Group(opt)
            },
            'Vector': function () {
                return new ol.layer.Vector(opt)
            },
            'Image': function () {
                return new ol.layer.Image(opt)
            },
            'Tile': function () {
                return new ol.layer.Tile(opt)
            }
        };
        return Layers[layer]();
    };
    self.addLayer = function (layer) {
        map.addLayer(layer)
    };
    self.selectLayer = function (layer) {
        selectedLayer = layer;
        return selectedLayer
    };
    self.getSelectedLayer = function () {
        return selectedLayer
    };
    self.deselectLayer = function () {
        selectedLayer = null;
        return selectedLayer
    };

    self.recenterView = function(x, y) {
        var center = ol.proj.transform([x, y], 'EPSG:4326', 'EPSG:3857');
        view.setCenter(center);
    };
    self.initialize = function() {

        ol.Map
        ol.Attribution
        ol.View
        ol.inherits
        ol.Sphere
        ol.Feature
        ol.Overlay
        ol.Collection
        ol.Observable

        ol.style.Style
        ol.style.Text
        ol.style.Stroke
        ol.style.Fill
        ol.style.Circle
        ol.style.RegularShape
        ol.style.Icon

        ol.control.call
        ol.control.Control
        ol.control.LayerSwitcher
        ol.control.MousePosition
        ol.control.ScaleLine
        ol.control.Attribution
        ol.control.Zoom
        ol.control.Interaction

        ol.interaction.Select
        ol.interaction.Modify
        ol.interaction.Translate
        ol.interaction.Draw
        ol.interaction.ChooseHole
        ol.interaction.Pointer
        ol.interaction.defaults

        // ol.loadingstrategy
        // ol.tilegrid.createXYZ
        ol.coordinate.createStringXY
        ol.extent.getCenter

        ol.events.condition.never
        ol.events.condition.doubleClick
        ol.events.condition.singleClick

        ol.geom.Point
        ol.geom.Polygon
        ol.geom.LinearRing
        ol.geom.LineString

        ol.proj.transformExtent
        ol.proj.transform
        ol.proj.get

        // Done
        // ol.layer
        // ol.layer.Group
        // ol.layer.Vector
        // ol.layer.Image
        // ol.layer.Tile
        // ol.source
        // ol.source.TileWMS
        // ol.source.ImageWMS
        // ol.source.ImageVector
        // ol.source.ImageStatic
        // ol.source.BingMaps
        // ol.source.OSM
        // ol.source.OSM.ATTRIBUTION
        // ol.source.Vector
        // ol.format
        // ol.format.GeoJSON
        // ol.format.TopoJSON
        // ol.format.OSMXML
        // ol.format.WMSCapabilities
        // ol.format.WFS
        // ol.format.KML
        // ol.format.GML

        map = new ol.Map({
            interactions: ol.interaction.defaults({doubleClickZoom: false}),
            loadTilesWhileInteracting: true,
            loadTilesWhileAnimating: true
        });
        view = new ol.View({});
        OSMFire_Core.log(1, 'OL Module has been initialized...', "blue");
    };
    // register with MainCore
    self.register = (function() {
        OSMFire_Core.registerModule(self);
    })();
    return OSMFire_Core.OL = {
        initialize: self.initialize,
        setMap: self.setMap,
        getMap: self.getMap,
        getView: self.getView,
        getMouseProjection: self.getMouseProjection,
        setMouseProjection: self.setMouseProjection,
        getMousePrecision: self.getMousePrecision,
        setMousePrecision: self.setMousePrecision,
        getLoadingStrategy: self.getLoadingStrategy,
        getFormat: self.getFormat,
        getSource: self.getSource,
        getLayer: self.getLayer,
        addLayer: self.addLayer,
        addControl: self.addControl,
        handlerObj: self
    };
});