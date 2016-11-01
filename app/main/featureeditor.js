/**
 * Created by maddoxw on 10/14/16.
 */

define(['jquery', 'ol',
    'exists',
    "featureid",
    'ttemplate',
    'ispolyvalid',
    'ispointinpoly',
    'doespolycoverhole',
    'jquery-ui'
], function ($, ol,
             exists,
             FID,
             tobjectTemplates,
             isPolyValid,
             isPointInPoly,
             doesPolyCoverHole) {

    var featureEditor = function (options) {
        'use strict';
        if (!(this instanceof featureEditor)) {
            throw new Error('featureEditor must be constructed with the new keyword.');
        }
        if (typeof options === 'object' && options.map && options.interactor) {
            if (!(options.map instanceof ol.Map)) {
                throw new Error('Please provide a valid OpenLayers 3 map object.');
            }
            this.map = options.map;
            this.interactor = options.interactor;
            this.wgs84Sphere = new ol.Sphere(6378137);
            this.formElements = {};
            this.$form = this.createForm();
        } else {
            throw new Error('Invalid parameter(s) provided.');
        }
    };
    featureEditor.prototype.createForm = function () {
        this.formElements.featurename = this.createNameNodes();
        this.formElements.geometrytype = this.createGeometryTypeNodes();
        this.formElements.measure = this.createMeasureNodes();
        this.formElements.featuretype = this.createFeatureTypeNodes();
        this.formElements.hole = this.createHoleNodes();
        this.formElements.height = this.createHeightNodes();
        this.formElements.thickness = this.createThicknessNodes();
        var $form = $("<form id='featureproperties' class='form'>");
        $form.append(this.addFormRow(['featurename']));
        $form.append(this.addFormRow(['geometrytype', 'measure']));
        $form.append(this.addFormRow(['featuretype', 'hole']));
        $form.append(this.addFormRow(['height']));
        $form.append(this.addFormRow(['thickness']));
        return $form;
    };

    featureEditor.prototype.addFormRow = function (labels) {
        var $formRow = $("<div class='form-row'>");
        for (let label of labels) {
            $formRow.append(this.formElements[label])
        }
        return $formRow
    };
    featureEditor.prototype.createNameNodes = function () {
        var $formElem = $("<div class='form-elem'>");

        $formElem.append($("<div id='feature-name-label' class='form-label'>Feature Name</div>"));

        var $formValue = $("<div class='form-value'>");
        $formValue.append($("<input type='text' id='feature-name' class='ui-widget'>"));
        $formElem.append($formValue);

        return $formElem
    };
    featureEditor.prototype.createGeometryTypeNodes = function () {
        var $formElem = $("<div class='form-elem' style='width:12em'>");

        $formElem.append($("<div id='geometry-type-label' class='form-label'>Geometry Type</div>"));

        var $formValue = $("<div class='form-value'>");
        $formValue.append($("<input type='text' id='geometry-type' readonly>"));
        $formElem.append($formValue);

        return $formElem
    };
    featureEditor.prototype.createMeasureNodes = function () {
        var $formElem = $("<div class='form-elem'>");

        $formElem.append($("<div id='measure-label' class='form-label'>Measure</div>"));

        var $formValue = $("<div class='form-value'>");
        $formValue.append($("<div id='measure' readonly/>"));
        var $measureUnits = $("<select id='measure-units'>");
        $formValue.append($measureUnits);
        $formValue.append($("<label for='geodesic' class='visible' title='Use geodesic measures'</label>"));
        var $geodesicValue = $("<input type='checkbox' id='geodesic' class='checkboxradio'>");
        $formValue.append($geodesicValue);
        $formElem.append($formValue);

        $measureUnits.selectmenu({
            classes: {
                "ui-selectmenu-button": "menuselect"
            }
        });
        $geodesicValue.checkboxradio();

        return $formElem
    };
    featureEditor.prototype.createFeatureTypeNodes = function () {
        var _this = this;
        var $formElem = $("<div class='form-elem'>");

        $formElem.append($("<div id='feature-type-label' class='form-label'>Feature Type</div>"));

        var $formValue = $("<div class='form-value'>");
        var $featureType = $("<select id='feature-type'>");
        $formValue.append($featureType);
        $formElem.append($formValue);

        $featureType.selectmenu({
            classes: {
                "ui-selectmenu-button": "menuselect"
            },
            change: function () {
                _this.changeFeatureType(this.value);
            }
        });

        return $formElem
    };
    featureEditor.prototype.createHoleNodes = function () {
        var _this = this;
        var $formElem = $("<div class='form-elem'>");

        $formElem.append($("<div id='hole-label' class='form-label'>Hole</div>"));

        var $formValue = $("<div class='form-value'>");
        var $addHole = $('<button id="add-hole" class="ol-unselectable ol-control hole-buttons" title="Draw a hole in the selected feature">Draw</button>');
        $formValue.append($addHole);
        var $deleteHole = $('<button id="delete-hole" class="ol-unselectable ol-control hole-buttons" title="Delete a hole from the selected feature">Delete</button>');
        $formValue.append($deleteHole);
        $formElem.append($formValue);

        $addHole.button({
            label: "Draw"
        }).on('click', function () {
            _this.addHole();
        });
        $deleteHole.button({
            label: "Delete"
        }).on('click', function () {
            _this.deleteHole();
        });

        return $formElem
    };
    featureEditor.prototype.createHeightNodes = function () {
        var _this = this;
        var $formElem = $("<div class='form-elem'>");

        $formElem.append($("<div id='height-label' class='form-label'>Height</div>"));

        var $formValue = $("<div class='form-value'>");
        var $heightSlider = $("<div id='height-slider' class='slider'>");
        $formValue.append($heightSlider);
        var $heightSpinner = $("<input id='height-spinner' class='spinbox'>");
        $formValue.append($heightSpinner);
        $formElem.append($formValue);

        $heightSlider.slider({
            animate: true,
            range: "min",
            min: 0,
            max: 100,
            step: 0.01,
            slide: function (event, ui) {
                $("#height-spinner").spinner("value", _this.pow10Slider(ui.value));
            },
            change: function (event, ui) {
                $("#height-spinner").spinner("value", _this.pow10Slider(ui.value));
            }
        });
        $heightSpinner.spinner({
            min: 0,
            max: 1000,
            step: 0.1,
            spin: function (event, ui) {
                $("#height-slider").slider("value", _this.log10Slider(ui.value));
            },
            change: function () {
                if (this.value.length > 0) {
                    $("#height-slider").slider("value", _this.log10Slider(this.value));
                }
            }
        }).spinner("value", 10);

        return $formElem
    };
    featureEditor.prototype.createThicknessNodes = function () {
        var $formElem = $("<div class='form-elem'>");

        $formElem.append($("<div id='thickness-label' class='form-label'>Thickness</div>"));

        var $formValue = $("<div class='form-value'>");
        var $thicknessSlider = $("<div id='thickness-slider'>");
        $formValue.append($thicknessSlider);
        var $thicknessSpinner = $("<input id='thickness-spinner'>");
        $formValue.append($thicknessSpinner);
        $formElem.append($formValue);

        $thicknessSlider.slider({
            animate: true,
            range: "min",
            min: 0,
            max: 50,
            step: 0.01,
            slide: function (event, ui) {
                $($thicknessSpinner).spinner("value", ui.value)
            },
            change: function (event, ui) {
                $($thicknessSpinner).spinner("value", ui.value)
            }
        });
        $thicknessSpinner.spinner({
            min: 0,
            max: 50,
            step: 0.01,
            spin: function (event, ui) {
                $($thicknessSlider).slider("value", ui.value)
            },
            change: function () {
                if (this.value.length > 0) {
                    $($thicknessSlider).slider("value", this.value);
                }
            }
        }).spinner("value", 5);

        return $formElem
    };

    featureEditor.prototype.createLabel = function (label) {
        var $label = $('<label>');
        $label.attr('for', label);
        return $label;
    };
    featureEditor.prototype.createInput = function (name, type) {
        var $input = $('<input>');
        $input.name = name;
        $input.type = type;
        $input.required = true;
        return $input;
    };
    featureEditor.prototype.createMenu = function (name, id) {
        var $menu = $('<select>');
        $menu.name = name;
        $menu.type = "text";
        $menu.id = id;
        return $menu;
    };
    featureEditor.prototype.createOption = function (option) {
        var $option = $('<option>');
        $option.val(option);
        $option.text(option);
        return $option;
    };
    featureEditor.prototype.createHoleButton = function (label, title) {
        var $buttonElem = $('<button id="' + label + '-hole">');
        $buttonElem.addClass("ol-unselectable ol-control hole-buttons");
        $buttonElem.val(label.capitalizeFirstLetter());
        $buttonElem.attr('title', title);
        return $buttonElem;
    };

    featureEditor.prototype.log10Slider = function (toPresent) {
        var val = 0;
        if (toPresent > 0.1) {
            val = 25.0 * (Math.log10(toPresent) + 1.0);
        }
        return val;
    };
    featureEditor.prototype.pow10Slider = function (val) {
        var toPresent = 0;
        if (val > 0) {
            toPresent = Math.pow(10, (val / 25 - 1));
        }
        return String(toPresent);
    };

    featureEditor.prototype.addHole = function () {
        var holeStyle = [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.8)',
                    lineDash: [3, 9],
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

        var currFeat = this.interactor.select.getFeatures().getArray()[0];
        var geomTypeSelected = currFeat.getGeometry().getType();
        var isMultiPolygon = geomTypeSelected === 'MultiPolygon';
        if (!(geomTypeSelected.endsWith("Polygon"))) {
            alert("Only Polygon and MultiPolygon geometries can have holes. Not " + geomTypeSelected);
            return;
        }
        // Clone and original selected geometry so we can test new vertex points against it in the geometryFunction.
        var origGeom = currFeat.getGeometry().clone();
        var currGeom;
        var polyindex = 0;
        var refGeom;
        if (isMultiPolygon) {
            var pickPoly = function (feature) {
                var points = feature.getGeometry().getCoordinates(false)[0];
                var polygons = origGeom.getPolygons();
                var nPolygons = polygons.length;
                for (var i = 0; i < nPolygons; i++) {
                    if (isPointInPoly(polygons[i], points[0])) {
                        polyindex = i;
                    }
                }
            }
        }

        var vertsCouter = 0; //this is the number of vertices drawn on the ol.interaction.Draw(used in the geometryFunction)

        //create a hole draw interaction
        var source = new ol.source.Vector();
        var holeDraw = new ol.interaction.Draw({
            source: source,
            type: 'Polygon',
            style: holeStyle,
            condition: function (evt) {
                if (evt.type === 'pointerdown' || ol.events.condition.singleClick(evt)) {
                    if (exists(refGeom)) {
                        return (isPointInPoly(refGeom, evt.coordinate))
                    } else {
                        return (isPointInPoly(origGeom, evt.coordinate))
                    }
                }
            }
        });

        $('#add-hole').button('disable');
        $('#delete-hole').button('disable');
        this.map.un('pointermove', this.interactor.hoverDisplay);
        this.interactor.select.setActive(false);
        this.interactor.modify.setActive(false);
        // this.translate.setActive(true);
        this.map.addInteraction(holeDraw);

        var _this = this;

        var getPolyHoles = function (poly) {
            var skip = true;
            var holes = [];
            poly.getLinearRings().forEach(function (ring) {
                if (skip) { // assume the first ring is the exterior ring.
                    skip = false;
                } else {
                    holes.push(new ol.Feature(new ol.geom.Polygon([ring.getCoordinates()])));
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

        var finishHole = function () {
            _this.map.removeInteraction(holeDraw);
            _this.interactor.modify.setActive(true);
            _this.interactor.select.setActive(true);
            // _this.translate.setActive(true);
            _this.map.on('pointermove', _this.interactor.hoverDisplay);
            $('#add-hole').button('enable');
            // $('#delete-hole').button('enable');
            var holeFeats = getHoles(currGeom);
            $('#delete-hole').button('option', 'disabled', holeFeats.getArray().length === 0);
            $(document).off('keyup')
        };

        $(document).on('keyup', function (evt) {
            if (evt.keyCode == 189 || evt.keyCode == 109) {
                if (vertsCouter === 1) {
                    currGeom.setCoordinates(origGeom.getCoordinates());
                    finishHole()
                } else {
                    holeDraw.removeLastPoint();
                }
            } else if (evt.keyCode == 27) {
                currGeom.setCoordinates(origGeom.getCoordinates());
                finishHole()
            }
        });

        holeDraw.on('drawstart', function (evt) {
            var feature = evt.feature; // the hole feature
            var ringAdded = false; //init boolean var to clarify whether drawn hole has already been added or not
            var setCoords;
            var polyCoords;

            currGeom = currFeat.getGeometry();
            if (isMultiPolygon) {
                pickPoly(feature);
                refGeom = currGeom.getPolygon(polyindex);
            } else {
                refGeom = currFeat.getGeometry().clone();
            }

            //set the change feature listener so we get the hole like visual effect
            feature.on('change', function (e) {
                //get draw hole feature geometry
                var currCoords = feature.getGeometry().getCoordinates(false)[0];
                vertsCouter = currCoords.length;

                if (isMultiPolygon) {
                    if (currCoords.length >= 3 && ringAdded === false) {
                        polyCoords = currGeom.getCoordinates()[polyindex];
                        polyCoords.push(currCoords);
                        setCoords = currGeom.getCoordinates();
                        setCoords.splice(polyindex, 1, polyCoords);
                        currGeom.setCoordinates(setCoords);
                        ringAdded = true;
                    } else if (currCoords.length >= 3 && ringAdded === true) {
                        polyCoords = currGeom.getCoordinates()[polyindex];
                        polyCoords.pop();
                        polyCoords.push(currCoords);
                        setCoords = currGeom.getCoordinates();
                        setCoords.splice(polyindex, 1, polyCoords);
                        currGeom.setCoordinates(setCoords);
                    } else if (currCoords.length == 2 && ringAdded === true) {
                        polyCoords = currGeom.getCoordinates()[polyindex];
                        polyCoords.pop();
                        setCoords = currGeom.getCoordinates();
                        setCoords.splice(polyindex, 1, polyCoords);
                        currGeom.setCoordinates(setCoords);
                        ringAdded = false;
                    } else if (currCoords.length == 2 && !(exists(polyindex))) {
                        pickPoly(feature);
                        refGeom = currGeom.getPolygon(polyindex)
                    } else if (currCoords.length == 1 && exists(polyindex)) {
                        currFeat = null;
                        refGeom = null;
                        polyindex = null;
                    }
                } else {
                    //if hole has 3 or more coordinate pairs, add the interior ring to feature
                    if (currCoords.length >= 3 && ringAdded === false) {
                        currGeom.appendLinearRing(new ol.geom.LinearRing(currCoords));
                        ringAdded = true;
                    } else if (currCoords.length >= 3 && ringAdded === true) { //if interior ring has already been added we need to remove it and add back the updated one
                        setCoords = currGeom.getCoordinates();
                        setCoords.pop(); //pop the dirty hole
                        setCoords.push(currCoords); //push the updated hole
                        currGeom.setCoordinates(setCoords); //update currGeom with new coordinates
                    } else if (currCoords.length == 2 && ringAdded === true) {
                        setCoords = currGeom.getCoordinates();
                        setCoords.pop();
                        currGeom.setCoordinates(setCoords);
                        ringAdded = false;
                    }
                }
            });
        });

        // Check if the hole is valid and remove the hole interaction
        holeDraw.on('drawend', function (evt) {

            if (isMultiPolygon) {
                var rings = currGeom.getCoordinates()[polyindex];
                var holecoords = rings.pop();
            } else {
                var rings = currGeom.getCoordinates();
                var holecoords = rings.pop();
            }

            var isValid = isPolyValid(new ol.geom.Polygon([holecoords]));
            var isInside = doesPolyCoverHole(origGeom, holecoords);
            if (isValid && isInside) {
                source.once('addfeature', function (e) {
                    var featuresGeoJSON = new ol.format.GeoJSON().writeFeatures(
                        [currFeat], {featureProjection: 'EPSG:3857'}
                    );
                    // console.log(featuresGeoJSON)
                });
            } else {
                currGeom.setCoordinates(origGeom.getCoordinates());
            }

            this.interactor.autoselect = true;
            $('#delete-hole').button('enable');
            finishHole();
        }, this);
    };
    featureEditor.prototype.deleteHole = function () {
        var holeStyle = [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.8)',
                    lineDash: [10, 10],
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 1.0)'
                })
            })
        ];

        var getPolyHoles = function (poly) {
            var skip = true;
            var holes = [];
            poly.getLinearRings().forEach(function (ring) {
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
            poly.getLinearRings().forEach(function (ring) {
                if (skip) { // assume the first ring is the exterior ring.
                    newPoly = new ol.geom.Polygon([ring.getCoordinates()]);
                    skip = false;
                } else {
                    var rcoord = ring.getFirstCoordinate();
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
            _this.interactor.autoselect = true;
            _this.map.removeInteraction(chooseHole);
            _this.map.removeLayer(holeOverlay);
            _this.interactor.modify.setActive(true);
            _this.interactor.select.setActive(true);
            // _this.translate.setActive(true);
            _this.map.on('pointermove', _this.interactor.hoverDisplay);
            $('#add-hole').button('enable');
            if (holeFeats.getArray().length > 0) {
                $('#delete-hole').button('enable');
            }
            $(document).off('keyup')
        };
        $(document).on('keyup', function (evt) {
            if (evt.keyCode == 27) {
                finishHole()
            }
        });

        $('#add-hole').button('disable');
        $('#delete-hole').button('disable');
        this.map.un('pointermove', this.interactor.hoverDisplay);
        this.interactor.select.setActive(false);
        this.interactor.modify.setActive(false);

        var feature = null;
        var currFeat = this.interactor.select.getFeatures().getArray()[0];
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

    featureEditor.prototype.formatArea = function (geom, sourceProj, sphere) {

    //  var getGeodesicArea = function (poly) {
    //     var area = 0;
    //     var isExterior = true;
    //     poly.getLinearRings().forEach( function (ring) {
    //         if (isExterior) { // assume the first ring is the exterior ring.
    //             area += Math.abs(sphere.geodesicArea(ring.getCoordinates()));
    //             isExterior = false;
    //         } else {
    //             area -= Math.abs(sphere.geodesicArea(ring.getCoordinates()));
    //         }
    //     });
    //     return area;
    // };
    //
    // var area;
    // if (document.getElementById('geodesic').checked) {
    //     // var wgs84Sphere = new ol.Sphere(6378137);
    //     var geom = polygon.clone().transform(sourceProj, 'EPSG:4326');
    //     // var coordinates = geom.getLinearRing(0).getCoordinates();
    //     // area = Math.abs(sphere.geodesicArea(coordinates));
    //     area = 0;
    //     if (geom.getType() === 'MultiPolygon') {
    //         geom.getPolygons().forEach(function (poly) {
    //             area += getGeodesicArea(poly);
    //         });
    //     } else {
    //         area = getGeodesicArea(geom);
    //     }
    // } else {
    //     area = polygon.getArea();
    // }


    var getPolygonArea = function (polygon) {
        var area = 0;
        var area0 = 0;
        var isExterior = true;
        if ($("#geodesic").is(":checked")) {
            var poly = polygon.clone().transform(sourceProj, 'EPSG:4326');
            poly.getLinearRings().forEach(function (ring) {
                if (isExterior) { // assume the first ring is the exterior ring.
                    area += Math.abs(sphere.geodesicArea(ring.getCoordinates()));
                    isExterior = false;
                } else {
                    area -= Math.abs(sphere.geodesicArea(ring.getCoordinates()));
                }
            });
        } else {
            area = polygon.getArea();
        }
        return area;
    };

    var area = 0;
    if (geom.getType() === 'MultiPolygon') {
        geom.getPolygons().forEach(function (poly) {
            area += getPolygonArea(poly)
        })
    } else {
        area = getPolygonArea(geom)
    }
    var output;
    var squared = "2";
    if (area > 100000) {
        output = (Math.round(area / 1000000 * 100) / 100) + " km" + squared.sup();
    } else {
        output = (Math.round(area * 100) / 100) + " m" + squared.sup();
    }
    $('#measure').html(output);
};
    featureEditor.prototype.formatLength = function (geom, sourceProj, sphere) {

        var getLineStringLength = function (line) {
            var length = 0;
            if ($("#geodesic").is(":checked")) {
                var coordinates = line.clone().transform(sourceProj, 'EPSG:4326').getCoordinates();
                var nCoords = coordinates.length;
                for (var i = 0; i < nCoords - 1; i++) {
                    length += sphere.haversineDistance(coordinates[i], coordinates[i + 1]);
                }
            } else {
                length = line.getLength();
            }
            return length;
        };

        var length = 0;
        if (geom.getType() === 'MultiLineString') {
            geom.getLineStrings().forEach(function (line) {
                length += getLineStringLength(line)
            })
        } else {
            length = getLineStringLength(geom)
        }
        var output;
        if (length > 1000) {
            output = (Math.round(length / 1000 * 100) / 100) + ' km';
        } else {
            output = (Math.round(length * 100) / 100) + ' m';
        }
        $('#measure').html(output);
    };
    featureEditor.prototype.formatPosition = function (point, sourceProj, sphere) {
        var geom = point.clone().transform(sourceProj, 'EPSG:4326');
        var coords = geom.getCoordinates();
        var coord_x = coords[0].toFixed(6);
        var coord_y = coords[1].toFixed(6);
        return coord_x + ', ' + coord_y;
    };

    featureEditor.prototype.activateForm = function (feature) {

        var _this = this;
        $('#featureproperties').show();

        $('#feature-name-label').removeClass('disabled');
        var $featureName = $('#feature-name');
        $featureName.removeClass('ui-state-disabled');
        $featureName.val(feature.get('name'));

        $('#geometry-type-label').removeClass('disabled');
        var $geometryType = $('#geometry-type');
        $geometryType.val(feature.getGeometry().getType());

        var $measureLabel = $('#measure-label');
        var $measureUnits = $('#measure-units');
        var $geodesic = $('#geodesic');
        var measure;
        $measureLabel.removeClass('disabled');
        if (feature.getGeometry().getType().endsWith('Polygon')) {
            $measureLabel.html('Area');
            measure = this.formatArea;
        } else if (feature.getGeometry().getType().endsWith('LineString')) {
            $measureLabel.html('Length');
            measure = this.formatLength;
        } else if (feature.getGeometry().getType().endsWith('Point')) {
            $measureLabel.html('Lon, Lat');
            measure = this.formatPosition;
        }
        $geodesic.checkboxradio('enable');
        $measureUnits.selectmenu('enable');
        var units = ['metric', 'english'];
        for (i = 0; i < units.length; i += 1) {
            $measureUnits.append(_this.createOption(units[i]));
        }
        measure(feature.getGeometry(), this.map.getView().getProjection(), this.wgs84Sphere);
        this.geometrylistener = feature.getGeometry().on('change', function (evt) {
            measure(evt.target, _this.map.getView().getProjection(), _this.wgs84Sphere);
        });
        this.geodesiclistener = function () {
            measure(_this.geometrylistener.target, _this.map.getView().getProjection(), _this.wgs84Sphere);
        };
        $geodesic.on('change', this.geodesiclistener);

        var $deleteHole = $('#delete-hole');

        if (feature.getGeometry().getType().endsWith('Polygon')) {
            $('#hole-label').removeClass('disabled');
            $('#add-hole').button('enable');
            if (feature.getGeometry().getType() === 'MultiPolygon') {
                var nPolygons = feature.getGeometry().getPolygons().length;
                for (var i = 0; i < nPolygons; i++)
                    if (feature.getGeometry().getPolygon(i).getLinearRingCount() > 1) {
                        $deleteHole.button('enable');
                    }
            } else if (feature.getGeometry().getLinearRingCount() > 1) {
                $deleteHole.button('enable');
            }
        }

        $('#feature-type-label').removeClass('disabled');
        var $featureType = $('#feature-type');
        $featureType.selectmenu('enable');
        for (var key in tobjectTemplates) {
            if (feature.getGeometry().getType().endsWith(tobjectTemplates[key]["geometry_type"])) {
                $featureType.append(this.createOption(key));
            }
        }
        $featureType.append(this.createOption('generic'));

        var feature_type = feature.get('type');
        if (!(feature_type && feature_type in tobjectTemplates)) {
            feature_type = 'generic';
        }
        $('#feature-type-button').find('.ui-selectmenu-text').text(feature_type);
        $featureType.val(feature_type);

        var feature_properties = tobjectTemplates[feature_type];

        var $heightSpinner = $('#height-spinner');
        var $heightSlider = $('#height-slider');
        if (feature_properties['height']) {
            $('#height-label').removeClass('disabled');
            $heightSpinner.spinner('enable');
            $heightSlider.slider('enable');
            var height = feature.get('height') || feature_properties['height'];
            $heightSpinner.spinner("value", height);
        }

        var $thicknessSpinner = $('#thickness-spinner');
        var $thicknessSlider = $('#thickness-slider');
        if (feature_properties['thickness']) {
            $('#thickness-label').removeClass('disabled');
            $thicknessSpinner.spinner('enable');
            $thicknessSlider.slider('enable');
            var thickness = feature.get('thickness') || feature_properties['thickness'];
            $thicknessSpinner.spinner("value", thickness);
        }
    };
    featureEditor.prototype.changeFeatureType = function (feature_type) {
        var feature_properties = tobjectTemplates[feature_type];

        var $featureName = $('#feature-name');
        for (var key in tobjectTemplates) {
            if (tobjectTemplates[key]["geometry_type"]) {
                if ($('#geometry-type').val().startsWith(tobjectTemplates[key]["geometry_type"])) {
                    if ($featureName.val().startsWith(key.capitalizeFirstLetter())) {
                        $featureName.val($featureName.val().replace(key.capitalizeFirstLetter(), feature_type.capitalizeFirstLetter()));
                    }
                }
            } else if (key === 'generic') {
                if ($featureName.val().startsWith(key.capitalizeFirstLetter())) {
                    $featureName.val($featureName.val().replace(key.capitalizeFirstLetter(), feature_type.capitalizeFirstLetter()));
                }
            }
        }

        $('#feature-type').val(feature_type);

        var $heightSpinner = $('#height-spinner');
        var $heightSlider = $('#height-slider');
        if (!($heightSpinner.spinner('option', 'disabled') || feature_properties['height'])) {
            $heightSpinner.spinner("value", null);
            $heightSlider.slider("value", 0);
            $heightSpinner.spinner('disable');
            $heightSlider.slider('disable');
            $('#height-label').addClass('disabled');
        } else if ($heightSpinner.spinner('option', 'disabled') && feature_properties['height']) {
            $heightSpinner.spinner("value", feature_properties['height']);
            $heightSlider.slider("value", feature_properties['height']);
            $heightSpinner.spinner('enable');
            $heightSlider.slider('enable');
            $('#height-label').removeClass('disabled');
        }

        var $thicknessSpinner = $('#thickness-spinner');
        var $thicknessSlider = $('#thickness-slider');
        if (!($thicknessSpinner.spinner('option', 'disabled') || feature_properties['thickness'])) {
            $thicknessSpinner.spinner("value", null);
            $thicknessSlider.slider("value", 0);
            $thicknessSpinner.spinner('disable');
            $thicknessSlider.slider('disable');
            $('#thickness-label').addClass('disabled');
        } else if ($thicknessSpinner.spinner('option', 'disabled') && feature_properties['thickness']) {
            $thicknessSpinner.spinner("value", feature_properties['thickness']);
            $thicknessSlider.slider("value", feature_properties['thickness']);
            $thicknessSpinner.spinner('enable');
            $thicknessSlider.slider('enable');
            $('#thickness-label').removeClass('disabled');
        }
        return this;
    };
    featureEditor.prototype.loadFeature = function (feature) {
        var $featureName = $('#feature-name');
        if (feature.get('name')) {
            feature.set('name', $featureName.val());
        }
        var $featureType = $('#feature-type');
        if (feature.get('type')) {
            feature.set('type', $featureType.val());
        }
        var $heightSpinner = $('#height-spinner');
        if ($heightSpinner.spinner("value")) {
            feature.set('height', $heightSpinner.spinner("value"));
        }
        var $thicknessSpinner = $('#thickness-spinner');
        if ($thicknessSpinner.spinner("value")) {
            feature.set('thickness', $thicknessSpinner.spinner("value"));
        }
    };
    featureEditor.prototype.deactivateForm = function () {

        var $featureName = $('#feature-name');
        var $featureType = $('#feature-type');
        var $heightSpinner = $('#height-spinner');
        var $heightSlider = $('#height-slider');
        var $thicknessSpinner = $('#thickness-spinner');
        var $thicknessSlider = $('#thickness-slider');
        var $geodesic = $('#geodesic');

        $featureName.val(null);
        $featureName.addClass('ui-state-disabled');

        $('#geometry-type').val(null);

        $geodesic.off('change', this.geodesiclistener);
        ol.Observable.unByKey(this.geometrylistener);
        this.geometrylistener = null;
        this.geodesiclistener = null;
        $geodesic.checkboxradio('disable');
        $('#measure').html(null);
        $('#measure-label').html('Measure');
        $('#measure-units').selectmenu('disable');
        $('#measure-units-button').find('.ui-selectmenu-text').html('&nbsp;');

        $featureType.empty();
        $featureType.val('');
        $('#feature-type-button').find('.ui-selectmenu-text').html('&nbsp;');
        $featureType.selectmenu('disable');

        $('#add-hole').button('disable');
        $('#delete-hole').button('disable');

        $heightSpinner.spinner("value", null);
        $heightSlider.slider("value", 0);
        $heightSpinner.spinner('disable');
        $heightSlider.slider('disable');

        $thicknessSpinner.spinner("value", null);
        $thicknessSlider.slider("value", 0);
        $thicknessSpinner.spinner('disable');
        $thicknessSlider.slider('disable');

        $('.form-label').addClass('disabled');
    };

    return featureEditor;
});
