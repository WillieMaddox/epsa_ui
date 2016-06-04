
function exists(x) {
    return (x !== undefined && x !== null);
}
function toRad(x) {
    return x*Math.PI/180.0
}
function toInt(x) {
    return ~~x
}
function mod(n, m) {
    return ((n % m) + m) % m
}
var deg2tile = function(lon_deg, lat_deg, zoom) {
    var lat_rad = toRad(lat_deg);
    var n = Math.pow(2, zoom);
    var xtile = toInt(mod((lon_deg + 180.0) / 360.0, 1) * n);
    var ytile = toInt((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n);
    return [xtile, ytile]
};
var FID = (function() {
    /**
     * Feature Id Generator based on
     * Linear Congruential Generator
     *Variant of a Lehman Generator
     *m is chosen to be large (as it is the max period)
     *and for its relationships to a and c
     *Make sure...
     *1: a - 1 is divisible by all prime factors of m.
     *2: a - 1 is divisible by 4 if m is divisible by 4.
     *3: m and c are co-prime (i.e. No prime number divides both m and c).
     */
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", // candidate char values
        chlength = chars.length, // number of candidate characters.
        idlength = 4, // number of chars to be put in the Id tag.
        idtag = "", // string to hold the id tag.
        t = 0, // dummy variable used in gen function.
        m = 14776336, // chars.length ** idlength --> 62**4
        a = 476657, // 62**3 + 1
        c = 1013904223, // offset. (prime number much larger than m.)
        z = seed = Math.round(Math.random() * m); // default random seed,
    return {
        setSeed: function(val) {
            z = seed = exists(val) ? val : Math.round(Math.random() * m);
        },
        getSeed: function() {
            return seed;
        },
        gen: function() {
            idtag = "";
            z = (a * z + c) % m;
            for (i = 0; i < idlength; i++) {
                t = Math.floor(z / Math.pow(chlength, i)) % chlength;
                idtag += chars.charAt(t);
            }
            return idtag;
        }
    }
})();
/**
 * check whether the point consists of pointcoords is inside the supplied polygon geometry
 * @{ol.geometry.Polygon} geom
 * @{Array()} a two elements array representing the point coordinates
 * @returns {Boolean} true||false
 */
function isPointInPoly(geom, pointcoords) {
    var geomA = new jsts.io.GeoJSONReader().read(
        new ol.format.GeoJSON().writeFeatureObject(
            new ol.Feature({
                geometry: geom
            })
        )
    ).geometry;
    var geomB = new jsts.io.GeoJSONReader().read(
        new ol.format.GeoJSON().writeFeatureObject(
            new ol.Feature({
                geometry: new ol.geom.Point(pointcoords)
            })
        )
    ).geometry;
    return geomB.within(geomA);
}
function doesPolyCoverHole(geom, holecoords) {
    var geomA = new jsts.io.GeoJSONReader().read(
        new ol.format.GeoJSON().writeFeatureObject(
            new ol.Feature({
                geometry: geom
            })
        )
    ).geometry;
    var geomB = new jsts.io.GeoJSONReader().read(
        new ol.format.GeoJSON().writeFeatureObject(
            new ol.Feature({
                geometry: new ol.geom.Polygon([holecoords])
            })
        )
    ).geometry;
    return geomA.covers(geomB);
}

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
            var layerDiv = document.createElement('div');
            layerDiv.className = buffer ? 'layer ol-unselectable buffering' : 'layer ol-unselectable';
            layerDiv.title = layer.get('name') || 'Unnamed Layer';
            layerDiv.id = layer.get('id');
            this.addSelectEvent(layerDiv);
            var _this = this;
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
                    layers.splice(layers.indexOf(sourceLayer), 1);
                    layers.splice(index, 0, sourceLayer);
                    _this.map.render();
                    _this.map.getLayers().changed();
                }
            });
            var layerSpan = document.createElement('span');
            layerSpan.textContent = layerDiv.title;
            layerDiv.appendChild(this.addSelectEvent(layerSpan, true));
            layerSpan.addEventListener('dblclick', function () {
                this.contentEditable = true;
                layerDiv.draggable = false;
                layerDiv.classList.remove('ol-unselectable');
                this.focus();
            });
            layerSpan.addEventListener('blur', function () {
                if (this.contentEditable) {
                    this.contentEditable = false;
                    layerDiv.draggable = true;
                    layer.set('name', this.textContent);
                    layerDiv.classList.add('ol-unselectable');
                    layerDiv.title = this.textContent;
                    this.scrollTo(0, 0);
                }
            });
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
            var layerControls = document.createElement('div');
            this.addSelectEvent(layerControls, true);
            var opacityHandler = document.createElement('input');
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
            layerControls.appendChild(this.stopPropagationOnEvent(opacityHandler, 'click'));
            if (layer instanceof ol.layer.Vector) {
                layerControls.appendChild(document.createElement('br'));
                var attributeOptions = document.createElement('select');
                layerControls.appendChild(this.stopPropagationOnEvent(attributeOptions, 'click'));
                layerControls.appendChild(document.createElement('br'));
                var defaultStyle = this.createButton('stylelayer', 'Default', 'stylelayer', layer);
                layerControls.appendChild(this.stopPropagationOnEvent(defaultStyle, 'click'));
                var graduatedStyle = this.createButton('stylelayer', 'Graduated', 'stylelayer', layer);
                layerControls.appendChild(this.stopPropagationOnEvent(graduatedStyle, 'click'));
                var categorizedStyle = this.createButton('stylelayer', 'Categorized', 'stylelayer', layer);
                layerControls.appendChild(this.stopPropagationOnEvent(categorizedStyle, 'click'));
                layer.set('style', layer.getStyle());
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
            this.removeRegistry(evt.element);
            this.selectEventEmitter.changed();
        }, this);
    } else {
        throw new Error('Invalid parameter(s) provided.');
    }
};

