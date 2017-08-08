// import OSMFire_Core from 'MainCore'
import utils from 'utils'

'use strict'

const result = (function () {

  class Name {
    constructor (feature_templates) {
      // console.log('name constructor() called')
      this.feature_templates = feature_templates
    }
    destroy (removeComponent) {
      console.log('destroy', removeComponent)
    }
    createNode () {
      const $formElem = $("<div class='form-elem'>")
      const $formValue = $("<div class='form-value'>")
      $formValue.append($("<input type='text' id='feature-name' class='ui-widget' placeholder='Feature Name'>"))
      $formElem.append($formValue)
      return $formElem
    }
    styleNode () {}
    loadFeature (feature) {
      const $name = $('#feature-name')
      $('#feature-name-label').removeClass('disabled')
      $name.removeClass('ui-state-disabled')
      $name.val(feature.get('name'))
    }
    changeFeatureType (feature_type) {
      const $name = $('#feature-name')
      const Type = utils.capitalizeFirstLetter(feature_type)
      let Key
      for (let key in this.feature_templates) {
        Key = utils.capitalizeFirstLetter(key)
        if ($name.val().startsWith(Key)) {
          $name.val($name.val().replace(Key, Type))
        }
      }
    }
    saveFeature (feature) {
      if (feature.get('name')) {
        feature.set('name', $('#feature-name').val())
      }
    }
    deactivateNode () {
      const $name = $('#feature-name')
      $name.val(null)
      $name.addClass('ui-state-disabled')
    }
  }
  return Name
})()

export default result
