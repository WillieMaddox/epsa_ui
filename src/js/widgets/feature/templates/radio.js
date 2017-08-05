/**
 * Created by maddoxw on 7/18/17.
 */

'use strict'

import $ from 'jquery'
import defaultRadios from '../defaultradios'
import sensor_properties from './sensor'

// import radioIcon from '../../img/radio-normal.png'

const radio_properties = {
  icon: '../../img/radio-normal.png',
  // icon: radioIcon,
  defaultsensor: 'TR1',
  option: 'A1',
  pattern: 'pattern'
}

const radio_template = {
  properties: $.extend({}, sensor_properties, radio_properties),
  defaultSensors: null
}

defaultRadios(function (data) {
  radio_template.defaultSensors = data
})

export default radio_template
