/**
 * Created by maddoxw on 7/18/17.
 */

'use strict'

import $ from 'jquery'
import defaultCameras from '../defaultcameras'
import sensorProperties from './sensor'

// import cameraIcon from '../../img/camera-normal.png'

const cameraProperties = {
  icon: '../../img/camera-normal.png',
  // icon: cameraIcon,
  defaultsensor: 'TC1',
  option: 'A1',
  fov: 'wide'
}

const cameraTemplate = {
  properties: $.extend({}, sensorProperties, cameraProperties),
  defaultSensors: null
}

defaultCameras(function (data) {
  cameraTemplate.defaultSensors = data
})

export default cameraTemplate
