/**
 * Created by maddoxw on 9/6/16.
 */

define(['jquery', 'ol',
    'exists',
    "featureid",
    'ttemplate',
    'ispolyvalid',
    'jquery-ui'
], function ($, ol,
             exists,
             FID,
             tobjectTemplates,
             isPolyValid) {

    var layerInteractor = function (options) {
        'use strict';
        if (!(this instanceof layerInteractor)) {
            throw new Error('layerInteractor must be constructed with the new keyword.');
        } else if (typeof options === 'object' && options.map && options.layertree && options.toolbar) {
            if (!(options.map instanceof ol.Map)) {
                throw new Error('Please provide a valid OpenLayers 3 map object.');
            }
            var _this = this;
            this.map = options.map;
            this.layertree = options.layertree;
            this.toolbar = options.toolbar;

            this.autoselect = false;
            this.highlight = undefined;
            this.highlightTextStyleCache = {};
            this.highlightGeomStyleCache = {};
            this.textStyleKey = 'name';
            this.geomStyleKey = 'type';
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

            $('#map').on('mouseleave', function () {
                if (_this.highlight) {
                    _this.featureOverlay.getSource().removeFeature(_this.highlight);
                    _this.highlight = undefined;
                }
            });

            this.layertree.deselectEventEmitter.on('change', function () {
                var layer;
                if (this.layertree.selectedLayer) {
                    layer = this.layertree.getLayerById(this.layertree.selectedLayer.id);
                    console.log('layerinteractor: deselected layer YES');
                } else {
                    layer = null;
                    console.log('layerinteractor: deselected layer NO');
                }
                var selectedFeatures = this.select.getFeatures();
                if (selectedFeatures.getLength() === 1) {
                    layer.getSource().addFeature(selectedFeatures.getArray()[0]);
                    selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
                }
            }, this);

            this.layertree.selectEventEmitter.on('change', function () {
                this.layer = this.layertree.getLayerById(this.layertree.selectedLayer.id);
                this.layer.on('propertychange', function (evt) {
                    if (evt.key === 'textstyle') {
                        _this.textStyleKey = this.get('textstyle');
                        _this.highlightTextStyleCache = {};
                    }
                    if (evt.key === 'geomstyle') {
                        _this.geomStyleKey = this.get('geomstyle');
                        _this.highlightGeomStyleCache = {};
                    }
                    if (evt.key === 'headers') {
                        _this.highlightTextStyleCache = {};
                        _this.highlightGeomStyleCache = {};
                    }
                });
                $('.colorbutton').click(function () {
                    _this.highlightGeomStyleCache = {};
                });
                this.editor = this.layertree.layerEditors['feature'];
                $('.layereditor').append(this.editor.$form);
                this.editor.deactivateForm();
            }, this);

        } else {
            throw new Error('Invalid parameter(s) provided.');
        }
    };

    // layerInteractor.prototype.addFormRow = function (labels) {
    //     var $formRow = $("<div class='form-row'>");
    //     for (let label of labels) {
    //         $formRow.append(this.formElements[label])
    //     }
    //     return $formRow
    // };
    // layerInteractor.prototype.createDrawPolygonNodes = function () {
    //
    // };
    // layerInteractor.prototype.createDrawLinestringNodes = function () {
    //
    // };
    // layerInteractor.prototype.createDrawPointNodes = function () {
    //
    // };

    // layerInteractor.prototype.createLabel = function (label) {
    //     var td = document.createElement('td');
    //     var l = document.createTextNode(label);
    //     td.appendChild(l);
    //     return td;
    // };
    // layerInteractor.prototype.createInput = function (name, type) {
    //     var td = document.createElement('td');
    //     var element = document.createElement('input');
    //     element.name = name;
    //     element.type = type;
    //     element.required = true;
    //     td.appendChild(element);
    //     return td;
    // };
    // layerInteractor.prototype.createMenu = function (name, id) {
    //     var td = document.createElement('td');
    //     var element = document.createElement('select');
    //     element.name = name;
    //     element.type = "text";
    //     element.id = id;
    //     td.appendChild(element);
    //     return td;
    // };
    // layerInteractor.prototype.createOption = function (option) {
    //     var $option = $('<option>');
    //     $option.val(option);
    //     $option.text(option);
    //     return $option;
    // };
    // layerInteractor.prototype.createHoleButton = function (label) {
    //     // var $buttonLabel = $('<label for="'+label+'-hole"></label>');
    //     var $buttonElem = $('<button id="'+label+'-hole">');
    //     $buttonElem.addClass("ol-unselectable ol-control hole-buttons");
    //     $buttonElem.val(label.capitalizeFirstLetter());
    //     var _this = this;
    //
    //     switch (label) {
    //         case 'add':
    //             $buttonElem.button({
    //                 label: "Draw"
    //             });
    //             $buttonElem.prop('title', 'Draw a hole in the selected feature');
    //             $buttonElem.on('click', function () {
    //                 _this.addHole();
    //             });
    //             return $buttonElem;
    //         case 'delete':
    //             $buttonElem.button({
    //                 label: "Delete"
    //             });
    //             $buttonElem.prop('title', 'Delete a hole from the selected feature');
    //             $buttonElem.on('click', function () {
    //                 _this.deleteHole();
    //             });
    //             return $buttonElem;
    //         default:
    //             return false;
    //     }
    // };

    layerInteractor.prototype.textStyle = function (text) {
        "use strict";
        var style = new ol.style.Style({
            text: new ol.style.Text({
                font: '14px Calibri,sans-serif',
                text: text,
                offsetY: -20,
                stroke: new ol.style.Stroke({
                    color: [255, 255, 255],
                    width: 5
                }),
                fill: new ol.style.Fill({
                    color: [0, 0, 0]
                })
            })
        });
        return style;
    };
    layerInteractor.prototype.createFeatureOverlay = function () {
        var _this = this;
        var overlayStyleFunction = (function () {
            return function (feature, resolution) {
                var retval;
                var textkey = feature.get(_this.textStyleKey);
                var geomkey = feature.get(_this.geomStyleKey);

                if (!_this.highlightTextStyleCache[textkey]) {
                    _this.highlightTextStyleCache[textkey] = _this.textStyle(textkey);
                }
                if ($('#'+_this.layer.get('id')+"-hovervisible").is(":checked")) {
                    retval = [_this.highlightGeomStyleCache[geomkey], _this.highlightTextStyleCache[textkey]]
                } else {
                    retval = [_this.highlightGeomStyleCache[geomkey]]
                }
                return retval;
            };
        })();
        return new ol.layer.Vector({
            source: new ol.source.Vector(),
            // Should probably attach the map to the overlay here so that the map doesn't manage the overlay.
            // Need to test this.
            // map: _this.map,
            type: 'overlay',
            style: overlayStyleFunction,
            zIndex: 9900
        });
    };
    layerInteractor.prototype.getFeatureAtPixel = function (pixel) {
        var coord = this.map.getCoordinateFromPixel(pixel);
        var smallestArea = 5.1e14; // approximate surface area of the earth
        var smallestFeature = null;
        var smallestFeatureLayer = null;
        var featureAndLayer = this.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            var geom = feature.getGeometry();
            if (geom.getType().endsWith('Point')) {
                //Need to add functionality for sensors here.
                return {feature:feature, layer:layer};
            } else if (geom.getType().endsWith('LineString')) {
                return {feature:feature, layer:layer};
            } else if (geom.getType().endsWith('Polygon')) {
                if (feature.get('type') === 'aor') {
                    var point = geom.getClosestPoint(coord);
                    var pixel0 = this.map.getPixelFromCoordinate(coord);
                    var pixel1 = this.map.getPixelFromCoordinate(point);
                    if (Math.abs(pixel0[0] - pixel1[0]) < 8 && Math.abs(pixel0[1] - pixel1[1]) < 8) {
                        return {feature:feature, layer:layer};
                    }
                } else {
                    var area = geom.getArea();
                    if (area < smallestArea) {
                        smallestArea = area;
                        smallestFeature = feature;
                        smallestFeatureLayer = layer
                    }
                }
            }
        }, this, function (layer) {
            if (this.layertree.selectedLayer) {
                return layer === this.layertree.getLayerById(this.layertree.selectedLayer.id)
            }
        }, this);
        if (!(exists(featureAndLayer))) {
            featureAndLayer = {};
            featureAndLayer.feature = smallestFeature;
            featureAndLayer.layer = smallestFeatureLayer;
        }
        if (exists(featureAndLayer.feature)) {
            var feature = featureAndLayer.feature;
            var text = feature.get(this.geomStyleKey);
            if (!this.highlightGeomStyleCache[text]) {
                var sf = featureAndLayer.layer.getStyleFunction();
                var style = sf(feature)[0].clone();
                this.highlightGeomStyleCache[text] = this.setFeatureStyle(style);
            }
        } else {
            feature = null;
        }
        return feature;
    };
    layerInteractor.prototype.setFeatureStyle = function (style) {
        if (style) {
            var image;
            var fill;
            var radius;
            var stroke;
            var width;
            var color;

            image =  style.getImage();
            if (exists(image)) {
                fill = image.getFill();
                if (exists(fill)) {
                    color = fill.getColor();
                    color[3] = 0.1;
                    fill.setColor(color);
                }
                stroke = image.getStroke();
                if (exists(stroke)) {
                    width = stroke.getWidth();
                    width = width + 1;
                    stroke.setWidth(width);
                }
                radius = image.getRadius();
                if (exists(radius)) {
                    radius = radius + 2;
                }
                image.setRadius(radius);
            }
            fill = style.getFill();
            if (exists(fill)) {
                color = fill.getColor();
                color[3] = 0.1;
                fill.setColor(color);
            }
            stroke = style.getStroke();
            if (exists(stroke)) {
                width = stroke.getWidth();
                width = width + 1;
                stroke.setWidth(width);
            }
        }
        return style;
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
        var _this = this;
        var toolbar = this.toolbar;
        var selectedLayer;
        this.select = new ol.interaction.Select({
            layers: [this.featureOverlay],
            toggleCondition: ol.events.condition.never,
            condition: function (evt) {
                if (ol.events.condition.singleClick(evt) || ol.events.condition.doubleClick(evt)) {
                    if (_this.toolbar.addedFeature || _this.autoselect) {
                        _this.toolbar.addedFeature = null;
                        _this.autoselect = false;
                        return false;
                    }
                    return true;
                }
            },
        });
        this.select.on('select', function (evt) {
            var feature;
            // Handle deselect first so we can move the feature back to the active layer.
            if (evt.deselected.length == 1) {
                feature = evt.deselected[0];
                _this.modify.setActive(false);
                // translate.setActive(false);
                console.log('auto deselect:', feature.get('name'), feature.getRevision());
                _this.editor.loadFeature(feature);
                _this.editor.deactivateForm();

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
                _this.editor.activateForm(feature);

                selectedLayer = _this.layertree.getLayerById(_this.layertree.selectedLayer.id);
                selectedLayer.getSource().removeFeature(feature);
                // _this.activeFeatures.push(feature);
                console.log('here')
            }
        });

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
            // console.log(evt.keyCode);
            if (exists(_this.highlight) && evt.keyCode == 46) { //delete key pressed
                var layer = _this.layertree.getLayerById(_this.layertree.selectedLayer.id);
                layer.getSource().removeFeature(_this.highlight);
                _this.featureOverlay.getSource().removeFeature(_this.highlight);
                _this.highlight = undefined;
            }
        };
        $(document).on('keydown', remove);

        toolbar.drawEventEmitter.on('change', function (evt) {
            var selectedFeatures = _this.select.getFeatures();
            var selectedFeature;
            if (_this.toolbar.active == true) {
                _this.map.un('pointermove', _this.hoverDisplay);

                if (selectedFeatures.getArray().length === 1) {
                    selectedFeature = selectedFeatures.getArray()[0];
                    _this.editor.loadFeature(selectedFeature);
                    _this.editor.deactivateForm();
                    console.log('manual deselect:', selectedFeature.get('name'), selectedFeature.getRevision());

                    // var selectedLayer = _this.layertree.getLayerById(_this.layertree.selectedLayer.id);
                    // selectedLayer.getSource().addFeature(feature);
                    // _this.activeFeatures.push(feature);

                    selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
                    // selectedFeatures.clear();
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

                if (_this.toolbar.addedFeature) {
                    selectedFeatures.push(_this.toolbar.addedFeature);
                    // selectedFeature = selectedFeatures.getArray()[0];
                    selectedFeature = _this.toolbar.addedFeature;

                    _this.editor.activateForm(selectedFeature);
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