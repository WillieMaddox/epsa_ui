
require(['jquery', 'ol',
    'layertree',
    'layertoolbar',
    'toolbar',
    'layerinteractor',
    'featureeditor',
    'cameraeditor'], function ($, ol,
                               layertree,
                               layertoolbar,
                               toolbar,
                               layerinteractor,
                               featureeditor,
                               cameraeditor) {

    String.prototype.capitalizeFirstLetter = function (flip) {
        if (flip) {
            return this.charAt(0).toLowerCase() + this.slice(1);
        } else {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
    };
    ol.layer.Image.prototype.buildHeaders = function () {
        var features = this.getSource().getSource().getFeatures();
        var len = features.length;
        if (len === 0) {
            return this;
        }
        var hasNew = false;
        var oldHeaders = this.get('headers') || {};
        var headers = {};
        for (var i = 0; i < len; i += 1) {
            var attributes = features[i].getProperties();
            for (var j in attributes) {
                if (typeof attributes[j] !== 'object' && attributes[j].length > 0 && !(j in oldHeaders)) {
                    headers[j] = typeof attributes[j];
                    hasNew = true;
                } else if (j in oldHeaders) {
                    headers[j] = oldHeaders[j];
                }
            }
        }
        if (hasNew) {
            this.set('headers', headers);
            console.log("addBufferIcon headers built");
        }
        return this;
    };
    ol.interaction.ChooseHole = function (opt_options) {

        this.emitter = new ol.Observable();

        ol.interaction.Pointer.call(this, {
            handleDownEvent: function (evt) {
                this.set('deleteCandidate', evt.map.forEachFeatureAtPixel(evt.pixel,
                    function (feature, layer) {
                        if (this.get('holes').getArray().indexOf(feature) !== -1) {
                            return feature;
                        }
                    }, this
                ));
                return !!this.get('deleteCandidate');
            },
            handleUpEvent: function (evt) {
                evt.map.forEachFeatureAtPixel(evt.pixel,
                    function (feature, layer) {
                        if (feature === this.get('deleteCandidate')) {
                            layer.getSource().removeFeature(feature);
                            this.get('holes').remove(feature);
                            this.set('hole', feature);
                        }
                    }, this
                );
                this.set('deleteCandidate', null);
                this.emitter.changed();
            }
        });
        this.setProperties({
            holes: opt_options.holes,
            deleteCandidate: null
        });
    };
    ol.inherits(ol.interaction.ChooseHole, ol.interaction.Pointer);
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

    layertree.init();
    layertoolbar.init();
    toolbar.init();
    toolbar.addDrawToolBar();
    layerinteractor.init();
    featureeditor.init();
    cameraeditor.init();
    layertree.layerEditors['feature'] = featureeditor;
    layertree.layerEditors['sensor'] = cameraeditor;

    /*********** WFS-T *************/
    // var dirty = {};
    // var formatGML = new ol.format.GML({
    //     featureNS: 'http://argeomatica.com',
    //     featureType: 'cite:nyc_buildings',
    //     srsName: 'EPSG:3857'
    // });
    // var transactWFS = function (p, f) {
    //     switch (p) {
    //         case 'insert':
    //             node = formatWFS.writeTransaction([f], null, null, formatGML);
    //             break;
    //         case 'update':
    //             node = formatWFS.writeTransaction(null, [f], null, formatGML);
    //             break;
    //         case 'delete':
    //             node = formatWFS.writeTransaction(null, null, [f], formatGML);
    //             break;
    //     }
    //     s = new XMLSerializer();
    //     str = s.serializeToString(node);
    //     $.ajax('http://www.firefly.com/geoserver/wfs', {
    //         type: 'POST',
    //         dataType: 'xml',
    //         processData: false,
    //         contentType: 'text/xml',
    //         data: str
    //     }).done();
    // };

    /********* ADD PROJECT *********/
    // var loadProject = document.getElementById('loadProject');
    // loadProject.onclick = function (e) {
    //     map.removeLayer(featureOverlay);
    //     map.removeLayer(projectGroup);
    //     var bounds = [-105.54833333333333, 39.76361111111111, -105.52694444444444, 39.778055555555554];
    //     var image = new ol.layer.Image({
    //         title: 'camera',
    //         type: 'overlay',
    //         source: new ol.source.ImageStatic({
    //             url: 'test_project/package_patched2.png',
    //             imageExtent: ol.proj.transformExtent(bounds, 'EPSG:4326', 'EPSG:3857')
    //         }),
    //         // Replace with an opacity slider-bar.
    //         opacity: 0.2
    //     });
    //     var vector_aor = new ol.layer.Vector({
    //         title: 'AOR',
    //         type: 'overlay',
    //         source: new ol.source.Vector({
    //             url: 'test_project/aor.geojson',
    //             format: new ol.format.GeoJSON()
    //         }),
    //         style: tobjectStyleFunction
    //     });
    //     var vector = new ol.layer.Vector({
    //         title: 'tobjects',
    //         type: 'overlay',
    //         source: new ol.source.Vector({
    //             url: 'test_project/tobjects_test.geojson',
    //             format: new ol.format.GeoJSON()
    //         }),
    //         style: tobjectStyleFunction
    //     });
    //     var projectGroup = new ol.layer.Group({
    //         title: 'Project',
    //         layers: [
    //             image,
    //             vector_aor,
    //             vector
    //         ]
    //     });
    //     map.addLayer(projectGroup);
    //     map.addLayer(featureOverlay);
    //     // Need to add in auto-zoom-in functionality here.
    //     vector_aor.getSource().on('change', function (evt) {
    //         var source = evt.target;
    //         if (source.getState() === 'ready') {
    //             view.setCenter(ol.extent.getCenter(source.getExtent()));
    //         }
    //     });
    // };

    // map.on('click', function (evt) {
    //     var pixel = evt.pixel;
    //     var coord = evt.coordinate;
    //     var attributeForm = document.createElement('form');
    //     attributeForm.className = 'popup';
    //     this.getOverlays().clear();
    //     var firstFeature = true;
    //
    //     function createRow(attributeName, attributeValue, type) {
    //         var rowElem = document.createElement('div');
    //         var attributeSpan = document.createElement('span');
    //         attributeSpan.textContent = attributeName + ': ';
    //         rowElem.appendChild(attributeSpan);
    //         var attributeInput = document.createElement('input');
    //         attributeInput.name = attributeName;
    //         attributeInput.type = 'text';
    //         if (type !== 'string') {
    //             attributeInput.type = 'number';
    //             attributeInput.step = (type === 'float') ? 1e-6 : 1;
    //         }
    //         attributeInput.value = attributeValue;
    //         rowElem.appendChild(attributeInput);
    //         return rowElem;
    //     }
    //
    //     this.forEachFeatureAtPixel(pixel, function (feature, layer) {
    //         if (firstFeature) {
    //             var attributes = feature.getProperties();
    //             var headers = layer.get('headers');
    //             for (var i in attributes) {
    //                 if (typeof attributes[i] !== 'object' && i in headers) {
    //                     attributeForm.appendChild(createRow(i, attributes[i], headers[i]));
    //                 }
    //             }
    //             if (attributeForm.children.length > 0) {
    //                 var saveAttributes = document.createElement('input');
    //                 saveAttributes.type = 'submit';
    //                 saveAttributes.className = 'save';
    //                 saveAttributes.value = '';
    //                 attributeForm.addEventListener('submit', function (evt) {
    //                     evt.preventDefault();
    //                     var attributeList = {};
    //                     var inputList = [].slice.call(this.querySelectorAll('input[type=text], input[type=number]'));
    //                     var len = inputList.length;
    //                     for (var i = 0; i < len; i += 1) {
    //                         switch (headers[inputList[i].name]) {
    //                             case 'string':
    //                                 attributeList[inputList[i].name] = inputList[i].value.toString();
    //                                 break;
    //                             case 'integer':
    //                                 attributeList[inputList[i].name] = parseInt(inputList[i].value);
    //                                 break;
    //                             case 'float':
    //                                 attributeList[inputList[i].name] = parseFloat(inputList[i].value);
    //                                 break;
    //                         }
    //                     }
    //                     feature.setProperties(attributeList);
    //                     map.getOverlays().clear();
    //                 });
    //                 attributeForm.appendChild(saveAttributes);
    //                 this.addOverlay(new ol.Overlay({
    //                     element: attributeForm,
    //                     position: coord
    //                 }));
    //                 firstFeature = false;
    //             }
    //         }
    //     }, map, function (layerCandidate) {
    //         if (this.selectedLayer !== null && layerCandidate.get('id') === this.selectedLayer.id) {
    //             return true;
    //         }
    //         return false;
    //     }, tree);
    // });

    /**
     * TODO: Need to integrate the opacity sliders from this code into the layerswitcher code.
     * See http://openlayers.org/en/v3.13.0/examples/layer-group.html?q=mapquest

     function bindInputs(layerid, layer) {
        var visibilityInput = $(layerid + ' input.visible');
        visibilityInput.on('change', function () {
            layer.setVisible(this.checked);
        });
        visibilityInput.prop('checked', layer.getVisible());

        var opacityInput = $(layerid + ' input.opacity');
        opacityInput.on('input change', function () {
            layer.setOpacity(parseFloat(this.value));
        });
        opacityInput.val(String(layer.getOpacity()));
    }
     map.getLayers().forEach(function (layer, i) {
        bindInputs('#layer' + i, layer);
        if (layer instanceof ol.layer.Group) {
            layer.getLayers().forEach(function (sublayer, j) {
                bindInputs('#layer' + i + j, sublayer);
            });
        }
    });
     **/


});
