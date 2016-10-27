/**
 * Created by maddoxw on 7/23/16.
 */

define(["jquery", "ol", "featureid", "ispolyvalid"], function ($, ol, FID, isPolyValid) {
    'use strict';
    ol.control.Interaction = function (opt_options) {
        var options = opt_options || {};
        var controlDiv = document.createElement('div');
        controlDiv.className = options.className || 'ol-unselectable ol-control';
        var controlButton = document.createElement('button');
        controlButton.textContent = options.label || 'I';
        controlButton.title = 'Add ' + options.feature_type || 'Custom interaction';
        controlDiv.appendChild(controlButton);

        var _this = this;
        controlButton.addEventListener('click', function () {
            if (_this.get('interaction').getActive()) {
                _this.set('active', false);
            } else {
                _this.set('active', true);
            }
        });
        ol.control.Control.call(this, {
            element: controlDiv,
            target: options.target
        });

        this.setDisabled = function (bool) {
            if (typeof bool === 'boolean') {
                controlButton.disabled = bool;
                return this;
            }
        };

        this.setProperties({
            interaction: options.interaction,
            active: false,
            button_type: 'radio',
            feature_type: options.feature_type,
            destroyFunction: function (evt) {
                if (evt.element === _this) {
                    this.removeInteraction(_this.get('interaction'));
                }
            }
        });
        this.on('change:active', function () {
            this.get('interaction').setActive(this.get('active'));
            if (this.get('active')) {
                controlButton.classList.add('active');
                $(document).on('keyup', function (evt) {
                    if (evt.keyCode === 189 || evt.keyCode === 109) {
                        _this.get('interaction').removeLastPoint();
                    } else if (evt.keyCode === 27) {
                        _this.set('active', false);
                    }
                });
            } else {
                $(document).off('keyup');
                controlButton.classList.remove('active');
            }
        }, this);
    };
    ol.inherits(ol.control.Interaction, ol.control.Control);

    ol.control.Interaction.prototype.setMap = function (map) {
        ol.control.Control.prototype.setMap.call(this, map);
        var interaction = this.get('interaction');
        if (map === null) {
            ol.Observable.unByKey(this.get('eventId'));
        } else if (map.getInteractions().getArray().indexOf(interaction) === -1) {
            map.addInteraction(interaction);
            interaction.setActive(false);
            this.set('eventId', map.getControls().on('remove', this.get('destroyFunction'), map));
        }
    };

    var toolBar = function (options) {
        if (!(this instanceof toolBar)) {
            throw new Error('toolBar must be constructed with the new keyword.');
        }
        if (typeof options === 'object' && options.map && options.target && options.layertree) {
            if (!(options.map instanceof ol.Map)) {
                throw new Error('Please provide a valid OpenLayers 3 map object.');
            }
            this.map = options.map;
            this.toolbar = document.getElementById(options.target);
            this.layertree = options.layertree;
            this.controls = new ol.Collection();
            this.bitA = 0;
            this.bitB = 0;
            this.activeControl = null;
            this.active = false;
            this.drawEventEmitter = new ol.Observable();
            this.addedFeature = null;
        } else {
            throw new Error('Invalid parameter(s) provided.');
        }
    };

    toolBar.prototype.addControl = function (control) {
        if (!(control instanceof ol.control.Control)) {
            throw new Error('Only controls can be added to the toolbar.');
        }
        if (control.get('button_type') === 'radio') {
            control.on('change:active', function () {
                if (!(this.bitA | this.bitB)) {
                    this.activeControl = control;
                    this.active = true;
                    this.drawEventEmitter.changed();
                }
                this.bitA ^= 1;
                if (control.get('active')) {
                    this.controls.forEach(function (controlToDisable) {
                        if (controlToDisable.get('button_type') === 'radio' && controlToDisable !== control) {
                            controlToDisable.set('active', false);
                        }
                    });
                }
                this.bitB ^= 1;
                if (!(this.bitA | this.bitB)) {
                    this.activeControl = null;
                    this.active = false;
                    this.drawEventEmitter.changed();
                }
            }, this);
        }
        control.setTarget(this.toolbar);
        this.controls.push(control);
        this.map.addControl(control);
        return this;
    };
    toolBar.prototype.removeControl = function (control) {
        this.controls.remove(control);
        this.map.removeControl(control);
        return this;
    };
    toolBar.prototype.addDrawToolBar = function () {
        var layertree = this.layertree;

        this.drawControls = new ol.Collection();

        var drawPoint = new ol.control.Interaction({
            label: ' ',
            feature_type: 'point',
            geometry_type: 'Point',
            className: 'ol-addpoint ol-unselectable ol-control',
            interaction: this.handleEvents(new ol.interaction.Draw({type: 'Point'}), 'point')
        }).setDisabled(true);
        this.drawControls.push(drawPoint);
        var drawLineString = new ol.control.Interaction({
            label: ' ',
            feature_type: 'line',
            geometry_type: 'LineString',
            className: 'ol-addline ol-unselectable ol-control',
            interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'line')
        }).setDisabled(true);
        this.drawControls.push(drawLineString);
        var drawPolygon = new ol.control.Interaction({
            label: ' ',
            feature_type: 'polygon',
            geometry_type: 'Polygon',
            className: 'ol-addpolygon ol-unselectable ol-control',
            interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'polygon')
        }).setDisabled(true);
        this.drawControls.push(drawPolygon);

        var drawAOR = new ol.control.Interaction({
            label: ' ',
            feature_type: 'aor',
            geometry_type: 'Polygon',
            className: 'ol-addaor ol-unselectable ol-control',
            interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'aor')
        }).setDisabled(true);
        this.drawControls.push(drawAOR);
        var drawBuilding = new ol.control.Interaction({
            label: ' ',
            feature_type: 'building',
            geometry_type: 'Polygon',
            className: 'ol-addbuilding ol-unselectable ol-control',
            interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'building')
        }).setDisabled(true);
        this.drawControls.push(drawBuilding);
        var drawHerbage = new ol.control.Interaction({
            label: ' ',
            feature_type: 'herbage',
            geometry_type: 'Polygon',
            className: 'ol-addherbage ol-unselectable ol-control',
            interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'herbage')
        }).setDisabled(true);
        this.drawControls.push(drawHerbage);
        var drawWater = new ol.control.Interaction({
            label: ' ',
            feature_type: 'water',
            geometry_type: 'Polygon',
            className: 'ol-addwater ol-unselectable ol-control',
            interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'water')
        }).setDisabled(true);
        this.drawControls.push(drawWater);
        var drawWall = new ol.control.Interaction({
            label: ' ',
            feature_type: 'wall',
            geometry_type: 'LineString',
            className: 'ol-addwall ol-unselectable ol-control',
            interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'wall')
        }).setDisabled(true);
        this.drawControls.push(drawWall);
        var drawRoad = new ol.control.Interaction({
            label: ' ',
            feature_type: 'road',
            geometry_type: 'LineString',
            className: 'ol-addroad ol-unselectable ol-control',
            interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'road')
        }).setDisabled(true);
        this.drawControls.push(drawRoad);

        var drawCamera = new ol.control.Interaction({
            label: ' ',
            feature_type: 'camera',
            geometry_type: 'Point',
            className: 'ol-addcamera ol-unselectable ol-control',
            interaction: this.handleEvents(new ol.interaction.Draw({type: 'Point'}), 'camera')
        }).setDisabled(true);
        this.drawControls.push(drawCamera);

        this.activeFeatures = new ol.Collection();

        layertree.deselectEventEmitter.on('change', function () {
            this.drawControls.forEach(function (control) {
                control.set('active', false);
                control.setDisabled(true);
            });
            this.activeFeatures.clear();
            console.log('toolbar: deselect');
        }, this);

        layertree.selectEventEmitter.on('change', function () {
            var layer;

            if (layertree.selectedLayer) {
                layer = layertree.getLayerById(layertree.selectedLayer.id);
                console.log('toolbar: selected layer YES');
            } else {
                layer = null;
                console.log('toolbar: selected layer NO');
            }
            if (layer instanceof ol.layer.Vector) { // feature layer.

                layertree.identifyLayer(layer);
                var layerType = layer.get('type');

                if (layerType === 'geomcollection' || layerType === 'point') {
                    drawPoint.setDisabled(false);
                    drawCamera.setDisabled(false);
                }
                if (layerType === 'geomcollection' || layerType === 'line') {
                    drawLineString.setDisabled(false);
                    drawWall.setDisabled(false);
                    drawRoad.setDisabled(false);
                }
                if (layerType === 'geomcollection' || layerType === 'polygon') {
                    drawPolygon.setDisabled(false);
                    drawAOR.setDisabled(false);
                    drawWater.setDisabled(false);
                    drawHerbage.setDisabled(false);
                    drawBuilding.setDisabled(false);
                }
                var _this = this;
                setTimeout(function () {
                    _this.activeFeatures.extend(layer.getSource().getFeatures());
                }, 0);
            }
        }, this);

        this.drawControls.forEach(function (control) {
            this.addControl(control);
        }, this);

        return this;
    };
    toolBar.prototype.handleEvents = function (interaction, feature_type) {

        interaction.on('drawend', function (evt) {
            var geom = evt.feature.getGeometry();
            if (geom.getType().endsWith('Polygon') && !(isPolyValid(geom))) {
                return;
            }
            var id = FID.gen();

            evt.feature.setId(id);
            evt.feature.set('type', feature_type);
            evt.feature.set('name', feature_type.capitalizeFirstLetter() + '-' + id);

            //TODO: The feature shouldn't be added to the layer yet.
            //TODO: Only after deselect should the layer be updated.
            //TODO: Need to Check.
            // var selectedLayer = this.layertree.getLayerById(this.layertree.selectedLayer.id);
            // selectedLayer.getSource().addFeature(evt.feature);
            // this.activeFeatures.push(evt.feature);

            this.addedFeature = evt.feature;
            this.activeControl.set('active', false);
        }, this);
        return interaction;
    };

    return toolBar;
});