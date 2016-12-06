/**
 * Created by maddoxw on 10/14/16.
 */

define(['jquery', 'ol',
    'exists',
    'featureid',
    'stemplate',
    'jsts',
    'jquery-ui'
], function ($, ol,
             exists,
             FID,
             sensorTemplates,
             jsts) {

    'use strict';
    var cameraEditor = function (options) {
        if (!(this instanceof cameraEditor)) {
            throw new Error('cameraEditor must be constructed with the new keyword.');
        }
        if (typeof options === 'object' && options.map && options.interactor) {
            if (!(options.map instanceof ol.Map)) {
                throw new Error('Please provide a valid OpenLayers 3 map object.');
            }
            this.parser = new jsts.io.OL3Parser();
            this.map = options.map;
            this.interactor = options.interactor;
            this.wgs84Sphere = new ol.Sphere(6378137);
            this.formElements = {};
            this.$form = this.createForm();
        } else {
            throw new Error('Invalid parameter(s) provided.');
        }
    };
    cameraEditor.prototype.createForm = function () {
        this.formElements.cameraName = this.createNameNodes();
        this.formElements.position = this.createPositionNodes();
        this.formElements.cameraType = this.createCameraTypeNodes();
        this.formElements.cameraOption = this.createCameraOptionNodes();
        this.formElements.cameraFOV = this.createCameraFOVNodes();
        this.formElements.sourceHeight = this.createSourceHeightNodes();
        this.formElements.targetHeight = this.createTargetHeightNodes();
        this.formElements.range = this.createRangeNodes();
        this.formElements.measure = this.createMeasureNodes();
        this.formElements.isotropic = this.createIsotropicNodes();
        this.formElements.pan = this.createPanNodes();
        this.formElements.tilt = this.createTiltNodes();
        var $form = $("<form id='cameraproperties' class='form'>");
        $form.append(this.addFormRow(['cameraName']));
        $form.append(this.addFormRow(['position']));
        $form.append(this.addFormRow(['cameraType', 'cameraOption', 'cameraFOV']));
        $form.append(this.addFormRow(['sourceHeight']));
        $form.append(this.addFormRow(['targetHeight']));
        $form.append(this.addFormRow(['isotropic']));
        $form.append(this.addFormRow(['range']));
        $form.append(this.addFormRow(['measure']));
        $form.append(this.addFormRow(['pan']));
        $form.append(this.addFormRow(['tilt']));
        return $form;
    };
    cameraEditor.prototype.styleForm = function () {

        var _this = this;

        $('#camera-type').selectmenu({
            classes: {
                "ui-selectmenu-button": "menuselect"
            }
        }).on('selectmenuchange', function () {
            _this.changeCameraType(this.value);
        });
        $("#camera-option").selectmenu({
            classes: {
                "ui-selectmenu-button": "menuselect"
            }
        }).on('selectmenuchange', function () {
            _this.changeCameraOption(this.value);
        });
        $("#camera-fov").selectmenu({
            classes: {
                "ui-selectmenu-button": "menuselect"
            }
        }).on('selectmenuchange', function () {
            _this.changeCameraFOV(this.value);
        });

        // $('#camera-type').selectmenu({
        //     classes: {
        //         "ui-selectmenu-button": "menuselect"
        //     },
        //     change: function () {
        //         _this.changeCameraType(this.value);
        //     }
        // });
        // $("#camera-option").selectmenu({
        //     classes: {
        //         "ui-selectmenu-button": "menuselect"
        //     },
        //     change: function () {
        //         _this.changeCameraOption(this.value);
        //     }
        // });
        // $("#camera-fov").selectmenu({
        //     classes: {
        //         "ui-selectmenu-button": "menuselect"
        //     },
        //     change: function () {
        //         _this.changeCameraFOV(this.value);
        //     }
        // });

        $('#isotropic').change(function () {
            if (this.checked) {
                $('#pan-slider').slider('disable');
                $('#pan-spinner').spinner('disable');
                $('#pan-label').addClass('disabled');
                $('#tilt-slider').slider('disable');
                $('#tilt-spinner').spinner('disable');
                $('#tilt-label').addClass('disabled');
            } else {
                $('#pan-slider').slider('enable');
                $('#pan-spinner').spinner('enable');
                $('#pan-label').removeClass('disabled');
                $('#tilt-slider').slider('enable');
                $('#tilt-spinner').spinner('enable');
                $('#tilt-label').removeClass('disabled');
            }
        }).checkboxradio();

        $("#measure-units").selectmenu({
            classes: {
                "ui-selectmenu-button": "menuselect"
            }
        });
        $("#geodesic2").checkboxradio();

        $("#source-height-slider").slider({
            animate: true,
            range: "min",
            min: 0,
            max: 100,
            step: 0.01,
            slide: function (event, ui) {
                $("#source-height-spinner").spinner("value", _this.pow10Slider(ui.value));
            },
            change: function (event, ui) {
                $("#source-height-spinner").spinner("value", _this.pow10Slider(ui.value));
            }
        });
        $("#source-height-spinner").spinner({
            min: 0,
            max: 1000,
            step: 0.1,
            spin: function (event, ui) {
                $("#source-height-slider").slider("value", _this.log10Slider(ui.value));
            },
            change: function () {
                if (this.value.length > 0) {
                    $("#source-height-slider").slider("value", _this.log10Slider(this.value));
                }
            }
        }).spinner("value", 10);

        $("#target-height-slider").slider({
            animate: true,
            range: "min",
            min: 0,
            max: 100,
            step: 0.01,
            slide: function (event, ui) {
                $("#target-height-spinner").spinner("value", _this.pow10Slider(ui.value));
            },
            change: function (event, ui) {
                $("#target-height-spinner").spinner("value", _this.pow10Slider(ui.value));
            }
        });
        $("#target-height-spinner").spinner({
            min: 0,
            max: 1000,
            step: 0.1,
            spin: function (event, ui) {
                $("#target-height-slider").slider("value", _this.log10Slider(ui.value));
            },
            change: function () {
                if (this.value.length > 0) {
                    $("#target-height-slider").slider("value", _this.log10Slider(this.value));
                }
            }
        }).spinner("value", 10);

        $('#range-slider').slider({
            animate: true,
            range: true,
            min: 0,
            max: 10000,
            step: 1,
            // values: [100, 1000],
            slide: function (event, ui) {
                if (ui.handleIndex === 0) {
                    $('#range-spinner-min').spinner("value", ui.value)
                } else if (ui.handleIndex === 1) {
                    $('#range-spinner-max').spinner("value", ui.value)
                }
            },
            change: function (event, ui) {
                if (ui.handleIndex === 0) {
                    $('#range-spinner-min').spinner("value", ui.value)
                } else if (ui.handleIndex === 1) {
                    $('#range-spinner-max').spinner("value", ui.value)
                }
            }
        });
        $('#range-spinner-min').spinner({
            min: 0,
            max: 10000,
            step: 1,
            spin: function (event, ui) {
                $('#range-slider').slider("values", 0, ui.value)
            },
            change: function () {
                if (this.value.length > 0) {
                    $('#range-slider').slider("values", 0, this.value);
                }
            }
        }).spinner("value", 0);
        $('#range-spinner-max').spinner({
            min: 0,
            max: 10000,
            step: 1,
            spin: function (event, ui) {
                $('#range-slider').slider("values", 1, ui.value)
            },
            change: function () {
                if (this.value.length > 0) {
                    $('#range-slider').slider("values", 1, this.value);
                }
            }
        }).spinner("value", 1000);

        $('#pan-slider').slider({
            animate: true,
            range: "min",
            min: 0,
            max: 359.9,
            step: 0.1,
            slide: function (event, ui) {
                $('#pan-spinner').spinner("value", ui.value)
            },
            change: function (event, ui) {
                $('#pan-spinner').spinner("value", ui.value)
            }
        });
        $('#pan-spinner').spinner({
            min: 0,
            max: 359.9,
            step: 0.1,
            spin: function (event, ui) {
                $('#pan-slider').slider("value", ui.value)
            },
            change: function () {
                if (this.value.length > 0) {
                    $('#pan-slider').slider("value", this.value);
                }
            }
        }).spinner("value", 0);

        $('#tilt-slider').slider({
            animate: true,
            range: "min",
            min: -89.9,
            max: 90,
            step: 0.1,
            slide: function (event, ui) {
                $('#tilt-spinner').spinner("value", ui.value)
            },
            change: function (event, ui) {
                $('#tilt-spinner').spinner("value", ui.value)
            }
        });
        $('#tilt-spinner').spinner({
            min: -89.9,
            max: 90,
            step: 0.1,
            spin: function (event, ui) {
                $('#tilt-slider').slider("value", ui.value)
            },
            change: function () {
                if (this.value.length > 0) {
                    $('#tilt-slider').slider("value", this.value);
                }
            }
        }).spinner("value", 0);

    };
    cameraEditor.prototype.addFormRow = function (labels) {
        var $formRow = $("<div class='form-row'>");
        for (let label of labels) {
            $formRow.append(this.formElements[label])
        }
        return $formRow
    };
    cameraEditor.prototype.createNameNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='feature-name-label' class='form-label'>Camera Name</div>"));
        $formValue.append($("<input type='text' id='feature-name' class='ui-widget'>"));
        $formElem.append($formValue);
        return $formElem
    };
    cameraEditor.prototype.createPositionNodes = function () {
        var $formElem = $("<div class='form-elem'>");

        $formElem.append($("<div id='camera-lon-label' class='form-label'>Lon</div>"));
        var $formLon = $("<div class='form-value'>");
        $formLon.append($("<div id='camera-lon'>"));
        $formElem.append($formLon);

        $formElem.append($("<div id='camera-lat-label' class='form-label'>Lat</div>"));
        var $formLat = $("<div class='form-value'>");
        $formLat.append($("<div id='camera-lat'>"));
        $formElem.append($formLat);

        return $formElem
    };
    cameraEditor.prototype.createCameraTypeNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='camera-type-label' class='form-label'>Camera Type</div>"));
        $formValue.append($("<select id='camera-type'>"));
        $formElem.append($formValue);
        return $formElem
    };
    cameraEditor.prototype.createCameraOptionNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='camera-option-label' class='form-label'>Camera Option</div>"));
        $formValue.append($("<select id='camera-option'>"));
        $formElem.append($formValue);
        return $formElem
    };
    cameraEditor.prototype.createCameraFOVNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='camera-fov-label' class='form-label'>Camera FOV</div>"));
        $formValue.append($("<select id='camera-fov'>"));
        $formElem.append($formValue);
        return $formElem
    };
    cameraEditor.prototype.createMeasureNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='measure-label' class='form-label'>Max Visible Area</div>"));
        $formValue.append($("<div id='measure' readonly>"));
        $formValue.append($("<select id='measure-units'>"));
        $formValue.append($("<label for='geodesic2' class='visible' title='Use geodesic measures'>"));
        $formValue.append($("<input type='checkbox' id='geodesic2' class='checkboxradio'>"));
        $formElem.append($formValue);
        return $formElem
    };
    cameraEditor.prototype.createSourceHeightNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='source-height-label' class='form-label'>Source Height</div>"));
        $formValue.append($("<div id='source-height-slider'>"));
        $formValue.append($("<input id='source-height-spinner'>"));
        $formElem.append($formValue);
        return $formElem
    };
    cameraEditor.prototype.createTargetHeightNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='target-height-label' class='form-label'>Target Height</div>"));
        $formValue.append($("<div id='target-height-slider'>"));
        $formValue.append($("<input id='target-height-spinner'>"));
        $formElem.append($formValue);
        return $formElem
    };
    cameraEditor.prototype.createRangeNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='range-label' class='form-label'>Range</div>"));
        $formValue.append($("<div id='range-slider'>"));
        $formValue.append($("<input id='range-spinner-min'>"));
        $formValue.append($("<input id='range-spinner-max'>"));
        $formElem.append($formValue);
        return $formElem
    };
    cameraEditor.prototype.createIsotropicNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='isotropic-label' class='form-label'>Isotropic</div>"));
        $formValue.append($("<label for='isotropic' class='visible' title='Force spherical field of view'>"));
        $formValue.append($("<input type='checkbox' id='isotropic' class='checkboxradio'>"));
        $formElem.append($formValue);
        return $formElem
    };
    cameraEditor.prototype.createPanNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='pan-label' class='form-label'>Pan</div>"));
        $formValue.append($("<div id='pan-slider'>"));
        $formValue.append($("<input id='pan-spinner'>"));
        $formElem.append($formValue);
        return $formElem
    };
    cameraEditor.prototype.createTiltNodes = function () {
        var $formElem = $("<div class='form-elem'>");
        var $formValue = $("<div class='form-value'>");
        $formElem.append($("<div id='tilt-label' class='form-label'>Tilt</div>"));
        $formValue.append($("<div id='tilt-slider'>"));
        $formValue.append($("<input id='tilt-spinner'>"));
        $formElem.append($formValue);
        return $formElem
    };

    cameraEditor.prototype.createLabel = function (label) {
        var $label = $('<label>');
        $label.attr('for', label);
        return $label;
    };
    cameraEditor.prototype.createInput = function (name, type) {
        var $input = $('<input>');
        $input.name = name;
        $input.type = type;
        $input.required = true;
        return $input;
    };
    cameraEditor.prototype.createMenu = function (name, id) {
        var $menu = $('<select>');
        $menu.name = name;
        $menu.type = "text";
        $menu.id = id;
        return $menu;
    };
    cameraEditor.prototype.createMenuOption = function (value, text) {
        var $option = $('<option>');
        $option.val(value);
        $option.text(text || value);
        return $option;
    };

    cameraEditor.prototype.log10Slider = function (toPresent) {
        var val = 0;
        if (toPresent > 0.1) {
            val = 25.0 * (Math.log10(toPresent) + 1.0);
        }
        return val;
    };
    cameraEditor.prototype.pow10Slider = function (val) {
        var toPresent = 0;
        if (val > 0) {
            toPresent = Math.pow(10, (val / 25 - 1));
        }
        return String(toPresent);
    };

    cameraEditor.prototype.formatArea = function (geom, sourceProj, sphere) {

        var getPolygonArea = function (polygon) {
            var area = 0;
            var isExterior = true;
            if ($("#geodesic2").is(":checked")) {
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
    cameraEditor.prototype.formatPosition = function (point, sourceProj) {
        var geom = point.clone().transform(sourceProj, 'EPSG:4326');
        var coords = geom.getCoordinates();
        var coord_x = coords[0].toFixed(6);
        var coord_y = coords[1].toFixed(6);
        $('#camera-lat').html(coord_y);
        $('#camera-lon').html(coord_x);
        // return coord_x + ', ' + coord_y;
    };

    cameraEditor.prototype.activateForm = function (feature) {

        var _this = this;
        $('#cameraproperties').show();

        var cameraTemplates = sensorTemplates['camera'].defaultSensors;
        var sensorProperties = sensorTemplates['camera'].properties;
        var i, key;
        var units = ['metric', 'english'];

        var $featureName = $('#feature-name');
        var $cameraType = $('#camera-type');
        var $cameraOption = $('#camera-option');
        var $cameraFOV = $('#camera-fov');
        var $sourceHeightSpinner = $('#source-height-spinner');
        var $targetHeightSpinner = $('#target-height-spinner');
        var $isotropic = $('#isotropic');
        var $rangeSpinnerMin = $('#range-spinner-min');
        var $rangeSpinnerMax = $('#range-spinner-max');
        var $rangeSlider = $('#range-slider');
        var $measureLabel = $('#measure-label');
        var $measureUnits = $('#measure-units');
        var $geodesic = $('#geodesic2');
        var $panSpinner = $('#pan-spinner');
        var $tiltSpinner = $('#tilt-spinner');

        var camera_type = feature.get('defaultsensor') || sensorProperties['defaultsensor'];
        var camera_option = feature.get('option') || sensorProperties['option'];
        var camera_fov = feature.get('fov') || sensorProperties['fov'];
        var isotropic = feature.get("isotropic") || sensorProperties['isotropic'];
        var source_height, target_height, min_range, max_range, pan, tilt;
        if (feature.get('source_height')) {
            source_height = feature.get('source_height').value
        } else {
            source_height = sensorProperties['source_height'].value
        }
        if (feature.get('target_height')) {
            target_height = feature.get('target_height').value
        } else {
            target_height = sensorProperties['target_height'].value
        }
        if (feature.get('min_range')) {
            min_range = feature.get('min_range').value
        } else {
            min_range = sensorProperties['min_range'].value
        }
        if (feature.get('max_range')) {
            max_range = feature.get('max_range').value
        } else {
            max_range = sensorProperties['max_range'].value
        }
        if (feature.get('pan')) {
            pan = feature.get('pan').value
        } else {
            pan = sensorProperties['pan'].value
        }
        if (feature.get('tilt')) {
            tilt = feature.get('tilt').value
        } else {
            tilt = sensorProperties['tilt'].value
        }

        $('#feature-name-label').removeClass('disabled');
        $featureName.removeClass('ui-state-disabled');
        $featureName.val(feature.get('name'));

        this.formatPosition(feature.getGeometry(), this.map.getView().getProjection());
        this.geometrylistener = feature.getGeometry().on('change', function (evt) {
            _this.formatPosition(evt.target, _this.map.getView().getProjection());
        });

        $('#camera-type-label').removeClass('disabled');
        $cameraType.selectmenu('enable');
        for (key in cameraTemplates) {
            $cameraType.append(this.createMenuOption(key));
        }
        $('#camera-type-button').find('.ui-selectmenu-text').text(camera_type);
        $cameraType.val(camera_type);


        $('#camera-option-label').removeClass('disabled');
        $cameraOption.selectmenu('enable');
        for (key in cameraTemplates[camera_type]['options']) {
            $cameraOption.append(this.createMenuOption(key));
        }
        $('#camera-option-button').find('.ui-selectmenu-text').text(camera_option);
        $cameraOption.val(camera_option);


        $('#camera-fov-label').removeClass('disabled');
        $cameraFOV.selectmenu('enable');
        for (key in cameraTemplates[camera_type]['options'][camera_option]['fov']) {
            $cameraFOV.append(this.createMenuOption(key));
        }
        $('#camera-fov-button').find('.ui-selectmenu-text').text(camera_fov);
        $cameraFOV.val(camera_fov);


        $sourceHeightSpinner.spinner('enable');
        $sourceHeightSpinner.spinner("value", source_height);
        $('#source-height-label').removeClass('disabled');
        $('#source-height-slider').slider('enable');

        $targetHeightSpinner.spinner('enable');
        $targetHeightSpinner.spinner("value", target_height);
        $('#target-height-label').removeClass('disabled');
        $('#target-height-slider').slider('enable');

        $rangeSpinnerMin.spinner('enable');
        $rangeSpinnerMin.spinner("value", min_range);

        $rangeSpinnerMax.spinner('enable');
        $rangeSpinnerMax.spinner("value", max_range);

        $('#range-label').removeClass('disabled');
        $rangeSlider.slider('enable');


        this.innerCircle = this.parser.read(feature.getGeometry()).buffer($rangeSpinnerMin.val());
        this.outerCircle = this.parser.read(feature.getGeometry()).buffer($rangeSpinnerMax.val());
        var jstshoop = this.outerCircle.difference(this.innerCircle);
        this.rangePolygon = this.parser.write(jstshoop);

        $rangeSpinnerMin.on("spinchange", function () {
            if (this.value.length > 0) {
                _this.innerCircle = _this.parser.read(feature.getGeometry()).buffer(this.value);
                jstshoop = _this.outerCircle.difference(_this.innerCircle);
                _this.rangePolygon.setCoordinates(_this.parser.write(jstshoop).getCoordinates())
            }
        });
        $rangeSpinnerMax.on("spinchange", function () {
            if (this.value.length > 0) {
                _this.outerCircle = _this.parser.read(feature.getGeometry()).buffer(this.value);
                jstshoop = _this.outerCircle.difference(_this.innerCircle);
                _this.rangePolygon.setCoordinates(_this.parser.write(jstshoop).getCoordinates())
            }
        });

        $measureLabel.removeClass('disabled');
        $measureUnits.selectmenu('enable');
        for (i = 0; i < units.length; i += 1) {
            $measureUnits.append(_this.createMenuOption(units[i]));
        }
        $geodesic.checkboxradio('enable');

        this.formatArea(this.rangePolygon, this.map.getView().getProjection(), this.wgs84Sphere);
        this.rangelistener = this.rangePolygon.on('change', function (evt) {
            _this.formatArea(evt.target, _this.map.getView().getProjection(), _this.wgs84Sphere);
        });
        $geodesic.on('change', function () {
            // For some reason this checkbox doesn't auto reset on change, so we force a refresh here.
            $(this).checkboxradio("refresh");
            _this.formatArea(_this.rangelistener.target, _this.map.getView().getProjection(), _this.wgs84Sphere);
        });

        $panSpinner.spinner('enable');
        $panSpinner.spinner("value", pan);
        $('#pan-label').removeClass('disabled');
        $('#pan-slider').slider('enable');

        $tiltSpinner.spinner('enable');
        $tiltSpinner.spinner("value", tilt);
        $('#tilt-label').removeClass('disabled');
        $('#tilt-slider').slider('enable');

        $('#isotropic-label').removeClass('disabled');
        $isotropic.checkboxradio("enable");
        $isotropic.attr("checked", isotropic).trigger("change");
        // $isotropic.checkboxradio("refresh");

    };
    cameraEditor.prototype.changeCameraType = function (camera_type) {
        // manufacturer
        // model
        // cost
        var $cameraOption = $('#camera-option');
        $cameraOption.empty();
        for (var key in sensorTemplates['camera']['defaultSensors'][camera_type]['options']) {
            $cameraOption.append(this.createMenuOption(key));
        }
        $cameraOption.val($cameraOption[0].options[0].value).selectmenu('refresh').trigger('selectmenuchange');
    };
    cameraEditor.prototype.changeCameraOption = function (camera_option) {
        var camera_type = $('#camera-type').val();
        var $cameraFOV = $('#camera-fov');
        $cameraFOV.empty();
        for (var key in sensorTemplates['camera']['defaultSensors'][camera_type]['options'][camera_option]['fov']) {
            $cameraFOV.append(this.createMenuOption(key));
        }
        $cameraFOV.val($cameraFOV[0].options[0].value).selectmenu('refresh').trigger('selectmenuchange');
    };
    cameraEditor.prototype.changeCameraFOV = function (camera_fov) {
        var camera_type = $('#camera-type').val();
        var camera_option = $('#camera-option').val();
        var fovs = sensorTemplates['camera']['defaultSensors'][camera_type]['options'][camera_option]['fov'][camera_fov];
        console.log(fovs['horizontal']);
        console.log(fovs['vertical']);
    };

    cameraEditor.prototype.loadFeature = function (feature) {
        var $featureName = $('#feature-name');
        if (feature.get('name')) {
            feature.set('name', $featureName.val());
        }
        var $cameraType = $('#camera-type');
        if (feature.get('defaultsensor')) {
            feature.set('defaultsensor', $cameraType.val());
        }
        var $cameraOption = $('#camera-option');
        if (feature.get('option')) {
            feature.set('option', $cameraOption.val());
        }
        var $cameraFOV = $('#camera-fov');
        if (feature.get('fov')) {
            feature.set('fov', $cameraFOV.val());
        }
        feature.set('isotropic', $('#isotropic').is(':checked'));

        feature.set('source_height', {'value': $('#source-height-spinner').spinner("value"), 'units': 'meter'});
        feature.set('target_height', {'value': $('#target-height-spinner').spinner("value"), 'units': 'meter'});
        feature.set('min_range', {'value': $('#range-spinner-min').spinner("value"), 'units': 'meter'});
        feature.set('max_range', {'value': $('#range-spinner-max').spinner("value"), 'units': 'meter'});
        feature.set('pan', {'value': $('#pan-spinner').spinner("value"), 'units': 'degree', 'wrt': 'north'});
        feature.set('tilt', {'value': $('#tilt-spinner').spinner("value"), 'units': 'degree'});
    };
    cameraEditor.prototype.deactivateForm = function () {

        var $cameraName = $('#feature-name');
        var $cameraType = $('#camera-type');
        var $cameraOption = $('#camera-option');
        var $cameraFOV = $('#camera-fov');
        var $sourceHeightSpinner = $('#source-height-spinner');
        var $sourceHeightSlider = $('#source-height-slider');
        var $targetHeightSpinner = $('#target-height-spinner');
        var $targetHeightSlider = $('#target-height-slider');
        var $rangeSpinnerMin = $('#range-spinner-min');
        var $rangeSpinnerMax = $('#range-spinner-max');
        var $rangeSlider = $('#range-slider');
        var $panSpinner = $('#pan-spinner');
        var $panSlider = $('#pan-slider');
        var $tiltSpinner = $('#tilt-spinner');
        var $tiltSlider = $('#tilt-slider');
        var $geodesic = $('#geodesic2');

        $cameraName.val(null);
        $cameraName.addClass('ui-state-disabled');

        $('#camera-lat').html('&nbsp;');
        $('#camera-lon').html('&nbsp;');

        $geodesic.off('change');
        ol.Observable.unByKey(this.geometrylistener);
        ol.Observable.unByKey(this.rangelistener);
        this.rangelistener = null;
        this.geometrylistener = null;
        $geodesic.checkboxradio('disable');
        $('#measure').html('&nbsp;');
        $('#measure-units').selectmenu('disable');
        $('#measure-units-button').find('.ui-selectmenu-text').html('&nbsp;');

        $cameraType.empty();
        $cameraType.val('');
        $cameraType.selectmenu('disable');
        $('#camera-type-button').find('.ui-selectmenu-text').html('&nbsp;');

        $cameraOption.empty();
        $cameraOption.val('');
        $cameraOption.selectmenu('disable');
        $('#camera-option-button').find('.ui-selectmenu-text').html('&nbsp;');

        $cameraFOV.empty();
        $cameraFOV.val('');
        $cameraFOV.selectmenu('disable');
        $('#camera-fov-button').find('.ui-selectmenu-text').html('&nbsp;');

        $sourceHeightSpinner.spinner("value", 0);
        $sourceHeightSpinner.spinner('disable');
        $sourceHeightSlider.slider("value", 0);
        $sourceHeightSlider.slider('disable');

        $targetHeightSpinner.spinner("value", 0);
        $targetHeightSpinner.spinner('disable');
        $targetHeightSlider.slider("value", 0);
        $targetHeightSlider.slider('disable');

        $rangeSpinnerMin.off('spinchange');
        $rangeSpinnerMin.spinner("value", 0);
        $rangeSpinnerMin.spinner('disable');
        $rangeSpinnerMax.off('spinchange');
        $rangeSpinnerMax.spinner("value", 10000);
        $rangeSpinnerMax.spinner('disable');
        $rangeSlider.slider("disable");
        $rangeSlider.slider("values", [0, 10000]);

        $('#isotropic').checkboxradio('disable');

        $panSpinner.spinner("value", 0);
        $panSpinner.spinner('disable');
        $panSlider.slider("value", 0);
        $panSlider.slider('disable');

        $tiltSpinner.spinner("value", 0);
        $tiltSpinner.spinner('disable');
        $tiltSlider.slider("value", 0);
        $tiltSlider.slider('disable');

        this.innerCircle = null;
        this.outerCircle = null;
        this.rangePolygon = null;

        $('.form-label').addClass('disabled');
    };

    return cameraEditor;
});
