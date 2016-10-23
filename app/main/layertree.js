/**
 * Created by maddoxw on 7/23/16.
 */

define(["jquery", "ol",
    "exists",
    "shp",
    'wfs110context',
    "ttemplate",
    "tstylefunction",
    "serversettings",
    "jquery-ui"
], function ($, ol,
             exists,
             shp,
             WFSContext,
             tobjectTemplates,
             tobjectStyleFunction,
             settings) {

    var layerTree = function (options) {
        'use strict';
        if (!(this instanceof layerTree)) {
            throw new Error('layerTree must be constructed with the new keyword.');
        } else if (typeof options === 'object' && options.map && options.target) {
            if (!(options.map instanceof ol.Map)) {
                throw new Error('Please provide a valid OpenLayers 3 map object.');
            }
            this.map = options.map;
            var containerDiv = document.getElementById(options.target);
            if (containerDiv === null || containerDiv.nodeType !== 1) {
                throw new Error('Please provide a valid element id.');
            }
            this.messages = document.getElementById(options.messages) || document.createElement('span');
            var observer = new MutationObserver(function (mutations) {
                if (mutations[0].target.textContent) {
                    var oldText = mutations[0].target.textContent;
                    var timeoutFunction = function () {
                        if (oldText !== mutations[0].target.textContent) {
                            oldText = mutations[0].target.textContent;
                            setTimeout(timeoutFunction, 10000);
                        } else {
                            oldText = '';
                            mutations[0].target.textContent = '';
                        }
                    };
                    setTimeout(timeoutFunction, 10000);
                }
            });
            observer.observe(this.messages, {childList: true});
            this.wfsProjections = null;
            // this.unmarshaller = this.schemaContext.createUnmarshaller();
            var controlDiv = document.createElement('div');
            controlDiv.className = 'layertree-buttons';
            controlDiv.appendChild(this.createButton('addwms', 'Add WMS Layer', 'addlayer')[0]);
            controlDiv.appendChild(this.createButton('addwfs', 'Add WFS Layer', 'addlayer')[0]);
            controlDiv.appendChild(this.createButton('addvector', 'Add Vector Layer', 'addlayer')[0]);
            controlDiv.appendChild(this.createButton('newvector', 'New Vector Layer', 'addlayer')[0]);
            controlDiv.appendChild(this.createButton('deletelayer', 'Remove Layer', 'deletelayer')[0]);
            containerDiv.appendChild(controlDiv);

            this.layerContainer = $("<div class='layercontainer'>");
            containerDiv.appendChild(this.layerContainer[0]);

            this.layerEditors = {};
            this.selectedLayer = null;
            this.selectEventEmitter = new ol.Observable();
            this.deselectEventEmitter = new ol.Observable();

            var _this = this;
            $(".layercontainer").sortable({
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

                    var htmlArray = [].slice.call(_this.layerContainer[0].children);
                    var index = htmlArray.length - htmlArray.indexOf(ui.item[0]) - 1;
                    var sourceLayer = _this.getLayerById(ui.item[0].id);
                    var layers = _this.map.getLayers().getArray();
                    var group_shift = layers.length - htmlArray.length;
                    layers.splice(layers.indexOf(sourceLayer), 1);
                    layers.splice(group_shift + index, 0, sourceLayer);
                    _this.map.render();
                    // _this.map.getLayers().changed();
                }
            });

            var idCounter = 0;

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
                    if (_this.selectedLayer) {
                        _this.deselectEventEmitter.changed();
                        _this.selectedLayer.classList.remove('active');
                    }

                    // if (_this.selectedLayer !== targetNode) {
                    //     _this.selectedLayer = targetNode;
                    //     _this.selectedLayer.classList.add('active');
                    // } else {
                    //     _this.selectedLayer = null;
                    // }

                    _this.selectedLayer = targetNode;
                    _this.selectedLayer.classList.add('active');
                    _this.selectEventEmitter.changed();
                }
                if (event.data.stopProp) {
                    event.stopPropagation();
                }
            };

            this.createRegistry = function (layer) {
                layer.set('id', 'layer_' + idCounter);
                idCounter += 1;
                var mouseDownFired = false;
                var _this = this;

                var $layerDiv = $("<div class='layer ol-unselectable'>");
                $layerDiv[0].title = layer.get('name') || 'Unnamed Layer';
                $layerDiv[0].id = layer.get('id');
                this.layerContainer.prepend($layerDiv);

                $layerDiv.on("click", null, function (event) {
                    console.log($layerDiv[0].id + ' .layer click');
                    if (mouseDownFired) {
                        mouseDownFired = false;
                        event.stopPropagation();
                        return;
                    }
                    var data = {
                        selectevent: true,
                        stopProp: true
                    };
                    handler(event, data)
                });

                $layerDiv.on("click", ".layerrow", function (event) {
                    console.log($layerDiv[0].id + ' .layerrow click');
                    if (mouseDownFired) {
                        mouseDownFired = false;
                        event.stopPropagation();
                        return;
                    }
                    var data = {
                        selectevent: true,
                        stopProp: true
                    };
                    handler(event, data)
                });

                var $layerRow_1 = $("<div class='layerrow layerrow1'>");

                var $visibleLabel = $("<label class='visible layervisible'>");
                $visibleLabel.attr('for', layer.get('id') + "-layervisible");
                $layerRow_1.append($visibleLabel);
                var $visibleInput = $("<input type='checkbox' class='checkboxradio'/>");
                $visibleInput.attr('id', layer.get('id') + "-layervisible" );
                $visibleInput[0].checked = layer.getVisible();
                $layerRow_1.append($visibleInput);
                $visibleInput.change(function () {
                    if (this.checked) {
                        layer.setVisible(true);
                    } else {
                        layer.setVisible(false);
                    }
                });
                $visibleInput.click({
                    stopProp: true
                }, handler);

                var $layerTitle = $("<div class='layertitle'>");
                $layerTitle[0].textContent = $layerDiv[0].title;
                $layerRow_1.append($layerTitle);
                $layerTitle.dblclick(function () {
                    this.contentEditable = true;
                    this.style.textOverflow = 'initial';
                    // $layerDiv[0].draggable = false;
                    $layerDiv[0].classList.remove('ol-unselectable');
                    this.focus();
                });
                $layerTitle.blur(function () {
                    if (this.contentEditable) {
                        this.contentEditable = false;
                        // $layerDiv[0].draggable = true;
                        $layerDiv[0].classList.add('ol-unselectable');
                        $layerDiv[0].title = this.textContent;
                        layer.set('name', this.textContent);
                        this.style.textOverflow = 'ellipsis';
                        this.scrollLeft = 0;
                    }
                });
                $layerTitle.click({
                    selectevent: true,
                    stopProp: true
                }, handler);

                var $opacitySlider = $("<div class='opacity'>");
                $layerRow_1.append($opacitySlider);

                $opacitySlider.slider({
                    animate: true,
                    range: "min",
                    min: 0,
                    max: 1,
                    step: 0.01,
                    value: layer.getOpacity(),
                    slide: function (event, ui) {
                        layer.setOpacity(ui.value);
                    }
                });
                $opacitySlider.on("mousedown", function (event) {
                    console.log($layerDiv[0].id + ' .opacity mousedown');
                    mouseDownFired = true;
                    var data = {
                        stopProp: true
                    };
                    handler(event, data)
                });
                $opacitySlider.on("mouseup", function (event) {
                    console.log($layerDiv[0].id + ' .opacity mouseup');
                    if (mouseDownFired) {
                        mouseDownFired = false;
                        event.stopPropagation();
                        return;
                    }
                    var data = {
                        stopProp: true
                    };
                    handler(event, data)
                });

                $layerDiv.append($layerRow_1);

                if (layer instanceof ol.layer.Vector) {

                    var $layerRow_2 = $("<div class='layerrow layerrow2'>");

                    var $hoverControl = $("<div class='controlgroup hovercontrol'>");
                    var $hoverLabel = $("<label class='visible hovervisible'>");
                    $hoverLabel.attr('for', layer.get('id') + "-hovervisible");
                    $hoverControl.append($hoverLabel);
                    var $hoverInput = $("<input type='checkbox' class='checkboxradio'/>");
                    $hoverInput.attr('id', layer.get('id') + "-hovervisible" );
                    $hoverControl.append($hoverInput);
                    var $hoverSelect = $("<select class='menuselect hoverselect'>");
                    $hoverControl.append($hoverSelect);
                    $layerRow_2.append($hoverControl);

                    var $colorControl = $("<div class='controlgroup colorcontrol'>");
                    var $resetButton = $("<button class='mybutton defaultbutton'>Reset</button>");
                    $colorControl.append($resetButton);
                    var $colorButton = $("<button class='mybutton colorbutton colorwheel-icon'></button>");
                    $colorControl.append($colorButton);
                    var $colorSelect = $("<select class='menuselect colorselect'>");
                    $colorControl.append($colorSelect);
                    $layerRow_2.append($colorControl);

                    $layerDiv.append($layerRow_2);

                    $hoverInput.click(function (event) {
                        console.log($layerDiv[0].id + ' .hoverInput click');
                        var data = {
                            stopProp: true
                        };
                        handler(event, data)
                    });
                    // $hoverInput.change(function () {
                    //     if (this.checked) {
                    //         console.log("hoverselect ON");
                    //     } else {
                    //         console.log("hoverselect OFF");
                    //     }
                    // });
                    $hoverSelect.selectmenu({
                        classes: {
                            "ui-selectmenu-button": "menuselect"
                        },
                        change: function () {
                            layer.set('textstyle', this.value);
                        }
                    });
                    $resetButton.click(function (event) {
                        console.log('resetbutton .layerrow click');
                        _this.styleDefault(layer, 'type');
                        layer.set('geomstyle', 'type');
                        var data = {
                            stopProp: true
                        };
                        handler(event, data)
                    });
                    $colorButton.click(function (event) {
                        console.log('colorbutton .layerrow click');
                        var attribute = $colorSelect.val();
                        if (layer.get('headers')[attribute] === 'string') {
                            _this.styleCategorized(layer, attribute);
                        } else if (layer.get('headers')[attribute] === 'number') {
                            _this.styleGraduated(layer, attribute);
                        } else {
                            _this.messages.textContent = 'A string or numeric column is required for attribute coloring.';
                        }
                        var data = {
                            stopProp: true
                        };
                        handler(event, data)
                    });
                    $colorSelect.selectmenu({
                        classes: {
                            "ui-selectmenu-button": "menuselect"
                        },
                        change: function () {
                            if (layer.get('headers')[this.value] === 'string') {
                                _this.styleCategorized(layer, this.value);
                            } else if (layer.get('headers')[this.value] === 'number') {
                                _this.styleGraduated(layer, this.value);
                            } else {
                                _this.messages.textContent = 'A string or numeric column is required for attribute coloring.';
                            }
                            layer.set('geomstyle', this.value);
                        }
                    });
                    $colorSelect.click(function (event) {
                        console.log($layerDiv[0].id + ' .colorselect click');
                        var data = {
                            stopProp: true
                        };
                        handler(event, data)
                    });

                    layer.on('propertychange', function (evt) {
                        if (evt.key === 'headers') {
                            var activeHoverAttribute = $hoverSelect[0].value;
                            // var activeHoverAttribute = $hoverSelect.val(); // Better ???
                            var activeColorAttribute = $colorSelect[0].value;
                            $hoverSelect.empty();
                            $colorSelect.empty();
                            var headers = layer.get('headers');
                            for (var i in headers) {
                                $hoverSelect.append(this.createOption(i));
                                $colorSelect.append(this.createOption(i));
                            }
                            if (activeHoverAttribute) {
                                $('#' + $layerDiv[0].id + ' .hovercontrol .ui-selectmenu-text').text(activeHoverAttribute);
                                $hoverSelect[0].value = activeHoverAttribute;
                            } else if ($hoverSelect.children().length > 0) {
                                $('#' + $layerDiv[0].id + ' .hovercontrol .ui-selectmenu-text').text($hoverSelect.children()[0].value);
                                $hoverSelect[0].value = $hoverSelect.children()[0].value;
                            }
                            if (activeColorAttribute) {
                                $('#' + $layerDiv[0].id + ' .colorcontrol .ui-selectmenu-text').text(activeColorAttribute);
                                $colorSelect[0].value = activeColorAttribute;
                            } else if ($colorSelect.children().length > 0) {
                                $('#' + $layerDiv[0].id + ' .colorcontrol .ui-selectmenu-text').text($colorSelect.children()[0].value);
                                $colorSelect[0].value = $colorSelect.children()[0].value;
                            }
                            $hoverSelect.selectmenu("refresh");
                            $colorSelect.selectmenu("refresh");
                        }
                    }, this);
                }
                $(".mybutton").button();
                $(".checkboxradio").checkboxradio();
                $('.controlgroup').controlgroup();


                return this;
            };
            this.map.getLayers().on('add', function (evt) {
                if (evt.element.get('type') !== 'overlay') {
                    this.createRegistry(evt.element);
                }
            }, this);
            this.map.getLayers().on('remove', function (evt) {
                if (evt.element.get('type') !== 'overlay') {
                    $('#' + evt.element.get('id')).remove();
                    this.deselectEventEmitter.changed();
                    //TODO: Check that this should be this.deselectEventEmitter.changed();
                }
            }, this);
        } else {
            throw new Error('Invalid parameter(s) provided.');
        }
    };
    layerTree.prototype.createOption = function (optionValue) {
        var option = document.createElement('option');
        option.appendChild(document.createTextNode(optionValue));
        // option.value = optionValue;
        return option;
    };
    layerTree.prototype.createOption2 = function (optionValue, optionText) {
        var option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionText || optionValue;
        return option;
    };
    layerTree.prototype.createButton = function (elemName, elemTitle, elemType, layer) {
        var _this = this;
        var $button = $('<button class="'+elemName+'" title="'+elemTitle+'"></button>');
        switch (elemType) {
            case 'addlayer':
                $button.button().on("click", function () {
                    _this.openDialog(elemName);
                });
                return $button;
            case 'deletelayer':
                $button.button().on("click", function () {
                    if (_this.selectedLayer) {
                        var layer = _this.getLayerById(_this.selectedLayer.id);
                        _this.map.removeLayer(layer);
                        _this.messages.textContent = 'Layer removed successfully.';
                    } else {
                        _this.messages.textContent = 'No selected layer to remove.';
                    }
                });
                return $button;
            default:
                return false;
        }
    };
    layerTree.prototype.addBufferIcon = function (layer) {
        layer.getSource().on('change', function (evt) {
            if (evt.target.getState() === 'ready') {
                if (layer.getSource().get('pendingRequests') > 0) {
                    layer.getSource().set('pendingRequests', layer.getSource().get('pendingRequests') - 1);
                    // console.log('Remaining', layer.getSource().get('pendingRequests'));
                    // Only unwrap layers with progressbar (i.e. addWfs and addVector)
                    if (layer.getSource().get('pendingRequests') === 0) {
                        $('#' + layer.get('id') + ' .layertitle').unwrap();
                    }
                }
                if (layer.getSource().get('pendingRequests') === 0) {
                    layer.buildHeaders();
                }
            } else {
                $('#' + layer.get('id')).addClass('error');
            }
        });
    };

    layerTree.prototype.checkWmsLayer = function ($button) {
        var _this = this;
        var $form = $button.form();
        $button.button("disable");
        $form.find(".layername").empty();
        $form.find(".format").empty();
        var serverUrl = $form.find(".url").val();
        serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
        $form.find(".url").val(serverUrl);
        serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';
        // var proxyUrl = "https://www.osmfire.com/cgi-bin/proxy.py?";
        var query = 'SERVICE=WMS&REQUEST=GetCapabilities';
        var url = settings.proxyUrl + serverUrl + query;
        console.log(url);

        $.ajax({
            type: 'GET',
            url: url
        }).done(function (response) {
            var parser = new ol.format.WMSCapabilities();
            var capabilities = parser.read(response);
            var currentProj = _this.map.getView().getProjection().getCode();
            var crs;
            var messageText = 'Layers read successfully.';
            if (capabilities.version === '1.3.0') {
                crs = capabilities.Capability.Layer.CRS;
            } else {
                crs = [currentProj];
                messageText += ' Warning! Projection compatibility could not be checked due to version mismatch (' + capabilities.version + ').';
            }
            var layers = capabilities.Capability.Layer.Layer;
            if (layers.length > 0 && crs.indexOf(currentProj) > -1) {
                var nLayers = layers.length;
                for (var i = 0; i < nLayers; i += 1) {
                    $form.find(".layername").append(_this.createOption(layers[i].Name));
                }
                var formats = capabilities.Capability.Request.GetMap.Format;
                var nFormats = formats.length;
                for (i = 0; i < nFormats; i += 1) {
                    $form.find(".format").append(_this.createOption(formats[i]));
                }
                _this.messages.textContent = messageText;
            }
        }).fail(function (error) {
            _this.messages.textContent = 'Some unexpected error occurred in checkWmsLayer: (' + error.message + ').';
        }).always(function () {
            $form.find(".layername").selectmenu("refresh");
            $form.find(".format").selectmenu("refresh");
            $button.button("enable");
        });
    };
    layerTree.prototype.addWmsLayer = function ($form) {
        var params = {
            url: $form.find(".url").val(),
            params: {
                layers: $form.find(".layername").val(),
                format: $form.find(".format").val()
            }
        };
        var layer;
        if ($form.find(".tiled").is(":checked")) {
            layer = new ol.layer.Tile({
                source: new ol.source.TileWMS(params),
                name: $form.find(".displayname").val()
            });
        } else {
            layer = new ol.layer.Image({
                source: new ol.source.ImageWMS(params),
                name: $form.find(".displayname").val(),
                opacity: 0.8
            });
        }
        this.map.addLayer(layer);
        this.messages.textContent = 'WMS layer added successfully.';
        return this;
    };
    layerTree.prototype.checkWfsLayer = function ($button) {
        var _this = this;
        var $form = $button.form();
        $button.button("disable");
        $form.find(".layername").empty();
        this.wfsProjections = {};
        var serverUrl = $form.find(".url").val();
        serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
        $form.find(".url").val(serverUrl);
        serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';
        // var proxyUrl = "https://www.osmfire.com/cgi-bin/proxy.py?";
        var query = 'SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities';
        var url = settings.proxyUrl + serverUrl + query;

        $.ajax({
            type: 'GET',
            url: url
        }).done(function (response) {
            var unmarshaller = WFSContext.createUnmarshaller();
            var capabilities = unmarshaller.unmarshalDocument(response).value;
            var messageText = 'Layers read successfully.';
            if (capabilities.version !== '1.1.0') {
                messageText += ' Warning! Projection compatibility could not be checked due to version mismatch (' + capabilities.version + ').';
            }
            var layers = capabilities.featureTypeList.featureType;
            var nLayers = layers.length;
            if (nLayers > 0) {
                var re = /}(.*)/;
                for (var i = 0; i < nLayers; i += 1) {
                    var name = re.exec(layers[i].name)[1];
                    $form.find(".layername").append(_this.createOption(name));
                    _this.wfsProjections[name] = layers[i].defaultSRS;
                }
                _this.messages.textContent = messageText;
            }
        }).fail(function (error) {
            _this.messages.textContent = 'Some unexpected error occurred in checkWfsLayer: (' + error.message + ').';
        }).always(function () {
            $form.find(".layername").selectmenu("refresh");
            $button.button("enable");
        });
    };
    layerTree.prototype.addWfsLayer = function ($form) {

        var buildQueryString = function (options) {
            var queryArray = [];
            queryArray.push('SERVICE=WFS');
            queryArray.push('VERSION=1.1.0');
            queryArray.push('REQUEST=GetFeature');
            if (options.typeName) {
                queryArray.push('TYPENAME=' + options.typeName);
            }
            if (options.proj) {
                queryArray.push('SRSNAME=' + options.proj);
            }
            if (options.extent) {
                queryArray.push('BBOX=' + options.extent.join(','));
            }
            return queryArray.join('&')
        };
        var typeName = $form.find(".layername").val();
        var mapProj = this.map.getView().getProjection();
        var proj = this.wfsProjections[typeName];
        var formatWFS = new ol.format.WFS();
        // var proxyUrl = "https://www.osmfire.com/cgi-bin/proxy.py?";
        var serverUrl = $form.find(".url").val();
        serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
        serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';

        var strategy;
        if ($form.find(".tiled").is(":checked")) {
            strategy = ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({}))
        } else {
            strategy = ol.loadingstrategy.bbox
        }
        var sourceWFS = new ol.source.Vector({
            loader: function (extent, res, mapProj) {
                var _this = this;
                var query = buildQueryString({typeName: typeName, proj: proj, extent: extent});
                // console.log(extent, mapProj);
                $.ajax({
                    type: 'GET',
                    url: settings.proxyUrl + serverUrl + query,
                    beforeSend: function () {
                        if (sourceWFS.get('pendingRequests') == 0) {
                            var $progressbar = $("<div class='buffering'></div>");
                            $progressbar.append($('#' + layer.get('id') + ' .layertitle'));
                            $progressbar.progressbar({value: false});
                            $progressbar.insertBefore($('#' + layer.get('id') + ' .opacity'));
                        }
                        sourceWFS.set('pendingRequests', sourceWFS.get('pendingRequests') + 1);
                        console.log('Pending', sourceWFS.get('pendingRequests'), 'res', res);
                    }
                }).done(function (response) {
                    // console.log('*******************************************');
                    // var t0 = new Date().getTime();
                    var features = formatWFS.readFeatures(response, {
                        dataProjection: proj,
                        featureProjection: mapProj.getCode()
                    });
                    // var t1 = new Date().getTime();
                    // var nAdd = features.length;
                    // console.log('Remaining', layer.getSource().get('pendingRequests'), 't=', t1-t0, 'ms n=', nAdd, 'n/t=', nAdd / (t1-t0));
                    // var nBefore = sourceWFS.getFeatures().length;
                    // var t0 = new Date().getTime();
                    sourceWFS.addFeatures(features);
                    // var t1 = new Date().getTime();
                    // var nAfter = sourceWFS.getFeatures().length;
                    // console.log('Remaining', layer.getSource().get('pendingRequests'), 't=', t1-t0, 'ms n=', nAfter - nBefore, 'n/t=', (nAfter - nBefore) / (t1-t0));
                }).fail(function (response) {
                    _this.messages.textContent = 'Some unexpected error occurred in addWfsLayer: (' + response.message + ').';
                });
            },
            strategy: strategy,
            wrapX: false
        });
        sourceWFS.set('pendingRequests', 0);

        var layer = new ol.layer.Vector({
            source: sourceWFS,
            name: $form.find(".displayname").val(),
            // Temp fix to lessen page load blocking. Don't draw features further than zoom level 14.
            maxResolution: 10,
            opacity: 0.7
        });

        this.addBufferIcon(layer);
        this.map.addLayer(layer);
        this.messages.textContent = 'WFS layer added successfully.';
        return this;
    };
    layerTree.prototype.addVectorLayer = function ($form) {
        var _this = this;
        var file = $form.find(".file")[0].files[0];
        var currentProj = this.map.getView().getProjection();
        var $progressbar;
        switch ($form.find(".filetype").val()) {
            // case 'shp':
            //     sourceFormat = new ol.format.GeoJSON();
            //     break;
            case 'zip':
                sourceFormat = new ol.format.GeoJSON();
                break;
            case 'geojson':
                sourceFormat = new ol.format.GeoJSON();
                break;
            case 'topojson':
                sourceFormat = new ol.format.TopoJSON();
                break;
            case 'kml':
                sourceFormat = new ol.format.KML();
                break;
            case 'osm':
                sourceFormat = new ol.format.OSMXML();
                break;
            default:
                return false;
        }

        function loadStart(evt) {
            $progressbar = $("<div class='buffering'></div>");
            $progressbar.append($('#' + layer.get('id') + ' .layertitle'));
            if (evt.lengthComputable) {
                $progressbar.progressbar({
                    max: evt.total,
                    value: 0
                });
            } else {
                $progressbar.progressbar({
                    value: false
                });
            }
            $progressbar.insertBefore($('#' + layer.get('id') + ' .opacity'));
        }
        function updateProgress(evt) {
            if (evt.lengthComputable) {
                $progressbar.progressbar("value", evt.loaded);
            }
        }
        function loaded(evt) {
            $progressbar.progressbar("value", false);
            var vectorData = evt.target.result;
            var dataProjection = $form.find(".projection").val() || sourceFormat.readProjection(vectorData) || currentProj;
            if ($form.find(".filetype").val() === 'zip') {
                shp(vectorData).then(function (geojson) {
                    source.addFeatures(sourceFormat.readFeatures(geojson, {
                        dataProjection: dataProjection,
                        featureProjection: currentProj
                    }));
                });
                // // Read in a .shp file directly.
                // } else if (form.format.value === 'shp'){
                //     shp(file).then(function (geojson) {
                //         source.addFeatures(sourceFormat.readFeatures(geojson, {
                //             dataProjection: dataProjection,
                //             featureProjection: currentProj
                //         }));
                //     });
            } else {
                source.addFeatures(sourceFormat.readFeatures(vectorData, {
                    dataProjection: dataProjection,
                    featureProjection: currentProj
                }));
            }
            // // Convert MultiPolygon to Polygons if there is only one exterior ring.
            // // Convert MultiLineString to LineString if there is only one linestring.
            // var newgeom;
            // source.getFeatures().forEach(function (feature) {
            //     if (feature.getGeometry().getType() === 'MultiPolygon') {
            //         if (feature.getGeometry().getCoordinates().length === 1) {
            //             newgeom = new ol.geom.Polygon(feature.getGeometry().getCoordinates()[0]);
            //             feature.setGeometry(newgeom);
            //         }
            //     } else if (feature.getGeometry().getType() === 'MultiLineString') {
            //         if (feature.getGeometry().getCoordinates().length === 1) {
            //             newgeom = new ol.geom.LineString(feature.getGeometry().getCoordinates()[0]);
            //             feature.setGeometry(newgeom);
            //         }
            //     }
            // });
        }
        function loadEnd(evt) {
            $('#' + layer.get('id') + ' .layertitle').unwrap();
            layer.buildHeaders();
            // console.log('headers built');
        }
        function errorHandler(evt) {
            if (evt.target.error.name == "NotReadableError") {
                _this.messages.textContent = 'The file could not be read.';
            } else {
                _this.messages.textContent = 'Some unexpected error occurred in addVectorLayer1: (' + evt.message + ').';
            }
        }

        try {
            var fr = new FileReader();
            var sourceFormat;
            fr.onloadstart = loadStart;
            fr.onprogress = updateProgress;
            fr.onload = loaded;
            fr.onloadend = loadEnd;
            fr.onerror = errorHandler;

            if ($form.find(".filetype").val() === 'zip') {
                fr.readAsArrayBuffer(file); // SHP
            } else {
                fr.readAsText(file);
            }

            var source = new ol.source.Vector({
                strategy: ol.loadingstrategy.bbox
            });
            var layer = new ol.layer.Vector({
                source: source,
                name: $form.find(".displayname").val(),
                style: tobjectStyleFunction,
                updateWhileInteracting: true,
                updateWhileAnimating: true,
                opacity: 0.6
            });
            this.map.addLayer(layer);
            // this.addBufferIcon(layer);
            this.messages.textContent = 'Vector layer added successfully.';
            return this;
        } catch (error) {
            this.messages.textContent = 'Some unexpected error occurred in addVectorLayer: (' + error.message + ').';
            return error;
        }
    };
    layerTree.prototype.newVectorLayer = function ($form) {
        var type = $form.find(".geomtype").val();
        var geomTypes = ['point', 'line', 'polygon', 'geomcollection'];
        var sourceTypes = Object.keys(tobjectTemplates);
        if (sourceTypes.indexOf(type) === -1 && geomTypes.indexOf(type) === -1) {
            this.messages.textContent = 'Unrecognized layer type.';
            return false;
        }
        var source = new ol.source.Vector({
            wrapX: false
        });
        source.set('pendingRequests', 0);
        var layer = new ol.layer.Vector({
            source: source,
            name: $form.find(".displayname").val() || type + ' Layer',
            type: type,
            opacity: 0.6
        });
        this.addBufferIcon(layer);
        this.map.addLayer(layer);
        layer.getSource().changed();
        layer.setStyle(tobjectStyleFunction);
        this.messages.textContent = 'New vector layer created successfully.';
        return this;
    };

    layerTree.prototype.openDialog = function (elemName) {
        "use strict";
        var $dialog;
        var $fieldset = $('<fieldset>');
        switch (elemName) {
            case 'addwms':
                $dialog = this.createAddWmsDialog($fieldset);
                break;
            case 'addwfs':
                $dialog = this.createAddWfsDialog($fieldset);
                break;
            case 'addvector':
                $dialog = this.createAddVectorDialog($fieldset);
                break;
            case 'newvector':
                $dialog = this.createNewVectorDialog($fieldset);
                break;
            default:
                return false;
        }
        $(".addlayer select").each( function () {
            $(this).selectmenu().selectmenu('menuWidget').addClass("overflow");
        });
        $dialog.dialog("open");
    };
    layerTree.prototype.createAddWmsDialog = function ($fieldset) {
        this.createDisplayNameNodes($fieldset);
        this.createServerUrlNodes($fieldset, 'wms');
        this.createLayerNameNodes($fieldset);
        this.createFormatNodes($fieldset);
        this.createTiledNodes($fieldset);
        return this.createDialog($fieldset, "Add WMS layer", 'addwms');
    };
    layerTree.prototype.createAddWfsDialog = function ($fieldset) {
        this.createDisplayNameNodes($fieldset);
        this.createServerUrlNodes($fieldset, 'wfs');
        this.createLayerNameNodes($fieldset);
        this.createTiledNodes($fieldset);
        return this.createDialog($fieldset, "Add WFS layer", 'addwfs');
    };
    layerTree.prototype.createAddVectorDialog = function ($fieldset) {
        this.createDisplayNameNodes($fieldset);
        this.createFileTypeNodes($fieldset);
        this.createFileOpenNodes($fieldset);
        this.createProjectionNodes($fieldset);
        return this.createDialog($fieldset, "Add Vector layer", 'addvector');
    };
    layerTree.prototype.createNewVectorDialog = function ($fieldset) {
        this.createDisplayNameNodes($fieldset);
        this.createGeomTypeNodes($fieldset);
        return this.createDialog($fieldset, "Create New Vector Layer", 'newvector');
    };

    layerTree.prototype.createDisplayNameNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-displayname">Display Name</label>'));
        $fieldset.append($('<input type="text" id="open-displayname" name="displayname" class="displayname">'));
    };
    layerTree.prototype.createGeomTypeNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-geomtype">Geometry Type</label>'));
        var $selectNode = $('<select name="geomtype" id="open-geomtype" class="geomtype ui-selectmenu">');
        $selectNode.append($('<option value="geomcollection">Geometry Collection</option>'));
        $selectNode.append($('<option value="polygon">Polygon</option>'));
        $selectNode.append($('<option value="line">Line</option>'));
        $selectNode.append($('<option value="point">Point</option>'));
        $fieldset.append($selectNode);
    };
    layerTree.prototype.createServerUrlNodes = function ($fieldset, id) {
        var _this = this;
        $fieldset.append($('<label for="open-url">Server URL</label>'));
        var $url = $('<input type="text" id="open-url" name="url" class="url" value="http://demo.opengeo.org/geoserver/'+id+'">');
        $fieldset.append($url);
        var $check = $('<input type="button" name="check" value="Check for layers">');
        $fieldset.append($check);

        $check.button().on("click", function () {
            if (id == 'wms') {
                _this.checkWmsLayer($(this));
            } else if (id == 'wfs') {
                _this.checkWfsLayer($(this));
            }
        });

        $url.on("change", function () {
            // for both addwms and addwfs.
            var $layername = $(this).parent().find(".layername");
            $layername.empty();
            $layername.selectmenu("refresh");
            if (id == 'wms') {
                var $format = $(this).parent().find(".format");
                $format.empty();
                $format.selectmenu("refresh");
            }
        });
    };
    layerTree.prototype.createLayerNameNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-layername">Layer Name</label>'));
        var $layername = $('<select id="open-layername" name="layername" class="layername ui-selectmenu"></select>');
        $fieldset.append($layername);
        $layername.on("change", function () {
            "use strict";
            var name = $(this).val();
            $(this).parent().find(".displayname").val(name);
        });
    };
    layerTree.prototype.createFormatNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-format">Format</label>'));
        $fieldset.append($('<select id="open-format" name="format" class="format ui-selectmenu"></select>'));
    };
    layerTree.prototype.createFileTypeNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-filetype">File Type</label>'));
        var $selectNode = $('<select name="filetype" id="open-filetype" class="filetype ui-selectmenu">');
        $selectNode.append($('<option value="geojson">GeoJSON</option>'));
        $selectNode.append($('<option value="topojson">TopoJSON</option>'));
        $selectNode.append($('<option value="zip">Shapefile (zipped)</option>'));
        $selectNode.append($('<option value="kml">KML</option>'));
        $selectNode.append($('<option value="osm">OSM</option>'));
        $fieldset.append($selectNode);
        $selectNode.on("change", function () {
            "use strict";
            $(this).parent().find(".displayname").val("");
            $(this).parent().find(".file").val("");
            $(this).parent().find(".file")[0].accept = '.' + $(this).val();
        })
    };
    layerTree.prototype.createFileOpenNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-file">Vector file</label>'));
        var $file = $('<input type="file" name="file" id="open-file" class="file ui-widget-content" accept=".geojson" required/>');
        $fieldset.append($file);
        $file.on("change", function (event) {
            var startPos = this.value.lastIndexOf("\\") + 1;
            var stopPos = this.value.lastIndexOf(".");
            var name = this.value.slice(startPos, stopPos);
            $(this).parent().find(".displayname").val(name);
        });
    };
    layerTree.prototype.createProjectionNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-projection">Projection</label>'));
        $fieldset.append($('<input type="text" id="open-projection" name="projection" class="projection"/>'));
    };
    layerTree.prototype.createTiledNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-tiled">Tiled</label>'));
        var $tiled = $('<input type="checkbox" id="open-tiled" name="tiled" class="tiled" checked/>');
        $fieldset.append($tiled);
        $tiled.checkboxradio();
    };

    layerTree.prototype.createDialog = function ($fieldset, title, elemName) {

        var _this = this;
        function callback($form) {
            "use strict";
            switch (elemName) {
                case 'addwms':
                    _this.addWmsLayer($form);
                    break;
                case 'addwfs':
                    _this.addWfsLayer($form);
                    break;
                case 'addvector':
                    _this.addVectorLayer($form);
                    break;
                case 'newvector':
                    _this.newVectorLayer($form);
                    break;
                default:
                    return false;
            }
        }

        var $dialog = $('<div>');
        var $form = $('<form class="addlayer">');
        var $submitInput = $('<input type="submit" tabindex="-1" style="position:absolute; top:-1000px"/>');
        $fieldset.append($submitInput);
        $form.append($fieldset);
        $dialog.append($form);
        $('body').append($dialog);

        $dialog.dialog({
            title: title,
            autoOpen: false,
            modal: true,
            buttons: {
                "Add Layer": function () {
                    callback($(this).children());
                    $(this).dialog("close")
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                $(this).find("form")[0].reset();
                $(this).dialog("destroy");
                $(this).remove();
            }
        });
        $dialog.find("form").on("submit", function (event) {
            event.preventDefault();
            callback($(this));
            $(this).parent().dialog("close");
        });
        return $dialog;
    };

    layerTree.prototype.getLayerById = function (id) {
        var layers = this.map.getLayers().getArray();
        var len = layers.length;
        for (var i = 0; i < len; i += 1) {
            if (layers[i].get('id') === id) {
                return layers[i];
            }
        }
        return false;
    };
    layerTree.prototype.identifyLayer = function (layer) {

        if (layer.getSource().getFeatures().length === 0) {
            return layer;
        }
        if (['point', 'line', 'polygon', 'geomcollection'].indexOf(layer.get('type')) >= 0) {
            return layer;
        }

        var geomType;
        var geomTypes = [];
        var geomTypeIsVerified = false;
        layer.getSource().forEachFeature(function (feat) {
            if (!(geomTypeIsVerified)) {
                var geom = feat.getGeometry();
                if (geom.getType().endsWith('Point')) {
                    geomType = 'point';
                } else if (geom.getType().endsWith('LineString')) {
                    geomType = 'line';
                } else if (geom.getType().endsWith('Polygon')) {
                    geomType = 'polygon';
                } else {
                    geomType = 'geomcollection';
                }
                if (geomTypes.indexOf(geomType) === -1) {
                    geomTypes.push(geomType);
                    if (geomType === 'geomcollection' || geomTypes.length >= 2) {
                        geomTypeIsVerified = true;
                    }
                }
            }
            if (geomTypeIsVerified) {
                return true;
            }
        });
        if (geomTypeIsVerified) {
            layer.set('type', 'geomcollection')
        } else if (geomTypes.length === 1) {
            layer.set('type', geomTypes[0])
        } else {
            this.messages.textContent = 'Error: Unable to Determine Layer Type';
        }
        return layer;
    };
    layerTree.prototype.styleDefault = function (layer, attribute) {
        layer.setStyle(tobjectStyleFunction);
    };
    layerTree.prototype.styleGraduated = function (layer, attribute) {
        var attributeArray = [];
        layer.getSource().forEachFeature(function (feat) {
            attributeArray.push(feat.get(attribute));
        });
        var max = Math.max.apply(null, attributeArray);
        var min = Math.min.apply(null, attributeArray);
        var step = (max - min) / 5;
        var colors = this.graduatedColorFactory(5, [254, 240, 217], [179, 0, 0]);
        layer.setStyle(function (feature, res) {
            var property = feature.get(attribute);
            var color = property < min + step ? colors[0] :
                property < min + step * 2 ? colors[1] :
                    property < min + step * 3 ? colors[2] :
                        property < min + step * 4 ? colors[3] : colors[4];
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [0, 0, 0, 1],
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: color.concat(0.9)
                })
            });
            return [style];
        });
    };
    layerTree.prototype.graduatedColorFactory = function (intervals, rgb1, rgb2) {
        var colors = [];
        var step = intervals - 1;
        var redStep = (rgb2[0] - rgb1[0]) / step;
        var greenStep = (rgb2[1] - rgb1[1]) / step;
        var blueStep = (rgb2[2] - rgb1[2]) / step;
        for (var i = 0; i < step; i += 1) {
            var red = Math.ceil(rgb1[0] + redStep * i);
            var green = Math.ceil(rgb1[1] + greenStep * i);
            var blue = Math.ceil(rgb1[2] + blueStep * i);
            colors.push([red, green, blue, 1]);
        }
        colors.push([rgb2[0], rgb2[1], rgb2[2], 1]);
        return colors;
    };
    layerTree.prototype.styleCategorized = function (layer, attribute) {
        var attributeArray = [];
        var colorArray = [];
        var randomColor;

        function convertHex(hex, opacity) {
            hex = hex.replace('#','');
            var r = parseInt(hex.substring(0,2), 16);
            var g = parseInt(hex.substring(2,4), 16);
            var b = parseInt(hex.substring(4,6), 16);
            return [r, g, b, opacity];
        }
        layer.getSource().forEachFeature(function (feature) {
            var property = feature.get(attribute) ? feature.get(attribute).toString() : '';
            if (attributeArray.indexOf(property) === -1) {
                attributeArray.push(property);
                do {
                    randomColor = this.randomHexColor();
                } while (colorArray.indexOf(randomColor) !== -1);
                colorArray.push(randomColor);
            }
        }, this);
        layer.setStyle(function (feature, res) {
            var index = feature.get(attribute) ? attributeArray.indexOf(feature.get(attribute).toString()) : 0;
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [0, 0, 0, 1],
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: convertHex(colorArray[index], 0.9)
                })
            });
            return [style]
        });
    };
    layerTree.prototype.randomHexColor = function () {
        var num = Math.floor(Math.random() * 16777215).toString(16);
        return '#' + String.prototype.repeat.call('0', 6 - num.length) + num;
    };

    return layerTree;
});