/**
 * Created by maddoxw on 7/21/17.
 */

'use strict'

import $ from 'jquery'
import ol from 'openlayers'
// import map from 'map'
import utils from 'utils'
import linestringTemplates from '../linestringtemplates'
import name from '../../nodes/name'
import measure from '../../nodes/measure'

const formElements = {}
const wgs84Sphere = new ol.Sphere(6378137)

const result = {
  init: function () {
    this.isStyled = false
    this.$form = this.createForm()
  },
  createForm: function () {
    formElements.featurename = name.init()
    formElements.measure = measure.init('LineString', 'Length')
    formElements.featuretype = this.createFeatureTypeNodes()
    formElements.height = this.createHeightNodes()
    formElements.thickness = this.createThicknessNodes()
    const $form = $("<form id='featureproperties' class='form'>")
    $form.append(this.addFormRow(['featurename']))
    $form.append(this.addFormRow(['measure']))
    $form.append(this.addFormRow(['featuretype']))
    $form.append(this.addFormRow(['height']))
    $form.append(this.addFormRow(['thickness']))
    return $form
  },
  getFeatureType: function () {
    return 'linestring'
  },
  styleForm: function () {

    const _this = this
    measure.styleNode()
    // $('#measure-units').selectmenu({
    //   classes: {
    //     'ui-selectmenu-button': 'menuselect'
    //   }
    // })
    // $('#geodesic').checkboxradio()

    $('#feature-type').selectmenu({
      classes: {
        'ui-selectmenu-button': 'menuselect'
      }
    }).on('change', function () {
      _this.changeFeatureType(this.value)
    })

    $('#height-slider').slider({
      animate: true,
      range: 'min',
      min: 0,
      max: 100,
      step: 0.01
    }).on('slide', function (event, ui) {
      $('#height-spinner').spinner('value', utils.pow10Slider(ui.value))
    }).on('slidechange', function (event, ui) {
      $('#height-spinner').spinner('value', utils.pow10Slider(ui.value))
    })

    $('#height-spinner').spinner({
      value: 10,
      min: 0,
      max: 1000,
      step: 0.1
    }).on('spin', function (event, ui) {
      $('#height-slider').slider('value', utils.log10Slider(ui.value))
    }).on('spinchange', function () {
      if (this.value.length > 0) {
        $('#height-slider').slider('value', utils.log10Slider(this.value))
      }
    })

    // $('#thickness-slider').slider({
    //     animate: true,
    //     range: "min",
    //     min: 0,
    //     max: 50,
    //     step: 0.01,
    //     slide: function (event, ui) {
    //         $('#thickness-spinner').spinner("value", ui.value)
    //     },
    //     change: function (event, ui) {
    //         $('#thickness-spinner').spinner("value", ui.value)
    //     }
    // });
    //
    // $('#thickness-spinner').spinner({
    //     min: 0,
    //     max: 50,
    //     step: 0.01,
    //     spin: function (event, ui) {
    //         $('#thickness-slider').slider("value", ui.value)
    //     },
    //     change: function () {
    //         if (this.value.length > 0) {
    //             $('#thickness-slider').slider("value", this.value);
    //         }
    //     }
    // }).spinner("value", 5);

    $('#thickness-slider').slider({
      animate: true,
      range: 'min',
      min: 0,
      max: 50,
      step: 0.01
    }).on('slide', function (event, ui) {
      $('#thickness-spinner').spinner('value', ui.value)
    }).on('slidechange', function (event, ui) {
      $('#thickness-spinner').spinner('value', ui.value)
    })

    $('#thickness-spinner').spinner({
      value: 5,
      min: 0,
      max: 50,
      step: 0.01
    }).on('spin', function (event, ui) {
      $('#thickness-slider').slider('value', ui.value)
    }).on('spinchange', function () {
      if (this.value.length > 0) {
        $('#thickness-slider').slider('value', this.value)
      }
    })

    this.isStyled = true
  },
  addFormRow: function (labels) {
    const $formRow = $("<div class='form-row'>")
    for (let label of labels) {
      $formRow.append(formElements[label])
    }
    return $formRow
  },
  // createMeasureNodes: function () {
  //   const $formElem = $("<div class='form-elem'>")
  //   const $formValue = $("<div class='form-value'>")
  //   $formElem.append($("<div id='measure-label' class='form-label'>Measure</div>"))
  //   $formValue.append($("<div id='measure' readonly>"))
  //   const $selectNode = $("<select id='measure-units'>")
  //   $selectNode.append(utils.createMenuOption('metric', 'Metric'))
  //   $selectNode.append(utils.createMenuOption('english', 'English'))
  //   $formValue.append($selectNode)
  //   $formValue.append($("<label for='geodesic' class='visible' title='Use geodesic measures'>"))
  //   $formValue.append($("<input type='checkbox' id='geodesic' checked>"))
  //   $formElem.append($formValue)
  //   return $formElem
  // },
  createFeatureTypeNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='feature-type-label' class='form-label'>Feature Type</div>"))
    //TODO: Consider using <datalist> instead of <select>. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
    $formValue.append($("<select id='feature-type'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createHeightNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='height-label' class='form-label'>Height</div>"))
    $formValue.append($("<div id='height-slider'>"))
    $formValue.append($("<input id='height-spinner'>"))
    $formElem.append($formValue)
    return $formElem
  },
  createThicknessNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='thickness-label' class='form-label'>Thickness</div>"))
    $formValue.append($("<div id='thickness-slider'>"))
    $formValue.append($("<input id='thickness-spinner'>"))
    $formElem.append($formValue)
    return $formElem
  },

  // formatLength: function (geom, sourceProj) {
  //
  //   const getLineStringLength = function (line) {
  //     let length = 0
  //     if ($('#geodesic').is(':checked')) {
  //       const coordinates = line.clone().transform(sourceProj, 'EPSG:4326').getCoordinates()
  //       const nCoords = coordinates.length
  //       for (let i = 0; i < nCoords - 1; i++) {
  //         length += wgs84Sphere.haversineDistance(coordinates[i], coordinates[i + 1])
  //       }
  //     } else {
  //       length = line.getLength()
  //     }
  //     return length
  //   }
  //
  //   let length = 0
  //   if (geom.getType() === 'MultiLineString') {
  //     geom.getLineStrings().forEach(function (line) {
  //       length += getLineStringLength(line)
  //     })
  //   } else {
  //     length = getLineStringLength(geom)
  //   }
  //   let output
  //   if (length > 1000) {
  //     output = (Math.round(length / 1000 * 100) / 100) + ' km'
  //   } else {
  //     output = (Math.round(length * 100) / 100) + ' m'
  //   }
  //   $('#measure').html(output)
  // },

  formatLength: function (geom, sourceProj) {

    const getLineStringLength = function (line) {
      let length = 0
      if ($('#geodesic').is(':checked')) {
        const coordinates = line.clone().transform(sourceProj, 'EPSG:4326').getCoordinates()
        const nCoords = coordinates.length
        for (let i = 0; i < nCoords - 1; i++) {
          length += wgs84Sphere.haversineDistance(coordinates[i], coordinates[i + 1])
        }
      } else {
        length = line.getLength()
      }
      return length
    }

    let length = 0
    if (geom.getType() === 'MultiLineString') {
      geom.getLineStrings().forEach(function (line) {
        length += getLineStringLength(line)
      })
    } else {
      length = getLineStringLength(geom)
    }
    let output
    if (length > 1000) {
      output = (Math.round(length / 1000 * 100) / 100) + ' km'
    } else {
      output = (Math.round(length * 100) / 100) + ' m'
    }
    $('#measure').html(output)
    // return output
  },

  activateForm: function (feature) {

    // const _this = this
    // const $geometryType = $('#geometry-type')
    // const $measureLabel = $('#measure-label')
    // const $measureUnits = $('#measure-units')
    // const $geodesic = $('#geodesic')
    // let measure
    const $featureType = $('#feature-type')
    let feature_type = feature.get('type')
    const $heightSpinner = $('#height-spinner')
    const $heightSlider = $('#height-slider')
    const $thicknessSpinner = $('#thickness-spinner')
    const $thicknessSlider = $('#thickness-slider')

    $('#featureproperties').show()

    name.activateNode(feature)

    measure.activateNode(feature, this.formatLength)

    // $measureLabel.removeClass('disabled')
    // $measureLabel.html('Length')
    // measure = this.formatLength
    // $geodesic.checkboxradio('enable')
    // $measureUnits.selectmenu('enable')
    // measure(feature.getGeometry(), map.getView().getProjection())
    // this.geometrylistener = feature.getGeometry().on('change', function (evt) {
    //   measure(evt.target, map.getView().getProjection())
    // })
    // $geodesic.on('change', function () {
    //   // For some reason this checkbox doesn't auto reset on change, so we force a refresh here.
    //   $(this).checkboxradio('refresh')
    //   measure(_this.geometrylistener.target, map.getView().getProjection())
    // })

    $('#feature-type-label').removeClass('disabled')
    $featureType.selectmenu('enable')
    for (let key in linestringTemplates) {
      $featureType.append(utils.createMenuOption(key))
    }

    if (!(feature_type && feature_type in linestringTemplates)) {
      feature_type = 'generic'
    }
    $('#feature-type-button').find('.ui-selectmenu-text').text(feature_type)
    $featureType.val(feature_type)

    const feature_properties = linestringTemplates[feature_type]

    if (feature_properties['height']) {
      $('#height-label').removeClass('disabled')
      $heightSpinner.spinner('enable')
      $heightSlider.slider('enable')
      $heightSpinner.spinner('value', feature.get('height') || feature_properties['height'])
    }

    if (feature_properties['thickness']) {
      $('#thickness-label').removeClass('disabled')
      $thicknessSpinner.spinner('enable')
      $thicknessSlider.slider('enable')
      $thicknessSpinner.spinner('value', feature.get('thickness') || feature_properties['thickness'])
    }
  },
  changeFeatureType: function (feature_type) {
    const feature_properties = linestringTemplates[feature_type]

    name.changeFeatureType(feature_type, linestringTemplates)

    $('#feature-type').val(feature_type)

    const $heightSpinner = $('#height-spinner')
    const $heightSlider = $('#height-slider')
    if (!($heightSpinner.spinner('option', 'disabled') || feature_properties['height'])) {
      $heightSpinner.spinner('value', 0)
      $heightSlider.slider('value', 0)
      $heightSpinner.spinner('disable')
      $heightSlider.slider('disable')
      $('#height-label').addClass('disabled')
    } else if ($heightSpinner.spinner('option', 'disabled') && feature_properties['height']) {
      $heightSpinner.spinner('value', feature_properties['height'])
      $heightSlider.slider('value', feature_properties['height'])
      $heightSpinner.spinner('enable')
      $heightSlider.slider('enable')
      $('#height-label').removeClass('disabled')
    }

    const $thicknessSpinner = $('#thickness-spinner')
    const $thicknessSlider = $('#thickness-slider')
    if (!($thicknessSpinner.spinner('option', 'disabled') || feature_properties['thickness'])) {
      $thicknessSpinner.spinner('value', 0)
      $thicknessSlider.slider('value', 0)
      $thicknessSpinner.spinner('disable')
      $thicknessSlider.slider('disable')
      $('#thickness-label').addClass('disabled')
    } else if ($thicknessSpinner.spinner('option', 'disabled') && feature_properties['thickness']) {
      $thicknessSpinner.spinner('value', feature_properties['thickness'])
      $thicknessSlider.slider('value', feature_properties['thickness'])
      $thicknessSpinner.spinner('enable')
      $thicknessSlider.slider('enable')
      $('#thickness-label').removeClass('disabled')
    }
    return this
  },
  loadFeature: function (feature) {
    name.loadFeature(feature)
    if (feature.get('type')) {
      feature.set('type', $('#feature-type').val())
    }

    // feature.set('height', $('#height-spinner').spinner("value"));
    const $heightSpinner = $('#height-spinner')
    if ($heightSpinner.spinner('value')) {
      feature.set('height', $heightSpinner.spinner('value'))
    }

    // feature.set('thickness', $('#thickness-spinner').spinner("value"));
    const $thicknessSpinner = $('#thickness-spinner')
    if ($thicknessSpinner.spinner('value')) {
      feature.set('thickness', $thicknessSpinner.spinner('value'))
    }
  },
  deactivateForm: function () {

    const $featureType = $('#feature-type')
    const $heightSpinner = $('#height-spinner')
    const $heightSlider = $('#height-slider')
    const $thicknessSpinner = $('#thickness-spinner')
    const $thicknessSlider = $('#thickness-slider')
    // const $geodesic = $('#geodesic')

    name.deactivateNode()

    measure.deactivateNode()

    // $geodesic.off('change')
    // ol.Observable.unByKey(this.geometrylistener)
    // this.geometrylistener = null
    // $geodesic.checkboxradio('disable')
    // $('#measure').html(null)
    // $('#measure-label').html('Measure')
    // $('#measure-units').selectmenu('disable')
    // $('#measure-units-button').find('.ui-selectmenu-text').html('&nbsp;')

    $featureType.empty()
    $featureType.val('')
    $('#feature-type-button').find('.ui-selectmenu-text').html('&nbsp;')
    $featureType.selectmenu('disable')

    // $heightSpinner.spinner("value", null);
    // $heightSlider.slider("value", 0);
    $heightSpinner.spinner('disable')
    $heightSlider.slider('disable')

    // $thicknessSpinner.spinner("value", null);
    // $thicknessSlider.slider("value", 0);
    $thicknessSpinner.spinner('disable')
    $thicknessSlider.slider('disable')

    $('.form-label').addClass('disabled')
  }
}

export default result