layerTree.prototype.createButton = function (elemName, elemTitle, elemType, layer) {
    var buttonElem = document.createElement('button');
    buttonElem.className = elemName;
    buttonElem.title = elemTitle;
    switch (elemType) {
        case 'addlayer':
            buttonElem.addEventListener('click', function () {
                document.getElementById(elemName).style.display = 'block';
            });
            return buttonElem;
        case 'deletelayer':
            var _this = this;
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
            var _this = this;
            buttonElem.textContent = elemTitle;
            if (elemTitle === 'Default') {
                buttonElem.addEventListener('click', function () {
                    layer.setStyle(layer.get('style'));
                });
            } else {
                var styleFunction = elemTitle === 'Graduated' ? this.styleGraduated : this.styleCategorized;
                buttonElem.addEventListener('click', function () {
                    var attribute = buttonElem.parentNode.querySelector('select').value;
                    styleFunction.call(_this, layer, attribute);
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
        switch (evt.target.getState()) {
            case 'ready':
                layerElem.className = layerElem.className.replace(/(?:^|\s)(error|buffering)(?!\S)/g, '');
                layer.buildHeaders();
                break;
            case 'error':
                layerElem.classList.add('error');
                break;
            default:
                layerElem.classList.add('buffering');
                break;
        }
    });
};

layerTree.prototype.removeContent = function (element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    return this;
};

layerTree.prototype.createOption = function (optionValue) {
    var option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    return option;
};

layerTree.prototype.checkWmsLayer = function (form) {
    form.check.disabled = true;
    var _this = this;
    this.removeContent(form.layer).removeContent(form.format);
    var url = form.server.value;
    url = /^((http)|(https))(:\/\/)/.test(url) ? url : 'http://' + url;
    form.server.value = url;
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
                    for (var i = 0; i < layers.length; i += 1) {
                        form.layer.appendChild(_this.createOption(layers[i].Name));
                    }
                    var formats = capabilities.Capability.Request.GetMap.Format;
                    for (i = 0; i < formats.length; i += 1) {
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
    url = /\?/.test(url) ? url + '&' : url + '?';
    url = url + 'REQUEST=GetCapabilities&SERVICE=WMS';
    // var url1 = '../../../cgi-bin/proxy.py?url=' + encodeURIComponent(url);
    // var url2 = 'http://localhost:8050/cgi-bin/proxy.py?' + encodeURIComponent(url);
    var url3 = 'http://www.firefly.com:8050/cgi-bin/proxy.py?' + url;
    console.log(url3);
    request.open('GET', url3, true);
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

layerTree.prototype.addWfsLayer = function (form) {
    var url = form.server.value;
    url = /^((http)|(https))(:\/\/)/.test(url) ? url : 'http://' + url;
    url = /\?/.test(url) ? url + '&' : url + '?';
    var typeName = form.layer.value;
    var mapProj = this.map.getView().getProjection().getCode();
    var proj = form.projection.value || mapProj;
    var parser = new ol.format.WFS();
    var source = new ol.source.Vector({
        strategy: ol.loadingstrategy.bbox
    });
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            source.addFeatures(parser.readFeatures(request.responseText, {
                dataProjection: proj,
                featureProjection: mapProj
            }));
        }
    };
    url = url + 'SERVICE=WFS&REQUEST=GetFeature&TYPENAME=' + typeName + '&VERSION=1.1.0&SRSNAME=' + proj;
    // request.open('GET', '../../../cgi-bin/proxy.py?' + encodeURIComponent(url));
    var url3 = 'http://www.firefly.com:8050/cgi-bin/proxy.py?' + url;
    request.open('GET', url3);
    request.send();
    var layer = new ol.layer.Vector({
        source: source,
        name: form.displayname.value
    });
    this.addBufferIcon(layer);
    this.map.addLayer(layer);
    this.messages.textContent = 'WFS layer added successfully.';
    return this;
};

layerTree.prototype.addVectorLayer = function (form) {
    var file = form.file.files[0];
    var currentProj = this.map.getView().getProjection();
    try {
        var fr = new FileReader();
        var sourceFormat;
        var source = new ol.source.Vector();
        fr.onload = function (evt) {
            var vectorData = evt.target.result;
            switch (form.format.value) {
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
            var dataProjection = form.projection.value || sourceFormat.readProjection(vectorData) || currentProj;
            source.addFeatures(sourceFormat.readFeatures(vectorData, {
                dataProjection: dataProjection,
                featureProjection: currentProj
            }));
        };
        fr.readAsText(file);
        var layer = new ol.layer.Vector({
            source: source,
            name: form.displayname.value,
            strategy: ol.loadingstrategy.bbox
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

layerTree.prototype.newVectorLayer = function (form) {
    var type = form.type.value;
    if (type !== 'point' && type !== 'line' && type !== 'polygon' && type !== 'geomcollection') {
        this.messages.textContent = 'Unrecognized layer type.';
        return false;
    }
    var layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        name: form.displayname.value || 'Unnamed Layer',
        type: type
    });
    this.addBufferIcon(layer);
    this.map.addLayer(layer);
    layer.getSource().changed();
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
    for (var i = 0; i < layers.length; i += 1) {
        if (layers[i].get('id') === id) {
            return layers[i];
        }
    }
    return false;
};

layerTree.prototype.getLayerGeomType = function (layer) {
    if (layer.get('type')) {
        return layer;
    }
    var types = [];
    layer.getSource().forEachFeature(function (feat) {
        var geom = feat.getGeometry();
        var type;
        if (geom instanceof ol.geom.Point || geom instanceof ol.geom.MultiPoint) {
            type = 'point';
        } else if (geom instanceof ol.geom.LineString || geom instanceof ol.geom.MultiLineString) {
            type = 'linestring';
        } else if (geom instanceof ol.geom.Polygon || geom instanceof ol.geom.MultiPolygon) {
            type = 'polygon';
        } else {
            type = 'geomcollection';
        }
        if (types.indexOf(type) === -1) {
            types.push(type);
            if (type === 'geomcollection' || types.length >= 2) {
                return true;
            }
        }
    });

    layer.set('type', types.length === 1 ? types[0] : 'geomcollection');
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
    var color = new RColor;

    layer.getSource().forEachFeature(function (feat) {
        var property = feat.get(attribute).toString();
        if (attributeArray.indexOf(property) === -1) {
            attributeArray.push(property);
            do {
                // randomColor = this.randomHexColor();
                randomColor = color.get(true, 0.8);
            } while (colorArray.indexOf(randomColor) !== -1);
            colorArray.push(randomColor);
        }
    }, this);
    layer.setStyle(function (feature, res) {
        var index = attributeArray.indexOf(feature.get(attribute).toString());
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

layerTree.prototype.randomHexColor = function() {
    var num = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + String.prototype.repeat.call('0', 6 - num.length) + num;
};

ol.layer.Vector.prototype.buildHeaders = function () {
    var oldHeaders = this.get('headers') || {};
    var headers = {};
    var features = this.getSource().getFeatures();
    for (var i = 0; i < features.length; i += 1) {
        var attributes = features[i].getProperties();
        for (var j in attributes) {
            if (typeof attributes[j] !== 'object' && !(j in headers)) {
                headers[j] = attributes[j];
            } else if (j in oldHeaders) {
                headers[j] = oldHeaders[j];
            }
        }
    }
    this.set('headers', headers);
    return this;
};

ol.control.Interaction = function (opt_options) {
    var options = opt_options || {};
    var controlDiv = document.createElement('div');
    controlDiv.className = options.className || 'ol-unselectable ol-control';
    var controlButton = document.createElement('button');
    controlButton.textContent = options.label || 'I';
    controlButton.title = options.tipLabel || 'Custom interaction';
    controlDiv.appendChild(controlButton);

    var _this = this;
    controlButton.addEventListener('click', function () {
        if (_this.get('interaction').getActive()) {
            _this.set('active', false);
        } else {
            _this.set('active', true);
        }
    });
    var interaction = options.interaction;
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
        interaction: interaction,
        tobj_type: options.tipLabel,
        active: false,
        type: 'radio',
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
            $(document).on('keyup', function(evt) {
                if (evt.keyCode == 189 || evt.keyCode == 109) {
                    _this.get('interaction').removeLastPoint();
                } else if (evt.keyCode == 27) {
                    _this.set('active', false);
                    // map.removeInteraction(draw);
                    // select.setActive(true);
                    // modify.setActive(true);
                    // translate.setActive(true);
                    // $('#drawhole').prop('disabled', false);
                    // map.on('pointermove', hoverDisplay);
                    // $(document).off('keyup')
                }
            });

        } else {
            controlButton.classList.remove('active');
            $(document).off('keyup')

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
    'use strict';
    if (!(this instanceof toolBar)) {
        throw new Error('toolBar must be constructed with the new keyword.');
    } else if (typeof options === 'object' && options.map && options.target && options.layertree) {
        if (!(options.map instanceof ol.Map)) {
            throw new Error('Please provide a valid OpenLayers 3 map object.');
        }
        this.map = options.map;
        this.toolbar = document.getElementById(options.target);
        this.layertree = options.layertree;
        this.controls = new ol.Collection();
        this.controlEventEmitter = new ol.Observable();
        this.active = false;
    } else {
        throw new Error('Invalid parameter(s) provided.');
    }
};

toolBar.prototype.addControl = function (control) {
    if (!(control instanceof ol.control.Control)) {
        throw new Error('Only controls can be added to the toolbar.');
    }
    // var bit2 = 0;
    // var bit3 = 0;
    if (control.get('type') === 'radio') {
        control.on('change:active', function () {
            if (!(this.bit2 | this.bit3)) {
                this.active = true;
                // console.log('drawing ON = ', this.active);
                this.controlEventEmitter.changed()
            }
            this.bit2 ^= 1;
            if (control.get('active')) {
                this.controls.forEach(function (controlToDisable) {
                    if (controlToDisable.get('type') === 'radio' && controlToDisable !== control) {
                        controlToDisable.set('active', false);
                    }
                });
            }
            this.bit3 ^= 1;
            if (!(this.bit2 | this.bit3)) {
                this.active = false;
                // console.log('drawing ON = ', this.active);
                this.controlEventEmitter.changed()
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
        tipLabel: 'Add points',
        className: 'ol-addpoint ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'Point'}), 'point')
    }).setDisabled(true);
    this.drawControls.push(drawPoint);
    var drawLine = new ol.control.Interaction({
        label: ' ',
        tipLabel: 'Add lines',
        className: 'ol-addline ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'line')
    }).setDisabled(true);
    this.drawControls.push(drawLine);
    var drawPolygon = new ol.control.Interaction({
        label: ' ',
        tipLabel: 'Add polygons',
        className: 'ol-addpolygon ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'polygon')
    }).setDisabled(true);
    this.drawControls.push(drawPolygon);
    var drawAOR = new ol.control.Interaction({
        label: ' ',
        tipLabel: 'Add AOR',
        className: 'draw-aor ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'polygon')
    }).setDisabled(true);
    this.drawControls.push(drawAOR);
    var drawBuilding = new ol.control.Interaction({
        label: ' ',
        tipLabel: 'Add Building',
        className: 'draw-building ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'polygon')
    }).setDisabled(true);
    this.drawControls.push(drawBuilding);
    var drawHerbage = new ol.control.Interaction({
        label: ' ',
        tipLabel: 'Add Herbage',
        className: 'draw-herbage ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'polygon')
    }).setDisabled(true);
    this.drawControls.push(drawHerbage);
    var drawWater = new ol.control.Interaction({
        label: ' ',
        tipLabel: 'Add Water',
        className: 'draw-water ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'polygon')
    }).setDisabled(true);
    this.drawControls.push(drawWater);
    var drawWall = new ol.control.Interaction({
        label: ' ',
        tipLabel: 'Add Wall',
        className: 'draw-wall ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'line')
    }).setDisabled(true);
    this.drawControls.push(drawWall);
    var drawRoad = new ol.control.Interaction({
        label: ' ',
        tipLabel: 'Add Road',
        className: 'draw-road ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'line')
    }).setDisabled(true);
    this.drawControls.push(drawRoad);

    this.activeFeatures = new ol.Collection();

    layertree.selectEventEmitter.on('change', function () {
        var layer;
        if (layertree.selectedLayer) {
            layer = layertree.getLayerById(layertree.selectedLayer.id);
        } else {
            layer = null;
        }

        if (layer instanceof ol.layer.Vector) {
            this.drawControls.forEach(function (control) {
                control.setDisabled(false);
            });
            layertree.getLayerGeomType(layer);
            var layerType = layer.get('type');
            if (layerType !== 'point' && layerType !== 'geomcollection') {
                drawPoint.setDisabled(true).set('active', false);
            }
            if (layerType !== 'line' && layerType !== 'geomcollection') {
                drawWall.setDisabled(true).set('active', false);
                drawRoad.setDisabled(true).set('active', false);
                drawLine.setDisabled(true).set('active', false);
            }
            if (layerType !== 'polygon' && layerType !== 'geomcollection') {
                drawAOR.setDisabled(true).set('active', false);
                drawWater.setDisabled(true).set('active', false);
                drawHerbage.setDisabled(true).set('active', false);
                drawBuilding.setDisabled(true).set('active', false);
                drawPolygon.setDisabled(true).set('active', false);
            }
            var _this = this;
            setTimeout(function () {
                _this.activeFeatures.clear();
                _this.activeFeatures.extend(layer.getSource().getFeatures());
            }, 0);
        } else {
            this.drawControls.forEach(function (control) {
                control.set('active', false);
                control.setDisabled(true);
            });
        }
    }, this);

    this.drawControls.forEach(function (control) {
        this.addControl(control)
    }, this);

    // this.addControl(drawAOR).addControl(drawBuilding).addControl(drawHerbage)
    //     .addControl(drawWater).addControl(drawWall).addControl(drawRoad)
    //     .addControl(drawPolygon).addControl(drawLine).addControl(drawPoint);
    return this;
};

toolBar.prototype.handleEvents = function (interaction, type) {

    interaction.on('drawend', function (evt) {

        // evt.feature.set('type', tobj_type);
        // evt.feature.set('name', FID.gen());

        var selectedLayer = this.layertree.getLayerById(this.layertree.selectedLayer.id);
        selectedLayer.getSource().addFeature(evt.feature);

        this.activeFeatures.push(evt.feature);

        // transactWFS('insert', evt.feature);
        // map.removeInteraction(draw);
        // select.setActive(true);
        //$('#drawhole').prop('disabled', false);
        // map.on('pointermove', hoverDisplay);
        // info.innerHTML = evt.feature.get('type') + ': ' + evt.feature.get('name');
        // featureadded = true;
        // source.once('addfeature', function(evt) {
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
        //     }).then(function(response) {
        //         console.log(response);
        //     });
        // });

    }, this);
    return interaction;
};

toolBar.prototype.addInteraction = function () {};

var layerInteractor = function (options) {
    'use strict';
    if (!(this instanceof layerInteractor)) {
        throw new Error('interactor must be constructed with the new keyword.');
    } else if (typeof options === 'object' && options.map && options.layertree && options.toolbar) {
        if (!(options.map instanceof ol.Map)) {
            throw new Error('Please provide a valid OpenLayers 3 map object.');
        }
        this.map = options.map;
        this.layertree = options.layertree;
        this.toolbar = options.toolbar;
        this.toolbarColors = {
            'AOR': [0, 0, 0],
            'Building': [128, 128, 128],
            'Herbage': [0, 200, 0],
            'Water': [0, 0, 200],
            'Wall': [64, 64, 64],
            'Road': [192, 51, 52],
            'default': [255, 0, 0]
        };
        this.fillOpacity = {
            'AOR': 0,
            'Building': 0.1,
            'Herbage': 0.1,
            'Water': 0.1,
            'Wall': 0,
            'Road': 0,
            'default': 0.1
        };
        this.highlight = undefined;
        var _this = this;
        this.hoverDisplay = function(evt) {
            if (evt.dragging) return;
            var pixel = _this.map.getEventPixel(evt.originalEvent);
            var feature = _this.getFeatureAtPixel(pixel);
            _this.setMouseCursor(feature);
            _this.displayFeatureInfo(feature);
        };
        this.featureOverlay = this.createFeatureOverlay();
        this.map.addLayer(this.featureOverlay);
        this.addInteractions();

        this.map.addInteraction(this.select);
        this.select.setActive(true);

        document.getElementById('map').addEventListener('mouseleave', function () {
            if (_this.highlight) {
                _this.featureOverlay.getSource().removeFeature(_this.highlight);
                _this.highlight = undefined;
            }
        });

        this.map.on('pointermove', this.hoverDisplay);
        this.map.addInteraction(this.modify);
        this.modify.setActive(false);

    } else {
        throw new Error('Invalid parameter(s) provided.');
    }

};

layerInteractor.prototype.createFeatureOverlay = function() {
    var highlightStyleCache = {};
    var _this = this;
    var overlayStyleFunction = (function() {
        var strokeopacity = 1;
        var setStyle = function(type, text) {
            type = type? type : 'default';
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: _this.toolbarColors[type].concat(strokeopacity),
                    width: 4
                }),
                fill: new ol.style.Fill({
                    color: _this.toolbarColors[type].concat(_this.fillOpacity[type])
                }),
                text: new ol.style.Text({
                    font: '14px Calibri,sans-serif',
                    text: text,
                    fill: new ol.style.Fill({
                        color: '#000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 5
                    })
                })
            });
            return [style]
        };
        return function(feature, resolution) {
            var text = resolution < 50000 ? feature.get('name') : '';
            if (!highlightStyleCache[text]) {
                highlightStyleCache[text] = setStyle(feature.get('type'), text);
            }
            return highlightStyleCache[text];
        }
    })();
    var featureOverlay = new ol.layer.Vector({
        source: new ol.source.Vector(),
        type: 'overlay',
        style: overlayStyleFunction,
        zIndex: 9999
    });
    return featureOverlay
};

layerInteractor.prototype.getFeatureAtPixel = function(pixel) {
    var coord = this.map.getCoordinateFromPixel(pixel);
    var smallestArea = 5.1e14; // approximate surface area of the earth
    var smallestFeature = null;
    // var _this = this;
    var feature = this.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        var geom = feature.getGeometry();
        if (geom instanceof ol.geom.Point) {
        //Need to add functionality for sensors here.
        //     return feature;
        } else if (geom instanceof ol.geom.LineString) {
            return feature;
        } else if (geom instanceof ol.geom.MultiLineString) {
            return feature;
        } else if (geom instanceof ol.geom.Polygon || geom instanceof ol.geom.MultiPolygon) {
            if (feature.get('type') === 'AOR') {
                var point = geom.getClosestPoint(coord);
                var pixel0 = this.map.getPixelFromCoordinate(coord);
                var pixel1 = this.map.getPixelFromCoordinate(point);
                if (Math.abs(pixel0[0]-pixel1[0]) < 4 && Math.abs(pixel0[1]-pixel1[1]) < 4) {
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
    }, this, function(layer) {
        if (this.layertree.selectedLayer) {
            return layer === this.layertree.getLayerById(this.layertree.selectedLayer.id)
        }
    }, this);
    return exists(feature) ? feature : smallestFeature;
};

layerInteractor.prototype.setMouseCursor = function(feature) {
    if (feature) {
        this.map.getTarget().style.cursor = 'pointer';
    } else {
        this.map.getTarget().style.cursor = '';
    }
};

layerInteractor.prototype.displayFeatureInfo = function(feature) {
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

layerInteractor.prototype.tobjectsStyleFunction = (function() {
    var _this = this;
    var strokeopacity = 1;
    var setStyle = function(type) {
        var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: _this.toolbarColors[type].concat(strokeopacity),
                width: 3
            }),
            fill: new ol.style.Fill({
                color: _this.toolbarColors[type].concat(_this.fillOpacity[type])
            })
        });
        return [style]
    };
    return function(feature, resolution) {
        return setStyle(feature.get('type'));
    };
})();

layerInteractor.prototype.addInteractions = function () {
    this.select = new ol.interaction.Select({
        layers: [this.featureOverlay],
        toggleCondition: ol.events.condition.never,
        /*condition: function(evt) {
            if (ol.events.condition.singleClick(evt) || ol.events.condition.doubleClick(evt)) {
                if (featureadded) {
                    featureadded = false;
                    return false;
                };
                return true;
            };
        },*/
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(255, 255, 255, 1)',
                width: 4
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.1)'
            })
        })
    });

    var _this = this;
    this.select.on('select', function(evt) {
        var feature;
        // Handle deselect first so we can update the feature in the python code.
        if (evt.deselected.length == 1) {
            feature = evt.deselected[0];
            _this.modify.setActive(false);
            console.log('deselect:', feature.get('name'), feature.getRevision());
        }
        if (evt.selected.length == 1) {
            feature = evt.selected[0];
            _this.modify.setActive(true);
            console.log('select:    ', feature.get('name'), feature.getRevision())
        }
    });

    this.modify = new ol.interaction.Modify({
        features: this.select.getFeatures()
    });

    this.toolbar.controlEventEmitter.on('change', function (evt) {
        console.log('toolbar.consoleEventEmitter changed')
        if (_this.toolbar.active == true) {
            _this.map.un('pointermove', _this.hoverDisplay);
            var selectedFeature = _this.select.getFeatures();
            selectedFeature.forEach(selectedFeature.remove, selectedFeature);
            // $('#drawhole').prop('disabled', true);
            // translate.setActive(false);
            // modify.setActive(false);
            _this.select.setActive(false);
            // var geom_type = event.target.value;
            // var tobj_type = event.target.id;
            // var source = tobj_type === 'AOR' ? vector_aor.getSource() : vector.getSource();

        } else {
            _this.select.setActive(true);
            //$('#drawhole').prop('disabled', false);
            _this.map.on('pointermove', _this.hoverDisplay);

        }
    });
};

