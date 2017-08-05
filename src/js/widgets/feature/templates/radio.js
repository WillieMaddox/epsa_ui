/**
 * Created by maddoxw on 7/18/17.
 */

'use strict'

import $ from 'jquery'
import defaultRadios from '../defaultradios'
import sensorProperties from './sensor'

// import radioIcon from '../../img/radio-normal.png'

const radioProperties = {
  icon: '../../img/radio-normal.png',
  // icon: radioIcon,
  defaultsensor: 'TR1',
  option: 'A1',
  pattern: 'pattern'
}

const radioTemplate = {
  properties: $.extend({}, sensorProperties, radioProperties),
  defaultSensors: null
}

defaultRadios(function (data) {
  radioTemplate.defaultSensors = data
})

export default radioTemplate
