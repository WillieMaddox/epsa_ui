// import OSMFire_Core from 'MainCore'
import utils from 'utils'
'use strict'

const result = {
  init: function () {
    console.log('component name.init() called')
    return this.createNode()
  },
  destroy: function (removeComponent) {
    console.log('destroy', removeComponent)
  },
  createNode: function () {
    const $formElem = $("<div class='form-elem'>")
    const $formValue = $("<div class='form-value'>")
    $formValue.append($("<input type='text' id='feature-name' class='ui-widget' placeholder='Feature Name'>"))
    $formElem.append($formValue)
    return $formElem
  },
  activateNode: function (feature) {
    const $featureName = $('#feature-name')
    $('#feature-name-label').removeClass('disabled')
    $featureName.removeClass('ui-state-disabled')
    $featureName.val(feature.get('name'))
  },
  changeFeatureType: function (feature_type, polygonTemplates) {
    const $featureName = $('#feature-name')
    for (let key in polygonTemplates) {
      if ($featureName.val().startsWith(utils.capitalizeFirstLetter(key))) {
        $featureName.val($featureName.val().replace(utils.capitalizeFirstLetter(key), utils.capitalizeFirstLetter(feature_type)))
      }
    }
  },
  loadFeature: function (feature) {
    if (feature.get('name')) {
      feature.set('name', $('#feature-name').val())
    }
  },
  deactivateNode: function () {
    const $featureName = $('#feature-name')
    $featureName.val(null)
    $featureName.addClass('ui-state-disabled')
  }
}

export default result
