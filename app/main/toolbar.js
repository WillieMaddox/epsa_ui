/**
 * Created by maddoxw on 7/23/16.
 */

define(['jquery', 'ol',
    'utils',
    'map',
    'layertree',
    'ispolyvalid'], function ($, ol,
                              utils,
                              map,
                              layertree,
                              isPolyValid) {

    'use strict';

    var bitA = 0;
    var bitB = 0;
    var activeControl = null;
    var drawControls = new ol.Collection();

    return {
        init: function () {
            this.toolbar = document.getElementById('toolbar');
            this.controls = new ol.Collection();
            // this.bitA = 0;
            // this.bitB = 0;
            // this.activeControl = null;
            this.active = false;
            this.drawEventEmitter = new ol.Observable();
            this.addedFeature = null;
        },
        addControl: function (control) {
            if (!(control instanceof ol.control.Control)) {
                throw new Error('Only controls can be added to the toolbar.');
            }
            if (control.get('button_type') === 'radio') {
                control.on('change:active', function () {
                    if (!(bitA | bitB)) {
                        activeControl = control;
                        this.active = true;
                        this.drawEventEmitter.changed();
                    }
                    bitA ^= 1;
                    if (control.get('active')) {
                        this.controls.forEach(function (controlToDisable) {
                            if (controlToDisable.get('button_type') === 'radio' && controlToDisable !== control) {
                                controlToDisable.set('active', false);
                            }
                        });
                    }
                    bitB ^= 1;
                    if (!(bitA | bitB)) {
                        activeControl = null;
                        this.active = false;
                        this.drawEventEmitter.changed();
                    }
                }, this);
            }
            control.setTarget(this.toolbar);
            this.controls.push(control);
            map.addControl(control);
            return this;
        },
        removeControl: function (control) {
            this.controls.remove(control);
            map.removeControl(control);
            return this;
        },
        addDrawToolBar: function () {

            var drawPoint = new ol.control.Interaction({
                label: ' ',
                feature_type: 'point',
                geometry_type: 'Point',
                className: 'ol-addpoint ol-unselectable ol-control',
                interaction: this.handleEvents(new ol.interaction.Draw({type: 'Point'}), 'point')
            }).setDisabled(true);
            drawControls.push(drawPoint);
            var drawLineString = new ol.control.Interaction({
                label: ' ',
                feature_type: 'line',
                geometry_type: 'LineString',
                className: 'ol-addline ol-unselectable ol-control',
                interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'line')
            }).setDisabled(true);
            drawControls.push(drawLineString);
            var drawPolygon = new ol.control.Interaction({
                label: ' ',
                feature_type: 'polygon',
                geometry_type: 'Polygon',
                className: 'ol-addpolygon ol-unselectable ol-control',
                interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'polygon')
            }).setDisabled(true);
            drawControls.push(drawPolygon);

            var drawAOR = new ol.control.Interaction({
                label: ' ',
                feature_type: 'aor',
                geometry_type: 'Polygon',
                className: 'ol-addaor ol-unselectable ol-control',
                interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'aor')
            }).setDisabled(true);
            drawControls.push(drawAOR);
            var drawBuilding = new ol.control.Interaction({
                label: ' ',
                feature_type: 'building',
                geometry_type: 'Polygon',
                className: 'ol-addbuilding ol-unselectable ol-control',
                interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'building')
            }).setDisabled(true);
            drawControls.push(drawBuilding);
            var drawHerbage = new ol.control.Interaction({
                label: ' ',
                feature_type: 'herbage',
                geometry_type: 'Polygon',
                className: 'ol-addherbage ol-unselectable ol-control',
                interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'herbage')
            }).setDisabled(true);
            drawControls.push(drawHerbage);
            var drawWater = new ol.control.Interaction({
                label: ' ',
                feature_type: 'water',
                geometry_type: 'Polygon',
                className: 'ol-addwater ol-unselectable ol-control',
                interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'water')
            }).setDisabled(true);
            drawControls.push(drawWater);
            var drawWall = new ol.control.Interaction({
                label: ' ',
                feature_type: 'wall',
                geometry_type: 'LineString',
                className: 'ol-addwall ol-unselectable ol-control',
                interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'wall')
            }).setDisabled(true);
            drawControls.push(drawWall);
            var drawRoad = new ol.control.Interaction({
                label: ' ',
                feature_type: 'road',
                geometry_type: 'LineString',
                className: 'ol-addroad ol-unselectable ol-control',
                interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'road')
            }).setDisabled(true);
            drawControls.push(drawRoad);

            var drawCamera = new ol.control.Interaction({
                label: ' ',
                feature_type: 'camera',
                geometry_type: 'Point',
                className: 'ol-addcamera ol-unselectable ol-control',
                interaction: this.handleEvents(new ol.interaction.Draw({
                    type: 'Point',
                    style: new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            anchor: [0.5, 0.5],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            // size: [20, 20],
                            color: [255, 0, 0],
                            scale: 0.05,
                            src: 'img/camera-normal.png'
                        }))
                    })
                }), 'camera')
            }).setDisabled(true);
            drawControls.push(drawCamera);

            // this.activeFeatures = new ol.Collection();

            layertree.deselectEventEmitter.on('change', function () {
                drawControls.forEach(function (control) {
                    control.set('active', false);
                    control.setDisabled(true);
                });
                // this.activeFeatures.clear();
            }, this);

            layertree.selectEventEmitter.on('change', function () {

                var layer = layertree.getLayerById(layertree.selectedLayer.id);

                if (layer instanceof ol.layer.Image) { // feature layer.

                    // layertree.identifyLayer(layer);
                    var layerGeomType = layer.get('geomtype');
                    var layerType = layer.get('type');

                    if (layerType === 'sensor') {
                        drawCamera.setDisabled(false);
                    } else if (layerType === 'feature') {
                        if (layerGeomType === 'geomcollection' || layerGeomType === 'point') {
                            drawPoint.setDisabled(false);
                        }
                        if (layerGeomType === 'geomcollection' || layerGeomType === 'line') {
                            drawLineString.setDisabled(false);
                            drawWall.setDisabled(false);
                            drawRoad.setDisabled(false);
                        }
                        if (layerGeomType === 'geomcollection' || layerGeomType === 'polygon') {
                            drawPolygon.setDisabled(false);
                            drawAOR.setDisabled(false);
                            drawWater.setDisabled(false);
                            drawHerbage.setDisabled(false);
                            drawBuilding.setDisabled(false);
                        }
                    }
                    // var _this = this;
                    // setTimeout(function () {
                    //     _this.activeFeatures.extend(layer.getSource().getFeatures());
                    // }, 0);
                }
            }, this);

            drawControls.forEach(function (control) {
                this.addControl(control);
            }, this);

            return this;
        },
        handleEvents: function (interaction, feature_type) {

            interaction.on('drawend', function (evt) {
                var geom = evt.feature.getGeometry();
                if (geom.getType().endsWith('Polygon') && !(isPolyValid(geom))) {
                    return;
                }
                var id = utils.FID.gen();

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
                activeControl.set('active', false);
            }, this);
            return interaction;
        }
    }
});