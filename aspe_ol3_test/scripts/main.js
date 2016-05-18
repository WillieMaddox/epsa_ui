function init() {
    document.removeEventListener('DOMContentLoaded', init);

    function exists(x) {
        return (x !== undefined && x !== null);
    }

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

    /*
    var tobjectsStyleFunction2 = (function() {
        var fillopacity = 0.1;
        var strokeopacity = 1;
        var styles = {};
        var image = new ol.style.Circle({
            radius: 5,
            fill: null,
            stroke: new ol.style.Stroke({color: 'orange', width: 2})
        });
        styles['AOR'] = [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: tobjectColors['AOR'].concat(strokeopacity),
                width: 3
            }),
            fill: new ol.style.Fill({
                color: tobjectColors['AOR'].concat(fillOpacity['AOR'])
            })
        })];
        styles['Building'] = [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: tobjectColors['Building'].concat(strokeopacity),
                width: 3
            }),
            fill: new ol.style.Fill({
                color: tobjectColors['Building'].concat(fillopacity)
            })
        })];
        styles['Herbage'] = [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: tobjectColors['Herbage'].concat(strokeopacity),
                width: 3
            }),
            fill: new ol.style.Fill({
                color: tobjectColors['Herbage'].concat(fillopacity)
            })
        })];
        styles['Water'] = [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: tobjectColors['Water'].concat(strokeopacity),
                width: 3
            }),
            fill: new ol.style.Fill({
                color: tobjectColors['Water'].concat(fillopacity)
            })
        })];
        styles['Wall'] = [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: tobjectColors['Wall'].concat(strokeopacity),
                width: 3
            }),
            fill: new ol.style.Fill({
                color: tobjectColors['Wall'].concat(fillOpacity['Wall'])
            })
        })];
        styles['Road'] = [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: tobjectColors['Road'].concat(strokeopacity),
                width: 3
            }),
            fill: new ol.style.Fill({
                color: tobjectColors['Road'].concat(fillOpacity['Road'])
            })
        })];
        styles['default'] = [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: tobjectColors['default'].concat(strokeopacity),
                width: 3
            }),
            fill: new ol.style.Fill({
                color: tobjectColors['default'].concat(fillopacity),
            }),
            image: image
        })];
        return function(feature, resolution) {
            var style = styles[feature.get('type')];
            return styles[feature.get('type')] || styles['default'];
        };
    })();
    */
    var tobjectColors = {
        'AOR': [0, 0, 0],
        'Building': [128, 128, 128],
        'Herbage': [0, 200, 0],
        'Water': [0, 0, 200],
        'Wall': [64, 64, 64],
        'Road': [192, 51, 52],
        'default': [255, 0, 0]
    };

    var fillOpacity = {
        'AOR': 0,
        'Building': 0.1,
        'Herbage': 0.1,
        'Water': 0.1,
        'Wall': 0,
        'Road': 0,
        'default': 0.1
    };

    var highlight;
    var highlightStyleCache = {};

    var tobjectsStyleFunction = (function() {
        var strokeopacity = 1;
        var setStyle = function(type) {
            style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: tobjectColors[type].concat(strokeopacity),
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: tobjectColors[type].concat(fillOpacity[type])
                })
            });
            return [style]
        };
        return function(feature, resolution) {
            return setStyle(feature.get('type'));
        };
    })();

    var overlayStyleFunction = (function() {
        var strokeopacity = 1;
        var setStyle = function(type, text) {
            style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: tobjectColors[type].concat(strokeopacity),
                    width: 4
                }),
                fill: new ol.style.Fill({
                    color: tobjectColors[type].concat(fillOpacity[type])
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
            var text = resolution < 5000 ? feature.get('name') : '';
            if (!highlightStyleCache[text]) {
                highlightStyleCache[text] = setStyle(feature.get('type'), text);
            }
            return highlightStyleCache[text];
        }
    })();

    var bingkey = 'AsPHemiyjrAaLwkdh3DLil_xdTJN7QFGPaOi9-a4sf8hbAwA3Z334atxK8GxYcxy';

    function toRad(x) {
        return x*Math.PI/180.0
    };
    function toInt(x) {
        return ~~x
    };
    function mod(n, m) {
        return ((n % m) + m) % m
    };
    var deg2tile = function(lon_deg, lat_deg, zoom) {
        var lat_rad = toRad(lat_deg);
        var n = Math.pow(2, zoom);
        var xtile = toInt(mod((lon_deg + 180.0) / 360.0, 1) * n);
        var ytile = toInt((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n);
        return [xtile, ytile]
    };
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
        var pixel1 = [pixel0[0] + 1.0, pixel0[1] - 1.0]
        var coord1 = map.getCoordinateFromPixel(pixel1);
        var currentProj = map.getView().getProjection().getCode()
        if (mouseProjection !== currentProj) {
            coord0 = ol.proj.transform(coord0, currentProj, mouseProjection);
            coord1 = ol.proj.transform(coord1, currentProj, mouseProjection);
        };
        var dx = Math.abs(coord1[0] - coord0[0])
        var dy = Math.abs(coord1[1] - coord0[1])

        var xp = Number(Math.abs(Math.min(0, Math.floor(Math.log10(dx)))).toFixed());
        var yp = Number(Math.abs(Math.min(0, Math.floor(Math.log10(dy)))).toFixed());

        mousePrecision = Math.max(xp, yp)
        console.log(mousePrecision, dx, dy);
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
        interactions: ol.interaction.defaults({ doubleClickZoom: false }),
        target: document.getElementById('map'),
        view: view,
        logo: {
            src: 'resources/saic-logo2.png',
            href: 'http://www.saic.com'
        },
        controls: [new ol.control.Attribution()],
        layers: [
            new ol.layer.Group({
                title: 'Bing Maps',
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
                title: 'MapQuest Maps',
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
                    }),
                ]
            }),
            new ol.layer.Group({
                title: 'OSM Maps',
                layers: [
                    new ol.layer.Tile({
                        title: 'OSM',
                        type: 'base',
                        visible: true,
                        source: new ol.source.OSM()
                    }),
                    new ol.layer.Tile({
                        title: 'OSM local',
                        type: 'base',
                        visible: false,
                        source: new ol.source.OSM({ url: 'http://localhost/osm_tiles/{z}/{x}/{y}.png' })
                    })
                ]
            }),
            new ol.layer.Group({
                title: 'Extra',
                layers: [
                    new ol.layer.Tile({
                        title: 'Countries',
                        type: 'vector',
                        source: new ol.source.TileWMS({
                            url: 'http://demo.opengeo.org/geoserver/wms',
                            params: {'LAYERS': 'ne:ne_10m_admin_1_states_provinces_lines_shp'},
                            serverType: 'geoserver'
                        })
                    })
                ]
            })
        ]
    });

    // var url="http://gis.local.osm:8080/geoserver/wfs?service=wfs&version=1.1.0&request=GetFeature&typeName=cite:nyc_buildings";

    // sourceVector = new ol.source.Vector({
    // 	url: '/cgi-bin/proxy.py?url='+ encodeURIComponent(url),
    // 	format: new ol.format.WFS()
    // })

    //wfs-t
    // url = 'http://gis.local.osm:8080/geoserver/wfs'
    // url = /^((http)|(https))(:\/\/)/.test(url) ? url : 'http://' + url;
    // url = /\?/.test(url) ? url + '&' : url + '?';
    // var typeName = 'cite:nyc_buildings';
    // var proj = 'EPSG:3857';
    // var formatWFS = new ol.format.WFS()
    // sourceVector = new ol.source.Vector({
        // loader: function(extent) {
        // 	$.ajax('/cgi-bin/proxy.py?url='+'http://gis.local.osm:8080/geoserver/wfs', {
        // 		type: 'GET',
        // 		data: {
        // 			service: 'WFS',
        // 			version: '2.0.0',
        // 			request: 'GetFeature',
        // 			typename: 'cite:nyc_buildings',
        // 			srsname: 'EPSG:3857',
        // 			bbox: extent.join(',') + ',EPSG:3857'
        // 		},
        // 	}).done(function(response) {
        // 		formatWFS = new ol.format.WFS(),
        // 			sourceVector.addFeatures(formatWFS.readFeatures(response))
        // 	});
        // },
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
    // }

    var vector_aor = new ol.layer.Vector({
        title: 'AOR',
        type: 'vector',
        source: new ol.source.Vector(),
        style: tobjectsStyleFunction
    });
    var vector = new ol.layer.Vector({
        title: 'tobjects',
        type: 'vector',
        source: new ol.source.Vector(),
        style: tobjectsStyleFunction
    });
    var projectGroup = new ol.layer.Group({
        title: 'Project',
        layers: [
            // layerVector,
            vector_aor,
            vector
        ]
    });
    map.addLayer(projectGroup);

    var featureOverlay = new ol.layer.Vector({
        source: new ol.source.Vector(),
        //map: map,
        style: overlayStyleFunction
    });
    map.addLayer(featureOverlay);

    var getFeatureAtPixel = function(pixel, coord) {
        var smallestArea = 5.1e14, // approximate surface area of the earth.
            smallestFeature;
        var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            var geom = feature.getGeometry()
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
                    var pixel0 = map.getPixelFromCoordinate(coord);
                    var pixel1 = map.getPixelFromCoordinate(point);
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
        });
        return exists(feature) ? feature : smallestFeature;
    };

    var setMouseCursor = function(feature) {
        if (feature) {
            map.getTarget().style.cursor = 'pointer';
        } else {
            map.getTarget().style.cursor = '';
        };
    };

    var displayFeatureInfo = function(feature) {
        if (feature !== highlight) {
            if (highlight) {
                featureOverlay.getSource().removeFeature(highlight);
            }
            if (feature) {
                featureOverlay.getSource().addFeature(feature);
            }
            highlight = feature;
        }
    };

    var hoverDisplay = function(evt) {
        if (evt.dragging) return;
        var pixel = map.getEventPixel(evt.originalEvent);
        var coord = map.getCoordinateFromPixel(pixel);
        var proj = view.getProjection().getCode();
        if (proj !== 'EPSG:4326') {
            coord = ol.proj.transform(coord, proj, 'EPSG:4326')
        };
        var zoom = view.getZoom()
        var xytile = deg2tile(coord[0], coord[1], zoom);
        var zoomlevel = document.getElementById('zoomlevel');
        zoomlevel.innerHTML = zoom;
        var xtile = document.getElementById('xtile');
        xtile.innerHTML = xytile[0];
        var ytile = document.getElementById('ytile');
        ytile.innerHTML = xytile[1];

        var feature = getFeatureAtPixel(pixel, coord);
        setMouseCursor(feature);
        displayFeatureInfo(feature);
    };

    /*
    var selectedFeature = null;
    var getSelectedFeatureAtPixel = function(pixel) {
        var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            if (feature.getId() == selectedFeature.getId()) {
                return feature;
            } else {
                return undefined;
            }
        })
        return feature;
    };

    var setSelectMousePointer = function(evt) {
        if (evt.dragging) return;
        var pixel = map.getEventPixel(evt.originalEvent);
        var intersectingFeature = getSelectedFeatureAtPixel(pixel);
        setMouseCursor(intersectingFeature)
    };
    */

    /*******************************/
    /******** INTERACTIONS *********/
    /*******************************/

    /*********** SELECT ************/
    var featureadded = false;
    var select = new ol.interaction.Select({
        layers: [featureOverlay],
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
    map.addInteraction(select);
    select.setActive(true);
    map.on('pointermove', hoverDisplay);

    select.on('select', function(evt) {
        var info = document.getElementById('info');
        var feature;
        // Handle deselect first so we can update the feature in the python code.
        if (evt.deselected.length == 1) {
            feature = evt.deselected[0]
            info.innerHTML = '&nbsp;';
            modify.setActive(false);
            //translate.setActive(false);
            $('#drawhole').prop('disabled', true);
            console.log('deselect:', feature.get('name'), feature.getRevision());
        };
        if (evt.selected.length == 1) {
            feature = evt.selected[0]
            info.innerHTML = feature.get('type') + ': ' + feature.get('name');
            modify.setActive(true);
            //translate.setActive(true);
            geom = feature.getGeometry()
            if (geom instanceof ol.geom.Polygon || geom instanceof ol.geom.MultiPolygon) {
                $('#drawhole').prop('disabled', false);
            } else {
                $('#drawhole').prop('disabled', true);
            }
            console.log('select:    ', feature.get('name'), feature.getRevision())
        };
    });

    /*********** MODIFY ************/
    var modify = new ol.interaction.Modify({
        features: select.getFeatures()
    });
    map.addInteraction(modify);
    modify.setActive(false);

    /********* TRANSLATE ***********/
    /**
     * When the translate interaction is active, it
     * causes the mouse cursor to turn into a
     * pointer when hovering over the interior
     * of the AOR. Need to find out why.
     * Disable until solution is found.
     */
    /**
    var translate = new ol.interaction.Translate({
        features: select.getFeatures()
    });
    map.addInteraction(translate);
    translate.setActive(false);
    */

    /********** DRAW ***************/
    var draw;
    var drawType = document.getElementById('draw-feature-type');
    drawType.onclick = function(event) {
        if (draw) {
            map.removeInteraction(draw)
        };
        map.un('pointermove', hoverDisplay);
        var selectedFeature = select.getFeatures();
        selectedFeature.forEach(selectedFeature.remove, selectedFeature);
        $('#drawhole').prop('disabled', true);
        //translate.setActive(false);
        //modify.setActive(false);
        select.setActive(false);
        var geom_type = event.target.value;
        var tobj_type = event.target.id;
        var source = tobj_type === 'AOR' ? vector_aor.getSource() : vector.getSource();
        draw = new ol.interaction.Draw({
            source: source,
            type: geom_type,
        });
        map.addInteraction(draw);

        $(document).on('keyup', function(evt) {
            if (evt.keyCode == 189 || evt.keyCode == 109) {
                draw.removeLastPoint();
            } else if (evt.keyCode == 27) {
                map.removeInteraction(draw);
                select.setActive(true);
                //modify.setActive(true);
                //translate.setActive(true);
                //$('#drawhole').prop('disabled', false);
                map.on('pointermove', hoverDisplay);
                $(document).off('keyup')
            }
        });
        draw.on('drawend', function(evt) {
            evt.feature.setId(FID.gen());
            evt.feature.set('type', tobj_type);
            evt.feature.set('name', evt.feature.getId());
            selectedFeature.push(evt.feature);

            // transactWFS('insert', evt.feature);

            map.removeInteraction(draw);
            select.setActive(true);
            //$('#drawhole').prop('disabled', false);
            map.on('pointermove', hoverDisplay);
            info.innerHTML = evt.feature.get('type') + ': ' + evt.feature.get('name');
            featureadded = true;
            source.once('addfeature', function(evt) {
                var parser = new ol.format.GeoJSON();
                var features = source.getFeatures();
                var featuresGeoJSON = parser.writeFeatures(features, {
                    featureProjection: 'EPSG:3857',
                });
                console.log(featuresGeoJSON)
                $.ajax({
                    url: 'test_project/features.geojson', // what about aor?
                    type: 'POST',
                    data: featuresGeoJSON
                }).then(function(response) {
                    console.log(response);
                });
            });
            $(document).off('keyup')
        });
    };

    /********** DRAW HOLE **********/
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

    document.getElementById('drawhole').onclick = function() {
        var selFeat = select.getFeatures();
        // Clone and original selected geometry so we can test new vertex points against it in the geometryFunction.
        var selFeatGeom = selFeat.getArray()[0].getGeometry().clone();
        var geomTypeSelected = selFeat.getArray()[0].getGeometry().getType();
        if (geomTypeSelected != "Polygon") {
        // if (geomTypeSelected.search("Polygon") < 0) {
            alert("Only Polygon (or MultiPolygon) geometry selections. Not " + geomTypeSelected);
            return;
        }

        var isMultiPolygon = geomTypeSelected == "MultiPolygon";
        var vertsCouter = 0; //this is the number of vertices drawn on the ol.interaction.Draw(used in the geometryFunction)

        //create a hole draw interaction
        source = new ol.source.Vector()
        var holeDraw = new ol.interaction.Draw({
            source: source,
            type: 'Polygon',
            style: holeStyle,
            //add the geometry function in order to disable hole creation outside selected polygon
            geometryFunction: function(coords, geom) {
                var retGeom; //define the geometry to return
                if (typeof(geom) !== 'undefined') { //if it is defined, set its coordinates
                    geom.setCoordinates(coords);
                } else {
                    retGeom = new ol.geom.Polygon(coords);
                }
                if (coords[0].length > vertsCouter) { //this is the case where new vertex has been drawn
                    //check if vertex drawn is within the "original" selected polygon
                    var isIn = isPointInPoly(selFeatGeom, coords[0][coords[0].length - 1]);
                    //if outside get rid of it
                    if (isIn !== true) {
                        coords[0].pop(); //remove the last coordinate element
                        retGeom = new ol.geom.Polygon(coords); //reconstruct the geometry
                    }
                    vertsCouter = coords[0].length; //reset the length of vertex counter
                }
                return retGeom;
            }
        });

        map.un('pointermove', hoverDisplay);
        select.setActive(false);
        modify.setActive(false);
        map.addInteraction(holeDraw);

        holeDraw.on('drawstart', function(evt) {
            var feature = evt.feature; // the hole feature
            var ringAdded = false; //init boolen var to clarify whether drawn hole has already been added or not
            //set the change feature listener so we get the hole like visual effect
            feature.on('change', function(e) {
                //get draw hole feature geometry
                var drawCoords = feature.getGeometry().getCoordinates(false)[0];
                //if hole has more than two cordinate pairs, add the interior ring to feature
                if (drawCoords.length > 2) {
                    //if interior ring has not been added yet, append it and set it as true
                    if (ringAdded === false) {
                        selFeat.getArray()[0].getGeometry().appendLinearRing(
                            new ol.geom.LinearRing(feature.getGeometry().getCoordinates(false)[0]));
                        ringAdded = true;
                    } else { //if interior ring has already been added we need to remove it and add back the updated one
                        var setCoords = selFeat.getArray()[0].getGeometry().getCoordinates();
                        setCoords.pop(); //pop the dirty hole
                        setCoords.push(feature.getGeometry().getCoordinates(false)[0]); //push the updated hole
                        selFeat.getArray()[0].getGeometry().setCoordinates(setCoords); //update selFeat with new geometry
                    }
                }
            });
        });

        $(document).on('keyup', function(evt) {
            if (evt.keyCode == 189 || evt.keyCode == 109) {
                holeDraw.removeLastPoint();
            } else if (evt.keyCode == 27) {
                selFeat.getArray()[0].getGeometry().setCoordinates(selFeatGeom.getCoordinates());
                map.removeInteraction(holeDraw);
                select.setActive(true);
                //modify.setActive(true);
                //translate.setActive(true);
                //$('#drawhole').prop('disabled', false);
                map.on('pointermove', hoverDisplay);
                $(document).off('keyup')
            }
        });

        //create a listener when finish drawing and so remove the hole interaction
        holeDraw.on('drawend', function(evt) {

            var rings = selFeat.getArray()[0].getGeometry().getCoordinates();
            holecoords = rings.pop();

            if (doesPolyCoverHole(selFeatGeom, holecoords)) {
                source.once('addfeature', function(e) {
                    var featuresGeoJSON = new ol.format.GeoJSON().writeFeatures(
                        selFeat.getArray(), {
                            featureProjection: 'EPSG:3857',
                        }
                    );
                    console.log(featuresGeoJSON)
                })
            } else {
                selFeat.getArray()[0].getGeometry().setCoordinates(rings);
            };

            map.removeInteraction(holeDraw);
            //reinitialise modify interaction. If you don't do that, holes may not be modifed
            modify.setActive(true);
            /*map.removeInteraction(modify);
            modify = new ol.interaction.Modify({
                features: selFeat
            });
            map.addInteraction(modify);
            */
            select.setActive(true);
            map.on('pointermove', hoverDisplay);
            $(document).off('keyup')
        })
    };

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
    };

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

    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point([0, 0]),
        name: 'Camera',
        maxRange: 4000,
        minRange: 500,
        sourceHeight: 3,
        targetHeight: 3
    });

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: 'resources/camera-normal.png'
        })
    });

    iconFeature.setStyle(iconStyle);

    var vectorSource = new ol.source.Vector({
        features: [iconFeature]
    });

    var loadProject = document.getElementById('loadProject');
    loadProject.onclick = function(e) {

        map.removeLayer(featureOverlay);
        map.removeLayer(projectGroup);

        var bounds = [-105.54833333333333, 39.76361111111111, -105.52694444444444, 39.778055555555554];

        var image = new ol.layer.Image({
            title: 'camera',
            type: 'overlay',
            source: new ol.source.ImageStatic({
                url: 'test_project/package_patched2.png',
                imageExtent: ol.proj.transformExtent(bounds, 'EPSG:4326', 'EPSG:3857')
            }),
            // Replace with an opacity slider-bar.
            opacity: 0.2
        });
        vector_aor = new ol.layer.Vector({
            title: 'AOR',
            type: 'overlay',
            source: new ol.source.Vector({
                url: 'test_project/aor.geojson',
                format: new ol.format.GeoJSON()
            }),
            style: tobjectsStyleFunction
        });
        vector = new ol.layer.Vector({
            title: 'tobjects',
            type: 'overlay',
            source: new ol.source.Vector({
                url: 'test_project/tobjects.geojson',
                format: new ol.format.GeoJSON()
            }),
            style: tobjectsStyleFunction
        });
        projectGroup = new ol.layer.Group({
            title: 'Project',
            layers: [
                image,
                vector_aor,
                vector
            ]
        });

        map.addLayer(projectGroup);
        map.addLayer(featureOverlay);

        // Need to add in auto-zoom-in functionality here.

        vector_aor.getSource().on('change', function(evt) {
            var source = evt.target;
            if (source.getState() === 'ready') {
                view.setCenter(ol.extent.getCenter(source.getExtent()));
            };
        });
    }


    /*******************************/
    /*********** EVENTS ************/
    /*******************************/

    var keyDown = function(evt) {
        console.log(evt.keyCode)
        if (exists(highlight) && evt.keyCode == 46) { //delete key pressed
            vector.getSource().removeFeature(highlight);
            featureOverlay.getSource().removeFeature(highlight);
            highlight = undefined;
        }
    };
    document.addEventListener('keydown', keyDown, false);


    /*******************************/
    /********** CONTROLS ***********/
    /*******************************/

    /******* LAYER SWITCHER ********/
    var layerSwitcher = new ol.control.LayerSwitcher();
    map.addControl(layerSwitcher);

    /********** SCALELINE **********/
    var scaleLineControl = new ol.control.ScaleLine({
        className: 'ol-scale-line ol-scale-line-inner text-stroke',
    });
    map.addControl(scaleLineControl);

    var unitsSelect = $('#units');
    unitsSelect.on('change', function() {
        scaleLineControl.setUnits(this.value);
    });
    unitsSelect.val(scaleLineControl.getUnits());

    /******** MOUSEPOSITION ********/
    var mousePositionControl = new ol.control.MousePosition({
        className: 'ol-mouse-position text-stroke',
        coordinateFormat: ol.coordinate.createStringXY(mousePrecision),
        projection: mouseProjection,
        // undefinedHTML: '&nbsp;'
    });
    map.addControl(mousePositionControl);

    mousePositionControl.on('change', function(evt) {
        var xytile = deg2tile(evt.coords.longitude, evt.coords.latitude, view.zoom);
        var zoomlevel = document.getElementById('zoomlevel');
        zoomlevel.innerHTML = view.zoom;
        var xtile = document.getElementById('xtile');
        xtile.innerHTML = xytile[0];
        var ytile = document.getElementById('ytile');
        ytile.innerHTML = xytile[1];
    });
    var projectionSelect = $('#projection');
    projectionSelect.on('change', function() {
        // mousePositionControl.setProjection(ol.proj.get(this.value));
        mouseProjection = ol.proj.get(this.value)
        mousePositionControl.setProjection(mouseProjection);

    });
    projectionSelect.val(mousePositionControl.getProjection().getCode());

    // var precisionInput = $('#precision');
    // precisionInput.on('change', function() {
    //     var format = ol.coordinate.createStringXY(this.valueAsNumber);
    //     mousePositionControl.setCoordinateFormat(format);
    // });

    /*******************************/
    /******* BEHAVIOR TESTS ********/
    /*******************************/


    // var overlayType = document.getElementById('overlay-type');
    // overlayType.onclick = function(e) {
    //     var bounds = [-105.54833333333333, -105.52694444444444, 39.76361111111111, 39.778055555555554];
    // };


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
