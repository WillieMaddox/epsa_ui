/**
 * Created by maddoxw on 10/14/16.
 */

'use strict'

import $ from 'jquery'
import ol from 'openlayers'
import map from 'map'
import utils from 'utils'
import exists from 'exists'
import * as jsts from 'jsts'
import cameraTemplates from '../templates/camera'
// import sensorTemplates from '../templates/sensor'

const formElements = {}
const wgs84Sphere = new ol.Sphere(6378137)

const result = {
  init: function () {
    this.isStyled = false
    this.parser = new jsts.io.OL3Parser()
    this.$form = this.createForm()
  },
  createForm: function () {
    formElements.cameraName = this.createNameNodes()
    formElements.range = this.createRangeNodes()
    formElements.sourceHeight = this.createSourceHeightNodes()
    formElements.targetHeight = this.createTargetHeightNodes()
    formElements.isotropic = this.createIsotropicNodes()
    formElements.measure = this.createMeasureNodes()
    formElements.pan = this.createPanNodes()
    formElements.tilt = this.createTiltNodes()
    formElements.cameraType = this.createCameraTypeNodes()
    formElements.cameraOption = this.createCameraOptionNodes()
    formElements.cameraFOV = this.createCameraFOVNodes()
    formElements.summary = this.createSummaryTableNodes()
    const $form = $("<form id='cameraproperties' class='form'>")
    $form.append(this.addFormRow(['cameraName']))
    $form.append(this.addFormRow(['range']))
    $form.append(this.addFormRow(['sourceHeight']))
    $form.append(this.addFormRow(['targetHeight']))
    $form.append(this.addFormRow(['isotropic', 'measure']))
    $form.append(this.addFormRow(['pan']))
    $form.append(this.addFormRow(['tilt']))
    $form.append(this.addFormRow(['cameraType', 'cameraOption', 'cameraFOV']))
    $form.append(this.addFormRow(['summary']))
    return $form
  },
  styleForm: function () {

    const _this = this

    $('#camera-type').selectmenu({
      classes: {
        'ui-selectmenu-button': 'menuselect'
      }
    }).on('selectmenuchange', function () {
      _this.changeCameraType(this.value)
    })
    $('#camera-option').selectmenu({
      classes: {
        'ui-selectmenu-button': 'menuselect'
      }
    }).on('selectmenuchange', function () {
      _this.changeCameraOption(this.value)
    })
    $('#camera-fov').selectmenu({
      classes: {
        'ui-selectmenu-button': 'menuselect'
      }
    }).on('selectmenuchange', function () {
      _this.changeCameraFOV(this.value)
    })

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
        $('#pan-slider').slider('disable')
        $('#pan-spinner').spinner('disable')
        $('#pan-label').addClass('disabled')
        $('#tilt-slider').slider('disable')
        $('#tilt-spinner').spinner('disable')
        $('#tilt-label').addClass('disabled')
        $('#camera-type').selectmenu('disable')
        $('#camera-type-label').addClass('disabled')
        $('#camera-option').selectmenu('disable')
        $('#camera-option-label').addClass('disabled')
        $('#camera-fov').selectmenu('disable')
        $('#camera-fov-label').addClass('disabled')
        $('.camera-hfov').addClass('disabled')
        $('.camera-vfov').addClass('disabled')
      } else {
        $('#pan-slider').slider('enable')
        $('#pan-spinner').spinner('enable')
        $('#pan-label').removeClass('disabled')
        $('#tilt-slider').slider('enable')
        $('#tilt-spinner').spinner('enable')
        $('#tilt-label').removeClass('disabled')
        $('#camera-type').selectmenu('enable')
        $('#camera-type-label').removeClass('disabled')
        $('#camera-option').selectmenu('enable')
        $('#camera-option-label').removeClass('disabled')
        $('#camera-fov').selectmenu('enable')
        $('#camera-fov-label').removeClass('disabled')
        $('.camera-hfov').removeClass('disabled')
        $('.camera-vfov').removeClass('disabled')
      }
    }).checkboxradio()

    $('#measure-units').selectmenu({
      classes: {
        'ui-selectmenu-button': 'menuselect'
      }
    })
    $('#geodesic2').checkboxradio()

    $('#source-height-slider').slider({
      animate: true,
      range: 'min',
      min: 0,
      max: 100,
      step: 0.01,
      slide: function (event, ui) {
        $('#source-height-spinner').spinner('value', utils.pow10Slider(ui.value))
      },
      change: function (event, ui) {
        $('#source-height-spinner').spinner('value', utils.pow10Slider(ui.value))
      }
    })
    $('#source-height-spinner').spinner({
      min: 0,
      max: 1000,
      step: 0.1,
      spin: function (event, ui) {
        $('#source-height-slider').slider('value', utils.log10Slider(ui.value))
      },
      change: function () {
        if (this.value.length > 0) {
          $('#source-height-slider').slider('value', utils.log10Slider(this.value))
        }
      }
    }).spinner('value', 10)

    $('#target-height-slider').slider({
      animate: true,
      range: 'min',
      min: 0,
      max: 100,
      step: 0.01,
      slide: function (event, ui) {
        $('#target-height-spinner').spinner('value', utils.pow10Slider(ui.value))
      },
      change: function (event, ui) {
        $('#target-height-spinner').spinner('value', utils.pow10Slider(ui.value))
      }
    })
    $('#target-height-spinner').spinner({
      min: 0,
      max: 1000,
      step: 0.1,
      spin: function (event, ui) {
        $('#target-height-slider').slider('value', utils.log10Slider(ui.value))
      },
      change: function () {
        if (this.value.length > 0) {
          $('#target-height-slider').slider('value', utils.log10Slider(this.value))
        }
      }
    }).spinner('value', 10)

    $('#range-slider').slider({
      animate: true,
      range: true,
      min: 0,
      max: 10000,
      step: 1,
      // values: [100, 1000],
      slide: function (event, ui) {
        if (ui.handleIndex === 0) {
          $('#range-spinner-min').spinner('value', ui.value)
        } else if (ui.handleIndex === 1) {
          $('#range-spinner-max').spinner('value', ui.value)
        }
      },
      change: function (event, ui) {
        if (ui.handleIndex === 0) {
          $('#range-spinner-min').spinner('value', ui.value)
        } else if (ui.handleIndex === 1) {
          $('#range-spinner-max').spinner('value', ui.value)
        }
      }
    })
    $('#range-spinner-min').spinner({
      min: 0,
      max: 10000,
      step: 1,
      spin: function (event, ui) {
        $('#range-slider').slider('values', 0, ui.value)
      },
      change: function () {
        if (this.value.length > 0) {
          $('#range-slider').slider('values', 0, this.value)
        }
      }
    }).spinner('value', 0)
    $('#range-spinner-max').spinner({
      min: 0,
      max: 10000,
      step: 1,
      spin: function (event, ui) {
        $('#range-slider').slider('values', 1, ui.value)
      },
      change: function () {
        if (this.value.length > 0) {
          $('#range-slider').slider('values', 1, this.value)
        }
      }
    }).spinner('value', 1000)

    $('#pan-slider').slider({
      animate: true,
      range: 'min',
      min: 0,
      max: 359.9,
      step: 0.1,
      slide: function (event, ui) {
        $('#pan-spinner').spinner('value', ui.value)
      },
      change: function (event, ui) {
        $('#pan-spinner').spinner('value', ui.value)
      }
    })
    $('#pan-spinner').spinner({
      min: 0,
      max: 359.9,
      step: 0.1,
      spin: function (event, ui) {
        $('#pan-slider').slider('value', ui.value)
      },
      change: function () {
        if (this.value.length > 0) {
          $('#pan-slider').slider('value', this.value)
        }
      }
    }).spinner('value', 0)

    $('#tilt-slider').slider({
      animate: true,
      range: 'min',
      min: -89.9,
      max: 90,
      step: 0.1,
      slide: function (event, ui) {
        $('#tilt-spinner').spinner('value', ui.value)
      },
      change: function (event, ui) {
        $('#tilt-spinner').spinner('value', ui.value)
      }
    })
    $('#tilt-spinner').spinner({
      min: -89.9,
      max: 90,
      step: 0.1,
      spin: function (event, ui) {
        $('#tilt-slider').slider('value', ui.value)
      },
      change: function () {
        if (this.value.length > 0) {
          $('#tilt-slider').slider('value', this.value)
        }
      }
    }).spinner('value', 0)

    this.isStyled = true
  },
  addFormRow: function (labels) {
    const $formRow = $("<div class='form-row'>")
    for (let label of labels) {
      $formRow.append(formElements[label])
    }
    return $formRow
  },
  createNameNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='feature-name-label' class='form-label'>Camera Name</div>"))
    $formValue.append($("<input type='text' id='feature-name' class='ui-widget'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createRangeNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='range-label' class='form-label'>Range</div>"))
    $formValue.append($("<input id='range-spinner-min'>"))
    $formValue.append($("<div id='range-slider'>"))
    $formValue.append($("<input id='range-spinner-max'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createSourceHeightNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='source-height-label' class='form-label'>Source Height</div>"))
    $formValue.append($("<div id='source-height-slider'>"))
    $formValue.append($("<input id='source-height-spinner'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createTargetHeightNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='target-height-label' class='form-label'>Target Height</div>"))
    $formValue.append($("<div id='target-height-slider'>"))
    $formValue.append($("<input id='target-height-spinner'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createIsotropicNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='isotropic-label' class='form-label'>Isotropic</div>"))
    $formValue.append($("<label for='isotropic' class='visible' title='Force spherical field of view'>"))
    $formValue.append($("<input type='checkbox' id='isotropic' class='checkboxradio'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createMeasureNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='measure-label' class='form-label'>Max Visible Area</div>"))
    $formValue.append($("<div id='measure' readonly>"))
    const $selectNode = $("<select id='measure-units'>")
    $selectNode.append(utils.createMenuOption('metric', 'Metric'))
    $selectNode.append(utils.createMenuOption('english', 'English'))
    $formValue.append($selectNode)
    $formValue.append($("<label for='geodesic2' class='visible' title='Use geodesic measures'>"))
    $formValue.append($("<input type='checkbox' id='geodesic2' class='checkboxradio' checked>"))
    $formElem.append($formValue)
    return $formElem
  },
  createPanNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='pan-label' class='form-label'>Pan</div>"))
    $formValue.append($("<div id='pan-slider'>"))
    $formValue.append($("<input id='pan-spinner'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createTiltNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='tilt-label' class='form-label'>Tilt</div>"))
    $formValue.append($("<div id='tilt-slider'>"))
    $formValue.append($("<input id='tilt-spinner'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createCameraTypeNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='camera-type-label' class='form-label'>Camera Type</div>"))
    $formValue.append($("<select id='camera-type'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createCameraOptionNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='camera-option-label' class='form-label'>Camera Option</div>"))
    $formValue.append($("<select id='camera-option'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createCameraFOVNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='camera-fov-label' class='form-label'>Camera FOV</div>"))
    $formValue.append($("<select id='camera-fov'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createSummaryTableNodes: function () {
    const createTableRow = function (opts) {
      const $trow = $('<tr>')
      $trow.append($("<td class='summary-attribute-tag " + opts['label'] + "'>" + opts['tag'] + '</td>'))
      $trow.append($("<td class='summary-attribute-value " + opts['label'] + "' id='" + opts['label'] + "'>" + opts['value'] + '</td>'))
      return $trow
    }
    const $formElem = $("<div class='form-elem'>")
    const $table = $("<table class='summary-table' style='width:100%'>")
    const $tbody = $('<tbody>')
    $tbody.append(createTableRow({'label': 'camera-position', 'tag': 'Lon, Lat', 'value': ''}))
    $tbody.append(createTableRow({'label': 'camera-manufacturer', 'tag': 'Manufacturer', 'value': ''}))
    $tbody.append(createTableRow({'label': 'camera-model', 'tag': 'Model', 'value': ''}))
    $tbody.append(createTableRow({'label': 'camera-cost', 'tag': 'Cost', 'value': ''}))
    $tbody.append(createTableRow({'label': 'camera-hfov', 'tag': 'Horizontal FOV', 'value': ''}))
    $tbody.append(createTableRow({'label': 'camera-vfov', 'tag': 'Vertical FOV', 'value': ''}))
    $table.append($tbody)
    $formElem.append($table)
    return $formElem
  },

  formatArea: function (geom, sourceProj) {

    const getPolygonArea = function (polygon) {
      let area = 0
      let isExterior = true
      if ($('#geodesic2').is(':checked')) {
        const poly = polygon.clone().transform(sourceProj, 'EPSG:4326')
        poly.getLinearRings().forEach(function (ring) {
          if (isExterior) { // assume the first ring is the exterior ring.
            area += Math.abs(wgs84Sphere.geodesicArea(ring.getCoordinates()))
            isExterior = false
          } else {
            area -= Math.abs(wgs84Sphere.geodesicArea(ring.getCoordinates()))
          }
        })
      } else {
        area = polygon.getArea()
      }
      return area
    }

    var area = 0
    if (geom.getType() === 'MultiPolygon') {
      geom.getPolygons().forEach(function (poly) {
        area += getPolygonArea(poly)
      })
    } else {
      area = getPolygonArea(geom)
    }
    let output
    const squared = '2'
    if (area > 100000) {
      output = (Math.round(area / 1000000 * 100) / 100) + ' km' + squared.sup()
    } else {
      output = (Math.round(area * 100) / 100) + ' m' + squared.sup()
    }
    $('#measure').html(output)
  },
  formatPosition: function (point, sourceProj) {
    const geom = point.clone().transform(sourceProj, 'EPSG:4326')
    const coords = geom.getCoordinates()
    const coord_x = coords[0].toFixed(6)
    const coord_y = coords[1].toFixed(6)
    $('#camera-position').html(coord_x + ', ' + coord_y)
  },

  activateForm: function (feature) {

    const _this = this
    $('#cameraproperties').show()

    const sensorTemplates = cameraTemplates.defaultSensors
    const sensorProperties = cameraTemplates.properties
    let key

    const $featureName = $('#feature-name')
    const $rangeSpinnerMin = $('#range-spinner-min')
    const $rangeSpinnerMax = $('#range-spinner-max')
    const $sourceHeightSpinner = $('#source-height-spinner')
    const $targetHeightSpinner = $('#target-height-spinner')
    const $isotropic = $('#isotropic')
    const $geodesic = $('#geodesic2')
    const $panSpinner = $('#pan-spinner')
    const $tiltSpinner = $('#tilt-spinner')
    const $cameraType = $('#camera-type')
    const $cameraOption = $('#camera-option')
    const $cameraFOV = $('#camera-fov')

    const camera_type = feature.get('defaultsensor') || sensorProperties['defaultsensor']
    const camera_option = feature.get('option') || sensorProperties['option']
    const camera_fov = feature.get('fov') || sensorProperties['fov']
    const isotropic = exists(feature.get('isotropic')) ? feature.get('isotropic') : sensorProperties['isotropic']
    let source_height, target_height, min_range, max_range, pan, tilt
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

    $('#feature-name-label').removeClass('disabled')
    $featureName.removeClass('ui-state-disabled')
    $featureName.val(feature.get('name'))

    $rangeSpinnerMin.spinner('enable')
    $rangeSpinnerMin.spinner('value', min_range)

    $rangeSpinnerMax.spinner('enable')
    $rangeSpinnerMax.spinner('value', max_range)

    $('#range-label').removeClass('disabled')
    $('#range-slider').slider('enable')

    // the rangefan will replace this
    this.innerCircle = this.parser.read(feature.getGeometry()).buffer($rangeSpinnerMin.val())
    this.outerCircle = this.parser.read(feature.getGeometry()).buffer($rangeSpinnerMax.val())
    let jstshoop = this.outerCircle.difference(this.innerCircle)
    this.rangePolygon = this.parser.write(jstshoop)

    $rangeSpinnerMin.on('spinchange', function () {
      if (this.value.length > 0) {
        _this.innerCircle = _this.parser.read(feature.getGeometry()).buffer(this.value)
        jstshoop = _this.outerCircle.difference(_this.innerCircle)
        _this.rangePolygon.setCoordinates(_this.parser.write(jstshoop).getCoordinates())
      }
    })
    $rangeSpinnerMax.on('spinchange', function () {
      if (this.value.length > 0) {
        _this.outerCircle = _this.parser.read(feature.getGeometry()).buffer(this.value)
        jstshoop = _this.outerCircle.difference(_this.innerCircle)
        _this.rangePolygon.setCoordinates(_this.parser.write(jstshoop).getCoordinates())
      }
    })

    $sourceHeightSpinner.spinner('enable')
    $sourceHeightSpinner.spinner('value', source_height)
    $('#source-height-label').removeClass('disabled')
    $('#source-height-slider').slider('enable')

    $targetHeightSpinner.spinner('enable')
    $targetHeightSpinner.spinner('value', target_height)
    $('#target-height-label').removeClass('disabled')
    $('#target-height-slider').slider('enable')

    $('#measure-label').removeClass('disabled')
    $('#measure-units').selectmenu('enable')
    $geodesic.checkboxradio('enable')

    // the rangefan will replace this
    this.formatArea(this.rangePolygon, map.getView().getProjection())
    this.rangelistener = this.rangePolygon.on('change', function (evt) {
      _this.formatArea(evt.target, map.getView().getProjection())
    })
    $geodesic.on('change', function () {
      // For some reason this checkbox doesn't auto reset on change, so we force a refresh here.
      $(this).checkboxradio('refresh')
      _this.formatArea(_this.rangelistener.target, map.getView().getProjection())
    })

    $panSpinner.spinner('enable')
    $panSpinner.spinner('value', pan)
    $('#pan-label').removeClass('disabled')
    $('#pan-slider').slider('enable')

    $tiltSpinner.spinner('enable')
    $tiltSpinner.spinner('value', tilt)
    $('#tilt-label').removeClass('disabled')
    $('#tilt-slider').slider('enable')

    this.formatPosition(feature.getGeometry(), map.getView().getProjection())
    this.geometrylistener = feature.getGeometry().on('change', function (evt) {
      _this.formatPosition(evt.target, map.getView().getProjection())
    })

    $('#camera-type-label').removeClass('disabled')
    $cameraType.selectmenu('enable')
    for (key in sensorTemplates) {
      $cameraType.append(utils.createMenuOption(key))
    }
    $('#camera-type-button').find('.ui-selectmenu-text').text(camera_type)
    $cameraType.val(camera_type)

    $('#camera-option-label').removeClass('disabled')
    $cameraOption.selectmenu('enable')
    for (key in sensorTemplates[camera_type]['options']) {
      $cameraOption.append(utils.createMenuOption(key))
    }
    $('#camera-option-button').find('.ui-selectmenu-text').text(camera_option)
    $cameraOption.val(camera_option)

    $('#camera-fov-label').removeClass('disabled')
    $cameraFOV.selectmenu('enable')
    for (key in sensorTemplates[camera_type]['options'][camera_option]['fov']) {
      $cameraFOV.append(utils.createMenuOption(key))
    }
    $('#camera-fov-button').find('.ui-selectmenu-text').text(camera_fov)
    $cameraFOV.val(camera_fov)

    $('#camera-manufacturer').html(sensorTemplates[camera_type]['manufacturer'])
    $('#camera-model').html(sensorTemplates[camera_type]['model'])
    $('#camera-cost').html(sensorTemplates[camera_type]['cost']['value'])
    $('#camera-hfov').html(sensorTemplates[camera_type]['options'][camera_option]['fov'][camera_fov]['horizontal'])
    $('#camera-vfov').html(sensorTemplates[camera_type]['options'][camera_option]['fov'][camera_fov]['vertical'])

    $('.summary-table').removeClass('ui-state-disabled')

    $('#isotropic-label').removeClass('disabled')
    $isotropic.checkboxradio('enable')
    $isotropic.prop('checked', isotropic).change()
    // $isotropic.checkboxradio("refresh");

  },
  changeCameraType: function (camera_type) {
    const $cameraOption = $('#camera-option')
    const defaultSensor = cameraTemplates['defaultSensors'][camera_type]
    $('#camera-manufacturer').html(defaultSensor['manufacturer'])
    $('#camera-model').html(defaultSensor['model'])
    $('#camera-cost').html(defaultSensor['cost']['value'])
    $cameraOption.empty()
    for (let key in defaultSensor['options']) {
      $cameraOption.append(utils.createMenuOption(key))
    }
    $cameraOption.val($cameraOption[0].options[0].value).selectmenu('refresh').trigger('selectmenuchange')
  },
  changeCameraOption: function (camera_option) {
    const camera_type = $('#camera-type').val()
    const $cameraFOV = $('#camera-fov')
    $cameraFOV.empty()
    for (let key in cameraTemplates['defaultSensors'][camera_type]['options'][camera_option]['fov']) {
      $cameraFOV.append(utils.createMenuOption(key))
    }
    $cameraFOV.val($cameraFOV[0].options[0].value).selectmenu('refresh').trigger('selectmenuchange')
  },
  changeCameraFOV: function (camera_fov) {
    const camera_type = $('#camera-type').val()
    const camera_option = $('#camera-option').val()
    const fovs = cameraTemplates['defaultSensors'][camera_type]['options'][camera_option]['fov'][camera_fov]
    $('#camera-hfov').html(fovs['horizontal'])
    $('#camera-vfov').html(fovs['vertical'])
  },
  loadFeature: function (feature) {
    if (feature.get('name')) {
      feature.set('name', $('#feature-name').val())
    }
    if (feature.get('defaultsensor')) {
      feature.set('defaultsensor', $('#camera-type').val())
    }
    if (feature.get('option')) {
      feature.set('option', $('#camera-option').val())
    }
    if (feature.get('fov')) {
      feature.set('fov', $('#camera-fov').val())
    }
    if (feature.get('hfov')) {
      feature.set('hfov', $('#camera-hfov').val())
    }
    if (feature.get('vfov')) {
      feature.set('vfov', $('#camera-vfov').val())
    }
    feature.set('isotropic', $('#isotropic').prop('checked'))

    feature.set('source_height', {'value': $('#source-height-spinner').spinner('value'), 'units': 'meter'})
    feature.set('target_height', {'value': $('#target-height-spinner').spinner('value'), 'units': 'meter'})
    feature.set('min_range', {'value': $('#range-spinner-min').spinner('value'), 'units': 'meter'})
    feature.set('max_range', {'value': $('#range-spinner-max').spinner('value'), 'units': 'meter'})
    feature.set('pan', {'value': $('#pan-spinner').spinner('value'), 'units': 'degree', 'wrt': 'north'})
    feature.set('tilt', {'value': $('#tilt-spinner').spinner('value'), 'units': 'degree'})
  },
  deactivateForm: function () {

    const $cameraName = $('#feature-name')
    const $rangeSpinnerMin = $('#range-spinner-min')
    const $rangeSpinnerMax = $('#range-spinner-max')
    const $rangeSlider = $('#range-slider')
    const $sourceHeightSpinner = $('#source-height-spinner')
    const $sourceHeightSlider = $('#source-height-slider')
    const $targetHeightSpinner = $('#target-height-spinner')
    const $targetHeightSlider = $('#target-height-slider')
    const $isotropic = $('#isotropic')
    const $geodesic = $('#geodesic2')
    const $panSpinner = $('#pan-spinner')
    const $panSlider = $('#pan-slider')
    const $tiltSpinner = $('#tilt-spinner')
    const $tiltSlider = $('#tilt-slider')
    const $cameraType = $('#camera-type')
    const $cameraOption = $('#camera-option')
    const $cameraFOV = $('#camera-fov')

    $cameraName.val(null)
    $cameraName.addClass('ui-state-disabled')

    $geodesic.off('change')
    ol.Observable.unByKey(this.geometrylistener)
    ol.Observable.unByKey(this.rangelistener)
    this.rangelistener = null
    this.geometrylistener = null
    $geodesic.checkboxradio('disable')
    $('#measure').html('&nbsp;')
    $('#measure-units').selectmenu('disable')
    // $('#measure-units-button').find('.ui-selectmenu-text').html('&nbsp;');

    $cameraType.empty()
    $cameraType.val('')
    $cameraType.selectmenu('disable')
    $('#camera-type-button').find('.ui-selectmenu-text').html('&nbsp;')

    $cameraOption.empty()
    $cameraOption.val('')
    $cameraOption.selectmenu('disable')
    $('#camera-option-button').find('.ui-selectmenu-text').html('&nbsp;')

    $cameraFOV.empty()
    $cameraFOV.val('')
    $cameraFOV.selectmenu('disable')
    $('#camera-fov-button').find('.ui-selectmenu-text').html('&nbsp;')

    $sourceHeightSpinner.spinner('disable')
    $sourceHeightSlider.slider('disable')

    $targetHeightSpinner.spinner('disable')
    $targetHeightSlider.slider('disable')

    $rangeSpinnerMin.off('spinchange')
    $rangeSpinnerMin.spinner('disable')
    $rangeSpinnerMax.off('spinchange')
    $rangeSpinnerMax.spinner('disable')
    $rangeSlider.slider('disable')

    $isotropic.prop('checked', false).change()
    $isotropic.checkboxradio('disable')

    $panSpinner.spinner('disable')
    $panSlider.slider('disable')

    $tiltSpinner.spinner('disable')
    $tiltSlider.slider('disable')

    this.innerCircle = null
    this.outerCircle = null
    this.rangePolygon = null
    $('.camera-attribute-value').html('&nbsp;')
    $('.summary-table').addClass('ui-state-disabled')
    $('.form-label').addClass('disabled')
  }
}

export default result
