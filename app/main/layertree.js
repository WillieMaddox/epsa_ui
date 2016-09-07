/**
 * Created by maddoxw on 7/23/16.
 */

define(["jquery", "ol",
    "nouislider",
    "exists",
    "shp",
    'wfs110context',
    "ttemplate",
    "tstylefunction",
    "serversettings"
], function (
    $, ol,
    noUiSlider,
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
            this.createAddVectorForm();
            this.createNewVectorForm();
            this.wfsProjections = null;
            // this.unmarshaller = this.schemaContext.createUnmarshaller();
            var controlDiv = document.createElement('div');
            controlDiv.className = 'layertree-buttons';
            controlDiv.appendChild(this.createButton('addwms', 'Add WMS Layer', 'addlayer'));
            controlDiv.appendChild(this.createButton('addwfs', 'Add WFS Layer', 'addlayer'));
            controlDiv.appendChild(this.createButton('newvector', 'New Vector Layer', 'addlayer'));
            controlDiv.appendChild(this.createButton('addvector', 'Add Vector Layer', 'addlayer'));
            controlDiv.appendChild(this.createButton('deletelayer', 'Remove Layer', 'deletelayer'));
            containerDiv.appendChild(controlDiv);
            this.layerContainer = document.createElement('div');
            this.layerContainer.className = 'layercontainer';
            containerDiv.appendChild(this.layerContainer);

            var idCounter = 0;

            this.selectedLayer = null;
            this.selectEventEmitter = new ol.Observable();

            this.createRegistry = function (layer, buffer) {
                layer.set('id', 'layer_' + idCounter);
                idCounter += 1;
                var _this = this;

                var layerDiv = document.createElement('div');
                // layerDiv.className = buffer ? 'layer ol-unselectable buffering' : 'layer ol-unselectable';
                layerDiv.className = 'layer ol-unselectable';
                layerDiv.title = layer.get('name') || 'Unnamed Layer';

                layerDiv.id = layer.get('id');
                layerDiv.draggable = true;
                layerDiv.addEventListener('dragstart', function (evt) {
                    evt.dataTransfer.effectAllowed = 'move';
                    evt.dataTransfer.setData('Text', this.id);
                });
                layerDiv.addEventListener('dragenter', function (evt) {
                    this.classList.add('over');
                });
                layerDiv.addEventListener('dragleave', function (evt) {
                    this.classList.remove('over');
                });
                layerDiv.addEventListener('dragover', function (evt) {
                    evt.preventDefault();
                    evt.dataTransfer.dropEffect = 'move';
                });
                layerDiv.addEventListener('drop', function (evt) {
                    evt.preventDefault();
                    this.classList.remove('over');
                    var sourceLayerDiv = document.getElementById(evt.dataTransfer.getData('Text'));
                    if (sourceLayerDiv !== this) {
                        _this.layerContainer.removeChild(sourceLayerDiv);
                        _this.layerContainer.insertBefore(sourceLayerDiv, this);
                        var htmlArray = [].slice.call(_this.layerContainer.children);
                        var index = htmlArray.length - htmlArray.indexOf(sourceLayerDiv) - 1;
                        var sourceLayer = _this.getLayerById(sourceLayerDiv.id);
                        var layers = _this.map.getLayers().getArray();
                        var group_shift = layers.length - htmlArray.length;
                        layers.splice(layers.indexOf(sourceLayer), 1);
                        // layers.splice(index, 0, sourceLayer);
                        layers.splice(group_shift + index, 0, sourceLayer);
                        _this.map.render();
                        // _this.map.getLayers().changed();
                    }
                });

                this.addSelectEvent(layerDiv);

                var visibleBox = document.createElement('input');
                visibleBox.type = 'checkbox';
                visibleBox.className = 'visible';
                visibleBox.checked = layer.getVisible();
                visibleBox.addEventListener('change', function () {
                    if (this.checked) {
                        layer.setVisible(true);
                    } else {
                        layer.setVisible(false);
                    }
                });
                layerDiv.appendChild(this.stopPropagationOnEvent(visibleBox, 'click'));

                var layerTitle = document.createElement('span');
                layerTitle.textContent = layerDiv.title;
                layerTitle.addEventListener('dblclick', function () {
                    this.contentEditable = true;
                    layerDiv.draggable = false;
                    layerDiv.classList.remove('ol-unselectable');
                    this.focus();
                });
                layerTitle.addEventListener('blur', function () {
                    if (this.contentEditable) {
                        this.contentEditable = false;
                        layerDiv.draggable = true;
                        layer.set('name', this.textContent);
                        layerDiv.classList.add('ol-unselectable');
                        layerDiv.title = this.textContent;
                        this.scrollTo(0, 0);
                    }
                });
                layerDiv.appendChild(this.addSelectEvent(layerTitle, true));

                var layerBuffer = document.createElement('span');
                layerBuffer.textContent = '';
                layerBuffer.className = layer.get('id') + ' buffering';
                layerDiv.appendChild(layerBuffer);

                var layerControls = document.createElement('div');
                this.addSelectEvent(layerControls, true);

                var opacityHandler = document.createElement('input');
                opacityHandler.className = 'slider';
                opacityHandler.type = 'range';
                opacityHandler.min = 0;
                opacityHandler.max = 1;
                opacityHandler.step = 0.1;
                opacityHandler.value = layer.getOpacity();

                opacityHandler.addEventListener('input', function () {
                    layer.setOpacity(this.value);
                });
                opacityHandler.addEventListener('change', function () {
                    layer.setOpacity(this.value);
                });
                opacityHandler.addEventListener('mousedown', function () {
                    layerDiv.draggable = false;
                });
                opacityHandler.addEventListener('mouseup', function () {
                    layerDiv.draggable = true;
                });

                // layerControls.appendChild(this.stopPropagationOnEvent(opacityHandler, 'click'));
                layerDiv.appendChild(this.stopPropagationOnEvent(opacityHandler, 'click'));

                if (layer instanceof ol.layer.Vector) {
                    var defaultStyle = this.createButton('stylelayer', 'Default', 'stylelayer', layer);
                    layerControls.appendChild(this.stopPropagationOnEvent(defaultStyle, 'click'));

                    var attributeStyle = this.createButton('stylelayer', 'Attribute', 'stylelayer', layer);
                    layerControls.appendChild(this.stopPropagationOnEvent(attributeStyle, 'click'));

                    var attributeOptions = document.createElement('select');
                    attributeOptions.className = 'attributes';
                    layerControls.appendChild(this.stopPropagationOnEvent(attributeOptions, 'click'));

                    layer.on('propertychange', function (evt) {
                        if (evt.key === 'headers') {
                            this.removeContent(attributeOptions);
                            var headers = layer.get('headers');
                            for (var i in headers) {
                                attributeOptions.appendChild(this.createOption(i));
                            }
                        }
                    }, this);
                }
                layerDiv.appendChild(layerControls);
                this.layerContainer.insertBefore(layerDiv, this.layerContainer.firstChild);
                return this;
            };

            this.map.getLayers().on('add', function (evt) {
                if (evt.element instanceof ol.layer.Vector) {
                    if (evt.element.get('type') !== 'overlay') {
                        this.createRegistry(evt.element, true);
                    }
                } else {
                    this.createRegistry(evt.element);
                }
            }, this);
            this.map.getLayers().on('remove', function (evt) {
                if (evt.element.get('type') !== 'overlay') {
                    this.removeRegistry(evt.element);
                    this.selectEventEmitter.changed();
                }
            }, this);
        } else {
            throw new Error('Invalid parameter(s) provided.');
        }
    };
    layerTree.prototype.createButton = function (elemName, elemTitle, elemType, layer) {
        var buttonElem = document.createElement('button');
        buttonElem.className = elemName;
        buttonElem.title = elemTitle;
        var _this = this;
        switch (elemType) {
            case 'addlayer':
                buttonElem.addEventListener('click', function () {
                    document.getElementById(elemName).style.display = 'block';
                });
                return buttonElem;
            case 'deletelayer':
                buttonElem.addEventListener('click', function () {
                    if (_this.selectedLayer) {
                        var layer = _this.getLayerById(_this.selectedLayer.id);
                        _this.map.removeLayer(layer);
                        _this.messages.textContent = 'Layer removed successfully.';
                    } else {
                        _this.messages.textContent = 'No selected layer to remove.';
                    }
                });
                return buttonElem;
            case 'stylelayer':
                buttonElem.textContent = elemTitle;
                if (elemTitle === 'Default') {
                    buttonElem.addEventListener('click', function () {
                        layer.setStyle(tobjectStyleFunction);
                    });
                } else {
                    buttonElem.addEventListener('click', function () {
                        var attribute = buttonElem.parentNode.querySelector('select').value;
                        if (layer.get('headers')[attribute] === 'string') {
                            _this.styleCategorized(layer, attribute);
                        } else if (layer.get('headers')[attribute] === 'number') {
                            _this.styleGraduated(layer, attribute);
                        } else {
                            _this.messages.textContent = 'A string or numeric column is required for attribute coloring.';
                        }
                    });
                }
                return buttonElem;
            default:
                return false;
        }
    };
    layerTree.prototype.addBufferIcon = function (layer) {
        layer.getSource().on('change', function (evt) {
            var layerElem = document.getElementById(layer.get('id'));
            // var layerSpan = layerElem.getElementsByClassName('buffering')[0];
            if (evt.target.getState() === 'ready') {
                if (layer.getSource().get('pendingRequests') !== undefined) {
                    layer.getSource().set('pendingRequests', layer.getSource().get('pendingRequests') - 1);
                    if (layer.getSource().get('pendingRequests') === 0) {
                        layerElem.className = layerElem.className.replace(/(?:^|\s)(error|buffering)(?!\S)/g, '');
                    }
                }
                layer.buildHeaders();
            } else {
                layerElem.className += ' error';
            }
        });
    };
    layerTree.prototype.removeContent = function (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        return this;
    };
    layerTree.prototype.createOption = function (optionValue, optionText) {
        var option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionText || optionValue;
        return option;
    };
    layerTree.prototype.createOption2 = function (optionValue) {
        var option = document.createElement('option');
        option.value = optionValue;
        return option;
    };

    layerTree.prototype.checkWmsLayer = function (form) {
        form.check.disabled = true;
        var _this = this;
        this.removeContent(form.layer).removeContent(form.format);
        var serverUrl = form.server.value;
        serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
        form.server.value = serverUrl;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                var parser = new ol.format.WMSCapabilities();
                try {
                    var capabilities = parser.read(request.responseText);
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
                            form.layer.appendChild(_this.createOption(layers[i].Name));
                        }
                        var formats = capabilities.Capability.Request.GetMap.Format;
                        var nFormats = formats.length;
                        for (i = 0; i < nFormats; i += 1) {
                            form.format.appendChild(_this.createOption(formats[i]));
                        }
                        _this.messages.textContent = messageText;
                    }
                } catch (error) {
                    _this.messages.textContent = 'Some unexpected error occurred: (' + error.message + ').';
                } finally {
                    form.check.disabled = false;
                }
            } else if (request.status > 200) {
                form.check.disabled = false;
            }
        };
        serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';
        // var proxyUrl = "https://www.osmfire.com/cgi-bin/proxy.py?";
        var query = 'SERVICE=WMS&REQUEST=GetCapabilities';
        var url = settings.proxyUrl + serverUrl + query;
        console.log(url);
        request.open('GET', url, true);
        request.send();
    };
    layerTree.prototype.addWmsLayer = function (form) {
        var params = {
            url: form.server.value,
            params: {
                layers: form.layer.value,
                format: form.format.value
            }
        };
        var layer;
        if (form.tiled.checked) {
            layer = new ol.layer.Tile({
                source: new ol.source.TileWMS(params),
                name: form.displayname.value
            });
        } else {
            layer = new ol.layer.Image({
                source: new ol.source.ImageWMS(params),
                name: form.displayname.value
            });
        }
        this.map.addLayer(layer);
        this.messages.textContent = 'WMS layer added successfully.';
        return this;
    };
    layerTree.prototype.checkWfsLayer = function (form) {
        form.check.disabled = true;
        var _this = this;
        this.removeContent(form.layer);
        this.wfsProjections = {};
        var serverUrl = form.server.value;
        serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
        form.server.value = serverUrl;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                try {
                    var unmarshaller = WFSContext.createUnmarshaller();
                    var capabilities = unmarshaller.unmarshalDocument(request.responseXML).value;
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
                            form.layer.appendChild(_this.createOption(name));
                            _this.wfsProjections[name] = layers[i].defaultSRS;
                        }
                        _this.messages.textContent = messageText;
                    }
                } catch (error) {
                    _this.messages.textContent = 'Some unexpected error occurred: (' + error.message + ').';
                } finally {
                    form.check.disabled = false;
                }
            } else if (request.status > 200) {
                form.check.disabled = false;
            }
        };
        serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';
        // var proxyUrl = "https://www.osmfire.com/cgi-bin/proxy.py?";
        var query = 'SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities';
        var url = settings.proxyUrl + serverUrl + query;
        console.log(url);
        request.open('GET', url, true);
        request.send();
    };
    layerTree.prototype.addWfsLayer = function (form) {

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
        var typeName = form.layer.value;
        var mapProj = this.map.getView().getProjection();
        // var proj = form.projection.value || mapProj.getCode();
        var proj = this.wfsProjections[typeName];
        console.log(proj);
        var parserformat = new ol.format.WFS();

        // var proxyUrl = "https://www.osmfire.com/cgi-bin/proxy.py?";
        var serverUrl = form.server.value;
        serverUrl = /^((http)|(https))(:\/\/)/.test(serverUrl) ? serverUrl : 'http://' + serverUrl;
        serverUrl = /\?/.test(serverUrl) ? serverUrl + '&' : serverUrl + '?';

        var pendingRequests = 0;
        var layer = new ol.layer.Vector({
            // title: 'WFS-T',
            // type: 'vector',
            source: new ol.source.Vector(),
            name: form.displayname.value
        });

        this.map.addLayer(layer);
        var layerElem = document.getElementById(layer.get('id'));
        var source = new ol.source.Vector({
            // url: settings.proxyUrl + 'url=' + encodeURIComponent(serverUrl + buildQueryString({typeName: typeName})),
            // format: parserformat,
            // url: function(extent, img, proj) {
            //     var query = buildQueryString({typeName: typeName, proj: proj.getCode(), extent: extent});
            //     return settings.proxyUrl + serverUrl + query;
            // },
            loader: function (extent, res, mapProj) {
                // proj = proj || mapProj.getCode();
                // var _this = this;
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState === 4 && request.status === 200) {
                        source.addFeatures(parserformat.readFeatures(request.responseText, {
                            dataProjection: proj,
                            featureProjection: mapProj.getCode()
                        }));

                    } else if (request.readyState === 1) {
                        source.set('pendingRequests', source.get('pendingRequests') + 1);
                        layerElem.classList.add('buffering');
                    } else if (request.readyState === 0) {
                        console.log('0: Request Not Initialized');
                    }
                };
                var query = buildQueryString({typeName: typeName, proj: proj, extent: extent});
                request.open('GET', settings.proxyUrl + serverUrl + query);
                request.send();
            },
            strategy: ol.loadingstrategy.bbox
            // strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({}))
        });
        source.set('pendingRequests', 0);
        layer.setSource(source);
        this.addBufferIcon(layer);
        this.messages.textContent = 'WFS layer added successfully.';
        return this;
    };
    layerTree.prototype.createAddVectorForm = function () {
        var div_addvector = document.createElement('div');
        div_addvector.id = "addvector";
        div_addvector.style.display = "none";
        div_addvector.className = "toggleable";

        var form_addvector_form = document.createElement('form');
        form_addvector_form.className = "addlayer";
        form_addvector_form.id = "addvector_form";

        var p_0 = document.createElement('p');
        p_0.appendChild(document.createTextNode("Add Vector layer"));
        form_addvector_form.appendChild(p_0);

        var table_0 = document.createElement('table');

        var tr_2 = document.createElement('tr');
        var td_4 = document.createElement('td');
        td_4.appendChild(document.createTextNode("Format:"));
        tr_2.appendChild(td_4);
        var td_5 = document.createElement('td');
        var select_0 = document.createElement('select');
        select_0.name = "format";
        select_0.required = "required";
        select_0.appendChild(this.createOption('geojson', 'GeoJSON'));
        select_0.appendChild(this.createOption('topojson', 'TopoJSON'));
        select_0.appendChild(this.createOption('zip', 'Shapefile (zipped)'));
        // select_0.appendChild(this.createOption('shp', 'ShapeFile'));
        select_0.appendChild(this.createOption('kml', 'KML'));
        select_0.appendChild(this.createOption('osm', 'OSM'));
        select_0.addEventListener("change", function () {
            document.getElementById("file-name").accept = '.' + this.value;
        });
        td_5.appendChild(select_0);
        tr_2.appendChild(td_5);

        table_0.appendChild(tr_2);

        var tr_0 = document.createElement('tr');
        var td_0 = document.createElement('td');
        td_0.appendChild(document.createTextNode("Vector file:"));
        tr_0.appendChild(td_0);
        var td_1 = document.createElement('td');
        var input_0 = document.createElement('input');
        input_0.id = "file-name";
        input_0.type = "file";
        input_0.name = "file";
        input_0.required = "required";
        input_0.accept = ".geojson";
        input_0.addEventListener("change", function (evt) {
            var startPos = this.value.lastIndexOf("\\") + 1;
            var stopPos = this.value.lastIndexOf(".");
            var name = this.value.slice(startPos, stopPos);
            document.getElementById("display-name").value = name;
        });
        td_1.appendChild(input_0);
        tr_0.appendChild(td_1);

        table_0.appendChild(tr_0);

        var tr_1 = document.createElement('tr');
        var td_2 = document.createElement('td');
        td_2.appendChild(document.createTextNode("Display name:"));
        tr_1.appendChild(td_2);
        var td_3 = document.createElement('td');
        var input_1 = document.createElement('input');
        input_1.id = "display-name";
        input_1.type = "text";
        input_1.name = "displayname";
        td_3.appendChild(input_1);
        tr_1.appendChild(td_3);

        table_0.appendChild(tr_1);

        var tr_3 = document.createElement('tr');
        var td_6 = document.createElement('td');
        td_6.appendChild(document.createTextNode("Projection:"));
        tr_3.appendChild(td_6);
        var td_7 = document.createElement('td');
        var input_2 = document.createElement('input');
        input_2.type = "text";
        input_2.name = "projection";
        td_7.appendChild(input_2);
        tr_3.appendChild(td_7);

        table_0.appendChild(tr_3);

        var tr_4 = document.createElement('tr');
        var td_8 = document.createElement('td');
        var input_3 = document.createElement('input');
        input_3.type = "submit";
        input_3.value = "Add layer";
        td_8.appendChild(input_3);
        tr_4.appendChild(td_8);
        var td_9 = document.createElement('td');
        var input_4 = document.createElement('input');
        input_4.type = "button";
        input_4.value = "Cancel";
        input_4.onclick = function () {
            this.form.parentNode.style.display = 'none'
        };
        td_9.appendChild(input_4);
        tr_4.appendChild(td_9);

        table_0.appendChild(tr_4);

        form_addvector_form.appendChild(table_0);

        div_addvector.appendChild(form_addvector_form);

        document.body.appendChild(div_addvector);
    };
    layerTree.prototype.addVectorLayer = function (form) {
        var file = form.file.files[0];
        var currentProj = this.map.getView().getProjection();
        try {
            var fr = new FileReader();
            var sourceFormat;
            var source = new ol.source.Vector({
                strategy: ol.loadingstrategy.bbox
            });
            fr.onload = function (evt) {
                var vectorData = evt.target.result;
                var sourceType;
                switch (form.format.value) {
                    case 'zip':
                        sourceFormat = new ol.format.GeoJSON();
                        break;
                    // case 'shp':
                    //     sourceFormat = new ol.format.GeoJSON();
                    //     break;
                    case 'geojson':
                        sourceFormat = new ol.format.GeoJSON();
                        // currently only supports saving out to geojson.
                        var re = /layertag[^a-z]*([a-zA-z]*)/;
                        sourceType = re.exec(vectorData);
                        if (exists(sourceType) && sourceType.length === 2) {
                            sourceType = sourceType[1];
                        }
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

                var dataProjection = form.projection.value || sourceFormat.readProjection(vectorData) || currentProj;
                if (form.format.value === 'zip') {
                    shp(vectorData).then(function (geojson) {
                        source.addFeatures(sourceFormat.readFeatures(geojson, {
                            dataProjection: dataProjection,
                            featureProjection: currentProj
                        }));
                    });
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
            };
            if (form.format.value === 'zip') {
                fr.readAsArrayBuffer(file); // SHP
            } else {
                fr.readAsText(file);
            }
            var layer = new ol.layer.Vector({
                source: source,
                name: form.displayname.value,
                style: tobjectStyleFunction,
                updateWhileInteracting: true,
                updateWhileAnimating: true
            });
            this.addBufferIcon(layer);
            this.map.addLayer(layer);
            this.messages.textContent = 'Vector layer added successfully.';
            return this;
        } catch (error) {
            this.messages.textContent = 'Some unexpected error occurred: (' + error.message + ').';
            return error;
        }
    };
    layerTree.prototype.createNewVectorForm = function () {
        var div_newvector = document.createElement('div');
        div_newvector.className = "toggleable";
        div_newvector.id = "newvector";
        div_newvector.style.display = "none";

        var form_newvector_form = document.createElement('form');
        form_newvector_form.id = "newvector_form";
        form_newvector_form.className = "addlayer";

        var p_0 = document.createElement('p');
        p_0.appendChild(document.createTextNode("New Vector layer"));
        form_newvector_form.appendChild(p_0);

        var table_0 = document.createElement('table');

        var tr_0 = document.createElement('tr');
        var td_0 = document.createElement('td');
        td_0.appendChild(document.createTextNode("Display name:"));
        tr_0.appendChild(td_0);
        var td_1 = document.createElement('td');
        var input_0 = document.createElement('input');
        input_0.name = "displayname";
        input_0.type = "text";
        td_1.appendChild(input_0);
        tr_0.appendChild(td_1);

        table_0.appendChild(tr_0);

        var tr_1 = document.createElement('tr');
        var td_2 = document.createElement('td');
        td_2.appendChild(document.createTextNode("Type:"));
        tr_1.appendChild(td_2);
        var td_3 = document.createElement('td');
        var select_0 = document.createElement('select');
        select_0.required = "required";
        select_0.name = "type";
        // select_0.appendChild(this.createOption('building', 'Building Layer'));
        // select_0.appendChild(this.createOption('herbage', 'Herbage Layer'));
        // select_0.appendChild(this.createOption('water', 'Water Layer'));
        // select_0.appendChild(this.createOption('wall', 'Wall Layer'));
        // select_0.appendChild(this.createOption('road', 'Road Layer'));
        // select_0.appendChild(this.createOption('aor', 'AOR Layer'));
        // select_0.appendChild(this.createOption('generic', 'Generic Layer'));
        // select_0.appendChild(this.createOption('tobject', 'TObject Layer'));
        select_0.appendChild(this.createOption('polygon', 'Polygon Layer'));
        select_0.appendChild(this.createOption('line', 'Line Layer'));
        select_0.appendChild(this.createOption('point', 'Point Layer'));
        select_0.appendChild(this.createOption('geomcollection', 'GeomCollection Layer'));
        // select_0.appendChild(this.createOption('camera', 'Camera Layer'));
        // select_0.appendChild(this.createOption('radio', 'Radio Layer'));
        td_3.appendChild(select_0);
        tr_1.appendChild(td_3);

        table_0.appendChild(tr_1);

        var tr_2 = document.createElement('tr');
        var td_4 = document.createElement('td');
        var input_1 = document.createElement('input');
        input_1.type = "submit";
        input_1.value = "Add layer";
        td_4.appendChild(input_1);
        tr_2.appendChild(td_4);
        var td_5 = document.createElement('td');
        var input_2 = document.createElement('input');
        input_2.type = "button";
        input_2.value = "Cancel";
        input_2.onclick = function () {
            this.form.parentNode.style.display = 'none'
        };
        td_5.appendChild(input_2);
        tr_2.appendChild(td_5);

        table_0.appendChild(tr_2);

        form_newvector_form.appendChild(table_0);

        div_newvector.appendChild(form_newvector_form);

        document.body.appendChild(div_newvector);
    };
    layerTree.prototype.newVectorLayer = function (form) {
        var type = form.type.value;
        var geomTypes = ['point', 'line', 'polygon', 'geomcollection'];
        var sourceTypes = Object.keys(tobjectTemplates);
        if (sourceTypes.indexOf(type) === -1 && geomTypes.indexOf(type) === -1) {
            this.messages.textContent = 'Unrecognized layer type.';
            return false;
        }
        var layer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            name: form.displayname.value || type + ' Layer',
            type: type
        });
        this.addBufferIcon(layer);
        this.map.addLayer(layer);
        layer.getSource().changed();
        layer.setStyle(tobjectStyleFunction);
        this.messages.textContent = 'New vector layer created successfully.';
        return this;
    };

    layerTree.prototype.addSelectEvent = function (node, isChild) {
        var _this = this;
        node.addEventListener('click', function (evt) {
            var targetNode = evt.target;
            if (isChild) {
                evt.stopPropagation();
                targetNode = targetNode.parentNode;
            }
            if (_this.selectedLayer) {
                _this.selectedLayer.classList.remove('active');
            }
            if (_this.selectedLayer !== targetNode) {
                _this.selectedLayer = targetNode;
                _this.selectedLayer.classList.add('active');
            } else {
                _this.selectedLayer = null;
            }
            _this.selectEventEmitter.changed();
        });
        return node;
    };
    layerTree.prototype.removeRegistry = function (layer) {
        var layerDiv = document.getElementById(layer.get('id'));
        this.layerContainer.removeChild(layerDiv);
        return this;
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
    layerTree.prototype.stopPropagationOnEvent = function (node, event) {
        node.addEventListener(event, function (evt) {
            evt.stopPropagation();
        });
        return node;
    };
    layerTree.prototype.styleGraduated = function (layer, attribute) {
        if (layer.get('headers')[attribute] === 'string') {
            this.messages.textContent = 'A numeric column is required for graduated symbology.';
        } else {
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
                var color = property < min + step * 1 ? colors[0] :
                    property < min + step * 2 ? colors[1] :
                        property < min + step * 3 ? colors[2] :
                            property < min + step * 4 ? colors[3] : colors[4];
                var style = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: [0, 0, 0, 1],
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        color: color
                    })
                });
                return [style];
            });
        }
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

        layer.getSource().forEachFeature(function (feat) {
            var property = feat.get(attribute) === undefined ? '' : feat.get(attribute).toString();
            if (attributeArray.indexOf(property) === -1) {
                attributeArray.push(property);
                do {
                    randomColor = this.randomHexColor();
                } while (colorArray.indexOf(randomColor) !== -1);
                colorArray.push(randomColor);
            }
        }, this);
        layer.setStyle(function (feature, res) {
            var index = feature.get(attribute) === undefined ? 0 : attributeArray.indexOf(feature.get(attribute).toString());
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [0, 0, 0, 1],
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: colorArray[index]
                })
            });
            return [style];
        });
    };
    layerTree.prototype.randomHexColor = function () {
        var num = Math.floor(Math.random() * 16777215).toString(16);
        return '#' + String.prototype.repeat.call('0', 6 - num.length) + num;
    };

    return layerTree;
});