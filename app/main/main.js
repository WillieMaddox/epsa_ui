
define(['jquery', 'ol',
    'nouislider',
    'exists',
    'deg2tile',
    'featureinteractor',
    'ttemplate',
    'layertree',
    'toolbar',
    'bingkey',
    'layerinteractor',
    'layerswitcher'], function ($, ol, noUiSlider, exists, deg2tile, FeatureInteractor, tobjectTemplates, layerTree, toolBar, bingKey, layerInteractor) {

    "use strict";
    String.prototype.capitalizeFirstLetter = function (flip) {
        if (flip) {
            return this.charAt(0).toLowerCase() + this.slice(1);
        } else {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
    };

    ol.layer.Vector.prototype.buildHeaders = function () {
        var oldHeaders = this.get('headers') || {};
        var headers = {};
        var features = this.getSource().getFeatures();
        var len = features.length;
        for (var i = 0; i < len; i += 1) {
            var attributes = features[i].getProperties();
            for (var j in attributes) {
                if (typeof attributes[j] !== 'object' && !(j in oldHeaders)) {
                    headers[j] = typeof attributes[j];
                } else if (j in oldHeaders) {
                    headers[j] = oldHeaders[j];
                }
            }
        }
        this.set('headers', headers);
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

    function init() {
        // document.removeEventListener('DOMContentLoaded', init);

        var mouseProjection = 'EPSG:4326';
        var mousePrecision = 4;
        var view = new ol.View({
            // center: ol.proj.transform([-86.711, 34.636], 'EPSG:4326', 'EPSG:3857'),
            // center: ol.proj.transform([-86.677945, 34.723185], 'EPSG:4326', 'EPSG:3857'),
            // center: ol.proj.transform([-78.87532, 42.884600], 'EPSG:4326', 'EPSG:3857'),
            // center: ol.proj.transform([-73.9812, 40.6957], 'EPSG:4326', 'EPSG:3857'),
            // center: ol.proj.transform([-105.539, 39.771], 'EPSG:4326', 'EPSG:3857'),
            center: ol.proj.transform([-105.0, 39.75], 'EPSG:4326', 'EPSG:3857'),
            // center: ol.proj.transform([-79.049, 43.146], 'EPSG:4326', 'EPSG:3857'),
            // center: [-8238000, 4970700],
            // center: [0, 0],
            zoom: 13
        });
        view.on('change:resolution', function (evt) {
            var coord0 = evt.target.getCenter();
            var pixel0 = map.getPixelFromCoordinate(coord0);
            var pixel1 = [pixel0[0] + 1.0, pixel0[1] - 1.0];
            var coord1 = map.getCoordinateFromPixel(pixel1);
            var currentProj = map.getView().getProjection().getCode();
            if (mouseProjection !== currentProj) {
                coord0 = ol.proj.transform(coord0, currentProj, mouseProjection);
                coord1 = ol.proj.transform(coord1, currentProj, mouseProjection);
            }
            var dx = Math.abs(coord1[0] - coord0[0]);
            var dy = Math.abs(coord1[1] - coord0[1]);

            var xp = Number(Math.abs(Math.min(0, Math.floor(Math.log10(dx)))).toFixed());
            var yp = Number(Math.abs(Math.min(0, Math.floor(Math.log10(dy)))).toFixed());

            mousePrecision = Math.max(xp, yp);
            var format = ol.coordinate.createStringXY(mousePrecision);
            mousePositionControl.setCoordinateFormat(format);
        });
        var thunderforestAttributions = [
            new ol.Attribution({
                html: 'Tiles &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>'
            }),
            ol.source.OSM.ATTRIBUTION
        ];

        var map = new ol.Map({
            interactions: ol.interaction.defaults({doubleClickZoom: false}),
            target: document.getElementById('map'),
            view: view,
            logo: {
                src: 'img/saic-logo2.png',
                href: 'http://www.saic.com'
            },
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
                }),
                new ol.layer.Group({
                    title: 'Localhost',
                    layers: [
                        new ol.layer.Tile({
                            title: 'OpenStreetMap',
                            type: 'base',
                            visible: false,
                            source: new ol.source.OSM({url: 'http://localhost/osm_tiles/{z}/{x}/{y}.png'})
                        })
                    ]
                })
            ],
            loadTilesWhileInteracting: true,
            loadTilesWhileAnimating: true
        });

        var tree = new layerTree({map: map, target: 'layertree', messages: 'messageBar'});

        // var tools = new toolBar({map: map, layertree: tree, target: 'toolbar'});
        // tools.addDrawToolBar();
        // var interactor = new FeatureInteractor({map: map, layertree: tree, toolbar: tools, target: 'featureeditor'});

        var interactor = new layerInteractor({map: map, layertree: tree, toolbartarget: 'toolbar', featuretarget: 'featureeditor'});
        interactor.addDrawToolBar();

        /*********** WFS-T *************/
        // var dirty = {};
        // var formatGML = new ol.format.GML({
        // 	featureNS: 'http://argeomatica.com',
        // 	featureType: 'cite:nyc_buildings',
        // 	srsName: 'EPSG:3857'
        // });
        // var transactWFS = function (p, f) {
        // 	switch (p) {
        // 		case 'insert':
        // 			node = formatWFS.writeTransaction([f], null, null, formatGML);
        // 			break;
        // 		case 'update':
        // 			node = formatWFS.writeTransaction(null, [f], null, formatGML);
        // 			break;
        // 		case 'delete':
        // 			node = formatWFS.writeTransaction(null, null, [f], formatGML);
        // 			break;
        // 	}
        // 	s = new XMLSerializer();
        // 	str = s.serializeToString(node);
        // 	$.ajax('http://www.firefly.com/geoserver/wfs', {
        // 		type: 'POST',
        // 		dataType: 'xml',
        // 		processData: false,
        // 		contentType: 'text/xml',
        // 		data: str
        // 	}).done();
        // };

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

        /********* ADD SENSOR **********/
        // var iconFeature = new ol.Feature({
        //     geometry: new ol.geom.Point([0, 0]),
        //     name: 'Camera',
        //     maxRange: 4000,
        //     minRange: 500,
        //     sourceHeight: 3,
        //     targetHeight: 3
        // });
        // var iconStyle = new ol.style.Style({
        //     image: new ol.style.Icon({
        //         anchor: [0.5, 46],
        //         anchorXUnits: 'fraction',
        //         anchorYUnits: 'pixels',
        //         src: 'resources/camera-normal.png'
        //     })
        // });
        // iconFeature.setStyle(iconStyle);
        // var vectorSource = new ol.source.Vector({
        //     features: [iconFeature]
        // });

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
        //         style: tobjectsStyleFunction
        //     });
        //     var vector = new ol.layer.Vector({
        //         title: 'tobjects',
        //         type: 'overlay',
        //         source: new ol.source.Vector({
        //             url: 'test_project/tobjects_test.geojson',
        //             format: new ol.format.GeoJSON()
        //         }),
        //         style: tobjectsStyleFunction
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

        // var vector_aor = new ol.layer.Vector({
        //     title: 'AOR',
        //     name: 'AOR',
        //     type: 'vector',
        //     source: new ol.source.Vector(),
        //     style: tobjectsStyleFunction
        // });
        // var vector = new ol.layer.Vector({
        //     title: 'tobjects',
        //     name: 'tobjects',
        //     type: 'vector',
        //     source: new ol.source.Vector(),
        //     style: tobjectsStyleFunction
        // });
        // var projectGroup = new ol.layer.Group({
        //     title: 'Project',
        //     layers: [
        //         // layerVector,
        //         vector_aor,
        //         vector
        //     ]
        // });
        // map.addLayer(projectGroup);

        /******* LAYER SWITCHER ********/
        var layerSwitcher = new ol.control.LayerSwitcher();
        map.addControl(layerSwitcher);

        /********** SCALELINE **********/
        var scaleLineControl = new ol.control.ScaleLine({
            // className: 'ol-scale-line ol-scale-line-inner text-stroke',
        });
        map.addControl(scaleLineControl);

        var unitsSelect = $('#units');
        unitsSelect.on('change', function () {
            scaleLineControl.setUnits(this.value);
        });
        unitsSelect.val(scaleLineControl.getUnits());

        /******** MOUSEPOSITION ********/
        var mousePositionControl = new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(mousePrecision),
            projection: mouseProjection,
            target: 'coordinates'
        });
        map.addControl(mousePositionControl);

        var projectionSelect = $('#projection');
        projectionSelect.on('change', function () {
            mouseProjection = ol.proj.get(this.value);
            mousePositionControl.setProjection(mouseProjection);

        });
        projectionSelect.val(mousePositionControl.getProjection().getCode());

        var mousePositionControl2 = new ol.control.MousePosition({
            coordinateFormat: function (coordinates) {
                var zoom = view.getZoom();
                var xytile = deg2tile(coordinates[0], coordinates[1], zoom);
                return "Tile: [Z: " + zoom + "  X: " + xytile[0] + "  Y: " + xytile[1] + "]";
            },
            projection: 'EPSG:4326',
            target: 'tile'
        });
        map.addControl(mousePositionControl2);

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


        // document.getElementById('checkwmslayer').addEventListener('click', function () {
        //     tree.checkWmsLayer(this.form);
        // });
        // document.getElementById('checkwfslayer').addEventListener('click', function () {
        //     tree.checkWfsLayer(this.form);
        // });
        // document.getElementById('wmsurl').addEventListener('change', function () {
        //     tree.removeContent(this.form.layer)
        //         .removeContent(this.form.format);
        // });
        // document.getElementById('wfsurl').addEventListener('change', function () {
        //     tree.removeContent(this.form.layer);
        // });
        // document.getElementById('addwms_form').addEventListener('submit', function (evt) {
        //     evt.preventDefault();
        //     tree.addWmsLayer(this);
        //     this.parentNode.style.display = 'none';
        // });
        // document.getElementById('addwfs_form').addEventListener('submit', function (evt) {
        //     evt.preventDefault();
        //     tree.addWfsLayer(this);
        //     this.parentNode.style.display = 'none';
        // });
        // document.getElementById('addvector_form').addEventListener('submit', function (evt) {
        //     evt.preventDefault();
        //     tree.addVectorLayer(this);
        //     this.parentNode.style.display = 'none';
        // });
        // document.getElementById('newvector_form').addEventListener('submit', function (evt) {
        //     evt.preventDefault();
        //     tree.newVectorLayer(this);
        //     this.parentNode.style.display = 'none';
        // });

        $("#checkwmslayer").button().on("click", function () {
            tree.checkWmsLayer($(this));
        });
        $("#checkwfslayer").button().on("click", function () {
            tree.checkWfsLayer($(this));
        });

        $("#url_addwms").on("change", function () {
            var $layername = $(this).parent().find(".layername");
            var $format = $(this).parent().find(".format");
            $layername.empty();
            $layername.selectmenu("refresh");
            $format.empty();
            $format.selectmenu("refresh");
        });
        $("#url_addwfs").on("change", function () {
            var $layername = $(this).parent().find(".layername");
            $layername.empty();
            $layername.selectmenu("refresh");
        });
        var $addWmsDialog = $("#addwms").dialog({
            title: "Add WMS layer",
            autoOpen: false,
            modal: true,
            buttons: {
                "Add Layer": function () {
                    tree.addWmsLayer($(this).children());
                    $(this).dialog("close")
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                $(this).find("form")[0].reset();
            }
        });
        $addWmsDialog.find("form").on("submit", function (event) {
            event.preventDefault();
            tree.addWmsLayer($(this));
            $(this).parent().dialog("close");
        });

        var $addWfsDialog = $("#addwfs").dialog({
            title: "Add WFS layer",
            autoOpen: false,
            modal: true,
            buttons: {
                "Add Layer": function () {
                    tree.addWfsLayer($(this).children());
                    $(this).dialog("close")
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                $(this).find("form")[0].reset();
            }
        });
        $addWfsDialog.find("form").on("submit", function (event) {
            event.preventDefault();
            tree.addWfsLayer($(this));
            $(this).parent().dialog("close");
        });

        var $addVectorDialog = $("#addvector").dialog({
            title: "Add Vector layer",
            autoOpen: false,
            modal: true,
            buttons: {
                "Add Layer": function () {
                    tree.addVectorLayer($(this).children());
                    $(this).dialog("close")
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                $(this).find("form")[0].reset();
            }
        });
        $addVectorDialog.find("form").on("submit", function (event) {
            event.preventDefault();
            tree.addVectorLayer($(this));
            $(this).parent().dialog("close");
        });
        $addVectorDialog.find(".file").on("change", function (event) {
            var startPos = this.value.lastIndexOf("\\") + 1;
            var stopPos = this.value.lastIndexOf(".");
            var name = this.value.slice(startPos, stopPos);
            $addVectorDialog.find(".displayname").val(name);
        });

        var $newVectorDialog = $("#newvector").dialog({
            title: "Create New Vector Layer",
            autoOpen: false,
            modal: true,
            buttons: {
                "Add Layer": function () {
                    tree.newVectorLayer($(this).children());
                    $(this).dialog("close")
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                $(this).find("form")[0].reset();
            }
        });
        $newVectorDialog.find("form").on("submit", function (event) {
            event.preventDefault();
            tree.newVectorLayer($(this));
            $(this).parent().dialog("close");
        });

        $(".layername").selectmenu({
            change: function (event, ui) {
                $(this).parent().find(".displayname").val($(this).val());
            }
        }).selectmenu('menuWidget').addClass("overflow");
        $(".geomtype").selectmenu().selectmenu('menuWidget').addClass("overflow");;
        $(".filetype").selectmenu({
            change: function (event, ui) {
                $(this).parent().find(".displayname").val("");
                $(this).parent().find(".file").val("");
                $(this).parent().find(".file")[0].accept = '.' + $(this).val();
            }
        }).selectmenu('menuWidget').addClass("overflow");;
        $(".format").selectmenu().selectmenu('menuWidget').addClass("overflow");;
        $(".tiled").checkboxradio();

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
    };
    // document.addEventListener('DOMContentLoaded', init);
    // alert();
    init();
    // alert();
});
// define([], function() {});
