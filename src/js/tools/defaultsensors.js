/**
 * Created by maddoxw on 11/1/16.
 */

'use strict'
import defaultSensorsData from '../../data/default_sensors.json'

const result = function (callback) {
  if (defaultSensorsData) {
    callback(defaultSensorsData)
  }
}

export default result
