/**
 * Created by maddoxw on 7/23/16.
 */

define(['jquery', 'ol',
    'exists',
    'shp',
    'wfs110context',
    'ttemplate',
    'tstylefunction',
    'stemplate',
    'sstylefunction',
    'serversettings',
    'jquery-ui'
], function ($, ol,
             exists,
             shp,
             WFSContext,
             tobjectTemplates,
             tobjectStyleFunction,
             sensorTemplates,
             sensorStyleFunction,
             settings) {

    'use strict';
    var layerTree = function (options) {
        if (!(this instanceof layerTree)) {
            throw new Error('layerTree must be constructed with the new keyword.');
        }
        if (typeof options === 'object' && options.map && options.target) {
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
                            setTimeout(timeoutFunction, 20000);
                        } else {
                            oldText = '';
                            mutations[0].target.textContent = '';
                        }
                    };
                    setTimeout(timeoutFunction, 20000);
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
                var lid = 'layer_' + idCounter;
                layer.set('id', lid);

                idCounter += 1;
                var mouseDownFired = false;
                var _this = this;

                var $layerDiv = $("<div class='layer ol-unselectable'>");
                $layerDiv[0].title = layer.get('name') || 'Unnamed Layer';
                $layerDiv[0].id = lid;
                this.layerContainer.prepend($layerDiv);

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
                });

                $layerDiv.on("click", ".layerrow", function (event) {
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

                var $layerRow1 = $("<div class='layerrow layerrow1'>");

                var $visibleLabel = $("<label for='"+lid+"-layervisible' class='visible layervisible'>");
                var $visibleInput = $("<input type='checkbox' id='"+lid+"-layervisible' class='checkboxradio'>");
                $visibleInput[0].checked = layer.getVisible();
                $layerRow1.append($visibleLabel);
                $layerRow1.append($visibleInput);
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
                $layerRow1.append($layerTitle);
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
                $layerRow1.append($opacitySlider);
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
                    handler(event, {
                        stopProp: true
                    })
                });
                $opacitySlider.on("mouseup", function (event) {
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

                $layerDiv.append($layerRow1);

                if (layer instanceof ol.layer.Image) {

                    var $layerRow2 = $("<div class='layerrow layerrow2'>");

                    var $hoverControl = $("<div class='controlgroup hovercontrol'>");

                    var $hoverVisibleLabel = $("<label for='"+lid+"-hovervisible' class='visible hovervisible'>");
                    var $hoverVisible = $("<input type='checkbox' id='"+lid+"-hovervisible' class='checkboxradio' checked>");
                    var $hoverSelectLabel = $("<label for='"+lid+"-hoverselect'>");
                    var $hoverSelect = $("<select id='"+lid+"-hoverselect' class='hoverselect'>");

                    $hoverControl.append($hoverVisibleLabel);
                    $hoverControl.append($hoverVisible);
                    $hoverControl.append($hoverSelectLabel);
                    $hoverControl.append($hoverSelect);

                    $layerRow2.append($hoverControl);

                    var $colorControl = $("<div class='controlgroup colorcontrol'>");

                    var $resetButton = $("<button class='mybutton resetbutton'>Reset</button>");
                    var $colorButton = $("<button class='mybutton colorbutton colorwheel-icon'></button>");
                    var $colorSelectLabel = $("<label for='"+lid+"-colorselect'>");
                    var $colorSelect = $("<select id='"+lid+"-colorselect' class='colorselect'>");

                    $colorControl.append($resetButton);
                    $colorControl.append($colorButton);
                    $colorControl.append($colorSelectLabel);
                    $colorControl.append($colorSelect);

                    $layerRow2.append($colorControl);

                    $layerDiv.append($layerRow2);

                    $hoverVisible.click(function (event) {
                        handler(event, {
                            stopProp: true
                        })
                    });
                    $hoverSelect.selectmenu({
                        classes: {
                            "ui-selectmenu-button": "menuselect"
                        },
                        change: function () {
                            layer.set('textstyle', this.value);
                        }
                    }).selectmenu('menuWidget').addClass("overflow");
                    $resetButton.click(function (event) {
                        _this.styleDefault(layer, 'type');
                        layer.set('geomstyle', 'type');
                        handler(event, {
                            stopProp: true
                        })
                    });
                    $colorButton.click(function (event) {
                        var attribute = $colorSelect.val();
                        if (layer.get('headers')[attribute] === 'string') {
                            _this.styleCategorized(layer, attribute);
                        } else if (layer.get('headers')[attribute] === 'number') {
                            _this.styleGraduated(layer, attribute);
                        } else {
                            _this.messages.textContent = 'A string or numeric column is required for attribute coloring.';
                        }
                        handler(event, {
                            stopProp: true
                        })
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
                    }).selectmenu('menuWidget').addClass("overflow");

                    layer.on('propertychange', function (evt) {
                        if (evt.key === 'headers') {
                            var refresh = false;
                            var opt, i;
                            var headers = evt.target.get('headers');
                            var previous = evt.oldValue;

                            for (i in headers) {
                                if (!previous || !previous[i]) {
                                    refresh = true;
                                } else {
                                    console.log('Warning: This should have been caught in buildHeaders function.')
                                }
                            }
                            if (refresh) {
                                this.identifyLayer(layer);
                                this.styleDefault(layer);
                                var opt1 = null;
                                var opt2 = null;
                                var id = '#' + evt.target.get('id');
                                var $hoverSelect = $(id + '-hoverselect');
                                var $colorSelect = $(id + '-colorselect');
                                var $hoverAttribute = $hoverSelect.val();
                                var $colorAttribute = $colorSelect.val();
                                $hoverSelect.selectmenu("destroy");
                                $colorSelect.selectmenu("destroy");
                                $hoverSelect.empty();
                                $colorSelect.empty();
                                for (i in headers) {
                                    $hoverSelect.append(this.createMenuOption(null, i));
                                    $colorSelect.append(this.createMenuOption(null, i));
                                }
                                if ($hoverSelect.children().length > 0) {
                                    $hoverSelect.children().each(function () {
                                        if ($(this).text() === $hoverAttribute) {
                                            opt1 = $(this).text()
                                        }
                                    });
                                    $hoverSelect.children().each(function () {
                                        if ($(this).text() === 'name') {
                                            opt2 = $(this).text()
                                        }
                                    });
                                    opt = opt1 || opt2 || $hoverSelect.children()[0].value;
                                }
                                // $hoverButtonText.text(opt);
                                $hoverSelect.val(opt);
                                layer.set('textstyle', opt);

                                opt1 = null;
                                opt2 = null;

                                if ($colorSelect.children().length > 0) {
                                    $colorSelect.children().each(function () {
                                        if ($(this).text() === $colorAttribute) {
                                            opt1 = $colorAttribute
                                        }
                                        if ($(this).text() === 'type') {
                                            opt2 = 'type'
                                        }
                                    });
                                    opt = opt1 || opt2 || $colorSelect.children()[0].value;
                                }
                                // $colorButtonText.text(opt);
                                $colorSelect.val(opt);
                                layer.set('geomstyle', opt);

                                $hoverSelect.selectmenu({
                                    classes: {
                                        "ui-selectmenu-button": "menuselect"
                                    },
                                    change: function () {
                                        layer.set('textstyle', this.value);
                                    }
                                }).selectmenu('menuWidget').addClass("overflow");
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
                                }).selectmenu('menuWidget').addClass("overflow");
                                $('.controlgroup').controlgroup('refresh')
                            }
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
                    if (evt.element instanceof ol.layer.Image) {
                        this.deselectEventEmitter.changed();
                    }
                    $('#' + evt.element.get('id')).remove();
                }
            }, this);
        } else {
            throw new Error('Invalid parameter(s) provided.');
        }
    };
    layerTree.prototype.createMenuOption = function (value, text) {
        var $option = $('<option>');
        if (value) {
            $option.val(value);
        }
        $option.text(text || value);
        return $option;
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
                        _this.selectedLayer.classList.remove('active');
                        _this.selectedLayer = null;
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
        layer.getSource().getSource().on('change', function (evt) {
            if (evt.target.getState() === 'ready') {
                if (layer.getSource().getSource().get('pendingRequests') > 0) {
                    layer.getSource().getSource().set('pendingRequests', layer.getSource().getSource().get('pendingRequests') - 1);
                    // console.log('Remaining', layer.getSource().getSource().get('pendingRequests'));
                    // Only unwrap layers with progressbar (i.e. addWfs and addVector)
                    if (layer.getSource().getSource().get('pendingRequests') === 0) {
                        $('#' + layer.get('id') + ' .layertitle').unwrap();
                    }
                }
                if (layer.getSource().getSource().get('pendingRequests') === 0) {
                    layer.buildHeaders();
                }
                if (layer.getSource().getSource().getFeatures().length === 0) {
                    var hasFeatures = [false, 'disable']
                } else {
                    hasFeatures = [true, 'enable']
                }
                $('.hovercontrol').controlgroup(hasFeatures[1]);
                $('.colorcontrol').controlgroup(hasFeatures[1]);

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
            var crs, i;
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
                for (i = 0; i < nLayers; i += 1) {
                    $form.find(".layername").append(_this.createMenuOption(layers[i].Name));
                }
                var formats = capabilities.Capability.Request.GetMap.Format;
                var nFormats = formats.length;
                for (i = 0; i < nFormats; i += 1) {
                    $form.find(".format").append(_this.createMenuOption(formats[i]));
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
                    $form.find(".layername").append(_this.createMenuOption(name));
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
        var _this = this;

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
        var proj = this.wfsProjections[typeName];
        var formatWFS = new ol.format.WFS();
        var serverUrl = $form.find(".url").val();
        serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
        serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';

        var strategy;
        if ($form.find(".tiled").is(":checked")) {
            strategy = ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({}))
        } else {
            strategy = ol.loadingstrategy.bbox
        }
        var source = new ol.source.Vector({
            loader: function (extent, res, mapProj) {
                var query = buildQueryString({typeName: typeName, proj: proj, extent: extent});
                $.ajax({
                    type: 'GET',
                    url: settings.proxyUrl + serverUrl + query,
                    beforeSend: function () {
                        if (source.get('pendingRequests') == 0) {
                            var $progressbar = $("<div class='buffering'></div>");
                            $progressbar.append($('#' + layer.get('id') + ' .layertitle'));
                            $progressbar.progressbar({value: false});
                            $progressbar.insertBefore($('#' + layer.get('id') + ' .opacity'));
                        }
                        source.set('pendingRequests', source.get('pendingRequests') + 1);
                        console.log('Pending', source.get('pendingRequests'), 'res', res);
                    }
                }).done(function (response) {
                    console.log('*******************************************');
                    var t0 = new Date().getTime();
                    var features = formatWFS.readFeatures(response, {
                        dataProjection: proj,
                        featureProjection: mapProj.getCode()
                    });
                    var t1 = new Date().getTime();
                    var nAdd = features.length;
                    console.log('Remaining', layer.getSource().getSource().get('pendingRequests'), 't=', t1-t0, 'ms n=', nAdd, 'n/t=', nAdd / (t1-t0));
                    var nBefore = source.getFeatures().length;
                    var t0 = new Date().getTime();
                    source.addFeatures(features);
                    var t1 = new Date().getTime();
                    var nAfter = source.getFeatures().length;
                    console.log('Remaining', layer.getSource().getSource().get('pendingRequests'), 't=', t1-t0, 'ms n=', nAfter - nBefore, 'n/t=', (nAfter - nBefore) / (t1-t0));
                }).fail(function (response) {
                    _this.messages.textContent = 'Some unexpected error occurred in addWfsLayer: (' + response.message + ').';
                });
            },
            strategy: strategy,
            wrapX: false
        });
        source.set('pendingRequests', 0);

        var layer = new ol.layer.Image({
            source: new ol.source.ImageVector({
                source: source
            }),
            name: $form.find(".displayname").val(),
            updateWhileInteracting: true,
            updateWhileAnimating: true,
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
        var fileType = $form.find(".filetype").val();
        var currentProj = this.map.getView().getProjection();
        var $progressbar;
        var sourceFormat;
        switch (fileType) {
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
            $progressbar = $("<div class='buffering'>");
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
            if (fileType === 'zip') {
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
                var features = sourceFormat.readFeatures(vectorData, {
                    dataProjection: dataProjection,
                    featureProjection: currentProj
                });
                source.addFeatures(features);
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
            // $('#' + layer.get('id') + ' .layertitle').unwrap();
            // layer.buildHeaders();
            // console.log('headers built');
            // _this.identifyLayer(layer);
            // _this.styleDefault(layer);
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
            fr.onloadstart = loadStart;
            fr.onprogress = updateProgress;
            fr.onload = loaded;
            fr.onloadend = loadEnd;
            fr.onerror = errorHandler;

            if (fileType === 'zip') {
                fr.readAsArrayBuffer(file); // SHP
            } else {
                fr.readAsText(file);
            }
            var source = new ol.source.Vector({
                strategy: ol.loadingstrategy.bbox,
                format: sourceFormat
            });
            source.set('pendingRequests', 1);
            var layer = new ol.layer.Image({
                source: new ol.source.ImageVector({
                    source: source
                }),
                name: $form.find(".displayname").val(),
                updateWhileInteracting: true,
                updateWhileAnimating: true,
                opacity: 0.6
            });
            this.addBufferIcon(layer);
            this.map.addLayer(layer);
            this.messages.textContent = 'Vector layer added successfully.';
            return this;
        } catch (error) {
            this.messages.textContent = 'Some unexpected error occurred in addVectorLayer: (' + error.message + ').';
            console.log(error.stack);
            return error;
        }
    };
    layerTree.prototype.newVectorLayer = function ($form) {
        var geomType = $form.find(".geomtype").val();
        var geomTypes = ['point', 'line', 'polygon', 'geomcollection'];
        var sourceTypes = Object.keys(tobjectTemplates);
        if (sourceTypes.indexOf(geomType) === -1 && geomTypes.indexOf(geomType) === -1) {
            this.messages.textContent = 'Unrecognized layer type.';
            return false;
        }
        var source = new ol.source.Vector({
            wrapX: false
        });
        source.set('pendingRequests', 0);
        var layer = new ol.layer.Image({
            source: new ol.source.ImageVector({
                source: source
            }),
            name: $form.find(".displayname").val() || geomType + ' Layer',
            geomtype: geomType,
            opacity: 0.6
        });
        this.addBufferIcon(layer);
        this.map.addLayer(layer);
        layer.getSource().getSource().changed();
        // layer.setStyle(tobjectStyleFunction);
        this.messages.textContent = 'New vector layer created successfully.';
        return this;
    };
    // layerTree.prototype.getDefaultSensors = function () {
    //     var _this = this;
    //     var $form = $button.form();
    //     $button.button("disable");
    //     $form.find(".layername").empty();
    //     $form.find(".format").empty();
    //     var serverUrl = $form.find(".url").val();
    //     serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
    //     $form.find(".url").val(serverUrl);
    //     serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';
    //     var query = 'SERVICE=WMS&REQUEST=GetCapabilities';
    //     var url = settings.proxyUrl + serverUrl + query;
    //     console.log(url);

        // var defsens = null;
        // $.getJSON('data/default_sensors.json', function (data) {
        //     defsens = data;
        // });
        // return defsens;

        // $.ajax({
        //     type: 'GET',
        //     url: url
        // }).done(function (response) {
        //     var parser = new ol.format.WMSCapabilities();
        //     var capabilities = parser.read(response);
        //     var currentProj = _this.map.getView().getProjection().getCode();
        //     var crs, i;
        //     var messageText = 'Layers read successfully.';
        //     if (capabilities.version === '1.3.0') {
        //         crs = capabilities.Capability.Layer.CRS;
        //     } else {
        //         crs = [currentProj];
        //         messageText += ' Warning! Projection compatibility could not be checked due to version mismatch (' + capabilities.version + ').';
        //     }
        //     var layers = capabilities.Capability.Layer.Layer;
        //     if (layers.length > 0 && crs.indexOf(currentProj) > -1) {
        //         var nLayers = layers.length;
        //         for (i = 0; i < nLayers; i += 1) {
        //             $form.find(".layername").append(_this.createMenuOption(layers[i].Name));
        //         }
        //         var formats = capabilities.Capability.Request.GetMap.Format;
        //         var nFormats = formats.length;
        //         for (i = 0; i < nFormats; i += 1) {
        //             $form.find(".format").append(_this.createMenuOption(formats[i]));
        //         }
        //         _this.messages.textContent = messageText;
        //     }
        // }).fail(function (error) {
        //     _this.messages.textContent = 'Some unexpected error occurred in checkWmsLayer: (' + error.message + ').';
        // }).always(function () {
        //     $form.find(".layername").selectmenu("refresh");
        //     $form.find(".format").selectmenu("refresh");
        //     $button.button("enable");
        // });
    // };

    layerTree.prototype.openDialog = function (elemName) {
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
        return this.createDialog($fieldset, 'addwms', "Add WMS layer");
    };
    layerTree.prototype.createAddWfsDialog = function ($fieldset) {
        this.createDisplayNameNodes($fieldset);
        this.createServerUrlNodes($fieldset, 'wfs');
        this.createLayerNameNodes($fieldset);
        this.createTiledNodes($fieldset);
        var $dialog = this.createDialog($fieldset, 'addwfs', "Add WFS layer");
        $('.layername').selectmenu({
            change: function () {
                $(this).parent().find(".displayname").val($(this).val());
            }
        });
        return $dialog
    };
    layerTree.prototype.createAddVectorDialog = function ($fieldset) {
        this.createDisplayNameNodes($fieldset);
        this.createFileTypeNodes($fieldset);
        this.createFileOpenNodes($fieldset);
        this.createProjectionNodes($fieldset);
        var $dialog = this.createDialog($fieldset, 'addvector', "Add Vector layer");
        $('.filetype').selectmenu({
            classes: {
                "ui-selectmenu-button": "menuselect"
            },
            change: function () {
                $(this).parent().find(".file").val("");
                $(this).parent().find(".file")[0].accept = '.' + $(this).val();
                $(this).parent().find(".displayname").val("");
            }
        });
        return $dialog
    };
    layerTree.prototype.createNewVectorDialog = function ($fieldset) {
        this.createDisplayNameNodes($fieldset);
        this.createGeomTypeNodes($fieldset);
        return this.createDialog($fieldset, 'newvector', "Create New Vector Layer");
    };

    layerTree.prototype.createDisplayNameNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-displayname">Display Name</label>'));
        $fieldset.append($('<input type="text" id="open-displayname" name="displayname" class="displayname">'));
    };
    layerTree.prototype.createGeomTypeNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-geomtype">Geometry Type</label>'));
        var $selectNode = $('<select id="open-geomtype" name="geomtype" class="geomtype ui-selectmenu">');
        $selectNode.append(this.createMenuOption("geomcollection", "Geometry Collection"));
        $selectNode.append(this.createMenuOption("polygon", "Polygon"));
        $selectNode.append(this.createMenuOption("line", "Line"));
        $selectNode.append(this.createMenuOption("point", "Point"));
        $fieldset.append($selectNode);
    };
    layerTree.prototype.createServerUrlNodes = function ($fieldset, id) {
        var _this = this;
        $fieldset.append($('<label for="open-url">Server URL</label>'));
        var $url = $('<input type="text" id="open-url" name="url" class="url" value="http://demo.opengeo.org/geoserver/'+id+'">');
        $fieldset.append($url);
        var $check = $('<input type="button" name="check" value="Check for layers">');
        $fieldset.append($check);
        $url.on("change", function () {
            // for both addwms and addwfs.
            var $layername = $(this).parent().find(".layername");
            $layername.empty();
            $layername.selectmenu("refresh");
            $(this).parent().find(".displayname").val("");
            if (id == 'wms') {
                var $format = $(this).parent().find(".format");
                $format.empty();
                $format.selectmenu("refresh");
            }
        });
        $check.button().on("click", function () {
            if (id == 'wms') {
                _this.checkWmsLayer($(this));
            } else if (id == 'wfs') {
                _this.checkWfsLayer($(this));
            }
        });
    };
    layerTree.prototype.createLayerNameNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-layername">Layer Name</label>'));
        $fieldset.append($('<select id="open-layername" name="layername" class="layername ui-selectmenu">'));
    };
    layerTree.prototype.createFileTypeNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-filetype">File Type</label>'));
        var $selectNode = $('<select id="open-filetype" name="filetype" class="filetype ui-selectmenu">');
        $selectNode.append(this.createMenuOption("geojson", "GeoJSON"));
        $selectNode.append(this.createMenuOption("topojson", "TopoJSON"));
        $selectNode.append(this.createMenuOption("zip", "Shapefile (zipped)"));
        $selectNode.append(this.createMenuOption("kml", "KML"));
        $selectNode.append(this.createMenuOption("osm", "OSM"));
        $fieldset.append($selectNode);
    };
    layerTree.prototype.createFileOpenNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-file">Vector file</label>'));
        var $file = $('<input type="file" id="open-file" name="file" class="file ui-widget-content ui-button" accept=".geojson" required>');
        $fieldset.append($file);
        $file.on("change", function () {
            var startPos = this.value.lastIndexOf("\\") + 1;
            var stopPos = this.value.lastIndexOf(".");
            var name = this.value.slice(startPos, stopPos);
            $(this).parent().find(".displayname").val(name);
        });
    };
    layerTree.prototype.createProjectionNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-projection">Projection</label>'));
        $fieldset.append($('<input type="text" id="open-projection" name="projection" class="projection">'));
    };
    layerTree.prototype.createFormatNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-format">Format</label>'));
        $fieldset.append($('<select id="open-format" name="format" class="format ui-selectmenu">'));
    };
    layerTree.prototype.createTiledNodes = function ($fieldset) {
        $fieldset.append($('<label for="open-tiled">Tiled</label>'));
        var $tiled = $('<input type="checkbox" id="open-tiled" name="tiled" class="tiled">');
        $fieldset.append($tiled);
        $tiled.checkboxradio();
    };

    layerTree.prototype.createDialog = function ($fieldset, elemName, title) {

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
            geomTypeIsVerified = true;
        }
        if (Object.keys(layerTypesDefault).indexOf(layer.get('type')) >= 0) {
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
    };

    layerTree.prototype.styleDefault = function (layer, attribute) {
        if (layer.get('type') === 'feature') {
            layer.getSource().setStyle(tobjectStyleFunction);
        } else if (layer.get('type') === 'sensor') {
            layer.getSource().setStyle(sensorStyleFunction);
        }
    };
    layerTree.prototype.styleGraduated = function (layer, attribute) {
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
            if (feature.getGeometry().getType().endsWith('LineString') || feature.get('type') === 'aor') {
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
            colors.push([red, green, blue]);
        }
        colors.push([rgb2[0], rgb2[1], rgb2[2]]);
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
    };
    layerTree.prototype.randomHexColor = function () {
        var num = Math.floor(Math.random() * 16777215).toString(16);
        return '#' + String.prototype.repeat.call('0', 6 - num.length) + num;
    };

    return layerTree;
});