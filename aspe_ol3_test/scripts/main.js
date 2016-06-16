String.prototype.capitalizeFirstLetter = function(flip) {
    if (flip) {
        return this.charAt(0).toLowerCase() + this.slice(1);
    } else {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
};
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
var deg2tile = function (lon_deg, lat_deg, zoom) {
    var lat_rad = toRad(lat_deg);
    var n = Math.pow(2, zoom);
    var xtile = toInt(mod((lon_deg + 180.0) / 360.0, 1) * n);
    var ytile = toInt((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n);
    return [xtile, ytile]
};
var FID = (function () {
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
        setSeed: function (val) {
            z = seed = exists(val) ? val : Math.round(Math.random() * m);
        },
        getSeed: function () {
            return seed;
        },
        gen: function () {
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
function isPolyValid(poly) {
    var geom = new jsts.io.GeoJSONReader().read(
        new ol.format.GeoJSON().writeFeatureObject(
            new ol.Feature({
                geometry: poly
            })
        )
    ).geometry;
    return geom.isValid();
}
function getJSTSgeom(origGeom) {
    var geom = new jsts.io.GeoJSONReader().read(
        new ol.format.GeoJSON().writeFeatureObject(
            new ol.Feature({
                geometry: origGeom
            })
        )
    ).geometry;
    return geom;
}

var defaultFeatureProperties = {
    'aor': {
        'geometry_type': 'Polygon',
        // 'subtype': null,
        // 'height': null,
        // 'thickness': null,
        'color': [0, 0, 0]},
    'building': {
        'geometry_type': 'Polygon',
        'subtype': ['metal', 'glass'],
        'height': 10,
        // 'thickness': null,
        'color': [128, 128, 128]},
    'herbage': {
        'geometry_type': 'Polygon',
        'subtype': ['dense', 'sparse'],
        'height': 10,
        // 'thickness': null,
        'color': [0, 200, 0]},
    'water': {
        'geometry_type': 'Polygon',
        'subtype': ['warm', 'cool', 'frozen'],
        // 'height': null,
        // 'thickness': null,
        'color': [0, 0, 200]},
    'wall': {
        'geometry_type': 'LineString',
        'subtype': ['metal', 'stone'],
        'height': 10,
        'thickness': 10,
        'color': [64, 64, 64]},
    'road': {
        'geometry_type': 'LineString',
        'subtype': ['cement', 'gravel', 'dirt'],
        // 'height': null,
        'thickness': 10,
        'color': [192, 51, 52]},
    'generic': {
        // 'geometry_type': null,
        // 'subtype': null,
        // 'height': null,
        // 'thickness': null,
        'color': [218, 188, 163]}
};

var featureGeomTypes = {
    'AOR': 'Polygon',
    'Building': 'Polygon',
    'Herbage': 'Polygon',
    'Water': 'Polygon',
    'Wall': 'LineString',
    'Road': 'LineString',
    'Generic': null
};
var featureSubTypes = {
    'AOR': null,
    'Building': ['metal', 'glass'],
    'Herbage': ['dense', 'sparse'],
    'Water': ['warm', 'cool', 'frozen'],
    'Wall': ['metal', 'stone'],
    'Road': ['cement', 'gravel', 'dirt'],
    'Generic': null
};
var featureHeights = {
    'AOR': null,
    'Building': 10,
    'Herbage': 10,
    'Water': null,
    'Wall': 10,
    'Road': null,
    'Generic': null
};
var featureThickness = {
    'AOR': null,
    'Building': null,
    'Herbage': null,
    'Water': null,
    'Wall': 10,
    'Road': 10,
    'Generic': null
};
var featureColors = {
    'AOR': [0, 0, 0],
    'Building': [128, 128, 128],
    'Herbage': [0, 200, 0],
    'Water': [0, 0, 200],
    'Wall': [64, 64, 64],
    'Road': [192, 51, 52],
    'Generic': [218, 188, 163]
};
var fillOpacity = {
    'Polygon': 0.1,
    'LineString': 0,
    'Point': 0,
    'MultiPolygon': 0.1,
    'MultiLineString': 0,
    'MultiPoint': 0
};

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
        this.idCounter = 0;
        this.selectedLayer = null;
        this.selectEventEmitter = new ol.Observable();
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
layerTree.prototype.createRegistry = function (layer, buffer) {
    layer.set('id', 'layer_' + this.idCounter);
    this.idCounter += 1;
    var _this = this;

    var layerDiv = document.createElement('div');
    layerDiv.className = buffer ? 'layer ol-unselectable buffering' : 'layer ol-unselectable';
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

    var layerSpan = document.createElement('span');
    layerSpan.textContent = layerDiv.title;
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

    layerDiv.appendChild(this.addSelectEvent(layerSpan, true));

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
            strategy: ol.loadingstrategy.bbox,
            style: this.tobjectsStyleFunction
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
        type: type,
        style: this.tobjectsStyleFunction
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
                randomColor = this.randomHexColor();
                // randomColor = color.get(true, 0.8);
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
layerTree.prototype.randomHexColor = function () {
    var num = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + String.prototype.repeat.call('0', 6 - num.length) + num;
};
layerTree.prototype.tobjectsStyleFunction = (function () {
    var setStyle = function (color, opacity) {
        var style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: color.concat(1),
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: color.concat(0.6)
                })
            }),
            stroke: new ol.style.Stroke({
                color: color.concat(1),
                width: 3
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
        if (exists(feature.get('type'))) {
            color = defaultFeatureProperties[feature.get('type')]['color'];
        } else {
            color = [255, 0, 0];
        }
        if (feature.get('type') === 'aor') {
            opacity = 0
        } else {
            opacity = fillOpacity[feature.getGeometry().getType()];
            opacity = opacity ? opacity : 0;
        }

        return setStyle(color, opacity);
    };
})();

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
    controlButton.title = 'Add '+options.feature_type || 'Custom interaction';
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

    var interaction = options.interaction;

    this.setProperties({
        interaction: interaction,
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
        this.bitA = 0;
        this.bitB = 0;
        this.activeControl = undefined;
        this.active = false;
        this.controlEventEmitter = new ol.Observable();
        this.addedFeature = null;
    } else {
        throw new Error('Invalid parameter(s) provided.');
    }
};
toolBar.prototype.addControl = function (control) {
    if (!(control instanceof ol.control.Control)) {
        throw new Error('Only controls can be added to the toolbar.');
    }
    if (control.get('button_type') === 'radio') {
        control.on('change:active', function () {
            if (!(this.bitA | this.bitB)) {
                this.activeControl = control;
                this.active = true;
                this.controlEventEmitter.changed()
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
        feature_type: 'generic',
        geometry_type: 'Point',
        className: 'ol-addpoint ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'Point'}), 'generic')
    }).setDisabled(true);
    this.drawControls.push(drawPoint);
    var drawLine = new ol.control.Interaction({
        label: ' ',
        feature_type: 'generic',
        geometry_type: 'LineString',
        className: 'ol-addline ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'LineString'}), 'generic')
    }).setDisabled(true);
    this.drawControls.push(drawLine);
    var drawPolygon = new ol.control.Interaction({
        label: ' ',
        feature_type: 'generic',
        geometry_type: 'Polygon',
        className: 'ol-addpolygon ol-unselectable ol-control',
        interaction: this.handleEvents(new ol.interaction.Draw({type: 'Polygon'}), 'generic')
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
toolBar.prototype.handleEvents = function (interaction, feature_type) {

    interaction.on('drawend', function (evt) {
        geom = evt.feature.getGeometry();
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
            var selectedLayer = this.layertree.getLayerById(this.layertree.selectedLayer.id);
            selectedLayer.getSource().addFeature(evt.feature);
            this.activeFeatures.push(evt.feature);

            // transactWFS('insert', evt.feature);
            this.addedFeature = evt.feature;
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
        this.activeControl.set('active', false);
    }, this);
    return interaction;
};

// var featureEditor = function (options) {
//     'use strict';
//     if (!(this instanceof featureEditor)) {
//         throw new Error('featureEditor must be constructed with the new keyword.');
//     } else if (typeof options === 'object' && options.target) {
//         this.featureeditor = document.getElementById(options.target);
//         this.featureeditor.className = 'featureeditor';
//     } else {
//         throw new Error('Invalid parameter(s) provided.');
//     }
// };
// featureEditor.prototype.createForm = function (options) {
//
//     var form = document.createElement('form');
//     form.id = 'featureproperties';
//     form.style.display = 'none';
//
//     var p_2 = this.addLayerGeometry();
//     form.appendChild( p_2 );
//
//     var table = document.createElement('table');
//
//     var tr = document.createElement('tr');
//     var td_1 = document.createElement('td');
//     td_1.appendChild(document.createTextNode("Geometry type:"));
//     tr.appendChild(td_1);
//     var td_2 = document.createElement('td');
//     var geometryType = document.createElement('input');
//     geometryType.name = "geometry_type";
//     geometryType.type = "text";
//     geometryType.required = true;
//     td_2.appendChild(geometryType);
//     tr.appendChild(td_2);
//     table.appendChild(tr);
//
//     // table.appendChild(this.addGeometryType());
//     table.appendChild(this.addName());
//     table.appendChild(this.addDrawHoleButton());
//     table.appendChild(this.addDeleteHoleButton());
//     table.appendChild(this.addFeatureType());
//     table.appendChild(this.addSubType());
//     table.appendChild(this.addHeight());
//     table.appendChild(this.addThickness());
//     // TODO: Add length (perimeter)
//     // table.appendChild(this.addLength(geometry_type));
//     // TODO: Add area
//     // table.appendChild(this.addArea(geometry_type));
//
//     form.appendChild( table );
//     this.featureeditor.appendChild(form);
//     return this;
// };
// featureEditor.prototype.createOption = function (optionValue) {
//     var option = document.createElement('option');
//     option.value = optionValue;
//     option.textContent = optionValue;
//     return option;
// };
// featureEditor.prototype.removeContent = function (element) {
//     while (element.firstChild) {
//         element.removeChild(element.firstChild);
//     }
//     return this;
// };
// featureEditor.prototype.stopPropagationOnEvent = function (node, event) {
//     node.addEventListener(event, function (evt) {
//         evt.stopPropagation();
//     });
//     return node;
// };
// featureEditor.prototype.addLayerGeometry = function () {
//     // readonly
//     var p = document.createElement('p');
//     p.appendChild( document.createTextNode("layer Geometry:") );
//     return p
// };
// featureEditor.prototype.createLabel = function (label) {
//     var td = document.createElement('td');
//     var l = document.createTextNode(label);
//     td.appendChild(l);
//     return td;
// };
// featureEditor.prototype.createInput = function (name, type) {
//     var td = document.createElement('td');
//     var element = document.createElement('input');
//     element.name = name;
//     element.type = type;
//     element.required = true;
//     td.appendChild(element);
//     return td;
// };
// featureEditor.prototype.createButton = function (name1, name2) {
//     var td = document.createElement('td');
//     var element = document.createElement('input');
//     element.value = name1 + " " + name2;
//     element.title = name1 + " a " + name2;
//     element.name = name1 + name2;
//     element.className = name1 + name2;
//     element.type = "button";
//     element.id = name1 + name2;
//     td.appendChild(element);
//     return td;
// };
// featureEditor.prototype.createButton2 = function (elemName, elemTitle, elemType, layer) {
//     var td = document.createElement('td');
//     var buttonElem = document.createElement('input');
//     buttonElem.type = "button";
//     buttonElem.name = elemName;
//     buttonElem.className = elemName;
//     buttonElem.title = elemTitle;
//     buttonElem.textContent = elemTitle;
//     var _this = this;
//
//     switch (elemType) {
//         case 'drawhole':
//             buttonElem.addEventListener('click', function () {
//                 _this.drawHole();
//             });
//             td.appendChild(buttonElem);
//             return td;
//         case 'deletehole':
//             buttonElem.addEventListener('click', function () {
//                 _this.deleteHole();
//             });
//             td.appendChild(buttonElem);
//             return td;
//         default:
//             return false;
//     }
// };
// featureEditor.prototype.createMenu = function (name, id) {
//     var td = document.createElement('td');
//     var element = document.createElement('select');
//     element.name = name;
//     element.type = "text";
//     element.id = id;
//     td.appendChild(element);
//     return td;
// };
// // featureEditor.prototype.addGeometryType = function () {
// //     var tr = document.createElement('tr');
// //
// //     var td_1 = document.createElement('td').appendChild(document.createTextNode("Geometry type:"));
// //     tr.appendChild(td_1);
// //
// //     var td_2 = document.createElement('td');
// //     var geometryType = document.createElement('input');
// //     geometryType.name = "geometry_type";
// //     geometryType.type = "text";
// //     geometryType.required = true;
// //     td_2.appendChild(geometryType);
// //
// //
// //     tr.appendChild(td_2);
// //     return tr;
// // };
// // featureEditor.prototype.addGeometryType = function () {
// //     var tr = document.createElement('tr');
// //     tr.appendChild(this.createLabel("Geometry type:"));
// //     tr.appendChild(this.createInput("geometry_type", "text"));
// //     return tr;
// // };
// featureEditor.prototype.addName = function () {
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Name:"));
//     tr.appendChild(this.createInput("name", "text"));
//     return tr;
// };
// featureEditor.prototype.addDrawHoleButton = function () {
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Draw:"));
//     // tr.appendChild(this.createButton("draw", "hole"));
//     tr.appendChild(this.createButton2("drawhole", "Draw Hole", "drawhole"));
//     // tr.appendChild(this.stopPropagationOnEvent(this.createButton("draw", "hole"), 'click'));
//     return tr;
// };
// featureEditor.prototype.addDeleteHoleButton = function () {
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Delete:"));
//     // tr.appendChild(this.createButton("delete", "hole"));
//     tr.appendChild(this.createButton2("deletehole", "Delete Hole", "deletehole"));
//     // tr.appendChild(this.stopPropagationOnEvent(this.createButton("delete", "hole"), 'click'));
//     return tr;
// };
// featureEditor.prototype.addFeatureType = function () {
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Feature type:"));
//     tr.appendChild(this.createMenu("feature_type", "feature-type"));
//     // tr.appendChild(this.stopPropagationOnEvent(this.createMenu("feature_type", "feature-type"), 'click'));
//     return tr;
// };
// featureEditor.prototype.addSubType = function () {
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Sub type:"));
//     tr.appendChild(this.createMenu("subtype", ""));
//     return tr;
// };
// featureEditor.prototype.addSliderElement = function (name) {
//
//     var td = document.createElement('td');
//     var slider = document.createElement('input');
//     slider.name = name;
//     slider.type = 'range';
//     slider.min = 0;
//     slider.max = 1;
//     slider.step = 0.1;
//     slider.value = layer.getOpacity();
//     slider.addEventListener('input', function () {
//         layer.setOpacity(this.value);
//     });
//     slider.addEventListener('change', function () {
//         layer.setOpacity(this.value);
//     });
//     // td.appendChild(this.stopPropagationOnEvent(slider, 'click'));
//     td.appendChild(slider);
//     return td;
// };
// featureEditor.prototype.addHeight = function () {
//     // add slider.
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Height:"));
//     tr.appendChild(this.createInput("height", "number"));
//     return tr;
// };
// featureEditor.prototype.addThickness = function () {
//     // add slider
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Thickness:"));
//     tr.appendChild(this.createInput("thickness", "number"));
//     return tr;
// };
// featureEditor.prototype.addCoordsLat = function () {
//     // readonly
//     // only for Points (not MultiPoints)
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Lat:"));
//     tr.appendChild(this.createInput("lattitude", "number"));
//     return tr;
// };
// featureEditor.prototype.addCoordsLon = function () {
//     // readonly
//     // only for Points (not MultiPoints)
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Lon:"));
//     tr.appendChild(this.createInput("longitude", "number"));
//     return tr;
// };
// featureEditor.prototype.addLength = function () {
//     // readonly
//     // only for Lines and LineStrings
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Length:"));
//     tr.appendChild(this.createInput("length", "text"));
//     return tr;
// };
// featureEditor.prototype.addArea = function () {
//     // readonly
//     // only for Polygons and MultiPolygons
//     var tr = document.createElement('tr');
//     tr.appendChild(this.createLabel("Area:"));
//     tr.appendChild(this.createInput("area", "text"));
//     return tr;
// };

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

var featureInteractor = function (options) {
    'use strict';
    if (!(this instanceof featureInteractor)) {
        throw new Error('interactor must be constructed with the new keyword.');
    } else if (typeof options === 'object' && options.map && options.layertree && options.toolbar && options.target) {
        if (!(options.map instanceof ol.Map)) {
            throw new Error('Please provide a valid OpenLayers 3 map object.');
        }
        this.map = options.map;
        this.layertree = options.layertree;
        this.toolbar = options.toolbar;
        // this.form = options.form;
        this.createForm({target: options.target});
        // this.form = new featureEditor({'target': 'featureeditor'})
        // this.form.createForm();
        // this.form = new featureEditor({'target': 'featureeditor'}).createForm();
        this.wgs84Sphere = new ol.Sphere(6378137);
        this.highlight = undefined;
        var _this = this;

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

        this.autoselect = false;

    } else {
        throw new Error('Invalid parameter(s) provided.');
    }
};

featureInteractor.prototype.createOption = function (optionValue) {
    var option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    return option;
};
featureInteractor.prototype.removeContent = function (element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    return this;
};
featureInteractor.prototype.stopPropagationOnEvent = function (node, event) {
    node.addEventListener(event, function (evt) {
        evt.stopPropagation();
    });
    return node;
};

featureInteractor.prototype.createForm = function (options) {

    var _this = this;
    var featureeditor = document.getElementById(options.target);
    featureeditor.className = 'featureeditor';

    var form = document.createElement('form');
    form.id = 'featureproperties';
    form.style.display = 'none';

    form.appendChild(this.addLayerGeometry());

    var rowElem = document.createElement('div');
    var attributeSpan = document.createElement('span');
    attributeSpan.textContent = 'Geometry type: ';
    rowElem.appendChild(attributeSpan);
    var geometryType = document.createElement('div');
    geometryType.id = "geometry-type";
    rowElem.appendChild(geometryType);
    form.appendChild(rowElem);

    var rowElem = document.createElement('div');
    var attributeSpan = document.createElement('span');
    attributeSpan.id = 'measure-label';
    attributeSpan.textContent = 'Measure: ';
    rowElem.appendChild(attributeSpan);
    var measure = document.createElement('div');
    measure.id = 'measure-feature';
    rowElem.appendChild(measure);
    form.appendChild(rowElem);

    var rowElem = document.createElement('div');
    var attributeSpan = document.createElement('span');
    attributeSpan.textContent = 'Name: ';
    rowElem.appendChild(attributeSpan);
    var featureName = document.createElement('input');
    featureName.id = "feature-name";
    featureName.type = "text";
    rowElem.appendChild(featureName);
    form.appendChild(rowElem);

    var rowElem = document.createElement('div');
    var attributeSpan = document.createElement('span');
    attributeSpan.textContent = 'Hole: ';
    rowElem.appendChild(attributeSpan);
    rowElem.appendChild(this.createHoleButton("draw"));
    rowElem.appendChild(this.createHoleButton("delete"));
    form.appendChild(rowElem);

    var rowElem = document.createElement('div');
    var attributeSpan = document.createElement('span');
    attributeSpan.textContent = 'Feature type:';
    rowElem.appendChild(attributeSpan);
    var featureType = document.createElement('select');
    featureType.id = "feature-type";
    featureType.addEventListener('change', function () {
        _this.loadFeature(this.value);
    });

    rowElem.appendChild(featureType);
    form.appendChild(rowElem);

    var rowElem = document.createElement('div');
    var attributeSpan = document.createElement('span');
    attributeSpan.textContent = 'Sub Type: ';
    rowElem.appendChild(attributeSpan);
    var subType = document.createElement('select');
    subType.id = "sub-type";
    rowElem.appendChild(subType);
    form.appendChild(rowElem);

    var rowElem = document.createElement('div');
    var attributeSpan = document.createElement('span');
    attributeSpan.textContent = 'Height: ';
    rowElem.appendChild(attributeSpan);
    var heightSlider = document.createElement('div');
    heightSlider.id = 'height-slider';
    noUiSlider.create(heightSlider, {
        start: null,
        margin: 20,
        connect: 'lower',
        behaviour: 'tap',
        range: {'min': 0, 'max': 100}
    });

    var heightInput = document.createElement('input');
    heightInput.id = 'height-input';
    heightInput.type = 'number';
    rowElem.appendChild(heightInput);
    form.appendChild(rowElem);

    // When the slider value changes, update the input and span
    heightSlider.noUiSlider.on('update', function( values, handle ) {
        heightInput.value = values[handle];
    });
    // When the input changes, set the slider value
    heightInput.addEventListener('change', function(){
        heightSlider.noUiSlider.set(this.value);
    });

    var rowElem = document.createElement('div');
    rowElem.appendChild(heightSlider);
    form.appendChild(rowElem);

    

    var rowElem = document.createElement('div');
    var attributeSpan = document.createElement('span');
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
    thicknessInput.id = 'thickness-input';
    thicknessInput.type = "number";
    rowElem.appendChild(thicknessInput);
    form.appendChild(rowElem);

    // When the slider value changes, update the input and span
    thicknessSlider.noUiSlider.on('update', function( values, handle ) {
        thicknessInput.value = values[handle];
    });
    // When the input changes, set the slider value
    thicknessInput.addEventListener('change', function(){
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

featureInteractor.prototype.createLabel = function (label) {
    var td = document.createElement('td');
    var l = document.createTextNode(label);
    td.appendChild(l);
    return td;
};
featureInteractor.prototype.createInput = function (name, type) {
    var td = document.createElement('td');
    var element = document.createElement('input');
    element.name = name;
    element.type = type;
    element.required = true;
    td.appendChild(element);
    return td;
};
featureInteractor.prototype.createHoleButton = function (label) {
    var buttonElem = document.createElement('input');
    buttonElem.id = label + '-hole';
    buttonElem.type = "button";
    buttonElem.value = label.capitalizeFirstLetter();
    var _this = this;

    switch (label) {
        case 'draw':
            buttonElem.title = 'Draw a hole in the selected feature';
            buttonElem.addEventListener('click', function () {
                _this.drawHole();
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
featureInteractor.prototype.createMenu = function (name, id) {
    var td = document.createElement('td');
    var element = document.createElement('select');
    element.name = name;
    element.type = "text";
    element.id = id;
    td.appendChild(element);
    return td;
};

featureInteractor.prototype.addLayerGeometry = function () {
    // readonly
    var p = document.createElement('p');
    p.appendChild(document.createTextNode("layer Geometry:"));
    return p
};
featureInteractor.prototype.addGeometryType = function () {
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Geometry type:"));
    tr.appendChild(this.createInput("geometry_type", "text"));
    return tr;
};
featureInteractor.prototype.addName = function () {
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Name:"));
    tr.appendChild(this.createInput("name", "text"));
    return tr;
};
featureInteractor.prototype.addDrawHoleButton = function () {
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Draw:"));
    // tr.appendChild(this.createButton("draw", "hole"));
    tr.appendChild(this.createButton2("drawhole", "Draw Hole", "drawhole"));
    return tr;
};
featureInteractor.prototype.addDeleteHoleButton = function () {
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Delete:"));
    // tr.appendChild(this.createButton("delete", "hole"));
    tr.appendChild(this.createButton2("deletehole", "Delete Hole", "deletehole"));
    return tr;
};
featureInteractor.prototype.addFeatureType = function () {
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Feature type:"));
    tr.appendChild(this.createMenu("feature_type", "feature-type"));
    return tr;
};
featureInteractor.prototype.addSubType = function () {
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Sub type:"));
    tr.appendChild(this.createMenu("subtype", ""));
    return tr;
};
featureInteractor.prototype.addHeight = function () {
    // add slider.
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Height:"));
    tr.appendChild(this.createInput("height", "number"));
    return tr;
};
featureInteractor.prototype.addThickness = function () {
    // add slider
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Thickness:"));
    tr.appendChild(this.createInput("thickness", "number"));
    return tr;
};
featureInteractor.prototype.addCoordsLat = function () {
    // readonly
    // only for Points (not MultiPoints)
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Lat:"));
    tr.appendChild(this.createInput("lattitude", "number"));
    return tr;
};
featureInteractor.prototype.addCoordsLon = function () {
    // readonly
    // only for Points (not MultiPoints)
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Lon:"));
    tr.appendChild(this.createInput("longitude", "number"));
    return tr;
};
featureInteractor.prototype.addLength = function () {
    // readonly
    // only for Lines and LineStrings
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Length:"));
    tr.appendChild(this.createInput("length", "text"));
    return tr;
};
featureInteractor.prototype.addArea = function () {
    // readonly
    // only for Polygons and MultiPolygons
    var tr = document.createElement('tr');
    tr.appendChild(this.createLabel("Area:"));
    tr.appendChild(this.createInput("area", "text"));
    return tr;
};

featureInteractor.prototype.drawHole = function () {
    var holeStyle = [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.8)',
                lineDash: [10, 10],
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

    // var currColl = this.select.getFeatures();
    var currFeat = this.select.getFeatures().getArray()[0];
    var geomTypeSelected = currFeat.getGeometry().getType();
    // Clone and original selected geometry so we can test new vertex points against it in the geometryFunction.
    var origGeom = currFeat.getGeometry().clone();
    var currGeom = null;
    var isMultiPolygon = false;
    if (!(geomTypeSelected.endsWith("Polygon"))) {
        alert("Only Polygon and MultiPolygon geometries can have holes. Not " + geomTypeSelected);
        return;
    }
    if (geomTypeSelected === 'MultiPolygon') {
        var origGeomMP = null;
        var currGeomMP = null;
        isMultiPolygon = true;
        var pickPoly = function (feature) {
            var points = feature.getGeometry().getCoordinates(false)[0];
            var polygons = origGeomMP.getPolygons();
            for (var i = 0; i < polygons.length; i++) {
                if (isPointInPoly(polygons[i], points[0])) {
                    currGeom = origGeomMP.getPolygon(i);
                    origGeom = currGeom.clone();
                } else {
                    if (currGeomMP == null) {
                        currGeomMP = new ol.geom.MultiPolygon([polygons[i].getCoordinates()])
                    } else {
                        currGeomMP.appendPolygon(polygons[i])
                    }
                }
            }
        }
    }

    var vertsCouter = 0; //this is the number of vertices drawn on the ol.interaction.Draw(used in the geometryFunction)
    var hasStarted = false;

    //create a hole draw interaction
    var source = new ol.source.Vector();
    var holeDraw = new ol.interaction.Draw({
        source: source,
        type: 'Polygon',
        style: holeStyle,
        //add the geometry function in order to disable hole creation outside selected polygon
        geometryFunction: function (coords, geom) {
            var retGeom; //define the geometry to return
            if (coords[0].length > vertsCouter) { //check if the new vertex drawn is within the "original" selected polygon
                var newPoint = coords[0][coords[0].length - 1];
                if (isPointInPoly(origGeom, newPoint) !== true) { //if outside get rid of it
                    coords[0].pop(); //remove the last coordinate element
                }
            }
            vertsCouter = coords[0].length; //reset the length of vertex counter
            if (typeof(geom) === 'undefined') {
                retGeom = new ol.geom.Polygon(coords);
            } else { //if it is defined, set its coordinates
                geom.setCoordinates(coords);
            }
            return retGeom;
        }
    });

    var deleteHoleIsDisabled = document.getElementById('delete-hole').disabled;
    document.getElementById('draw-hole').disabled = true;
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
        document.getElementById('draw-hole').disabled = false;
        $(document).off('keyup')
    };

    $(document).on('keyup', function (evt) {
        if (evt.keyCode == 189 || evt.keyCode == 109) {
            if (vertsCouter === 1) {
                if (isMultiPolygon) {
                    currFeat.setGeometry(origGeomMP);
                }
                document.getElementById('delete-hole').disabled = deleteHoleIsDisabled;
                finishHole()
            } else {
                holeDraw.removeLastPoint();
            }
        } else if (evt.keyCode == 27) {
            if (isMultiPolygon) {
                if (origGeomMP) {
                    currFeat.setGeometry(origGeomMP);
                }
            } else {
                currFeat.setGeometry(origGeom);
            }
            document.getElementById('delete-hole').disabled = deleteHoleIsDisabled;
            finishHole()
        }
    });

    holeDraw.on('drawstart', function (evt) {
        var feature = evt.feature; // the hole feature
        var ringAdded = false; //init boolean var to clarify whether drawn hole has already been added or not
        hasStarted = true;

        if (isMultiPolygon) {
            origGeomMP = origGeom.clone();
        } else {
            currGeom = currFeat.getGeometry();
        }

        //set the change feature listener so we get the hole like visual effect
        feature.on('change', function (e) {
            var setCoords;
            //get draw hole feature geometry
            var currCoords = feature.getGeometry().getCoordinates(false)[0];
            //if hole has 3 or more coordinate pairs, add the interior ring to feature

            if (currCoords.length >= 3 && ringAdded === false) {
                currGeom.appendLinearRing( //if interior ring has not been added yet, append it and set it as true
                    new ol.geom.LinearRing(currCoords));
                ringAdded = true;
            } else if (currCoords.length >= 3 && ringAdded === true) { //if interior ring has already been added we need to remove it and add back the updated one
                setCoords = currGeom.getCoordinates();
                setCoords.pop(); //pop the dirty hole
                setCoords.push(currCoords); //push the updated hole
                currGeom.setCoordinates(setCoords); //update currGeom with new coordinates
            } else if (currCoords.length == 2 && ringAdded === true ) {
                setCoords = currGeom.getCoordinates();
                setCoords.pop(); //pop the dirty hole
                currGeom.setCoordinates(setCoords); //update currGeom with new coordinates
                ringAdded = false;
            }
            if (isMultiPolygon) {
                if (currCoords.length == 1 && currGeom) {
                    origGeom = origGeomMP.clone();
                    currGeom = null;
                    currGeomMP = null;
                } else if (currCoords.length == 2 && (!(currGeom))) {
                    pickPoly(feature)
                }
                if (currGeom) {
                    currFeat.setGeometry(currGeom);
                }
            }
        });
    }, this);

    // Check if the hole is valid and remove the hole interaction
    holeDraw.on('drawend', function (evt) {

        var rings = currGeom.getCoordinates();
        var holecoords = rings.pop();

        var isValid = isPolyValid(new ol.geom.Polygon([holecoords]));
        var isInside = doesPolyCoverHole(origGeom, holecoords);
        if (isValid && isInside) {
            source.once('addfeature', function (e) {
                var featuresGeoJSON = new ol.format.GeoJSON().writeFeatures(
                    [currFeat], { featureProjection: 'EPSG:3857' }
                );
                // console.log(featuresGeoJSON)
            })
        } else {
            currFeat.getGeometry().setCoordinates(rings);
        }
        if (isMultiPolygon) {
            if (origGeomMP.getCoordinates().length == 1) {
                currGeomMP = new ol.geom.MultiPolygon([currGeom.getCoordinates()]);
            } else {
                currGeomMP.appendPolygon(currGeom);
            }
            currFeat.setGeometry(currGeomMP);
        }

        this.autoselect = true;
        document.getElementById('delete-hole').disabled = false;
        finishHole();
    }, this);
};
featureInteractor.prototype.deleteHole = function () {
    var holeStyle = [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.8)',
                lineDash: [10, 10],
                width: 3
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.8)'
            })
        })
    ];

    var getPolyHoles = function (poly) {
        var skip = true;
        var holes = [];
        poly.getLinearRings().forEach( function (ring) {
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
        poly.getLinearRings().forEach( function (ring) {
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
        document.getElementById('draw-hole').disabled = false;
        document.getElementById('delete-hole').disabled = (holeFeats.getArray().length == 0);
        $(document).off('keyup')
    };
    $(document).on('keyup', function (evt) {
        if (evt.keyCode == 27) {
            finishHole()
        }
    });

    document.getElementById('draw-hole').disabled = true;
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
featureInteractor.prototype.formatLength = function(line, proj) {
    var length;
    // if (geodesicCheckbox.checked) {
    //     var coordinates = line.getCoordinates();
    //     length = 0;
    //     var sourceProj = map.getView().getProjection();
    //     for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
    //         var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
    //         var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
    //         length += this.wgs84Sphere.haversineDistance(c1, c2);
    //     }
    // } else {
    //     length = Math.round(line.getLength() * 100) / 100;
    // }
    length = Math.round(line.getLength() * 100) / 100;
    var output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) + ' km';
    } else {
        output = (Math.round(length * 100) / 100) + ' m';
    }
    return output;
};
featureInteractor.prototype.formatArea = function(polygon, proj) {
    var area;
    // if (geodesicCheckbox.checked) {
    //     var sourceProj = map.getView().getProjection();
    //     var geom = polygon.clone().transform(sourceProj, 'EPSG:4326');
    //     var coordinates = geom.getLinearRing(0).getCoordinates();
    //     area = Math.abs(this.wgs84Sphere.geodesicArea(coordinates));
    // } else {
    //     area = polygon.getArea();
    // }
    area = polygon.getArea();
    var output;
    var squared = "2";
    if (area > 10000) {
        output = (Math.round(area / 1000000 * 100) / 100) + " km" + squared.sup();
    } else {
        output = (Math.round(area * 100) / 100) + " m" + squared.sup();
    }
    return output;
};
featureInteractor.prototype.formatPosition = function (point, sourceProj) {
    var geom = point.clone().transform(sourceProj, 'EPSG:4326');
    var coords = geom.getCoordinates();
    var coord_x = coords[0].toFixed(6);
    var coord_y = coords[1].toFixed(6);
    return coord_x + ', ' + coord_y;
};

featureInteractor.prototype.activateForm = function (feature) {

    var _this = this;
    document.getElementById('featureproperties').style.display = 'block';

    var geometry_type = document.getElementById('geometry-type');
    geometry_type.innerHTML = feature.getGeometry().getType();

    var measureLabel = document.getElementById('measure-label');
    var measure;
    if (feature.getGeometry() instanceof ol.geom.Polygon || feature.getGeometry() instanceof ol.geom.MultiPolygon) {
        measureLabel.innerHTML = 'Area:';
        measure = this.formatArea;
    } else if (feature.getGeometry() instanceof ol.geom.LineString || feature.getGeometry() instanceof ol.geom.MultiLineString) {
        measureLabel.innerHTML = 'Length:';
        measure = this.formatLength;
    } else if (feature.getGeometry() instanceof ol.geom.Point) {
        measureLabel.innerHTML = 'Lon, Lat';
        measure = this.formatPosition;
    }

    var measureValue = document.getElementById('measure-feature');
    measureValue.innerHTML = measure(feature.getGeometry(), this.map.getView().getProjection());
    this.listener = feature.getGeometry().on('change', function(evt) {
        measureValue.innerHTML = measure(evt.target, _this.map.getView().getProjection());
    });

    document.getElementById('feature-name').value = feature.get('name');

    document.getElementById('draw-hole').disabled = true;
    document.getElementById('delete-hole').disabled = true;
    if (feature.getGeometry().getType().endsWith('Polygon')) {
        document.getElementById('draw-hole').disabled = false;
        if (feature.getGeometry().getType() === 'MultiPolygon') {
            for (i = 0; i < feature.getGeometry().getPolygons().length; i++)
                if (feature.getGeometry().getPolygon(i).getLinearRingCount() > 1) {
                    document.getElementById('delete-hole').disabled = false;
                }
        } else if (feature.getGeometry().getLinearRingCount() > 1) {
            document.getElementById('delete-hole').disabled = false;
        }
    }

    for (var key in defaultFeatureProperties) {
        if (feature.getGeometry().getType().endsWith(defaultFeatureProperties[key]["geometry_type"])) {
            document.getElementById('feature-type').appendChild(this.createOption(key));
        }
    }
    document.getElementById('feature-type').appendChild(this.createOption('generic'));

    var feature_type = feature.get('type');
    if (!(feature_type && feature_type in defaultFeatureProperties)) {
        feature_type = 'generic';
    }

    document.getElementById('feature-type').value = feature_type;

    var feature_properties = defaultFeatureProperties[feature_type];
    if (feature_properties['subtype']) {
        feature_properties['subtype'].forEach( function (sub_type) {
            document.getElementById('sub-type').appendChild(this.createOption(sub_type));
        }, this);
        if (feature.get('subtype')) {
            document.getElementById('sub-type').value = feature.get('subtype');
        }
        document.getElementById('sub-type').disabled = false;
    } else {
        document.getElementById('sub-type').disabled = true;
    }

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
featureInteractor.prototype.loadFeature = function (feature_type) {
    console.log(feature_type);

    var feature_properties = defaultFeatureProperties[feature_type];

    var geometry_type = document.getElementById('geometry-type');
    var feature_name = document.getElementById('feature-name');
    for (var key in defaultFeatureProperties) {
        if (defaultFeatureProperties[key]["geometry_type"]) {
            if (geometry_type.innerHTML.startsWith(defaultFeatureProperties[key]["geometry_type"])) {
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

    var sub_type = document.getElementById('sub-type');
    this.removeContent(sub_type);
    if (feature_properties['subtype']) {
        feature_properties['subtype'].forEach( function (st) {
            sub_type.appendChild(this.createOption(st));
        }, this);
        sub_type.disabled = false;
    } else {
        sub_type.disabled = true;
    }

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
featureInteractor.prototype.deactivateForm = function (feature) {

    var feature_name = document.getElementById('feature-name');
    if (feature.get('name')) {
        feature.set('name', feature_name.value);
    }
    feature_name.value = null;
    feature_name.disabled = true;

    document.getElementById('draw-hole').disabled = true;
    document.getElementById('delete-hole').disabled = true;

    var feature_type = document.getElementById('feature-type');
    if (feature.get('type')) {
        feature.set('type', feature_type.value);
    }
    this.removeContent(feature_type);

    var subtype = document.getElementById('sub-type');
    if (feature.get('subtype')) {
        feature.set('subtype', subtype.value);
    }
    this.removeContent(subtype);

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

    ol.Observable.unByKey(this.listener);
};

featureInteractor.prototype.createFeatureOverlay = function () {
    var highlightStyleCache = {};
    var _this = this;
    var overlayStyleFunction = (function () {
        var setStyle = function (color, opacity, text) {
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color.concat(1),
                    width: 4
                }),
                fill: new ol.style.Fill({
                    color: color.concat(opacity)
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
        return function (feature, resolution) {

            var color;
            var opacity;
            if (exists(feature.get('type'))) {
                color = defaultFeatureProperties[feature.get('type')]['color'];
            } else {
                color = [255, 0, 0];
            }
            if (feature.get('type') === 'aor') {
                opacity = 0
            } else {
                opacity = fillOpacity[feature.getGeometry().getType()] * 2;
                opacity = opacity ? opacity : 0;
            }
            var text = resolution < 50000 ? feature.get('name') : '';
            if (!highlightStyleCache[text]) {
                highlightStyleCache[text] = setStyle(color, opacity, text);
            }
            return highlightStyleCache[text];
        }
    })();
    var featureOverlay = new ol.layer.Vector({
        source: new ol.source.Vector(),
        type: 'overlay',
        style: overlayStyleFunction,
        zIndex: 9900
    });
    return featureOverlay
};
featureInteractor.prototype.getFeatureAtPixel = function (pixel) {
    var coord = this.map.getCoordinateFromPixel(pixel);
    var smallestArea = 5.1e14; // approximate surface area of the earth
    var smallestFeature = null;
    // var _this = this;
    var feature = this.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        var geom = feature.getGeometry();
        if (geom instanceof ol.geom.Point) {
        //Need to add functionality for sensors here.
            return feature;
        } else if (geom instanceof ol.geom.LineString || geom instanceof ol.geom.MultiLineString) {
            return feature;
        } else if (geom instanceof ol.geom.Polygon || geom instanceof ol.geom.MultiPolygon) {
            if (feature.get('type') === 'aor') {
                var point = geom.getClosestPoint(coord);
                var pixel0 = this.map.getPixelFromCoordinate(coord);
                var pixel1 = this.map.getPixelFromCoordinate(point);
                if (Math.abs(pixel0[0]-pixel1[0]) < 8 && Math.abs(pixel0[1]-pixel1[1]) < 8) {
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
featureInteractor.prototype.setMouseCursor = function (feature) {
    if (feature) {
        this.map.getTarget().style.cursor = 'pointer';
    } else {
        this.map.getTarget().style.cursor = '';
    }
};
featureInteractor.prototype.displayFeatureInfo = function (feature) {
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

featureInteractor.prototype.addInteractions = function () {
    var _this = this;
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
        style: this.featureOverlay.getStyle()
        // style: new ol.style.Style({
        //     stroke: new ol.style.Stroke({
        //         color: 'rgba(255, 255, 255, 1)',
        //         width: 4
        //     }),
        //     fill: new ol.style.Fill({
        //         color: 'rgba(255, 255, 255, 0.1)'
        //     })
        // })
    });

    this.select.on('select', function (evt) {
        var feature;
        // Handle deselect first so we can update the feature in the python code.
        if (evt.deselected.length == 1) {
            feature = evt.deselected[0];
            _this.modify.setActive(false);
            // translate.setActive(false);
            console.log('deselect:', feature.get('name'), feature.getRevision());
            _this.deactivateForm(feature);

            // var selectedLayer = _this.layertree.getLayerById(_this.layertree.selectedLayer.id);
            // selectedLayer.getSource().addFeature(feature);
            // _this.activeFeatures.push(feature);

        }
        if (evt.selected.length == 1) {
            feature = evt.selected[0];
            _this.modify.setActive(true);
            //translate.setActive(true);
            console.log('select:  ', feature.get('name'), feature.getRevision());
            _this.activateForm(feature);
        }
    });

    /*********** MODIFY ************/
    this.modify = new ol.interaction.Modify({
        features: this.select.getFeatures()
    });

    var origGeom;
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

    this.toolbar.controlEventEmitter.on('change', function (evt) {
        var selectedFeatures = _this.select.getFeatures();
        var selectedFeature;
        if (_this.toolbar.active == true) {
            _this.map.un('pointermove', _this.hoverDisplay);

            if (selectedFeatures.getArray().length === 1) {
                selectedFeature = selectedFeatures.getArray()[0];
                console.log('deselect:', selectedFeature.get('name'), selectedFeature.getRevision());
                _this.deactivateForm(selectedFeature);

                // var selectedLayer = _this.layertree.getLayerById(_this.layertree.selectedLayer.id);
                // selectedLayer.getSource().addFeature(feature);
                // _this.activeFeatures.push(feature);

                selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
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

                selectedFeature = selectedFeatures.getArray()[0];
                console.log('select:    ', selectedFeature.get('name'), selectedFeature.getRevision());
                _this.activateForm(selectedFeature);
            }

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
        // center: [-8236600, 4975706],
        center: [0, 0],
        zoom: 2
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

    var tools = new toolBar({map: map, target: 'toolbar', layertree: tree});

    tools.addDrawToolBar();

    // var featureedit = new featureEditor({target: 'featureeditor'});
    // featureedit.createForm({feature_type: "Herbage"})

    // var form = new featureEditor({'target': 'featureeditor'}).createForm();
    var interactor = new featureInteractor({map: map, toolbar: tools, layertree: tree, target: 'featureeditor'});


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
    // var getSelectedFeatureAtPixel = function (pixel) {
    //     var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
    //         if (feature.getId() == selectedFeature.getId()) {
    //             return feature;
    //         } else {
    //             return undefined;
    //         }
    //     })
    //     return feature;
    // };
    //
    // var setSelectMousePointer = function (evt) {
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
    //     loader: function (extent) {
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
    //     	}).done(function (response) {
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
    // drawType.onclick = function (event) {
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
    //     $(document).on('keyup', function (evt) {
    //         if (evt.keyCode == 189 || evt.keyCode == 109) {
    //             draw.removeLastPoint();
    //         } else if (evt.keyCode == 27) {
    //             map.removeInteraction(draw);
    //             select.setActive(true);
    //             modify.setActive(true);
    //             translate.setActive(true);
    //             $('#drawhole').prop('disabled', false);
    //             map.on('pointermove', hoverDisplay);
    //             $(document).off('keyup')
    //         }
    //     });
    //     draw.on('drawend', function (evt) {
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
    //         // source.once('addfeature', function (evt) {
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
    //         //     }).then(function (response) {
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
    //     /*condition: function (evt) {
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
    // select.on('select', function (evt) {
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
    // var keyDown = function (evt) {
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
    // document.getElementById('drawhole').onclick = function () {
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
    //     source = new ol.source.Vector();
    //     var holeDraw = new ol.interaction.Draw({
    //         source: source,
    //         type: 'Polygon',
    //         style: holeStyle,
    //         //add the geometry function in order to disable hole creation outside selected polygon
    //         geometryFunction: function (coords, geom) {
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
    //     holeDraw.on('drawstart', function (evt) {
    //         var feature = evt.feature; // the hole feature
    //         var ringAdded = false; //init boolen var to clarify whether drawn hole has already been added or not
    //         //set the change feature listener so we get the hole like visual effect
    //         feature.on('change', function (e) {
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
    //     $(document).on('keyup', function (evt) {
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
    //     holeDraw.on('drawend', function (evt) {
    //
    //         var rings = selFeat.getArray()[0].getGeometry().getCoordinates();
    //         holecoords = rings.pop();
    //
    //         if (doesPolyCoverHole(selFeatGeom, holecoords)) {
    //             source.once('addfeature', function (e) {
    //                 var featuresGeoJSON = new ol.format.GeoJSON().writeFeatures(
    //                     selFeat.getArray(), {
    //                         featureProjection: 'EPSG:3857'
    //                     }
    //                 );
    //                 console.log(featuresGeoJSON)
    //             })
    //         } else {
    //             selFeat.getArray()[0].getGeometry().setCoordinates(rings);
    //         }
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
    // loadProject.onclick = function (e) {
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
    //     vector_aor.getSource().on('change', function (evt) {
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
            return "Tile: [Z: "+zoom+"  X: "+xytile[0]+"  Y: "+xytile[1]+"]";
        },
        projection: 'EPSG:4326',
        target: 'tile'
    });
    map.addControl(mousePositionControl2);

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
}
document.addEventListener('DOMContentLoaded', init);
