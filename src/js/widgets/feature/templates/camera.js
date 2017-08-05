/**
 * Created by maddoxw on 7/18/17.
 */

'use strict'

import $ from 'jquery'
import defaultCameras from '../defaultcameras'
import sensor_properties from './sensor'

// import cameraIcon from '../../img/camera-normal.png'

const camera_properties = {
  icon: '../../img/camera-normal.png',
  // icon: cameraIcon,
  defaultsensor: 'TC1',
  option: 'A1',
  fov: 'wide'
}

const camera_template = {
  properties: $.extend({}, sensor_properties, camera_properties),
  defaultSensors: null
}

defaultCameras(function (data) {
  camera_template.defaultSensors = data
})

export default camera_template
