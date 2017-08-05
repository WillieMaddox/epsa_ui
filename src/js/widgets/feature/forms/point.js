/**
 * Created by maddoxw on 7/21/17.
 */

'use strict'

import $ from 'jquery'
import utils from 'utils'
import pointTemplates from '../pointtemplates'
import name from '../nodes/name'
const formElements = {}

const result = {
  init: function () {
    this.isStyled = false
    this.$form = this.createForm()
  },
  createForm: function () {
    formElements.featurename = name.init()
    formElements.featuretype = this.createFeatureTypeNodes()
    const $form = $("<form id='featureproperties' class='form'>")
    $form.append(this.addFormRow(['featurename']))
    $form.append(this.addFormRow(['featuretype']))
    return $form
  },
  getFeatureType: function () {
    return 'point'
  },
  styleForm: function () {
    const _this = this
    $('#measure-units').selectmenu({
      classes: {
        'ui-selectmenu-button': 'menuselect'
      }
    })
    $('#feature-type').selectmenu({
      classes: {
        'ui-selectmenu-button': 'menuselect'
      }
    }).on('change', function () {
      _this.changeFeatureType(this.value)
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
  createFeatureTypeNodes: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formElem.append($("<div id='feature-type-label' class='form-label'>Feature Type</div>"))
    //TODO: Consider using <datalist> instead of <select>. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
    $formValue.append($("<select id='feature-type'>"))
    $formElem.append($formValue)
    return $formElem
  },

  formatPosition: function (point, sourceProj) {
    const geom = point.clone().transform(sourceProj, 'EPSG:4326')
    const coords = geom.getCoordinates()
    const coord_x = coords[0].toFixed(6)
    const coord_y = coords[1].toFixed(6)
    const output = coord_x + ', ' + coord_y
    $('#measure').html(output)
  },

  activateForm: function (feature) {

    const $featureType = $('#feature-type')
    let feature_type = feature.get('type')

    $('#featureproperties').show()

    name.activateNode(feature)

    $('#feature-type-label').removeClass('disabled')
    $featureType.selectmenu('enable')
    for (let key in pointTemplates) {
      $featureType.append(utils.createMenuOption(key))
    }

    if (!(feature_type && feature_type in pointTemplates)) {
      feature_type = 'point'
    }
    $('#feature-type-button').find('.ui-selectmenu-text').text(feature_type)
    $featureType.val(feature_type)
  },
  changeFeatureType: function (feature_type) {
    name.changeFeatureType(feature_type, pointTemplates)

    $('#feature-type').val(feature_type)
    return this
  },
  loadFeature: function (feature) {
    name.loadFeature(feature)
    if (feature.get('type')) {
      feature.set('type', $('#feature-type').val())
    }
  },
  deactivateForm: function () {

    const $featureType = $('#feature-type')

    name.deactivateNode()

    $featureType.empty()
    $featureType.val('')
    $('#feature-type-button').find('.ui-selectmenu-text').html('&nbsp;')
    $featureType.selectmenu('disable')

    $('.form-label').addClass('disabled')
  }
}

export default result
