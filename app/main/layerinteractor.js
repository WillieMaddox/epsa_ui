/**
 * Created by maddoxw on 9/6/16.
 */

define(['jquery', 'ol',
    'nouislider',
    'exists',
    "featureid",
    'ttemplate',
    'ispolyvalid',
    'ispointinpoly',
    'doespolycoverhole'
], function ($, ol,
             noUiSlider,
             exists,
             FID,
             tobjectTemplates,
             isPolyValid,
             isPointInPoly,
             doesPolyCoverHole) {

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
                    if (evt.keyCode == 189 || evt.keyCode == 109) {
                        _this.get('interaction').removeLastPoint();
                    } else if (evt.keyCode == 27) {
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

    var layerInteractor = function (options) {
        'use strict';
        if (!(this instanceof layerInteractor)) {
            throw new Error('layerInteractor must be constructed with the new keyword.');
        } else if (typeof options === 'object' && options.map && options.layertree && options.toolbartarget && options.featuretarget) {
            if (!(options.map instanceof ol.Map)) {
                throw new Error('Please provide a valid OpenLayers 3 map object.');
            }
            var _this = this;
            this.map = options.map;
            this.layertree = options.layertree;

            this.toolbar = document.getElementById(options.toolbartarget);
            this.createForm({target: options.featuretarget});

            this.controls = new ol.Collection();
            this.bitA = 0;
            this.bitB = 0;
            this.activeControl = undefined;
            this.active = false;
            this.drawEventEmitter = new ol.Observable();
            this.addedFeature = null;
            this.autoselect = false;
            this.wgs84Sphere = new ol.Sphere(6378137);
            this.highlight = undefined;
            this.featureOverlay = this.createFeatureOverlay();
            this.map.addLayer(this.featureOverlay);
            this.hoverDisplay = function (evt) {
                if (evt.dragging) return;
                var pixel = _this.map.getEventPixel(evt.originalEvent);
                var feature = _this.getFeatureAtPixel(pixel);
                _this.setMouseCursor(feature);
                _this.displayFeatureInfo(feature);
            };
            this.addInteractions();

            this.map.addInteraction(this.select);
            this.select.setActive(true);

            this.map.on('pointermove', this.hoverDisplay);
            this.map.addInteraction(this.modify);
            this.modify.setActive(false);

            document.getElementById('map').addEventListener('mouseleave', function () {
                if (_this.highlight) {
                    _this.featureOverlay.getSource().removeFeature(_this.highlight);
                    _this.highlight = undefined;
                }
            });

        } else {
            throw new Error('Invalid parameter(s) provided.');
        }
    };

    layerInteractor.prototype.addControl = function (control) {
        if (!(control instanceof ol.control.Control)) {
            throw new Error('Only controls can be added to the toolbar.');
        }
        if (control.get('button_type') === 'radio') {
            control.on('change:active', function () {
                if (!(this.bitA | this.bitB)) {
                    this.activeControl = control;
                    this.active = true;
                    this.drawEventEmitter.changed()
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
                    this.activeControl = undefined;
                    this.active = false;
                    this.drawEventEmitter.changed()
                }
            }, this);
        }
        control.setTarget(this.toolbar);
        this.controls.push(control);
        this.map.addControl(control);
        return this;
    };
    layerInteractor.prototype.removeControl = function (control) {
        this.controls.remove(control);
        this.map.removeControl(control);
        return this;
    };
    layerInteractor.prototype.addDrawToolBar = function () {
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
            var layer;
            if (layertree.selectedLayer) {
                layer = layertree.getLayerById(layertree.selectedLayer.id);
            } else {
                layer = null;
            }
            var selectedFeatures = this.select.getFeatures();
            if (selectedFeatures.getLength() === 1) {
                layer.getSource().addFeature(selectedFeatures.getArray()[0]);
                selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
            }
        }, this);

        layertree.selectEventEmitter.on('change', function () {
            var layer;

            if (layertree.selectedLayer) {
                layer = layertree.getLayerById(layertree.selectedLayer.id);
            } else {
                layer = null;
            }
            this.drawControls.forEach(function (control) {
                control.set('active', false);
                control.setDisabled(true);
            });
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
                    _this.activeFeatures.clear();
                    _this.activeFeatures.extend(layer.getSource().getFeatures());
                }, 0);
            }
        }, this);

        this.drawControls.forEach(function (control) {
            this.addControl(control)
        }, this);

        return this;
    };
    layerInteractor.prototype.handleEvents = function (interaction, feature_type) {

        interaction.on('drawend', function (evt) {
            var geom = evt.feature.getGeometry();
            if (geom.getType().endsWith('Polygon') && !(isPolyValid(geom))) {
                return;
            } else {
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
            }
            this.activeControl.set('active', false);
        }, this);
        return interaction;
    };



    layerInteractor.prototype.createOption = function (optionValue) {
        var option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        return option;
    };
    layerInteractor.prototype.removeContent = function (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        return this;
    };
    layerInteractor.prototype.stopPropagationOnEvent = function (node, event) {
        node.addEventListener(event, function (evt) {
            evt.stopPropagation();
        });
        return node;
    };

    layerInteractor.prototype.createForm = function (options) {

        var _this = this;
        var featureeditor = document.getElementById(options.target);
        featureeditor.className = 'featureeditor';

        var form = document.createElement('form');
        form.className = 'form';
        form.id = 'featureproperties';
        form.style.display = 'none';

        form.appendChild(this.addLayerGeometry());

        var rowElem = document.createElement('div');
        rowElem.className = 'form-row';

        var attributeSpan = document.createElement('div');
        attributeSpan.className = 'form-label';
        attributeSpan.textContent = 'Geometry type: ';
        rowElem.appendChild(attributeSpan);

        var geometryType = document.createElement('div');
        geometryType.className = 'form-value';
        geometryType.id = "geometry-type";

        rowElem.appendChild(geometryType);

        form.appendChild(rowElem);

        var rowElem = document.createElement('div');
        rowElem.className = 'form-row';
        var attributeSpan = document.createElement('div');
        attributeSpan.className = 'form-label';
        attributeSpan.style.display = 'flex';
        var measureLabel = document.createElement('div');
        measureLabel.id = 'measure-label';
        measureLabel.textContent = 'Measure: ';
        attributeSpan.appendChild(measureLabel);
        var geodesic = document.createElement('input');
        geodesic.id = "geodesic";
        geodesic.type = "checkbox";
        geodesic.title = "Use geodesic measures";
        attributeSpan.appendChild(geodesic);
        rowElem.appendChild(attributeSpan);
        var measure = document.createElement('div');
        measure.id = 'measure-feature';
        rowElem.appendChild(measure);
        form.appendChild(rowElem);

        var rowElem = document.createElement('div');
        rowElem.className = 'form-row';
        var attributeSpan = document.createElement('div');
        attributeSpan.className = 'form-label';
        attributeSpan.textContent = 'Name: ';
        rowElem.appendChild(attributeSpan);
        var featureName = document.createElement('input');
        featureName.className = 'form-value';
        featureName.id = "feature-name";
        featureName.type = "text";
        rowElem.appendChild(featureName);
        form.appendChild(rowElem);

        var rowElem = document.createElement('div');
        rowElem.className = 'form-row';
        var attributeSpan = document.createElement('div');
        attributeSpan.className = 'form-label';
        attributeSpan.textContent = 'Hole: ';
        rowElem.appendChild(attributeSpan);
        rowElem.appendChild(this.createHoleButton("add"));
        rowElem.appendChild(this.createHoleButton("delete"));
        form.appendChild(rowElem);

        var rowElem = document.createElement('div');
        rowElem.className = 'form-row';
        var attributeSpan = document.createElement('div');
        attributeSpan.className = 'form-label';
        attributeSpan.textContent = 'Feature type:';
        rowElem.appendChild(attributeSpan);
        var featureType = document.createElement('select');
        featureType.className = 'form-value';
        featureType.id = "feature-type";
        featureType.addEventListener('change', function () {
            _this.loadFeature(this.value);
        });

        rowElem.appendChild(featureType);
        form.appendChild(rowElem);

        // var rowElem = document.createElement('div');
        // rowElem.className = 'form-row';
        // var attributeSpan = document.createElement('div');
        // attributeSpan.className = 'form-label';
        // attributeSpan.textContent = 'Sub Type: ';
        // rowElem.appendChild(attributeSpan);
        // var subType = document.createElement('select');
        // subType.className = 'form-value';
        // subType.id = "sub-type";
        // rowElem.appendChild(subType);
        // form.appendChild(rowElem);

        var rowElem = document.createElement('div');
        rowElem.className = 'form-row';
        var attributeSpan = document.createElement('div');
        attributeSpan.className = 'form-label';
        attributeSpan.textContent = 'Height: ';
        rowElem.appendChild(attributeSpan);
        var heightSlider = document.createElement('div');
        heightSlider.id = 'height-slider';
        noUiSlider.create(heightSlider, {
            start: null,
            connect: 'lower',
            behaviour: 'tap',
            range: {
                'min': 0,
                '25%': 1,
                '50%': 10,
                '75%': 100,
                'max': 1000
            }
        });

        var heightInput = document.createElement('input');
        heightInput.className = 'form-value';
        heightInput.id = 'height-input';
        heightInput.type = 'number';
        rowElem.appendChild(heightInput);
        form.appendChild(rowElem);

        // When the slider value changes, update the input and span
        heightSlider.noUiSlider.on('update', function (values, handle) {
            heightInput.value = values[handle];
        });
        // When the input changes, set the slider value
        heightInput.addEventListener('change', function () {
            heightSlider.noUiSlider.set(this.value);
        });

        var rowElem = document.createElement('div');
        rowElem.appendChild(heightSlider);
        form.appendChild(rowElem);


        var rowElem = document.createElement('div');
        rowElem.className = 'form-row';
        var attributeSpan = document.createElement('div');
        attributeSpan.className = 'form-label';
        attributeSpan.textContent = 'Thickness: ';
        rowElem.appendChild(attributeSpan);
        var thicknessSlider = document.createElement('div');
        thicknessSlider.id = 'thickness-slider';
        noUiSlider.create(thicknessSlider, {
            start: null,
            margin: 20,
            connect: 'lower',
            behaviour: 'tap',
            range: {'min': 0, 'max': 50}
        });

        var thicknessInput = document.createElement('input');
        thicknessInput.className = 'form-value';
        thicknessInput.id = 'thickness-input';
        thicknessInput.type = "number";
        rowElem.appendChild(thicknessInput);
        form.appendChild(rowElem);

        // When the slider value changes, update the input and span
        thicknessSlider.noUiSlider.on('update', function (values, handle) {
            thicknessInput.value = values[handle];
        });
        // When the input changes, set the slider value
        thicknessInput.addEventListener('change', function () {
            thicknessSlider.noUiSlider.set(this.value);
        });

        var rowElem = document.createElement('div');
        rowElem.appendChild(thicknessSlider);
        form.appendChild(rowElem);


        // var table = document.createElement('table');
        // table.appendChild(this.addGeometryType());
        // table.appendChild(this.addName());
        // table.appendChild(this.addDrawHoleButton());
        // table.appendChild(this.addDeleteHoleButton());
        // table.appendChild(this.addFeatureType());
        // table.appendChild(this.addSubType());
        // table.appendChild(this.addHeight());
        // table.appendChild(this.addThickness());
        // table.appendChild(this.addLength(geometry_type));
        // table.appendChild(this.addArea(geometry_type));
        // form.appendChild(table);

        featureeditor.appendChild(form);
        return this;
    };

    layerInteractor.prototype.createLabel = function (label) {
        var td = document.createElement('td');
        var l = document.createTextNode(label);
        td.appendChild(l);
        return td;
    };
    layerInteractor.prototype.createInput = function (name, type) {
        var td = document.createElement('td');
        var element = document.createElement('input');
        element.name = name;
        element.type = type;
        element.required = true;
        td.appendChild(element);
        return td;
    };
    layerInteractor.prototype.createHoleButton = function (label) {
        var buttonElem = document.createElement('input');
        buttonElem.id = label + '-hole';
        buttonElem.className = "hole-buttons ol-" + label + "hole ol-unselectable ol-control";
        buttonElem.type = "button";
        buttonElem.value = label.capitalizeFirstLetter();
        var _this = this;

        switch (label) {
            case 'add':
                buttonElem.title = 'Draw a hole in the selected feature';
                buttonElem.addEventListener('click', function () {
                    _this.addHole();
                });
                return buttonElem;
            case 'delete':
                buttonElem.title = 'Delete a hole from the selected feature';
                buttonElem.addEventListener('click', function () {
                    _this.deleteHole();
                });
                return buttonElem;
            default:
                return false;
        }
    };
    layerInteractor.prototype.createMenu = function (name, id) {
        var td = document.createElement('td');
        var element = document.createElement('select');
        element.name = name;
        element.type = "text";
        element.id = id;
        td.appendChild(element);
        return td;
    };

    layerInteractor.prototype.addLayerGeometry = function () {
        // readonly
        var p = document.createElement('p');
        p.appendChild(document.createTextNode("layer Geometry:"));
        return p
    };
    layerInteractor.prototype.addGeometryType = function () {
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Geometry type:"));
        tr.appendChild(this.createInput("geometry_type", "text"));
        return tr;
    };
    layerInteractor.prototype.addName = function () {
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Name:"));
        tr.appendChild(this.createInput("name", "text"));
        return tr;
    };
    layerInteractor.prototype.addDrawHoleButton = function () {
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Draw:"));
        // tr.appendChild(this.createButton("draw", "hole"));
        tr.appendChild(this.createButton2("drawhole", "Draw Hole", "drawhole"));
        return tr;
    };
    layerInteractor.prototype.addDeleteHoleButton = function () {
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Delete:"));
        // tr.appendChild(this.createButton("delete", "hole"));
        tr.appendChild(this.createButton2("deletehole", "Delete Hole", "deletehole"));
        return tr;
    };
    layerInteractor.prototype.addFeatureType = function () {
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Feature type:"));
        tr.appendChild(this.createMenu("feature_type", "feature-type"));
        return tr;
    };
    layerInteractor.prototype.addSubType = function () {
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Sub type:"));
        tr.appendChild(this.createMenu("subtype", ""));
        return tr;
    };
    layerInteractor.prototype.addHeight = function () {
        // add slider.
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Height:"));
        tr.appendChild(this.createInput("height", "number"));
        return tr;
    };
    layerInteractor.prototype.addThickness = function () {
        // add slider
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Thickness:"));
        tr.appendChild(this.createInput("thickness", "number"));
        return tr;
    };
    layerInteractor.prototype.addCoordsLat = function () {
        // readonly
        // only for Points (not MultiPoints)
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Lat:"));
        tr.appendChild(this.createInput("lattitude", "number"));
        return tr;
    };
    layerInteractor.prototype.addCoordsLon = function () {
        // readonly
        // only for Points (not MultiPoints)
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Lon:"));
        tr.appendChild(this.createInput("longitude", "number"));
        return tr;
    };
    layerInteractor.prototype.addLength = function () {
        // readonly
        // only for Lines and LineStrings
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Length:"));
        tr.appendChild(this.createInput("length", "text"));
        return tr;
    };
    layerInteractor.prototype.addArea = function () {
        // readonly
        // only for Polygons and MultiPolygons
        var tr = document.createElement('tr');
        tr.appendChild(this.createLabel("Area:"));
        tr.appendChild(this.createInput("area", "text"));
        return tr;
    };

    layerInteractor.prototype.addHole = function () {
        var holeStyle = [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.8)',
                    lineDash: [3, 9],
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0)'
                })
            }),
            new ol.style.Style({
                image: new ol.style.RegularShape({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 0, 0, 0.5)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 1
                    }),
                    points: 4,
                    radius: 6,
                    angle: Math.PI / 4
                })
            })
        ];

        var currFeat = this.select.getFeatures().getArray()[0];
        var geomTypeSelected = currFeat.getGeometry().getType();
        var isMultiPolygon = geomTypeSelected === 'MultiPolygon';
        if (!(geomTypeSelected.endsWith("Polygon"))) {
            alert("Only Polygon and MultiPolygon geometries can have holes. Not " + geomTypeSelected);
            return;
        }
        // Clone and original selected geometry so we can test new vertex points against it in the geometryFunction.
        var origGeom = currFeat.getGeometry().clone();
        var currGeom;
        var polyindex = 0;
        var refGeom;
        if (isMultiPolygon) {
            var pickPoly = function (feature) {
                var points = feature.getGeometry().getCoordinates(false)[0];
                var polygons = origGeom.getPolygons();
                var nPolygons = polygons.length;
                for (var i = 0; i < nPolygons; i++) {
                    if (isPointInPoly(polygons[i], points[0])) {
                        polyindex = i;
                    }
                }
            }
        }

        var vertsCouter = 0; //this is the number of vertices drawn on the ol.interaction.Draw(used in the geometryFunction)

        //create a hole draw interaction
        var source = new ol.source.Vector();
        var holeDraw = new ol.interaction.Draw({
            source: source,
            type: 'Polygon',
            style: holeStyle,
            condition: function (evt) {
                if (evt.type === 'pointerdown' || ol.events.condition.singleClick(evt)) {
                    if (exists(refGeom)) {
                        return (isPointInPoly(refGeom, evt.coordinate))
                    } else {
                        return (isPointInPoly(origGeom, evt.coordinate))
                    }
                }
            }
        });

        var deleteHoleIsDisabled = document.getElementById('delete-hole').disabled;
        document.getElementById('add-hole').disabled = true;
        document.getElementById('delete-hole').disabled = true;
        this.map.un('pointermove', this.hoverDisplay);
        this.select.setActive(false);
        this.modify.setActive(false);
        // this.translate.setActive(true);
        this.map.addInteraction(holeDraw);

        var _this = this;

        var finishHole = function () {
            _this.map.removeInteraction(holeDraw);
            _this.modify.setActive(true);
            _this.select.setActive(true);
            // _this.translate.setActive(true);
            _this.map.on('pointermove', _this.hoverDisplay);
            document.getElementById('add-hole').disabled = false;
            $(document).off('keyup')
        };

        $(document).on('keyup', function (evt) {
            if (evt.keyCode == 189 || evt.keyCode == 109) {
                if (vertsCouter === 1) {
                    currGeom.setCoordinates(origGeom.getCoordinates());
                    document.getElementById('delete-hole').disabled = deleteHoleIsDisabled;
                    finishHole()
                } else {
                    holeDraw.removeLastPoint();
                }
            } else if (evt.keyCode == 27) {
                currGeom.setCoordinates(origGeom.getCoordinates());
                document.getElementById('delete-hole').disabled = deleteHoleIsDisabled;
                finishHole()
            }
        });

        holeDraw.on('drawstart', function (evt) {
            var feature = evt.feature; // the hole feature
            var ringAdded = false; //init boolean var to clarify whether drawn hole has already been added or not
            var setCoords;
            var polyCoords;

            currGeom = currFeat.getGeometry();
            if (isMultiPolygon) {
                pickPoly(feature);
                refGeom = currGeom.getPolygon(polyindex);
            } else {
                refGeom = currFeat.getGeometry().clone();
            }

            //set the change feature listener so we get the hole like visual effect
            feature.on('change', function (e) {
                //get draw hole feature geometry
                var currCoords = feature.getGeometry().getCoordinates(false)[0];
                vertsCouter = currCoords.length;

                if (isMultiPolygon) {
                    if (currCoords.length >= 3 && ringAdded === false) {
                        polyCoords = currGeom.getCoordinates()[polyindex];
                        polyCoords.push(currCoords);
                        setCoords = currGeom.getCoordinates();
                        setCoords.splice(polyindex, 1, polyCoords);
                        currGeom.setCoordinates(setCoords);
                        ringAdded = true;
                    } else if (currCoords.length >= 3 && ringAdded === true) {
                        polyCoords = currGeom.getCoordinates()[polyindex];
                        polyCoords.pop();
                        polyCoords.push(currCoords);
                        setCoords = currGeom.getCoordinates();
                        setCoords.splice(polyindex, 1, polyCoords);
                        currGeom.setCoordinates(setCoords);
                    } else if (currCoords.length == 2 && ringAdded === true) {
                        polyCoords = currGeom.getCoordinates()[polyindex];
                        polyCoords.pop();
                        setCoords = currGeom.getCoordinates();
                        setCoords.splice(polyindex, 1, polyCoords);
                        currGeom.setCoordinates(setCoords);
                        ringAdded = false;
                    } else if (currCoords.length == 2 && !(exists(polyindex))) {
                        pickPoly(feature);
                        refGeom = currGeom.getPolygon(polyindex)
                    } else if (currCoords.length == 1 && exists(polyindex)) {
                        currFeat = null;
                        refGeom = null;
                        polyindex = null;
                    }
                } else {
                    //if hole has 3 or more coordinate pairs, add the interior ring to feature
                    if (currCoords.length >= 3 && ringAdded === false) {
                        currGeom.appendLinearRing(new ol.geom.LinearRing(currCoords));
                        ringAdded = true;
                    } else if (currCoords.length >= 3 && ringAdded === true) { //if interior ring has already been added we need to remove it and add back the updated one
                        setCoords = currGeom.getCoordinates();
                        setCoords.pop(); //pop the dirty hole
                        setCoords.push(currCoords); //push the updated hole
                        currGeom.setCoordinates(setCoords); //update currGeom with new coordinates
                    } else if (currCoords.length == 2 && ringAdded === true) {
                        setCoords = currGeom.getCoordinates();
                        setCoords.pop();
                        currGeom.setCoordinates(setCoords);
                        ringAdded = false;
                    }
                }
            });
        });

        // Check if the hole is valid and remove the hole interaction
        holeDraw.on('drawend', function (evt) {

            if (isMultiPolygon) {
                var rings = currGeom.getCoordinates()[polyindex];
                var holecoords = rings.pop();
            } else {
                var rings = currGeom.getCoordinates();
                var holecoords = rings.pop();
            }

            var isValid = isPolyValid(new ol.geom.Polygon([holecoords]));
            var isInside = doesPolyCoverHole(origGeom, holecoords);
            if (isValid && isInside) {
                source.once('addfeature', function (e) {
                    var featuresGeoJSON = new ol.format.GeoJSON().writeFeatures(
                        [currFeat], {featureProjection: 'EPSG:3857'}
                    );
                    // console.log(featuresGeoJSON)
                });
            } else {
                currGeom.setCoordinates(origGeom.getCoordinates());
            }

            this.autoselect = true;
            document.getElementById('delete-hole').disabled = false;
            finishHole();
        }, this);
    };
    layerInteractor.prototype.deleteHole = function () {
        var holeStyle = [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.8)',
                    lineDash: [10, 10],
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 1.0)'
                })
            })
        ];

        var getPolyHoles = function (poly) {
            var skip = true;
            var holes = [];
            poly.getLinearRings().forEach(function (ring) {
                if (skip) { // assume the first ring is the exterior ring.
                    skip = false;
                } else {
                    feature = new ol.Feature(new ol.geom.Polygon([ring.getCoordinates()]));
                    holes.push(feature);
                }
            });
            return holes;
        };

        var getHoles = function (currGeom) {
            var holefeats = new ol.Collection();
            var polyholes;
            if (currGeom.getType() === 'MultiPolygon') {
                currGeom.getPolygons().forEach(function (poly) {
                    polyholes = getPolyHoles(poly);
                    holefeats.extend(polyholes)
                })
            } else {
                polyholes = getPolyHoles(currGeom);
                holefeats.extend(polyholes)
            }
            return holefeats;
        };

        var testCoords = function (poly, coord) {
            var newPoly = null;
            var skip = true;
            var found = false;
            console.log(coord);
            poly.getLinearRings().forEach(function (ring) {
                if (skip) { // assume the first ring is the exterior ring.
                    newPoly = new ol.geom.Polygon([ring.getCoordinates()]);
                    skip = false;
                } else {
                    var rcoord = ring.getFirstCoordinate();
                    console.log(rcoord);
                    if (rcoord[0] !== coord[0] || rcoord[1] !== coord[1]) {
                        newPoly.appendLinearRing(ring);
                    } else {
                        found = true;
                    }
                }
            });
            return found ? newPoly : poly;
        };

        var removeHole = function (feature) {
            console.log("---------------------");
            var geom = feature.getGeometry();
            var newGeom = new ol.geom.MultiPolygon(null);
            if (currGeom.getType() === 'MultiPolygon') {
                currGeom.getPolygons().forEach(function (poly) {
                    var newPoly = testCoords(poly, geom.getFirstCoordinate());
                    newGeom.appendPolygon(newPoly);
                });
            } else {
                newGeom = testCoords(currGeom, geom.getFirstCoordinate());
            }
            currGeom.setCoordinates(newGeom.getCoordinates());
        };

        var _this = this;
        var finishHole = function () {
            _this.autoselect = true;
            _this.map.removeInteraction(chooseHole);
            _this.map.removeLayer(holeOverlay);
            _this.modify.setActive(true);
            _this.select.setActive(true);
            // _this.translate.setActive(true);
            _this.map.on('pointermove', _this.hoverDisplay);
            document.getElementById('add-hole').disabled = false;
            document.getElementById('delete-hole').disabled = (holeFeats.getArray().length == 0);
            $(document).off('keyup')
        };
        $(document).on('keyup', function (evt) {
            if (evt.keyCode == 27) {
                finishHole()
            }
        });

        document.getElementById('add-hole').disabled = true;
        document.getElementById('delete-hole').disabled = true;
        this.map.un('pointermove', this.hoverDisplay);
        this.select.setActive(false);
        this.modify.setActive(false);

        var feature = null;
        var currFeat = this.select.getFeatures().getArray()[0];
        var currGeom = currFeat.getGeometry();
        var holeFeats = getHoles(currGeom);

        var source = new ol.source.Vector({
            features: holeFeats
        });
        var holeOverlay = new ol.layer.Vector({
            source: source,
            type: 'overlay',
            style: holeStyle,
            zIndex: 9999
        });
        // holeOverlay.getSource().addFeatures(holeFeats);
        this.map.addLayer(holeOverlay);

        var chooseHole = new ol.interaction.ChooseHole({
            holes: holeFeats
        });
        this.map.addInteraction(chooseHole);

        chooseHole.emitter.on('change', function () {
            feature = chooseHole.get('hole');
            if (feature !== null) {
                removeHole(feature);
            }
            finishHole();
        });
    };
    layerInteractor.prototype.formatArea = function (geom, sourceProj, sphere) {

        //  var getGeodesicArea = function (poly) {
        //     var area = 0;
        //     var isExterior = true;
        //     poly.getLinearRings().forEach( function (ring) {
        //         if (isExterior) { // assume the first ring is the exterior ring.
        //             area += Math.abs(sphere.geodesicArea(ring.getCoordinates()));
        //             isExterior = false;
        //         } else {
        //             area -= Math.abs(sphere.geodesicArea(ring.getCoordinates()));
        //         }
        //     });
        //     return area;
        // };
        //
        // var area;
        // if (document.getElementById('geodesic').checked) {
        //     // var wgs84Sphere = new ol.Sphere(6378137);
        //     var geom = polygon.clone().transform(sourceProj, 'EPSG:4326');
        //     // var coordinates = geom.getLinearRing(0).getCoordinates();
        //     // area = Math.abs(sphere.geodesicArea(coordinates));
        //     area = 0;
        //     if (geom.getType() === 'MultiPolygon') {
        //         geom.getPolygons().forEach(function (poly) {
        //             area += getGeodesicArea(poly);
        //         });
        //     } else {
        //         area = getGeodesicArea(geom);
        //     }
        // } else {
        //     area = polygon.getArea();
        // }


        var getPolygonArea = function (polygon) {
            var area = 0;
            var area0 = 0;
            var isExterior = true;
            if (document.getElementById('geodesic').checked) {
                var poly = polygon.clone().transform(sourceProj, 'EPSG:4326');
                poly.getLinearRings().forEach(function (ring) {
                    if (isExterior) { // assume the first ring is the exterior ring.
                        area += Math.abs(sphere.geodesicArea(ring.getCoordinates()));
                        isExterior = false;
                    } else {
                        area -= Math.abs(sphere.geodesicArea(ring.getCoordinates()));
                    }
                });
            } else {
                area = polygon.getArea();
            }
            return area;
        };

        var area = 0;
        if (geom.getType() === 'MultiPolygon') {
            geom.getPolygons().forEach(function (poly) {
                area += getPolygonArea(poly)
            })
        } else {
            area = getPolygonArea(geom)
        }

        var output;
        var squared = "2";
        if (area > 100000) {
            output = (Math.round(area / 1000000 * 100) / 100) + " km" + squared.sup();
        } else {
            output = (Math.round(area * 100) / 100) + " m" + squared.sup();
        }
        return output;
    };
    layerInteractor.prototype.formatLength = function (geom, sourceProj, sphere) {

        var getLineStringLength = function (line) {
            var length = 0;
            if (document.getElementById('geodesic').checked) {
                var coordinates = line.clone().transform(sourceProj, 'EPSG:4326').getCoordinates();
                var nCoords = coordinates.length;
                for (var i = 0; i < nCoords - 1; i++) {
                    length += sphere.haversineDistance(coordinates[i], coordinates[i + 1]);
                }
            } else {
                length = line.getLength();
            }
            return length;
        };

        var length = 0;
        if (geom.getType() === 'MultiLineString') {
            geom.getLineStrings().forEach(function (line) {
                length += getLineStringLength(line)
            })
        } else {
            length = getLineStringLength(geom)
        }
        var output;
        if (length > 1000) {
            output = (Math.round(length / 1000 * 100) / 100) + ' km';
        } else {
            output = (Math.round(length * 100) / 100) + ' m';
        }
        return output;
    };
    layerInteractor.prototype.formatPosition = function (point, sourceProj, sphere) {
        var geom = point.clone().transform(sourceProj, 'EPSG:4326');
        var coords = geom.getCoordinates();
        var coord_x = coords[0].toFixed(6);
        var coord_y = coords[1].toFixed(6);
        return coord_x + ', ' + coord_y;
    };

    layerInteractor.prototype.activateForm = function (feature) {

        var _this = this;
        document.getElementById('featureproperties').style.display = 'block';

        var geometry_type = document.getElementById('geometry-type');
        geometry_type.innerHTML = feature.getGeometry().getType();


        var measureLabel = document.getElementById('measure-label');
        var measure;
        if (feature.getGeometry().getType().endsWith('Polygon')) {
            measureLabel.innerHTML = 'Area:';
            measure = this.formatArea;
        } else if (feature.getGeometry().getType().endsWith('LineString')) {
            measureLabel.innerHTML = 'Length:';
            measure = this.formatLength;
        } else if (feature.getGeometry().getType().endsWith('Point')) {
            measureLabel.innerHTML = 'Lon, Lat';
            measure = this.formatPosition;
        }
        var measureValue = document.getElementById('measure-feature');
        measureValue.innerHTML = measure(feature.getGeometry(), this.map.getView().getProjection(), this.wgs84Sphere);
        this.geometrylistener = feature.getGeometry().on('change', function (evt) {
            measureValue.innerHTML = measure(evt.target, _this.map.getView().getProjection(), _this.wgs84Sphere);
        });
        this.geodesiclistener = function () {
            measureValue.innerHTML = measure(_this.geometrylistener.target, _this.map.getView().getProjection(), _this.wgs84Sphere);
        };
        document.getElementById('geodesic').addEventListener('change', this.geodesiclistener);


        document.getElementById('feature-name').value = feature.get('name');
        document.getElementById('feature-name').disabled = false;


        document.getElementById('add-hole').disabled = true;
        document.getElementById('delete-hole').disabled = true;
        if (feature.getGeometry().getType().endsWith('Polygon')) {
            document.getElementById('add-hole').disabled = false;
            if (feature.getGeometry().getType() === 'MultiPolygon') {
                var nPolygons = feature.getGeometry().getPolygons().length;
                for (var i = 0; i < nPolygons; i++)
                    if (feature.getGeometry().getPolygon(i).getLinearRingCount() > 1) {
                        document.getElementById('delete-hole').disabled = false;
                    }
            } else if (feature.getGeometry().getLinearRingCount() > 1) {
                document.getElementById('delete-hole').disabled = false;
            }
        }


        for (var key in tobjectTemplates) {
            if (feature.getGeometry().getType().endsWith(tobjectTemplates[key]["geometry_type"])) {
                document.getElementById('feature-type').appendChild(this.createOption(key));
            }
        }
        document.getElementById('feature-type').appendChild(this.createOption('generic'));

        var feature_type = feature.get('type');
        if (!(feature_type && feature_type in tobjectTemplates)) {
            feature_type = 'generic';
        }

        document.getElementById('feature-type').value = feature_type;

        var feature_properties = tobjectTemplates[feature_type];

        var heightinput = document.getElementById('height-input');
        var heightslider = document.getElementById('height-slider');
        if (feature.get('height')) {
            heightinput.disabled = false;
            heightinput.value = feature.get('height');
            heightslider.removeAttribute('disabled');
            heightslider.noUiSlider.set(feature.get('height'));
        } else if (feature_properties['height']) {
            heightinput.disabled = false;
            heightinput.value = feature_properties['height'];
            heightslider.removeAttribute('disabled');
            heightslider.noUiSlider.set(feature_properties['height']);
        } else {
            heightinput.disabled = true;
            heightslider.setAttribute('disabled', true);
        }

        var thicknessinput = document.getElementById('thickness-input');
        var thicknessslider = document.getElementById('thickness-slider');
        if (feature.get('thickness')) {
            thicknessinput.disabled = false;
            thicknessinput.value = feature.get('thickness');
            thicknessslider.removeAttribute('disabled');
            thicknessslider.noUiSlider.set(feature.get('thickness'));
        } else if (feature_properties['thickness']) {
            thicknessinput.disabled = false;
            thicknessinput.value = feature_properties['thickness'];
            thicknessslider.removeAttribute('disabled');
            thicknessslider.noUiSlider.set(feature_properties['thickness']);
        } else {
            thicknessinput.disabled = true;
            thicknessslider.noUiSlider.set(null);
            thicknessslider.setAttribute('disabled', true);
        }
    };
    layerInteractor.prototype.loadFeature = function (feature_type) {
        console.log(feature_type);

        var feature_properties = tobjectTemplates[feature_type];

        var geometry_type = document.getElementById('geometry-type');
        var feature_name = document.getElementById('feature-name');
        for (var key in tobjectTemplates) {
            if (tobjectTemplates[key]["geometry_type"]) {
                if (geometry_type.innerHTML.startsWith(tobjectTemplates[key]["geometry_type"])) {
                    if (feature_name.value.startsWith(key.capitalizeFirstLetter())) {
                        feature_name.value = feature_name.value.replace(key.capitalizeFirstLetter(), feature_type.capitalizeFirstLetter());
                    }
                }
            } else if (key === 'generic') {
                if (feature_name.value.startsWith(key.capitalizeFirstLetter())) {
                    feature_name.value = feature_name.value.replace(key.capitalizeFirstLetter(), feature_type.capitalizeFirstLetter());
                }
            }
        }

        document.getElementById('feature-type').value = feature_type;

        var heightinput = document.getElementById('height-input');
        var heightslider = document.getElementById('height-slider');

        if (!(heightinput.disabled || feature_properties['height'])) {
            heightslider.noUiSlider.set(0);
            heightslider.setAttribute('disabled', true);
            heightinput.disabled = true;
            heightinput.value = null;
        } else if (heightinput.disabled && feature_properties['height']) {
            heightslider.noUiSlider.set(feature_properties['height']);
            heightslider.removeAttribute('disabled');
            heightinput.disabled = false;
        }

        var thicknessinput = document.getElementById('thickness-input');
        var thicknessslider = document.getElementById('thickness-slider');

        if (!(thicknessinput.disabled || feature_properties['thickness'])) {
            thicknessslider.noUiSlider.set(0);
            thicknessslider.setAttribute('disabled', true);
            thicknessinput.disabled = true;
            thicknessinput.value = null;
        } else if (thicknessinput.disabled && feature_properties['thickness']) {
            thicknessslider.noUiSlider.set(feature_properties['thickness']);
            thicknessslider.removeAttribute('disabled');
            thicknessinput.disabled = false;
        }
        return this;
    };
    layerInteractor.prototype.deactivateForm = function (feature) {

        var feature_name = document.getElementById('feature-name');
        if (feature.get('name')) {
            feature.set('name', feature_name.value);
        }
        feature_name.value = null;
        feature_name.disabled = true;

        document.getElementById('add-hole').disabled = true;
        document.getElementById('delete-hole').disabled = true;

        var feature_type = document.getElementById('feature-type');
        if (feature.get('type')) {
            feature.set('type', feature_type.value);
        }
        this.removeContent(feature_type);

        var heightinput = document.getElementById('height-input');
        if (feature.get('height')) {
            feature.set('height', heightinput.value);
        }
        heightinput.value = null;
        heightinput.disabled = true;

        var thicknessinput = document.getElementById('thickness-input');
        if (feature.get('thickness')) {
            feature.set('thickness', thicknessinput.value);
        }
        thicknessinput.value = null;
        thicknessinput.disabled = true;

        document.getElementById('featureproperties').style.display = 'none';

        document.getElementById('geodesic').removeEventListener('change', this.geodesiclistener);
        ol.Observable.unByKey(this.geometrylistener);
        this.geometrylistener = null;
        this.geodesiclistener = null;
    };

    layerInteractor.prototype.createFeatureOverlay = function () {
        var highlightStyleCache = {};
        var _this = this;
        var overlayStyleFunction = (function () {
            var setStyle = function (color, opacity, text) {
                var style = new ol.style.Style({
                    text: new ol.style.Text({
                        font: '14px Calibri,sans-serif',
                        text: text,
                        stroke: new ol.style.Stroke({
                            color: '#fff',
                            width: 5
                        }),
                        fill: new ol.style.Fill({
                            color: '#000'
                        })
                    }),
                    stroke: new ol.style.Stroke({
                        color: color.concat(1),
                        width: 4
                    }),
                    fill: new ol.style.Fill({
                        color: color.concat(opacity)
                    })
                });
                return [style]
            };
            return function (feature, resolution) {
                var color;
                var opacity;

                if (exists(feature.get('type')) && tobjectTemplates.hasOwnProperty(feature.get('type'))) {
                    color = tobjectTemplates[feature.get('type')].color;
                } else {
                    color = [255, 0, 0];
                }
                if (exists(feature.get('type')) && tobjectTemplates.hasOwnProperty(feature.get('type'))) {
                    opacity = tobjectTemplates[feature.get('type')].fillopacity;
                } else {
                    opacity = 0.1;
                }
                var text = resolution < 50000 ? feature.get('name') : '';
                if (!highlightStyleCache[text]) {
                    highlightStyleCache[text] = setStyle(color, opacity, text);
                }
                return highlightStyleCache[text];
            }
        })();
        return new ol.layer.Vector({
            source: new ol.source.Vector(),
            type: 'overlay',
            style: overlayStyleFunction,
            zIndex: 9900
        });
    };
    layerInteractor.prototype.getFeatureAtPixel = function (pixel) {
        var coord = this.map.getCoordinateFromPixel(pixel);
        var smallestArea = 5.1e14; // approximate surface area of the earth
        var smallestFeature = null;
        // var _this = this;
        var feature = this.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            var geom = feature.getGeometry();
            if (geom.getType().endsWith('Point')) {
                //Need to add functionality for sensors here.
                return feature;
            } else if (geom.getType().endsWith('LineString')) {
                return feature;
            } else if (geom.getType().endsWith('Polygon')) {
                if (feature.get('type') === 'aor') {
                    var point = geom.getClosestPoint(coord);
                    var pixel0 = this.map.getPixelFromCoordinate(coord);
                    var pixel1 = this.map.getPixelFromCoordinate(point);
                    if (Math.abs(pixel0[0] - pixel1[0]) < 8 && Math.abs(pixel0[1] - pixel1[1]) < 8) {
                        return feature;
                    }
                } else {
                    var area = geom.getArea();
                    if (area < smallestArea) {
                        smallestArea = area;
                        smallestFeature = feature;
                    }
                }
            }
        }, this, function (layer) {
            if (this.layertree.selectedLayer) {
                return layer === this.layertree.getLayerById(this.layertree.selectedLayer.id)
            }
        }, this);
        return exists(feature) ? feature : smallestFeature;
    };
    layerInteractor.prototype.setMouseCursor = function (feature) {
        if (feature) {
            this.map.getTarget().style.cursor = 'pointer';
        } else {
            this.map.getTarget().style.cursor = '';
        }
    };
    layerInteractor.prototype.displayFeatureInfo = function (feature) {
        if (feature !== this.highlight) {
            if (this.highlight) {
                this.featureOverlay.getSource().removeFeature(this.highlight);
            }
            if (feature) {
                this.featureOverlay.getSource().addFeature(feature);
            }
            this.highlight = feature;
        }
    };

    layerInteractor.prototype.addInteractions = function () {
        /*********** SELECT ************/
        var _this = this;
        var selectedLayer;
        this.select = new ol.interaction.Select({
            layers: [this.featureOverlay],
            toggleCondition: ol.events.condition.never,
            condition: function (evt) {
                if (ol.events.condition.singleClick(evt) || ol.events.condition.doubleClick(evt)) {
                    if (_this.addedFeature || _this.autoselect) {
                        _this.addedFeature = null;
                        _this.autoselect = false;
                        return false;
                    }
                    return true;
                }
            },
            // style: this.featureOverlay.getStyle()
            // style: new ol.style.Style({
            //     stroke: new ol.style.Stroke({
            //         color: 'rgba(255, 255, 255, 1)',
            //         width: 3
            //     }),
            //     fill: new ol.style.Fill({
            //         color: 'rgba(255, 255, 255, 0.2)'
            //     })
            // })
        });
        this.select.on('select', function (evt) {
            var feature;
            // Handle deselect first so we can move the feature back to the active layer.
            if (evt.deselected.length == 1) {
                feature = evt.deselected[0];
                _this.modify.setActive(false);
                // translate.setActive(false);
                console.log('auto deselect:', feature.get('name'), feature.getRevision());
                _this.deactivateForm(feature);

                selectedLayer = _this.layertree.getLayerById(_this.layertree.selectedLayer.id);
                selectedLayer.getSource().addFeature(feature);
                // _this.activeFeatures.push(feature);

                // transactWFS('insert', evt.feature);
                // source.once('addfeature', function (evt) {
                //     var parser = new ol.format.GeoJSON();
                //     var features = source.getFeatures();
                //     var featuresGeoJSON = parser.writeFeatures(features, {
                //         featureProjection: 'EPSG:3857',
                //     });
                //     console.log(featuresGeoJSON)
                //     $.ajax({
                //         url: 'test_project/features.geojson', // what about aor?
                //         type: 'POST',
                //         data: featuresGeoJSON
                //     }).then(function (response) {
                //         console.log(response);
                //     });
                // });
            }

            if (evt.selected.length == 1) {
                feature = evt.selected[0];
                _this.modify.setActive(true);
                //translate.setActive(true);
                console.log('auto select:  ', feature.get('name'), feature.getRevision());
                _this.activateForm(feature);

                selectedLayer = _this.layertree.getLayerById(_this.layertree.selectedLayer.id);
                selectedLayer.getSource().removeFeature(feature);
                // _this.activeFeatures.push(feature);
                console.log('here')
            }
        });

        /*********** MODIFY ************/
        var origGeom;
        this.modify = new ol.interaction.Modify({
            features: this.select.getFeatures()
        });
        this.modify.on('modifystart', function (evt) {
            origGeom = evt.features.getArray()[0].getGeometry().clone();
        });
        this.modify.on('modifyend', function (evt) {
            if (!(isPolyValid(evt.features.getArray()[0].getGeometry()))) {
                evt.features.getArray()[0].getGeometry().setCoordinates(origGeom.getCoordinates());
            }
        });

        /********* TRANSLATE ***********/
            // When the translate interaction is active, it
            // causes the mouse cursor to turn into a
            // pointer when hovering over the interior
            // of the AOR. Need to find out why.
            // Disable until solution is found.
            //
            // var translate = new ol.interaction.Translate({
            //     features: select.getFeatures()
            // });
            // map.addInteraction(translate);
            // translate.setActive(false);

        var remove = function (evt) {
                console.log(evt.keyCode);
                if (exists(_this.highlight) && evt.keyCode == 46) { //delete key pressed
                    var layer = _this.layertree.getLayerById(_this.layertree.selectedLayer.id);
                    layer.getSource().removeFeature(_this.highlight);
                    _this.featureOverlay.getSource().removeFeature(_this.highlight);
                    _this.highlight = undefined;
                }
            };
        document.addEventListener('keydown', remove, false);

        this.drawEventEmitter.on('change', function (evt) {
            var selectedFeatures = _this.select.getFeatures();
            var selectedFeature;
            if (_this.active == true) {
                _this.map.un('pointermove', _this.hoverDisplay);

                if (selectedFeatures.getArray().length === 1) {
                    selectedFeature = selectedFeatures.getArray()[0];
                    _this.deactivateForm(selectedFeature);
                    console.log('manual deselect:', selectedFeature.get('name'), selectedFeature.getRevision());

                    // var selectedLayer = _this.layertree.getLayerById(_this.layertree.selectedLayer.id);
                    // selectedLayer.getSource().addFeature(feature);
                    // _this.activeFeatures.push(feature);

                    selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
                } else {
                    console.log('ERROR: selectedFeatures.getArray().length = ', selectedFeatures.getArray().length)
                }

                // translate.setActive(false);
                _this.modify.setActive(false);
                _this.select.setActive(false);
            } else {
                _this.select.setActive(true);
                _this.modify.setActive(true);
                // translate.setActive(true);

                if (_this.addedFeature) {
                    selectedFeatures.push(_this.addedFeature);
                    // selectedFeature = selectedFeatures.getArray()[0];
                    selectedFeature = _this.addedFeature;

                    _this.activateForm(selectedFeature);
                    console.log('manual select:  ', selectedFeature.get('name'), selectedFeature.getRevision());
                } else {
                    console.log('HHHHHHHERREE!!!')
                }

                _this.map.on('pointermove', _this.hoverDisplay);
            }
        });
    };

    return layerInteractor;

});