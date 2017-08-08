import $ from 'jquery'
import utils from 'utils'

'use strict'

const result = (function () {

  class Height {
    constructor () {
      // console.log('height constructor() called')
    }
    destroy (removeComponent) {
      console.log('destroy', removeComponent)
    }
    createNode () {
      const $formElem = $("<div class='form-elem'>")
      const $formValue = $("<div class='form-value'>")
      $formElem.append($("<div id='height-label' class='form-label'>Height</div>"))
      $formValue.append($("<div id='height-slider'>"))
      $formValue.append($("<input id='height-spinner'>"))
      $formElem.append($formValue)
      return $formElem
    }
    styleNode () {
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
    }
    loadFeature (feature) {
      const $heightSlider = $('#height-slider')
      const $heightSpinner = $('#height-spinner')
      $('#height-label').removeClass('disabled')
      $heightSpinner.spinner('enable')
      $heightSlider.slider('enable')
      $heightSpinner.spinner('value', feature.get('height') || feature_properties['height'])
    }
    changeFeatureType (feature_type, feature_templates) {
      const feature_properties = feature_templates[feature_type]
      const $heightSlider = $('#height-slider')
      const $heightSpinner = $('#height-spinner')
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
    }
    saveFeature (feature) {
      // feature.set('height', $('#height-spinner').spinner("value"));
      const $heightSpinner = $('#height-spinner')
      if ($heightSpinner.spinner('value')) {
        feature.set('height', $heightSpinner.spinner('value'))
      }
    }
    deactivateNode () {
      const $heightSlider = $('#height-slider')
      const $heightSpinner = $('#height-spinner')
      $heightSpinner.spinner('disable')
      $heightSlider.slider('disable')
    }
    // registerForEvents () {
    //   sandBox.addEventHandlerToElement('height-slider', 'slide', this.handleHeightSliderSlide)
    //   sandBox.addEventHandlerToElement('height-slider', 'slidechange', this.handleHeightSliderChange)
    //   sandBox.addEventHandlerToElement('height-spinner', 'spin', this.handleHeightSpinnerSpin)
    //   sandBox.addEventHandlerToElement('height-spinner', 'spinchange', this.handleHeightSpinnerChange)
    // }
    // unregisterFromEvents () {
    //   sandBox.removeEventHandlerFromElement('height-slider', 'slide', this.handleHeightSliderSlide)
    //   sandBox.removeEventHandlerFromElement('height-slider', 'slidechange', this.handleHeightSliderChange)
    //   sandBox.removeEventHandlerFromElement('height-spinner', 'spin', this.handleHeightSpinnerSpin)
    //   sandBox.removeEventHandlerFromElement('height-spinner', 'spinchange', this.handleHeightSpinnerChange)
    // }
    // handleHeightSliderSlide (e) {
    //   sandBox.publishCustomEvent({
    //     type: 'heightslider-Slid',
    //     data: this.value
    //   })
    //   e.preventDefault()
    //   e.stopPropagation()
    // }
    // handleHeightSliderChange (e) {
    //   sandBox.publishCustomEvent({
    //     type: 'heightslider-Changed',
    //     data: this.value
    //   })
    //   e.preventDefault()
    //   e.stopPropagation()
    // }
    // handleHeightSpinnerSpin (e) {
    //   sandBox.publishCustomEvent({
    //     type: 'heightspinner-Spun',
    //     data: this.value
    //   })
    //   e.preventDefault()
    //   e.stopPropagation()
    // }
    // handleHeightSpinnerChange (e) {
    //   sandBox.publishCustomEvent({
    //     type: 'heightspinner-Changed',
    //     data: this.value
    //   })
    //   e.preventDefault()
    //   e.stopPropagation()
    // }
  }
  return Height
})()

export default result
