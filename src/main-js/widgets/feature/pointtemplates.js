/**
 * Created by maddoxw on 7/18/17.
 */

'use strict'

import $ from 'jquery'
import defaultCameras from './defaultcameras'
import defaultRadios from './defaultradios'

// import cameraIcon from '../../img/camera-normal.png'
// import radioIcon from '../../img/radio-normal.png'

const sensorProperties = {
  source_height: {
    units: 'meter',
    value: 3
  },
  target_height: {
    units: 'meter',
    value: 1
  },
  isotropic: true,
  min_range: {
    units: 'meter',
    value: 0
  },
  max_range: {
    units: 'meter',
    value: 1000
  },
  pan: {
    wrt: 'north',
    units: 'degree',
    value: 0
  },
  tilt: {
    units: 'degree',
    value: 0
  }
}
const cameraProperties = {
  type: 'camera',
  icon: '../../img/camera-normal.png',
  // icon: cameraIcon,
  defaultsensor: 'TC1',
  option: 'A1',
  fov: 'wide'
}
const radioProperties = {
  type: 'radio',
  icon: '../../img/radio-normal.png',
  // icon: radioIcon,
  defaultsensor: 'TR1',
  option: 'A1',
  pattern: 'pattern'
}

const pointTemplates = {
  'generic': {
    'color': [218, 188, 163]
  },
  'camera': {
    geometry_type: 'Point',
    properties: $.extend({}, sensorProperties, cameraProperties),
    defaultSensors: null
  },
  'radio': {
    geometry_type: 'Point',
    properties: $.extend({}, sensorProperties, radioProperties),
    defaultSensors: null
  }
}

defaultCameras(function (data) {
  pointTemplates['camera'].defaultSensors = data
})

defaultRadios(function (data) {
  pointTemplates['radio'].defaultSensors = data
})

export default pointTemplates
