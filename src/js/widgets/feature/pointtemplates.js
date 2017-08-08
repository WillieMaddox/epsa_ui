/**
 * Created by maddoxw on 7/18/17.
 */

'use strict'

import $ from 'jquery'
import defaultCameras from './defaultcameras'
import defaultRadios from './defaultradios'

// import cameraIcon from '../../img/camera-normal.png'
// import radioIcon from '../../img/radio-normal.png'

const sensor_properties = {
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
const camera_properties = {
  type: 'camera',
  icon: '../../img/camera-normal.png',
  // icon: cameraIcon,
  defaultsensor: 'TC1',
  option: 'A1',
  fov: 'wide'
}
const radio_properties = {
  type: 'radio',
  icon: '../../img/radio-normal.png',
  // icon: radioIcon,
  defaultsensor: 'TR1',
  option: 'A1',
  pattern: 'pattern'
}

const point_templates = {
  'point': {
    'color': [218, 188, 163]
  },
  'camera': {
    properties: $.extend({}, sensor_properties, camera_properties),
    defaultSensors: null
  },
  'radio': {
    properties: $.extend({}, sensor_properties, radio_properties),
    defaultSensors: null
  }
}

defaultCameras(function (data) {
  point_templates['camera'].defaultSensors = data
})

defaultRadios(function (data) {
  point_templates['radio'].defaultSensors = data
})

export default point_templates
