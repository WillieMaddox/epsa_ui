/**
 * Created by maddoxw on 7/23/16.
 */

define(['jquery', 'ol',
    'messagebar',
    'map',
    'exists',
    'utils',
    'shp',
    'wfs110context',
    'ttemplate',
    'tstylefunction',
    'stemplate',
    'sstylefunction',
    'jquery-ui'
], function ($, ol,
             message,
             map,
             exists,
             utils,
             shp,
             WFSContext,
             tobjectTemplates,
             tobjectStyleFunction,
             sensorTemplates,
             sensorStyleFunction) {

    'use strict';

    var idCounter = 0;

    return {
        init: function () {

            this.$layerContainer = $('#layertree-container');
            this.$layerContainer.sortable({
                axis: "y",
                items: "> .layer",
                containment: "parent",
                opacity: 0.5,
                start: function (event, ui) {
                    console.log('start')
                },
                change: function (event, ui) {
                    console.log('change')
                },
                beforeStop: function (event, ui) {
                    console.log('beforeStop')
                },
                stop: function (event, ui) {
                    // IE doesn't register the blur when sorting
                    // so trigger focusout handlers to remove .ui-state-focus
                    ui.item.children(".layer").triggerHandler("focusout");

                    var htmlArray = [].slice.call(_this.$layerContainer[0].children);
                    var index = htmlArray.length - htmlArray.indexOf(ui.item[0]) - 1;
                    var sourceLayer = _this.getLayerById(ui.item[0].id);
                    var layers = map.getLayers().getArray();
                    var group_shift = layers.length - htmlArray.length;
                    layers.splice(layers.indexOf(sourceLayer), 1);
                    layers.splice(group_shift + index, 0, sourceLayer);
                    map.render();
                    // map.getLayers().changed();
                }
            });

            this.layerEditors = {};
            this.selectedLayer = null;
            this.selectEventEmitter = new ol.Observable();
            this.deselectEventEmitter = new ol.Observable();

            var _this = this;
            var handler = function (event, data) {
                if (data) {
                    event.data = data;
                }
                if (event.data.selectevent) {
                    var targetNode = event.target;
                    if (targetNode.classList.contains("layertitle")) {
                        targetNode = targetNode.parentNode;
                    }
                    if (targetNode.classList.contains("layerrow")) {
                        targetNode = targetNode.parentNode;
                    }
                    if (!(targetNode.classList.contains("layer"))) {
                        return;
                    }
                    if (_this.selectedLayer === targetNode) {
                        _this.deselectEventEmitter.changed();
                        _this.selectedLayer.classList.remove('active');
                        _this.selectedLayer = null;
                    } else if (_this.selectedLayer === null) {
                        _this.selectedLayer = targetNode;
                        _this.selectedLayer.classList.add('active');
                        _this.selectEventEmitter.changed();
                    } else if (_this.selectedLayer !== targetNode) {
                        _this.deselectEventEmitter.changed();
                        _this.selectedLayer.classList.remove('active');
                        _this.selectedLayer = null;
                        _this.selectedLayer = targetNode;
                        _this.selectedLayer.classList.add('active');
                        _this.selectEventEmitter.changed();
                    }
                }
                if (event.data.stopProp) {
                    event.stopPropagation();
                }
            };
            this.createRegistry = function (layer) {
                var mouseDownFired = false;
                var lid = 'layer_' + idCounter;
                layer.set('id', lid);
                idCounter += 1;

                var $layerDiv = $("<div id='" + lid + "' class='layer ol-unselectable'>");

                var $layerRow1 = $("<div class='layerrow layerrow1'>");

                // var $layerVisibleLabel = $("<label for='"+lid+"-layervisible' class='visible layervisible'>");
                // var $layerVisible = $("<input type='checkbox' id='"+lid+"-layervisible' class='checkboxradio' checked>");
                // var $layerTitle = $("<div id='"+lid+"-layertitle' class='layertitle'>" + layer.get('name') + "</div>");
                // var $layerOpacity = $("<div id='"+lid+"-layeropacity' class='layeropacity'>");
                $layerRow1.append($("<label for='" + lid + "-layervisible' class='visible layervisible'>"));
                $layerRow1.append($("<input type='checkbox' id='" + lid + "-layervisible' class='checkboxradio' checked>"));
                $layerRow1.append($("<div id='" + lid + "-layertitle' class='layertitle'>" + layer.get('name') + "</div>"));
                $layerRow1.append($("<div id='" + lid + "-layeropacity' class='layeropacity'>"));

                $layerDiv.append($layerRow1);

                if (layer instanceof ol.layer.Image) {

                    var $layerRow2 = $("<div class='layerrow layerrow2'>");

                    var $hoverControl = $("<div class='controlgroup hovercontrol'>");

                    // var $hoverVisibleLabel = $("<label for='"+lid+"-hovervisible' class='visible hovervisible'>");
                    // var $hoverVisible = $("<input type='checkbox' id='"+lid+"-hovervisible' class='checkboxradio' checked>");
                    // var $hoverSelect = $("<select id='"+lid+"-hoverselect' class='hoverselect'>");
                    $hoverControl.append($("<label for='" + lid + "-hovervisible' class='visible hovervisible'>"));
                    $hoverControl.append($("<input type='checkbox' id='" + lid + "-hovervisible' class='checkboxradio' checked>"));
                    $hoverControl.append($("<select id='" + lid + "-hoverselect' class='hoverselect'>"));

                    $layerRow2.append($hoverControl);

                    var $colorControl = $("<div class='controlgroup colorcontrol'>");

                    // var $resetButton = $("<button id='"+lid+"-resetbutton' class='mybutton resetbutton'>Reset</button>");
                    // var $colorButton = $("<button id='"+lid+"-colorbutton' class='mybutton colorbutton colorwheel-icon'></button>");
                    // var $colorSelect = $("<select id='"+lid+"-colorselect' class='colorselect'>");
                    $colorControl.append($("<button id='" + lid + "-resetbutton' class='mybutton resetbutton'>Reset</button>"));
                    $colorControl.append($("<button id='" + lid + "-colorbutton' class='mybutton colorbutton colorwheel-icon'></button>"));
                    $colorControl.append($("<select id='" + lid + "-colorselect' class='colorselect'>"));

                    $layerRow2.append($colorControl);

                    $layerDiv.append($layerRow2);
                }

                this.$layerContainer.prepend($layerDiv);

                $layerDiv.on("click", null, function (event) {
                    console.log($layerDiv[0].id + ' .layer click');
                    if (mouseDownFired) {
                        mouseDownFired = false;
                        event.stopPropagation();
                        return;
                    }
                    handler(event, {
                        selectevent: true,
                        stopProp: true
                    })
                }).on("click", ".layerrow", function (event) {
                    console.log($layerDiv[0].id + ' .layerrow click');
                    if (mouseDownFired) {
                        mouseDownFired = false;
                        event.stopPropagation();
                        return;
                    }
                    handler(event, {
                        selectevent: true,
                        stopProp: true
                    })
                });

                $('#' + lid + '-layervisible').checkboxradio().on('change', function () {
                    layer.setVisible(this.checked);
                }).on('click', function (event) {
                    handler(event, {
                        stopProp: true
                    })
                });
                $('#' + lid + '-layertitle').on('dblclick', function () {
                    this.contentEditable = true;
                    this.style.textOverflow = 'initial';
                    // $layerDiv[0].draggable = false;
                    $layerDiv[0].classList.remove('ol-unselectable');
                    this.focus();
                }).on('blur', function () {
                    if (this.contentEditable) {
                        this.contentEditable = false;
                        // $layerDiv[0].draggable = true;
                        $layerDiv[0].classList.add('ol-unselectable');
                        // $layerDiv[0].title = this.textContent;
                        layer.set('name', this.textContent);
                        this.style.textOverflow = 'ellipsis';
                        this.scrollLeft = 0;
                    }
                }).on('click', function (event) {
                    handler(event, {
                        selectevent: true,
                        stopProp: true
                    })
                });
                $('#' + lid + '-layeropacity').slider({
                    animate: true,
                    range: "min",
                    min: 0,
                    max: 1,
                    step: 0.01,
                    value: layer.getOpacity(),
                    slide: function (event, ui) {
                        layer.setOpacity(ui.value);
                    }
                }).on("mousedown", function (event) {
                    console.log($layerDiv[0].id + ' .opacity mousedown');
                    mouseDownFired = true;
                    handler(event, {
                        stopProp: true
                    })
                }).on("mouseup", function (event) {
                    console.log($layerDiv[0].id + ' .opacity mouseup');
                    if (mouseDownFired) {
                        mouseDownFired = false;
                        event.stopPropagation();
                        return;
                    }
                    handler(event, {
                        stopProp: true
                    })
                });

                if (layer instanceof ol.layer.Image) {

                    $('#' + lid + '-hovercontrol').controlgroup();
                    $('#' + lid + '-hovervisible').checkboxradio().on('click', function (event) {
                        handler(event, {
                            stopProp: true
                        })
                    });
                    $('#' + lid + '-hoverselect').selectmenu();
                    $('#' + lid + '-colorcontrol').controlgroup();
                    $('#' + lid + '-resetbutton').button().on('click', function (event) {
                        _this.styleDefault(layer, 'type');
                        layer.set('geomstyle', 'type');
                        handler(event, {
                            stopProp: true
                        })
                    });
                    $('#' + lid + '-colorbutton').button().on('click', function (event) {
                        var attribute = $('#' + lid + '-colorselect').val();
                        if (layer.get('headers')[attribute] === 'string') {
                            _this.styleCategorized(layer, attribute);
                        } else if (layer.get('headers')[attribute] === 'number') {
                            _this.styleGraduated(layer, attribute);
                        } else {
                            message('A string or numeric column is required for attribute coloring.');
                        }
                        handler(event, {
                            stopProp: true
                        })
                    });
                    $('#' + lid + '-colorselect').selectmenu();

                    layer.on('propertychange', function (evt) {
                        if (evt.key === 'headers') {
                            let refresh = false;
                            let opt, header;
                            let headers = evt.target.get('headers');
                            let previous = evt.oldValue;

                            for (header in headers) {
                                if (!previous || !previous[header]) {
                                    refresh = true;
                                } else {
                                    console.log('Warning: This should have been caught in buildHeaders function.')
                                }
                            }
                            if (refresh) {
                                _this.identifyLayer(layer);
                                _this.styleDefault(layer);
                                let id = '#' + evt.target.get('id');
                                let $hoverSelect = $(id + '-hoverselect');
                                let $colorSelect = $(id + '-colorselect');
                                let $hoverAttribute = $hoverSelect.val();
                                let $colorAttribute = $colorSelect.val();
                                $hoverSelect.selectmenu('destroy').empty();
                                $colorSelect.selectmenu('destroy').empty();

                                for (header in headers) {
                                    $hoverSelect.append(utils.createMenuOption(header));
                                    $colorSelect.append(utils.createMenuOption(header));
                                }

                                if ($hoverSelect.children().length > 0) {
                                    let opt1 = null;
                                    let opt2 = null;
                                    $hoverSelect.children().each(function () {
                                        if ($(this).text() === $hoverAttribute) {
                                            opt1 = $(this).text()
                                        }
                                        if ($(this).text() === 'name') {
                                            opt2 = $(this).text()
                                        }
                                    });
                                    opt = opt1 || opt2 || $hoverSelect.children()[0].value;
                                    $hoverSelect.val(opt);
                                }
                                layer.set('textstyle', opt);

                                if ($colorSelect.children().length > 0) {
                                    let opt1 = null;
                                    let opt2 = null;
                                    $colorSelect.children().each(function () {
                                        if ($(this).text() === $colorAttribute) {
                                            opt1 = $colorAttribute
                                        }
                                        if ($(this).text() === 'type') {
                                            opt2 = 'type'
                                        }
                                    });
                                    opt = opt1 || opt2 || $colorSelect.children()[0].value;
                                    $colorSelect.val(opt);
                                }
                                layer.set('geomstyle', opt);

                                $hoverSelect.selectmenu({
                                    classes: {
                                        'ui-selectmenu-button': 'menuselect'
                                    },
                                    change: function () {
                                        layer.set('textstyle', this.value);
                                    }
                                }).selectmenu('menuWidget').addClass('overflow');
                                $colorSelect.selectmenu({
                                    classes: {
                                        'ui-selectmenu-button': 'menuselect'
                                    },
                                    change: function () {
                                        layer.set('geomstyle', this.value);
                                        if (layer.get('headers')[this.value] === 'string') {
                                            _this.styleCategorized(layer, this.value);
                                        } else if (layer.get('headers')[this.value] === 'number') {
                                            _this.styleGraduated(layer, this.value);
                                        } else {
                                            message('A string or numeric column is required for attribute coloring.');
                                        }
                                    }
                                }).selectmenu('menuWidget').addClass('overflow');
                                $(id + '-hovercontrol').controlgroup('refresh');
                                $(id + '-colorcontrol').controlgroup('refresh');
                                // $('.controlgroup').controlgroup('refresh')
                            }
                        }
                    });
                }

                // $('.mybutton').button();
                // $('.checkboxradio').checkboxradio();
                // $('.controlgroup').controlgroup();

                return this;
            };

            map.getLayers().on('add', function (evt) {
                if (evt.element.get('type') !== 'overlay') {
                    this.createRegistry(evt.element);
                }
            }, this);
            map.getLayers().on('remove', function (evt) {
                if (evt.element.get('type') !== 'overlay') {
                    if (evt.element instanceof ol.layer.Image) {
                        this.deselectEventEmitter.changed();
                    }
                    $('#' + evt.element.get('id')).remove();
                }
            }, this);
        },

        addBufferIcon: function (layer) {
            // Rename this. It hasn't added a buffer Icon in a long time.
            // What it does do:
            // 1. decrements pendingRequests counter
            // 2. unwrap progressbar when pending requests hits 0.
            // 3. call buildHeaders()
            // 4. refreshes hover and color controls in layer. (after buildHeaders success)
            console.log('addBufferIcon init()');
            layer.getSource().getSource().on('change', function (evt) {
                // layer.getSource().getSource() === evt.target === this
                let id = '#' + layer.get('id');
                if (evt.target.getState() === 'ready') {
                    if (evt.target.get('pendingRequests') > 0) {
                        evt.target.set('pendingRequests', evt.target.get('pendingRequests') - 1);
                        // console.log('Remaining', evt.target.get('pendingRequests'));
                        // Only unwrap layers with progressbar (i.e. addWfs and addVector)
                        if (evt.target.get('pendingRequests') === 0) {
                            $(id + ' .layertitle').unwrap();
                        }
                    }
                    if (evt.target.get('pendingRequests') === 0) {
                        layer.buildHeaders();
                    }
                    if (evt.target.getFeatures().length === 0) {
                        var hasFeatures = [false, 'disable']
                    } else {
                        hasFeatures = [true, 'enable']
                    }
                    $(id + '-hovercontrol').controlgroup(hasFeatures[1]);
                    $(id + '-colorcontrol').controlgroup(hasFeatures[1]);

                } else {
                    $(id).addClass('error');
                }
            });
        },
        removeLayer: function () {
            if (this.selectedLayer) {
                var layer = this.getLayerById(this.selectedLayer.id);
                map.removeLayer(layer);
                this.selectedLayer.classList.remove('active');
                this.selectedLayer = null;
                message('Layer removed successfully.');
            } else {
                message('No selected layer to remove.');
            }
        },

        getLayerById: function (id) {
            var layers = map.getLayers().getArray();
            var len = layers.length;
            for (var i = 0; i < len; i += 1) {
                if (layers[i].get('id') === id) {
                    return layers[i];
                }
            }
            return false;
        },
        identifyLayer: function (layer) {

            var geomType = null;
            var geomTypes = [];
            var geomTypesDefault = ['point', 'line', 'polygon', 'geomcollection'];
            var geomTypeIsVerified = false;

            var layerType;
            var layerTypes = [];
            var layerTypesDefault = {
                'feature': Object.keys(tobjectTemplates),
                'sensor': Object.keys(sensorTemplates)
            };
            var layerTypeIsVerified = false;

            var getLayerType = function (featureType) {
                for (var ltype in layerTypesDefault) {
                    for (var ftype in layerTypesDefault[ltype]) {
                        if (featureType === layerTypesDefault[ltype][ftype]) {
                            return ltype;
                        }
                    }
                }
            };
            var getGeometryType = function (geomType) {
                if (geomType.endsWith('Point')) {
                    return 'point';
                } else if (geomType.endsWith('LineString')) {
                    return 'line';
                } else if (geomType.endsWith('Polygon')) {
                    return 'polygon';
                } else {
                    return 'geomcollection';
                }
            };
            if (geomTypesDefault.indexOf(layer.get('geomtype')) >= 0) {
                geomTypes.push(layer.get('geomtype'));
                geomTypeIsVerified = true;
            }
            if (Object.keys(layerTypesDefault).indexOf(layer.get('type')) >= 0) {
                layerTypes.push(layer.get('type'));
                layerTypeIsVerified = true;
            }

            layer.getSource().getSource().forEachFeature(function (feature) {
                if (!(geomTypeIsVerified)) {
                    geomType = getGeometryType(feature.getGeometry().getType());
                    if (geomTypes.indexOf(geomType) === -1) {
                        geomTypes.push(geomType);

                        if (geomTypes.length > 1) {
                            geomTypes = ['geomcollection'];
                            geomTypeIsVerified = true;
                        }
                    }
                }
                if (!(layerTypeIsVerified)) {
                    layerType = getLayerType(feature.get('type'));
                    if (layerType && layerTypes.indexOf(layerType) === -1) {
                        layerTypes.push(layerType);

                        if (layerTypes.length > 1) {
                            layerTypes = ['feature'];
                            layerTypeIsVerified = true;
                        }
                    }
                }
                if (geomTypeIsVerified && layerTypeIsVerified) {
                    return true;
                }
            });

            if (geomTypes.length === 1) {
                layer.set('geomtype', geomTypes[0])
            }

            if (layerTypes.length === 1) {
                layer.set('type', layerTypes[0])
            } else {
                layer.set('type', 'feature')
            }
            return layer;
        },

        styleDefault: function (layer, attribute) {
            if (layer.get('type') === 'feature') {
                layer.getSource().setStyle(tobjectStyleFunction);
            } else if (layer.get('type') === 'sensor') {
                layer.getSource().setStyle(sensorStyleFunction);
            }
        },
        styleGraduated: function (layer, attribute) {
            var attributeArray = [];
            layer.getSource().getSource().forEachFeature(function (feat) {
                attributeArray.push(feat.get(attribute) || 0);
            });
            var max = Math.max.apply(null, attributeArray);
            var min = Math.min.apply(null, attributeArray);
            var step = (max - min) / 5;
            var colors = this.graduatedColorFactory(5, [254, 240, 217], [179, 0, 0]);
            layer.getSource().setStyle(function (feature, res) {
                var property = feature.get(attribute) || 0;
                // var opacity = feature.get('type') === 'aor' ? 0.0 : 0.9;
                var color = property < min + step ? colors[0] :
                    property < min + step * 2 ? colors[1] :
                        property < min + step * 3 ? colors[2] :
                            property < min + step * 4 ? colors[3] : colors[4];
                var style;
                if (feature.getGeometry().getType().endsWith('Point')) {
                    if (feature.get('type') === 'camera' || feature.get('type') === 'radio') {
                        style = [
                            new ol.style.Style({
                                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                                    anchor: [0.5, 0.5],
                                    anchorXUnits: 'fraction',
                                    anchorYUnits: 'fraction',
                                    color: color,
                                    opacity: 1,
                                    scale: 0.05,
                                    snapToPixel: false,
                                    src: './img/camera-normal.png'
                                }))
                            })
                        ]
                    } else {
                        style = [
                            new ol.style.Style({
                                image: new ol.style.Circle({
                                    radius: 5,
                                    stroke: new ol.style.Stroke({
                                        color: [0, 0, 0, 1],
                                        width: 2
                                    }),
                                    fill: new ol.style.Fill({
                                        color: color.concat(0.5)
                                    })
                                })
                            })
                        ]
                    }
                } else if (feature.getGeometry().getType().endsWith('LineString') || feature.get('type') === 'aor') {
                    style = [
                        new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: [0, 0, 0, 1],
                                width: 4
                            })
                        }),
                        new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: color.concat(1),
                                width: 2
                            })
                        })
                    ]
                } else {
                    style = [
                        new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: [0, 0, 0, 1],
                                width: 1
                            }),
                            fill: new ol.style.Fill({
                                color: color.concat(1)
                            })
                        })
                    ];
                }
                return style;
            });
        },
        graduatedColorFactory: function (intervals, rgb1, rgb2) {
            var colors = [];
            var step = intervals - 1;
            var redStep = (rgb2[0] - rgb1[0]) / step;
            var greenStep = (rgb2[1] - rgb1[1]) / step;
            var blueStep = (rgb2[2] - rgb1[2]) / step;
            for (var i = 0; i < step; i += 1) {
                var red = Math.ceil(rgb1[0] + redStep * i);
                var green = Math.ceil(rgb1[1] + greenStep * i);
                var blue = Math.ceil(rgb1[2] + blueStep * i);
                colors.push([red, green, blue]);
            }
            colors.push([rgb2[0], rgb2[1], rgb2[2]]);
            return colors;
        },
        styleCategorized: function (layer, attribute) {
            var attributeArray = [];
            var colorArray = [];
            var randomColor;

            function convertHex(hex, opacity) {
                hex = hex.replace('#', '');
                var r = parseInt(hex.substring(0, 2), 16);
                var g = parseInt(hex.substring(2, 4), 16);
                var b = parseInt(hex.substring(4, 6), 16);
                if (opacity) {
                    return [r, g, b, opacity];
                } else {
                    return [r, g, b];
                }
            }

            layer.getSource().getSource().forEachFeature(function (feature) {
                var property = feature.get(attribute) ? feature.get(attribute).toString() : '';
                if (attributeArray.indexOf(property) === -1) {
                    attributeArray.push(property);
                    do {
                        randomColor = this.randomHexColor();
                    } while (colorArray.indexOf(randomColor) !== -1);
                    colorArray.push(randomColor);
                }
            }, this);
            layer.getSource().setStyle(function (feature, res) {
                var index = feature.get(attribute) ? attributeArray.indexOf(feature.get(attribute).toString()) : attributeArray.indexOf('');
                var style;
                if (feature.getGeometry().getType().endsWith('Point')) {
                    if (feature.get('type') === 'camera' || feature.get('type') === 'radio') {
                        style = [
                            new ol.style.Style({
                                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                                    anchor: [0.5, 0.5],
                                    anchorXUnits: 'fraction',
                                    anchorYUnits: 'fraction',
                                    color: convertHex(colorArray[index]),
                                    opacity: 0.8,
                                    scale: 0.05,
                                    snapToPixel: false,
                                    src: './img/camera-normal.png'
                                }))
                            })
                        ]
                    } else {
                        style = [
                            new ol.style.Style({
                                image: new ol.style.Circle({
                                    radius: 5,
                                    stroke: new ol.style.Stroke({
                                        color: convertHex(colorArray[index], 1),
                                        width: 2
                                    }),
                                    fill: new ol.style.Fill({
                                        color: convertHex(colorArray[index], 0.5)
                                    })
                                })
                            })
                        ]
                    }
                } else if (feature.getGeometry().getType().endsWith('LineString') || feature.get('type') === 'aor') {
                    style = [
                        new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: [0, 0, 0, 1],
                                width: 4
                            })
                        }),
                        new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: convertHex(colorArray[index], 1),
                                width: 2
                            })
                        })
                    ]
                } else {
                    style = [
                        new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: [0, 0, 0, 1],
                                width: 1
                            }),
                            fill: new ol.style.Fill({
                                color: convertHex(colorArray[index], 1)
                            })
                        })
                    ];
                }
                return style;
            });
        },
        randomHexColor: function () {
            var num = Math.floor(Math.random() * 16777215).toString(16);
            return '#' + String.prototype.repeat.call('0', 6 - num.length) + num;
        }
    }
});