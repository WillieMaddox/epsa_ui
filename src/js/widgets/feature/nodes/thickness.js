import $ from 'jquery'

'use strict'

const result = (function () {

  class Thickness {
    constructor () {
      console.log('thickness constructor() called')
    }
    destroy (removeComponent) {
      console.log('destroy', removeComponent)
    }
    createNode () {
      const $formElem = $("<div class='form-elem'>")
      const $formValue = $("<div class='form-value'>")
      $formElem.append($("<div id='thickness-label' class='form-label'>Thickness</div>"))
      $formValue.append($("<div id='thickness-slider'>"))
      $formValue.append($("<input id='thickness-spinner'>"))
      $formElem.append($formValue)
      return $formElem
    }
    styleNode () {
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
    }
    loadFeature (feature) {
      const $thicknessSlider = $('#thickness-slider')
      const $thicknessSpinner = $('#thickness-spinner')
      $('#thickness-label').removeClass('disabled')
      $thicknessSpinner.spinner('enable')
      $thicknessSlider.slider('enable')
      $thicknessSpinner.spinner('value', feature.get('thickness') || feature_properties['thickness'])
    }
    changeFeatureType (feature_type, feature_templates) {
      const feature_properties = feature_templates[feature_type]
      const $thicknessSlider = $('#thickness-slider')
      const $thicknessSpinner = $('#thickness-spinner')
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
    }
    saveFeature (feature) {
      // feature.set('thickness', $('#thickness-spinner').spinner("value"));
      const $thicknessSpinner = $('#thickness-spinner')
      if ($thicknessSpinner.spinner('value')) {
        feature.set('thickness', $thicknessSpinner.spinner('value'))
      }
    }
    // deactivateNode () {
    //   const $thicknessSlider = $('#thickness-slider')
    //   const $thicknessSpinner = $('#thickness-spinner')
    //   $thicknessSpinner.spinner('disable')
    //   $thicknessSlider.slider('disable')
    // }
    // registerForEvents: function () {
    //   sandBox.addEventHandlerToElement('measure-units', 'change', this.handleMeasureUnitsChanged)
    // }
    // unregisterFromEvents: function () {
    //   sandBox.removeEventHandlerFromElement('measure-units', 'change', this.handleMeasureUnitsChanged)
    // }
    // handleMeasureUnitsChanged: function (e) {
    //   sandBox.publishCustomEvent({
    //     type: 'measureunits-Changed',
    //     data: this.value
    //   })
    //   e.preventDefault()
    //   e.stopPropagation()
    // }
  }
  return Thickness
})()

export default result