function init() {
    document.removeEventListener('DOMContentLoaded', init);

    var mouseProjection = 'EPSG:4326';
    var mousePrecision = 4;
    var view = new ol.View({
        // center: ol.proj.transform([-86.711, 34.636], 'EPSG:4326', 'EPSG:3857'),
        // center: ol.proj.transform([-73.9812, 40.6957], 'EPSG:4326', 'EPSG:3857'),
        // center: ol.proj.transform([-105.539, 39.771], 'EPSG:4326', 'EPSG:3857'),
        center: [-8236600, 4975706],
        zoom: 14
    });
    view.on('change:resolution', function(evt) {
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

    var bingkey = 'AsPHemiyjrAaLwkdh3DLil_xdTJN7QFGPaOi9-a4sf8hbAwA3Z334atxK8GxYcxy';
    var thunderforestAttributions = [
        new ol.Attribution({
            html: 'Tiles &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>'
        }),
        ol.source.OSM.ATTRIBUTION
    ];

    var map = new ol.Map({
        interactions: ol.interaction.defaults({ doubleClickZoom: false }),
        target: document.getElementById('map'),
        view: view,
        logo: {
            src: 'res/saic-logo2.png',
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
                            key: bingkey,
                            imagerySet: 'Road'
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'Aerial',
                        type: 'base',
                        visible: false,
                        source: new ol.source.BingMaps({
                            key: bingkey,
                            imagerySet: 'Aerial'
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'Aerial + Labels',
                        type: 'base',
                        visible: false,
                        source: new ol.source.BingMaps({
                            key: bingkey,
                            imagerySet: 'AerialWithLabels'
                        })
                    })
                ]
            }),
            new ol.layer.Group({
                title: 'MapQuest',
                layers: [
                    new ol.layer.Tile({
                        title: 'Labels',
                        type: 'base',
                        visible: false,
                        source: new ol.source.MapQuest({layer: 'osm'})
                    }),
                    new ol.layer.Tile({
                        title: 'Sat',
                        type: 'base',
                        visible: false,
                        source: new ol.source.MapQuest({layer: 'sat'})
                    }),
                    new ol.layer.Group({
                        title: 'Sat + Labels',
                        type: 'base',
                        visible: false,
                        layers: [
                            new ol.layer.Tile({
                                source: new ol.source.MapQuest({layer: 'sat'})
                            }),
                            new ol.layer.Tile({
                                source: new ol.source.MapQuest({layer: 'hyb'})
                            })
                        ]
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
                        source: new ol.source.OSM({ url: 'http://localhost/osm_tiles/{z}/{x}/{y}.png' })
                    })
                ]
            })
            // new ol.layer.Group({
            //     title: 'Extra',
            //     layers: [
            //         new ol.layer.Tile({
            //             title: 'Countries',
            //             type: 'vector',
            //             source: new ol.source.TileWMS({
            //                 url: 'http://demo.opengeo.org/geoserver/wms',
            //                 params: {'LAYERS': 'ne:ne_10m_admin_1_states_provinces_lines_shp'},
            //                 serverType: 'geoserver'
            //             })
            //         })
            //     ]
            // })
        ]
    });

    var tree = new layerTree({map: map, target: 'layertree', messages: 'messageBar'});

    document.getElementById('checkwmslayer').addEventListener('click', function () {
        tree.checkWmsLayer(this.form);
    });
    document.getElementById('addwms_form').addEventListener('submit', function (evt) {
        evt.preventDefault();
        tree.addWmsLayer(this);
        this.parentNode.style.display = 'none';
    });
    document.getElementById('wmsurl').addEventListener('change', function () {
        tree.removeContent(this.form.layer)
            .removeContent(this.form.format);
    });
    document.getElementById('addwfs_form').addEventListener('submit', function (evt) {
        evt.preventDefault();
        tree.addWfsLayer(this);
        this.parentNode.style.display = 'none';
    });
    document.getElementById('addvector_form').addEventListener('submit', function (evt) {
        evt.preventDefault();
        tree.addVectorLayer(this);
        this.parentNode.style.display = 'none';
    });
    document.getElementById('newvector_form').addEventListener('submit', function (evt) {
        evt.preventDefault();
        tree.newVectorLayer(this);
        this.parentNode.style.display = 'none';
    });

    var tools = new toolBar({map: map, target: 'toolbar', layertree: tree});

    tools.addDrawToolBar();

    var interactor = new layerInteractor({map: map, toolbar: tools, layertree: tree});


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

    // map.addLayer(featureOverlay);

    // var selectedFeature = null;
    // var getSelectedFeatureAtPixel = function(pixel) {
    //     var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
    //         if (feature.getId() == selectedFeature.getId()) {
    //             return feature;
    //         } else {
    //             return undefined;
    //         }
    //     })
    //     return feature;
    // };
    //
    // var setSelectMousePointer = function(evt) {
    //     if (evt.dragging) return;
    //     var pixel = map.getEventPixel(evt.originalEvent);
    //     var intersectingFeature = getSelectedFeatureAtPixel(pixel);
    //     setMouseCursor(intersectingFeature)
    // };

    /*********** WFS-T *************/
    // var url="http://gis.local.osm:8080/geoserver/wfs?service=wfs&version=1.1.0&request=GetFeature&typeName=cite:nyc_buildings";
    // sourceVector = new ol.source.Vector({
    // 	url: '/cgi-bin/proxy.py?url='+ encodeURIComponent(url),
    // 	format: new ol.format.WFS()
    // });
    //
    //wfs-t
    // url = 'http://gis.local.osm:8080/geoserver/wfs';
    // url = /^((http)|(https))(:\/\/)/.test(url) ? url : 'http://' + url;
    // url = /\?/.test(url) ? url + '&' : url + '?';
    // var typeName = 'cite:nyc_buildings';
    // var proj = 'EPSG:3857';
    // var formatWFS = new ol.format.WFS();
    // sourceVector = new ol.source.Vector({
    //     loader: function(extent) {
    //     	$.ajax('/cgi-bin/proxy.py?url='+'http://gis.local.osm:8080/geoserver/wfs', {
    //     		type: 'GET',
    //     		data: {
    //     			service: 'WFS',
    //     			version: '2.0.0',
    //     			request: 'GetFeature',
    //     			typename: 'cite:nyc_buildings',
    //     			srsname: 'EPSG:3857',
    //     			bbox: extent.join(',') + ',EPSG:3857'
    //     		},
    //     	}).done(function(response) {
    //     		formatWFS = new ol.format.WFS(),
    //     			sourceVector.addFeatures(formatWFS.readFeatures(response))
    //     	});
    //     },
    // 	loader: function (extent, res, mapProj) {
    // 		proj = proj || mapProj.getCode();
    // 		var request = new XMLHttpRequest();
    // 		request.onreadystatechange = function () {
    // 			if (request.readyState === 4 && request.status === 200) {
    // 				sourceVector.addFeatures(formatWFS.readFeatures(request.responseText, {
    // 					dataProjection: proj,
    // 					featureProjection: mapProj.getCode()
    // 				}));
    // 			}
    // 		};
    // 		url = url + 'SERVICE=WFS&REQUEST=GetFeature&TYPENAME=' + typeName + '&VERSION=1.1.0&SRSNAME=' + proj + '&BBOX=' + extent.join(',');
    // 		request.open('GET', '/cgi-bin/proxy.py?' + encodeURIComponent(url));
    // 		//request.open('GET', url);
    // 		request.send();
    // 	},
    // 	strategy: ol.loadingstrategy.bbox
    // });
    //
    // var layerVector = new ol.layer.Vector({
    // 	title: 'WFS-T',
    // 	type: 'vector',
    // 	source: sourceVector
    // });
    //
    // var dirty = {};
    // var formatWFS = new ol.format.WFS();
    // var formatGML = new ol.format.GML({
    // 	featureNS: 'http://argeomatica.com',
    // 	featureType: 'cite:nyc_buildings',
    // 	srsName: 'EPSG:3857'
    // });
    // var transactWFS = function(p, f) {
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
    // 	$.ajax('http://gis.local.osm/geoserver/wfs', {
    // 		type: 'POST',
    // 		dataType: 'xml',
    // 		processData: false,
    // 		contentType: 'text/xml',
    // 		data: str
    // 	}).done();
    // };

    /********** DRAW ***************/
    // var draw;
    // var drawType = document.getElementById('draw-feature-type');
    // drawType.onclick = function(event) {
    //     if (draw) {
    //         map.removeInteraction(draw)
    //     }
    //     map.un('pointermove', hoverDisplay);
    //     var selectedFeature = select.getFeatures();
    //     selectedFeature.forEach(selectedFeature.remove, selectedFeature);
    //     //$('#drawhole').prop('disabled', true);
    //     //translate.setActive(false);
    //     //modify.setActive(false);
    //     select.setActive(false);
    //     var geom_type = event.target.value;
    //     var tobj_type = event.target.id;
    //     var source = tobj_type === 'AOR' ? vector_aor.getSource() : vector.getSource();
    //     draw = new ol.interaction.Draw({
    //         source: source,
    //         type: geom_type
    //     });
    //     map.addInteraction(draw);
    //
    //     $(document).on('keyup', function(evt) {
    //         if (evt.keyCode == 189 || evt.keyCode == 109) {
    //             draw.removeLastPoint();
    //         } else if (evt.keyCode == 27) {
    //             map.removeInteraction(draw);
    //             select.setActive(true);
    //             //modify.setActive(true);
    //             //translate.setActive(true);
    //             //$('#drawhole').prop('disabled', false);
    //             map.on('pointermove', hoverDisplay);
    //             $(document).off('keyup')
    //         }
    //     });
    //     draw.on('drawend', function(evt) {
    //         evt.feature.setId(FID.gen());
    //         evt.feature.set('type', tobj_type);
    //         evt.feature.set('name', evt.feature.getId());
    //         selectedFeature.push(evt.feature);
    //
    //         // transactWFS('insert', evt.feature);
    //
    //         map.removeInteraction(draw);
    //         select.setActive(true);
    //         //$('#drawhole').prop('disabled', false);
    //         map.on('pointermove', hoverDisplay);
    //         // info.innerHTML = evt.feature.get('type') + ': ' + evt.feature.get('name');
    //         featureadded = true;
    //         // source.once('addfeature', function(evt) {
    //         //     var parser = new ol.format.GeoJSON();
    //         //     var features = source.getFeatures();
    //         //     var featuresGeoJSON = parser.writeFeatures(features, {
    //         //         featureProjection: 'EPSG:3857',
    //         //     });
    //         //     console.log(featuresGeoJSON)
    //         //     $.ajax({
    //         //         url: 'test_project/features.geojson', // what about aor?
    //         //         type: 'POST',
    //         //         data: featuresGeoJSON
    //         //     }).then(function(response) {
    //         //         console.log(response);
    //         //     });
    //         // });
    //         $(document).off('keyup')
    //     });
    // };

    /*********** SELECT ************/
    // var featureadded = false;
    // var select = new ol.interaction.Select({
    //     layers: [featureOverlay],
    //     toggleCondition: ol.events.condition.never,
    //     /*condition: function(evt) {
    //         if (ol.events.condition.singleClick(evt) || ol.events.condition.doubleClick(evt)) {
    //             if (featureadded) {
    //                 featureadded = false;
    //                 return false;
    //             };
    //             return true;
    //         };
    //     },*/
    //     style: new ol.style.Style({
    //         stroke: new ol.style.Stroke({
    //             color: 'rgba(255, 255, 255, 1)',
    //             width: 4
    //         }),
    //         fill: new ol.style.Fill({
    //             color: 'rgba(255, 255, 255, 0.1)'
    //         })
    //     })
    // });
    // map.addInteraction(select);
    // select.setActive(true);
    // map.on('pointermove', hoverDisplay);
    //
    // select.on('select', function(evt) {
    //     var info = document.getElementById('info');
    //     var feature;
    //     // Handle deselect first so we can update the feature in the python code.
    //     if (evt.deselected.length == 1) {
    //         feature = evt.deselected[0]
    //         // info.innerHTML = '&nbsp;';
    //         modify.setActive(false);
    //         //translate.setActive(false);
    //         $('#drawhole').prop('disabled', true);
    //         console.log('deselect:', feature.get('name'), feature.getRevision());
    //     }
    //     if (evt.selected.length == 1) {
    //         feature = evt.selected[0]
    //         // info.innerHTML = feature.get('type') + ': ' + feature.get('name');
    //         modify.setActive(true);
    //         //translate.setActive(true);
    //         geom = feature.getGeometry()
    //         if (geom instanceof ol.geom.Polygon || geom instanceof ol.geom.MultiPolygon) {
    //             $('#drawhole').prop('disabled', false);
    //         } else {
    //             $('#drawhole').prop('disabled', true);
    //         }
    //         console.log('select:    ', feature.get('name'), feature.getRevision())
    //     }
    // });

    /*********** MODIFY ************/
    // var modify = new ol.interaction.Modify({
    //     features: select.getFeatures()
    // });
    // map.addInteraction(modify);
    // modify.setActive(false);

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

    /*********** REMOVE ************/
    // var keyDown = function(evt) {
    //     console.log(evt.keyCode);
    //     if (exists(highlight) && evt.keyCode == 46) { //delete key pressed
    //         vector.getSource().removeFeature(highlight);
    //         featureOverlay.getSource().removeFeature(highlight);
    //         highlight = undefined;
    //     }
    // };
    // document.addEventListener('keydown', keyDown, false);

    /********** DRAW HOLE **********/
    // var holeStyle = [
    //     new ol.style.Style({
    //         stroke: new ol.style.Stroke({
    //             color: 'rgba(0, 0, 0, 0.8)',
    //             lineDash: [10, 10],
    //             width: 3
    //         }),
    //         fill: new ol.style.Fill({
    //             color: 'rgba(255, 255, 255, 0)'
    //         })
    //     }),
    //     new ol.style.Style({
    //         image: new ol.style.RegularShape({
    //             fill: new ol.style.Fill({
    //                 color: 'rgba(255, 0, 0, 0.5)'
    //             }),
    //             stroke: new ol.style.Stroke({
    //                 color: 'black',
    //                 width: 1
    //             }),
    //             points: 4,
    //             radius: 6,
    //             angle: Math.PI / 4
    //         })
    //     })
    // ];
    //
    // document.getElementById('drawhole').onclick = function() {
    //     var selFeat = select.getFeatures();
    //     // Clone and original selected geometry so we can test new vertex points against it in the geometryFunction.
    //     var selFeatGeom = selFeat.getArray()[0].getGeometry().clone();
    //     var geomTypeSelected = selFeat.getArray()[0].getGeometry().getType();
    //     if (geomTypeSelected != "Polygon") {
    //     // if (geomTypeSelected.search("Polygon") < 0) {
    //         alert("Only Polygon (or MultiPolygon) geometry selections. Not " + geomTypeSelected);
    //         return;
    //     }
    //
    //     var isMultiPolygon = geomTypeSelected == "MultiPolygon";
    //     var vertsCouter = 0; //this is the number of vertices drawn on the ol.interaction.Draw(used in the geometryFunction)
    //
    //     //create a hole draw interaction
    //     source = new ol.source.Vector()
    //     var holeDraw = new ol.interaction.Draw({
    //         source: source,
    //         type: 'Polygon',
    //         style: holeStyle,
    //         //add the geometry function in order to disable hole creation outside selected polygon
    //         geometryFunction: function(coords, geom) {
    //             var retGeom; //define the geometry to return
    //             if (typeof(geom) !== 'undefined') { //if it is defined, set its coordinates
    //                 geom.setCoordinates(coords);
    //             } else {
    //                 retGeom = new ol.geom.Polygon(coords);
    //             }
    //             if (coords[0].length > vertsCouter) { //this is the case where new vertex has been drawn
    //                 //check if vertex drawn is within the "original" selected polygon
    //                 var isIn = isPointInPoly(selFeatGeom, coords[0][coords[0].length - 1]);
    //                 //if outside get rid of it
    //                 if (isIn !== true) {
    //                     coords[0].pop(); //remove the last coordinate element
    //                     retGeom = new ol.geom.Polygon(coords); //reconstruct the geometry
    //                 }
    //                 vertsCouter = coords[0].length; //reset the length of vertex counter
    //             }
    //             return retGeom;
    //         }
    //     });
    //
    //     map.un('pointermove', hoverDisplay);
    //     select.setActive(false);
    //     modify.setActive(false);
    //     map.addInteraction(holeDraw);
    //
    //     holeDraw.on('drawstart', function(evt) {
    //         var feature = evt.feature; // the hole feature
    //         var ringAdded = false; //init boolen var to clarify whether drawn hole has already been added or not
    //         //set the change feature listener so we get the hole like visual effect
    //         feature.on('change', function(e) {
    //             //get draw hole feature geometry
    //             var drawCoords = feature.getGeometry().getCoordinates(false)[0];
    //             //if hole has more than two cordinate pairs, add the interior ring to feature
    //             if (drawCoords.length > 2) {
    //                 //if interior ring has not been added yet, append it and set it as true
    //                 if (ringAdded === false) {
    //                     selFeat.getArray()[0].getGeometry().appendLinearRing(
    //                         new ol.geom.LinearRing(feature.getGeometry().getCoordinates(false)[0]));
    //                     ringAdded = true;
    //                 } else { //if interior ring has already been added we need to remove it and add back the updated one
    //                     var setCoords = selFeat.getArray()[0].getGeometry().getCoordinates();
    //                     setCoords.pop(); //pop the dirty hole
    //                     setCoords.push(feature.getGeometry().getCoordinates(false)[0]); //push the updated hole
    //                     selFeat.getArray()[0].getGeometry().setCoordinates(setCoords); //update selFeat with new geometry
    //                 }
    //             }
    //         });
    //     });
    //
    //     $(document).on('keyup', function(evt) {
    //         if (evt.keyCode == 189 || evt.keyCode == 109) {
    //             holeDraw.removeLastPoint();
    //         } else if (evt.keyCode == 27) {
    //             selFeat.getArray()[0].getGeometry().setCoordinates(selFeatGeom.getCoordinates());
    //             map.removeInteraction(holeDraw);
    //             select.setActive(true);
    //             //modify.setActive(true);
    //             //translate.setActive(true);
    //             //$('#drawhole').prop('disabled', false);
    //             map.on('pointermove', hoverDisplay);
    //             $(document).off('keyup')
    //         }
    //     });
    //
    //     //create a listener when finish drawing and so remove the hole interaction
    //     holeDraw.on('drawend', function(evt) {
    //
    //         var rings = selFeat.getArray()[0].getGeometry().getCoordinates();
    //         holecoords = rings.pop();
    //
    //         if (doesPolyCoverHole(selFeatGeom, holecoords)) {
    //             source.once('addfeature', function(e) {
    //                 var featuresGeoJSON = new ol.format.GeoJSON().writeFeatures(
    //                     selFeat.getArray(), {
    //                         featureProjection: 'EPSG:3857'
    //                     }
    //                 );
    //                 console.log(featuresGeoJSON)
    //             })
    //         } else {
    //             selFeat.getArray()[0].getGeometry().setCoordinates(rings);
    //         };
    //
    //         map.removeInteraction(holeDraw);
    //         //reinitialise modify interaction. If you don't do that, holes may not be modifed
    //         modify.setActive(true);
    //         /*map.removeInteraction(modify);
    //         modify = new ol.interaction.Modify({
    //             features: selFeat
    //         });
    //         map.addInteraction(modify);
    //         */
    //         select.setActive(true);
    //         map.on('pointermove', hoverDisplay);
    //         $(document).off('keyup')
    //     })
    // };

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
    // loadProject.onclick = function(e) {
    //
    //     map.removeLayer(featureOverlay);
    //     map.removeLayer(projectGroup);
    //
    //     var bounds = [-105.54833333333333, 39.76361111111111, -105.52694444444444, 39.778055555555554];
    //
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
    //     vector_aor = new ol.layer.Vector({
    //         title: 'AOR',
    //         type: 'overlay',
    //         source: new ol.source.Vector({
    //             url: 'test_project/aor.geojson',
    //             format: new ol.format.GeoJSON()
    //         }),
    //         style: tobjectsStyleFunction
    //     });
    //     vector = new ol.layer.Vector({
    //         title: 'tobjects',
    //         type: 'overlay',
    //         source: new ol.source.Vector({
    //             url: 'test_project/tobjects.geojson',
    //             format: new ol.format.GeoJSON()
    //         }),
    //         style: tobjectsStyleFunction
    //     });
    //     projectGroup = new ol.layer.Group({
    //         title: 'Project',
    //         layers: [
    //             image,
    //             vector_aor,
    //             vector
    //         ]
    //     });
    //
    //     map.addLayer(projectGroup);
    //     map.addLayer(featureOverlay);
    //
    //     // Need to add in auto-zoom-in functionality here.
    //
    //     vector_aor.getSource().on('change', function(evt) {
    //         var source = evt.target;
    //         if (source.getState() === 'ready') {
    //             view.setCenter(ol.extent.getCenter(source.getExtent()));
    //         };
    //     });
    // }

    /******* LAYER SWITCHER ********/
    var layerSwitcher = new ol.control.LayerSwitcher();
    map.addControl(layerSwitcher);

    /********** SCALELINE **********/
    var scaleLineControl = new ol.control.ScaleLine({
        // className: 'ol-scale-line ol-scale-line-inner text-stroke',
    });
    map.addControl(scaleLineControl);

    var unitsSelect = $('#units');
    unitsSelect.on('change', function() {
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
    projectionSelect.on('change', function() {
        mouseProjection = ol.proj.get(this.value);
        mousePositionControl.setProjection(mouseProjection);

    });
    projectionSelect.val(mousePositionControl.getProjection().getCode());

    var mousePositionControl2 = new ol.control.MousePosition({
        coordinateFormat: function (coordinates) {
            var zoom = view.getZoom();
            var xytile = deg2tile(coordinates[0], coordinates[1], zoom);
            return "Tile: [Z: "+zoom+"  X: "+xytile[0]+"  Y: "+xytile[1]+"]";
        },
        projection: 'EPSG:4326',
        target: 'tile'
    });
    map.addControl(mousePositionControl2);

    /**
     * TODO: Need to integrate the opacity sliders from this code into the layerswitcher code.
     * See http://openlayers.org/en/v3.13.0/examples/layer-group.html?q=mapquest

    function bindInputs(layerid, layer) {
        var visibilityInput = $(layerid + ' input.visible');
        visibilityInput.on('change', function() {
            layer.setVisible(this.checked);
        });
        visibilityInput.prop('checked', layer.getVisible());

        var opacityInput = $(layerid + ' input.opacity');
        opacityInput.on('input change', function() {
            layer.setOpacity(parseFloat(this.value));
        });
        opacityInput.val(String(layer.getOpacity()));
    }
    map.getLayers().forEach(function(layer, i) {
        bindInputs('#layer' + i, layer);
        if (layer instanceof ol.layer.Group) {
            layer.getLayers().forEach(function(sublayer, j) {
                bindInputs('#layer' + i + j, sublayer);
            });
        }
    });
    **/
}
document.addEventListener('DOMContentLoaded', init);
