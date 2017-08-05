import $ from 'jquery'
import utils from 'utils'

'use strict'

const result = (function () {

  class Type {
    constructor (feature_templates) {
      console.log('featuretype constructor() called')
      this.feature_templates = feature_templates

      // sandBox.addEventHandlerToParent('click', this.handleMainContainerClicked)
      // this.registerForCustomEvents()
      // sandBox.contextObj = this
      // sandBox.log(1, 'featuretype constructor() called...', 'blue')
    }
    destroy (removeComponent) {
      console.log('destroy', removeComponent)
    }
    createNode () {
      const $formElem = $("<div class='form-elem'>")
      const $formValue = $("<div class='form-value'>")
      $formElem.append($("<div id='feature-type-label' class='form-label'>Feature Type</div>"))
      $formValue.append($("<select id='feature-type'>"))
      $formElem.append($formValue)
      return $formElem
    }
    styleNode () {
      $('#feature-type').selectmenu({
        classes: {
          'ui-selectmenu-button': 'menuselect'
        },
        change: function (event, data) {
          $('#feature-type').val(data.item.value)
        }
      })
    }
    activateNode (feature) {
      let feature_type = feature.get('type')
      const $featureType = $('#feature-type')
      $('#feature-type-label').removeClass('disabled')
      $featureType.selectmenu('enable')
      for (let key in this.feature_templates) {
        $featureType.append(utils.createMenuOption(key))
      }
      if (!(feature_type && feature_type in this.feature_templates)) {
        feature_type = 'polygon'
      }
      $('#feature-type-button').find('.ui-selectmenu-text').text(feature_type)
      $featureType.val(feature_type)
    }
    loadFeature (feature) {
      if (feature.get('type')) {
        feature.set('type', $('#feature-type').val())
      }
    }
    deactivateNode () {
      const $featureType = $('#feature-type')
      $featureType.empty()
      $featureType.val('')
      $('#feature-type-button').find('.ui-selectmenu-text').html('&nbsp;')
      $featureType.selectmenu('disable')
    }
    // registerForEvents () {
    //   sandBox.addEventHandlerToElement('feature-type', 'change', this.handleFeatureTypeChanged)
    // }
    // unregisterFromEvents () {
    //   sandBox.removeEventHandlerFromElement('feature-type', 'change', this.handleFeatureTypeChanged)
    // }
    // handleFeatureTypeChanged (e) {
    //   sandBox.publishCustomEvent({
    //     type: 'featuretype-Changed',
    //     data: this.value
    //   })
    //   e.preventDefault()
    //   e.stopPropagation()
    // }
  }
  return Type
})()

export default result
